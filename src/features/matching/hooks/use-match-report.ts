"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { matchReportApi } from "../api/match-report.api";

/**
 * One stored match report.
 *
 * `staleTime: Infinity` because a report is a SNAPSHOT: the backend stored the scores as
 * they were when the user scanned, so refetching can only ever return the same bytes.
 * Retries are off for the same reason a 403 here is final — the report belongs to someone
 * else, and asking again will not change that.
 */
export function useMatchReport(id: string) {
  return useQuery({
    queryKey: qk.matching.report(id),
    queryFn: () => matchReportApi.get(id),
    enabled: Boolean(id),
    staleTime: Infinity,
    retry: false,
  });
}
