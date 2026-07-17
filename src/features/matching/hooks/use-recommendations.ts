"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { matchingApi } from "../api/matching.api";

/** Personalized job recommendations (mock behind interface — see matching.api). */
export function useRecommendations() {
  return useQuery({
    queryKey: qk.matching.recommendations(),
    queryFn: () => matchingApi.recommendations(),
    staleTime: 60_000,
  });
}
