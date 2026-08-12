"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import type { Job } from "@/shared/types/shared.types";
import { jobApi } from "@/features/job/api/job.api";
import { toJobView } from "@/features/job/api/job.mappers";
import { savedJobsApi } from "../api/saved-jobs.api";
import { perform } from "@/lib/offline/mutation-queue";

/** The set of saved job IDs (for save toggles on cards). */
export function useSavedJobIds() {
  const query = useQuery({
    queryKey: qk.savedJobs.list(),
    queryFn: () => savedJobsApi.list(),
    staleTime: Infinity,
  });
  return { ...query, ids: new Set(query.data ?? []) };
}

/**
 * Toggle saved state, optimistically updating the cached ID list.
 *
 * Resolves the toggle to an explicit SAVE or UNSAVE before it leaves the
 * client. `POST /saved-jobs/:jobId/toggle` cannot be used by the offline queue:
 * a toggle is not replay-safe, so a retried flush would flip the state back.
 * Stating the intended end state makes the retry a no-op instead.
 */
export function useToggleSavedJob() {
  const qc = useQueryClient();
  const { ids } = useSavedJobIds();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const isSaved = ids.has(jobId);
      await perform(isSaved ? "UNSAVE_JOB" : "SAVE_JOB", { jobId });
      // Computed rather than taken from the response: offline there is no
      // response, and both paths must leave the cache in the same shape.
      return isSaved
        ? [...ids].filter((id) => id !== jobId)
        : [jobId, ...[...ids].filter((id) => id !== jobId)];
    },
    onSuccess: (next) => qc.setQueryData(qk.savedJobs.list(), next),
  });
}

/**
 * Full saved jobs, hydrated from the LIVE job API by id. Saved-but-now-removed
 * postings (404) are dropped rather than shown broken.
 */
export function useSavedJobs() {
  const { data: ids = [] } = useSavedJobIds();
  return useQuery({
    queryKey: [...qk.savedJobs.list(), "hydrated", ids],
    queryFn: async (): Promise<Job[]> => {
      const jobs = await Promise.all(
        ids.map((id) =>
          jobApi
            .get(id)
            .then(toJobView)
            .catch(() => null),
        ),
      );
      return jobs.filter((j): j is Job => j !== null);
    },
    enabled: ids.length > 0,
  });
}
