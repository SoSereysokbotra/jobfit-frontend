"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { perform } from "@/lib/offline/mutation-queue";

/**
 * Dismiss ("not interested") a recommended job.
 *
 * Goes through the offline queue in BOTH states, because there is no REST route
 * to call: the backend wires `RecommendationDismissService` only into
 * `POST /sync/batch`, so the online path is a batch of one. That is the current
 * API surface, not a workaround — `MatchingController` exposes GETs only.
 *
 * ⚠️ A dismissal is not durable yet. `Recommendation` has no `dismissedAt` and
 * is hard-deleted, and `RecomputeUserMatchesUseCase` rebuilds from scratch
 * without consulting anything, so a dismissed job can reappear
 * (PWA_OFFLINE_KNOWN_GAPS.md §2.4). Do not present dismissal as permanent until
 * that lands.
 */
export function useDismissRecommendation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => perform("DISMISS_RECOMMENDATION", { jobId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.matching.all });
    },
  });
}
