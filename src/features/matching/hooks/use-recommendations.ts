"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { matchingApi } from "../api/matching.api";

/**
 * Personalized job recommendations — live `GET /recommendations`, not a mock.
 *
 * An empty array is a REAL answer, and the page must not read it as "your filters are
 * too narrow": the backend returns [] when the candidate has no profile embedding, which
 * is what made this page blank for four seed users. Pair it with `useMatchReadiness` to
 * tell those two apart before rendering an empty state.
 *
 * `enabled` exists for the onboarding bridge screen, which holds the query back until
 * readiness says READY. Fetching earlier is not merely wasted — this endpoint triggers
 * the lazy recompute, so calling it mid-embedding races the very thing it is waiting on.
 */
export function useRecommendations({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: qk.matching.recommendations(),
    queryFn: () => matchingApi.recommendations(),
    enabled,
    staleTime: 60_000,
  });
}
