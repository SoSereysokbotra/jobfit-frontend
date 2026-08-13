"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import {
  savedExternalJobsApi,
  type SavedExternalJob,
} from "../api/saved-external-jobs.api";

/** Jobs saved from the browser extension, newest first. */
export function useSavedExternalJobs() {
  return useQuery({
    queryKey: qk.savedJobs.external(),
    queryFn: () => savedExternalJobsApi.list(),
    staleTime: 30_000,
  });
}

/**
 * Remove one, optimistically.
 *
 * Not routed through the offline mutation queue like `useToggleSavedJob`: these rows are
 * written by the extension, which needs the network anyway, so there is no offline path
 * that could create one to delete. On failure the previous list is put back.
 */
export function useRemoveSavedExternalJob() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => savedExternalJobsApi.remove(id),
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: qk.savedJobs.external() });
      const previous = qc.getQueryData<SavedExternalJob[]>(qk.savedJobs.external());
      qc.setQueryData<SavedExternalJob[]>(qk.savedJobs.external(), (rows) =>
        (rows ?? []).filter((row) => row.id !== id),
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        qc.setQueryData(qk.savedJobs.external(), context.previous);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: qk.savedJobs.external() });
    },
  });
}
