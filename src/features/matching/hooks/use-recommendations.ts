"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { matchingApi } from "../api/matching.api";

/**
 * Personalized job recommendations — live `GET /recommendations`, not a mock.
 *
 * An empty array is a REAL answer, and the page must not read it as "your filters are
 * too narrow": the backend returns [] when the candidate has no profile embedding, which
 * is what made this page blank for four seed users.
 */
export function useRecommendations() {
  return useQuery({
    queryKey: qk.matching.recommendations(),
    queryFn: () => matchingApi.recommendations(),
    staleTime: 60_000,
  });
}
