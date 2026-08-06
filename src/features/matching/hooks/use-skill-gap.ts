"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { matchingApi } from "../api/matching.api";

/**
 * Which of a job's requirements the user's résumé does not evidence.
 *
 * Cached generously: the answer only changes when the job or the user's résumé changes,
 * and for ingested jobs the requirements behind it came from an LLM extraction that is
 * already cached server-side.
 */
export function useSkillGap(jobId: string | undefined) {
  return useQuery({
    queryKey: qk.matching.skillGap(jobId ?? ""),
    queryFn: () => matchingApi.skillGap(jobId as string),
    enabled: Boolean(jobId),
    staleTime: 5 * 60_000,
  });
}
