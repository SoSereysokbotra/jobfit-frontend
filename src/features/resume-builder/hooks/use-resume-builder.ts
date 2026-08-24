"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import {
  resumeBuilderApi,
  type CreateResumeDocumentInput,
  type ImportableSection,
  type ResumeDocumentDetailDto,
  type UpdateResumeDocumentInput,
} from "../api/resume-builder.api";

/**
 * Templates are seed-only and read-only, so they never change within a session.
 * `staleTime: Infinity` matches how the app treats other immutable catalogues.
 */
export function useResumeTemplates(params?: { atsOnly?: boolean; category?: string }) {
  const filters = {
    ...(params?.atsOnly ? { atsOnly: true } : {}),
    ...(params?.category ? { category: params.category } : {}),
  };
  return useQuery({
    queryKey: qk.resumeBuilder.templates(filters),
    queryFn: () => resumeBuilderApi.templates(params),
    staleTime: Infinity,
  });
}

export function useResumeDocuments() {
  return useQuery({
    queryKey: qk.resumeBuilder.documents(),
    queryFn: () => resumeBuilderApi.list(),
  });
}

export function useResumeDocument(documentId: string | undefined) {
  return useQuery({
    queryKey: qk.resumeBuilder.document(documentId ?? ""),
    queryFn: () => resumeBuilderApi.get(documentId!),
    enabled: Boolean(documentId),
  });
}

/**
 * Optimistic local write into the document detail cache.
 *
 * This is what makes the preview live. The preview renders off this one cache
 * entry, so the section editors patch it on every keystroke: the editor's draft
 * and the preview become the same state, and the debounced section PUT becomes a
 * pure background write that nothing renders off.
 *
 * Deliberately no invalidation afterwards. The section PUTs answer 204 with no
 * body, so a refetch could only re-fetch what we just wrote — and would race the
 * next keystroke to replace it with older data.
 */
export function useLocalDocumentPatch(documentId: string) {
  const qc = useQueryClient();
  return useCallback(
    (patch: Partial<ResumeDocumentDetailDto>) => {
      qc.setQueryData<ResumeDocumentDetailDto>(
        qk.resumeBuilder.document(documentId),
        (previous) => (previous ? { ...previous, ...patch } : previous),
      );
    },
    [qc, documentId],
  );
}

/**
 * `id` and `order` are server-owned and a draft row carries neither, but the
 * preview keys its rows off `id`. Reusing whatever id already sits at this index
 * keeps those keys stable while the user types; a row added since the last read
 * has no server id yet, so it gets a local placeholder until the next read.
 */
export function rowIdentity(
  previous: { id: string }[],
  index: number,
): { id: string; order: number } {
  return { id: previous[index]?.id ?? `local-${index}`, order: index };
}

/**
 * PATCH input merged onto the cached document.
 *
 * `fontFamily` needs its own line: the input type allows `null` to mean "clear
 * it" while the stored DTO only knows `string | undefined`, and a key that is
 * absent altogether must leave the stored value alone rather than clear it.
 */
function applyUpdate(
  current: ResumeDocumentDetailDto,
  input: UpdateResumeDocumentInput,
): ResumeDocumentDetailDto {
  return {
    ...current,
    ...input,
    fontFamily: "fontFamily" in input ? input.fontFamily ?? undefined : current.fontFamily,
  };
}

/**
 * Every `documents()` invalidation below is `exact: true` on purpose.
 *
 * `qk.resumeBuilder.document(id)` is built as `[...documents(), id]`, so a plain
 * prefix invalidation of the list also refetches the detail query the editor is
 * sitting on — which would replace the optimistic, not-yet-saved preview state
 * with whatever the server last stored. The list and the detail are invalidated
 * separately wherever both genuinely need it.
 */
export function useCreateResumeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateResumeDocumentInput) => resumeBuilderApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.resumeBuilder.documents(), exact: true }),
  });
}

/**
 * Settings/title/header updates.
 *
 * The detail cache is patched in `onMutate`, not `onSuccess`, so a new colour or
 * spacing redraws the preview on the click rather than a round-trip later — the
 * same optimistic rule the section editors follow. `onError` puts the old
 * document back so a rejected PATCH never leaves the preview showing a setting
 * the document does not actually have.
 *
 * The list is invalidated because PATCH moves the document in `updatedAt`
 * ordering.
 */
