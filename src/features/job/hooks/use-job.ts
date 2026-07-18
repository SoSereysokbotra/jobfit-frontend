"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { jobApi, type SearchJobsParams } from "../api/job.api";
import { toJobView, toJobViews } from "../api/job.mappers";

/**
 * Published jobs for the board. The UI filters/sorts client-side over this set
 * (see use-job-search), so by default we fetch the whole published page once and
 * let React Query cache it. Pass `params` to push a filter down to the backend.
 */
export function useJobs(params: SearchJobsParams = {}) {
  return useQuery({
    queryKey: qk.jobs.list(params as Record<string, unknown>),
    queryFn: () => jobApi.search(params).then(toJobViews),
    staleTime: 60_000,
  });
}

/** A single job by id (public). */
export function useJob(jobId: string | undefined) {
  return useQuery({
    queryKey: qk.jobs.detail(jobId ?? ""),
    queryFn: () => jobApi.get(jobId as string).then(toJobView),
    enabled: Boolean(jobId),
  });
}
