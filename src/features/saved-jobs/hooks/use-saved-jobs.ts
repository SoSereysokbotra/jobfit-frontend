"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import type { Job } from "@/shared/types/shared.types";
import { jobApi } from "@/features/job/api/job.api";
import { toJobView } from "@/features/job/api/job.mappers";
import { savedJobsApi } from "../api/saved-jobs.api";

/** The set of saved job IDs (for save toggles on cards). */
export function useSavedJobIds() {
  const query = useQuery({
    queryKey: qk.savedJobs.list(),
    queryFn: () => savedJobsApi.list(),
    staleTime: Infinity,
  });
  return { ...query, ids: new Set(query.data ?? []) };
}

/** Toggle saved state, optimistically updating the cached ID list. */
export function useToggleSavedJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => savedJobsApi.toggle(jobId),
    onSuccess: (ids) => qc.setQueryData(qk.savedJobs.list(), ids),
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