export function useUpdateResumeDocument(documentId: string) {
  const qc = useQueryClient();
  const key = qk.resumeBuilder.document(documentId);

  return useMutation({
    mutationFn: (input: UpdateResumeDocumentInput) =>
      resumeBuilderApi.update(documentId, input),
    onMutate: async (input) => {
      // An in-flight GET would otherwise land after this and undo it.
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<ResumeDocumentDetailDto>(key);
      qc.setQueryData<ResumeDocumentDetailDto>(key, (current) =>
        current ? applyUpdate(current, input) : current,
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) qc.setQueryData(key, context.previous);
    },
    onSuccess: (updated) => {
      qc.setQueryData<ResumeDocumentDetailDto>(key, (previous) =>
        previous ? { ...previous, ...updated } : previous,
      );
      void qc.invalidateQueries({ queryKey: qk.resumeBuilder.documents(), exact: true });
    },
  });
}

export function useDuplicateResumeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => resumeBuilderApi.duplicate(documentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.resumeBuilder.documents(), exact: true }),
  });
}

export function useDeleteResumeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => resumeBuilderApi.remove(documentId),
    onSuccess: (_result, documentId) => {
      qc.removeQueries({ queryKey: qk.resumeBuilder.document(documentId) });
      void qc.invalidateQueries({ queryKey: qk.resumeBuilder.documents(), exact: true });
    },
  });
}

/** Import returns the whole document, so the detail cache is replaced outright. */
export function useImportFromProfile(documentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sections: ImportableSection[]) =>
      resumeBuilderApi.importFromProfile(documentId, sections),
    onSuccess: (document) => {
      qc.setQueryData(qk.resumeBuilder.document(documentId), document);
      void qc.invalidateQueries({ queryKey: qk.resumeBuilder.documents(), exact: true });
    },
  });
}

/**
 * Export.
 *
 * Also invalidates the resumes list: export creates a real `Resume` row (and
 * soft-deletes the previous one), so the Resumes page is stale the moment this
 * succeeds.
 */
export function useExportResumeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => resumeBuilderApi.export(documentId),
    onSuccess: (_result, documentId) => {
      // Export sets exportedResumeId, so the document itself is stale too.
      void qc.invalidateQueries({ queryKey: qk.resumeBuilder.document(documentId) });
      void qc.invalidateQueries({ queryKey: qk.resumeBuilder.documents(), exact: true });
      void qc.invalidateQueries({ queryKey: qk.resumes.all });
    },
  });
}

/**
 * Local draft state for one section.
 *
 * The editor owns its section while the user types — re-seeding from the server
 * on every render would fight the cursor. It re-seeds only when `resetToken`
 * changes, which happens when the document is replaced wholesale (import from
 * profile), never on an ordinary autosave.
 */
export function useSectionDraft<T>(initial: T, resetToken: number) {
  const [draft, setDraft] = useState<T>(initial);

  const initialRef = useRef(initial);
  initialRef.current = initial;

  const firstRun = useRef(true);
  useEffect(() => {
    // Skip the mount pass — useState already seeded it.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setDraft(initialRef.current);
  }, [resetToken]);

  return [draft, setDraft] as const;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounced section autosave.
 *
 * Sections are bulk-replace, so the unit of saving is the whole section — there
 * is nothing finer to send. The debounce coalesces keystrokes into one PUT.
 *
 * Two details that matter:
 *  - The latest payload wins. A timer already pending is cleared and replaced, so
 *    a burst of edits produces exactly one request carrying the final state.
 *  - Responses are sequenced. A slow earlier PUT that lands after a later one
 *    must not flip the indicator back to "saved" for stale data, so each run
 *    carries a token and only the newest may report.
 */
export function useDebouncedSectionSave<T>(
  save: (value: T) => Promise<unknown>,
  options: { delay?: number; onSaved?: () => void } = {},
) {
  const { delay = 800, onSaved } = options;

  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runRef = useRef(0);

  // Held in refs so the returned callback stays stable across renders — an
  // unstable schedule() would re-trigger effects in the section editors.
  const saveRef = useRef(save);
  saveRef.current = save;
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      // Anything in flight is disowned rather than allowed to setState after unmount.
      runRef.current += 1;
    },
    [],
  );

  const flush = useCallback(async (value: T) => {
    const run = (runRef.current += 1);
    setStatus("saving");
    try {
      await saveRef.current(value);
      if (runRef.current !== run) return;
      setStatus("saved");
      onSavedRef.current?.();
    } catch {
      if (runRef.current !== run) return;
      setStatus("error");
    }
  }, []);

  const schedule = useCallback(
    (value: T) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void flush(value), delay);
    },
    [delay, flush],
  );

  /** Save immediately — used on blur, so leaving a field commits it. */
  const saveNow = useCallback(
    (value: T) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      return flush(value);
    },
    [flush],
  );

  return { status, schedule, saveNow };
}
