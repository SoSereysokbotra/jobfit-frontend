"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { matchingApi } from "../api/matching.api";
import type { MatchReadinessDto } from "../api/matching.api";

/** How often to re-ask while the answer is still "we are working on it". */
const POLL_MS = 5_000;

/**
 * Whether matching can produce results for the current user, and why not when it cannot.
 *
 * POLLS ONLY WHILE `transient` IS TRUE. That flag is the backend's own statement that the
 * state resolves on its own (EMBEDDING_PENDING); every other state is waiting on the user
 * or on us, so re-asking would burn requests to receive the same answer forever. This is
 * also why the poll keys off the response rather than a caller-supplied boolean — the
 * server decides when it is worth asking again.
 *
 * `staleTime: 0` because the whole point is to observe a change; caching a PENDING answer
 * would leave the bridge screen spinning after the embedding had already landed.
 */
export function useMatchReadiness(enabled = true) {
  return useQuery<MatchReadinessDto>({
    queryKey: qk.matching.readiness(),
    queryFn: () => matchingApi.readiness(),
    enabled,
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.data?.transient ? POLL_MS : false,
  });
}
