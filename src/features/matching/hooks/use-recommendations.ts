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
 *
 * `staleTime` STAYS AT 60s ON PURPOSE. It looks like the reason a profile edit appeared
 * to do nothing, but shortening it is the wrong fix: this endpoint is not a cheap read —
 * it is the only thing that rebuilds the cache, and a cold recompute has been measured at
 * ~56s (docs/AI_DEGRADATION_PLAN.md). Refetching on every mount would put that on the
 * request path repeatedly. What was actually missing is invalidation on the event that
 * changes the answer: the profile / preferences / salary mutations now invalidate
 * `qk.matching.all`, which refetches immediately regardless of this value.
 */
export function useRecommendations({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: qk.matching.recommendations(),
    queryFn: () => matchingApi.recommendations(),
    enabled,
    staleTime: 60_000,
  });
}
