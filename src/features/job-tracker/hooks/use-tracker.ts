"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import {
  trackerApi,
  type AddTrackedJobInput,
  type TrackedJob,
  type TrackerBoard,
  type TrackerStage,
  type UpdateTrackedJobInput,
} from "../api/tracker.api";

/** The board. */
export function useTrackerBoard() {
  return useQuery({
    queryKey: qk.tracker.board(),
    queryFn: () => trackerApi.board(),
    staleTime: 30_000,
  });
}

export function useArchivedTrackedJobs(enabled = true) {
  return useQuery({
    queryKey: qk.tracker.archived(),
    queryFn: () => trackerApi.archived(),
    enabled,
    staleTime: 30_000,
  });
}

/**
 * Move a card — the drag.
 *
 * OPTIMISTIC ON PURPOSE, and this is the one place it really matters. Drag-and-drop is a
 * direct-manipulation gesture: the user has already moved the card with their hand, and a
 * round trip before it settles reads as the card springing back and then jumping. So the
 * cache is rewritten immediately and the server confirms behind it.
 *
 * `onError` restores the exact previous board rather than refetching, because a refetch
 * during a failure races the user's next drag. `onSettled` then re-syncs so the server's
 * positions — which it renumbers densely — become the truth.
 */
export function useMoveTrackedJob() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stage, position }: { id: string; stage: TrackerStage; position?: number }) =>
      trackerApi.move(id, stage, position),

    onMutate: async ({ id, stage, position }) => {
      await qc.cancelQueries({ queryKey: qk.tracker.board() });
      const previous = qc.getQueryData<TrackerBoard>(qk.tracker.board());
      if (previous) qc.setQueryData(qk.tracker.board(), moveCard(previous, id, stage, position));
      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(qk.tracker.board(), ctx.previous);
    },

    onSettled: () => {
      void qc.invalidateQueries({ queryKey: qk.tracker.all });
    },
  });
}

export function useAddTrackedJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddTrackedJobInput) => trackerApi.add(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tracker.all }),
  });
}

export function useUpdateTrackedJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTrackedJobInput }) =>
      trackerApi.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.tracker.all }),
  });
}

/** Archive, restore and delete all invalidate both the board and the archived list. */
export function useTrackedJobActions() {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: qk.tracker.all });

  const archive = useMutation({ mutationFn: trackerApi.archive, onSuccess: done });
  const restore = useMutation({ mutationFn: trackerApi.restore, onSuccess: done });
  const remove = useMutation({ mutationFn: trackerApi.remove, onSuccess: done });

  return {
    archive: (id: string) => archive.mutate(id),
    restore: (id: string) => restore.mutate(id),
    remove: (id: string) => remove.mutate(id),
    isBusy: archive.isPending || restore.isPending || remove.isPending,
  };
}

/**
 * The board as it will look after a move, computed locally for the optimistic update.
 *
 * Mirrors what the server does — remove from wherever it is, insert at `position` in the
 * destination (append when absent), then renumber both columns — so the optimistic board
 * and the confirmed one agree and the card does not visibly shuffle when the response
 * lands. Exported for tests.
 */
export function moveCard(
  board: TrackerBoard,
  id: string,
  toStage: TrackerStage,
  position?: number,
): TrackerBoard {
  const columns = Object.fromEntries(
    Object.entries(board.columns).map(([stage, cards]) => [stage, [...cards]]),
  ) as TrackerBoard["columns"];

  let card: TrackedJob | undefined;
  for (const stage of Object.keys(columns) as TrackerStage[]) {
    const index = columns[stage].findIndex((c) => c.id === id);
    if (index !== -1) [card] = columns[stage].splice(index, 1);
  }
  // Nothing to move — a stale id, or the board changed underneath. Leave it untouched
  // rather than inventing a card.
  if (!card) return board;

  const destination = columns[toStage];
  const index = Math.min(Math.max(position ?? destination.length, 0), destination.length);
  destination.splice(index, 0, { ...card, stage: toStage });

  for (const stage of Object.keys(columns) as TrackerStage[]) {
    columns[stage] = columns[stage].map((c, i) => (c.position === i ? c : { ...c, position: i }));
  }

  return { columns, total: board.total };
}
