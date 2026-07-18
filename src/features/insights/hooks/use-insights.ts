"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { insightsApi } from "../api/insights.api";

/** The current user's funnel + engagement stats. */
export function useMyStats() {
  return useQuery({
    queryKey: qk.analytics.myStats(),
    queryFn: () => insightsApi.myStats(),
    staleTime: 60_000,
  });
}
