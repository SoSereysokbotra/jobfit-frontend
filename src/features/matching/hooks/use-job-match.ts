"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { matchingApi } from "../api/matching.api";

/** The real match score for one job against the current user's profile. */
export function useJobMatch(jobId: string | undefined) {
  return useQuery({
    queryKey: qk.matching.breakdown(jobId ?? ""),
    queryFn: () => matchingApi.matchForJob(jobId as string),
    enabled: Boolean(jobId),
    staleTime: 5 * 60_000,
  });
}
