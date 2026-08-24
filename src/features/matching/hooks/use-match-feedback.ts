"use client";

import { useState, useCallback } from "react";
import { useToggleSavedJob, useSavedJobIds } from "@/features/saved-jobs/hooks/use-saved-jobs";
import { useDismissRecommendation } from "./use-dismiss-recommendation";

export type SwipeAction = "save" | "dismiss";

export interface SwipeHistoryEntry {
  jobId: string;
  action: SwipeAction;
  timestamp: number;
}

/**
 * Hook for managing match swipe feedback on recommendations.
 *
 * Requirements per UI_ENHANCEMENT_PLAN.md § Phase 4:
 * - Right-swipe (save): wired to existing `useToggleSavedJob` (persisted in backend).
 * - Left-swipe (dismiss): feeds `useDismissRecommendation` + session feedback tracking.
 *   TODO(backend): matching.api.ts exposes no feedback/dislike recording endpoint yet.
 *   Session-level feedback is retained client-side and marked TODO(backend).
 * - Undo support: allows undoing the last swiped card.
 */
export function useMatchFeedback() {
  const toggleSaved = useToggleSavedJob();
  const { ids: savedJobIds } = useSavedJobIds();
  const dismissMutation = useDismissRecommendation();

  const [history, setHistory] = useState<SwipeHistoryEntry[]>([]);
  const [sessionDismissedIds, setSessionDismissedIds] = useState<Set<string>>(new Set());

  const handleSwipe = useCallback(
    (jobId: string, action: SwipeAction) => {
      setHistory((prev) => [...prev, { jobId, action, timestamp: Date.now() }]);

      if (action === "save") {
        if (!savedJobIds.has(jobId)) {
          toggleSaved.mutate(jobId);
        }
      } else if (action === "dismiss") {
        setSessionDismissedIds((prev) => new Set(prev).add(jobId));
        // Dismiss recommendation via queue
        dismissMutation.mutate(jobId);
      }
    },
    [savedJobIds, toggleSaved, dismissMutation]
  );

  const handleUndo = useCallback(() => {
    if (history.length === 0) return null;

    const lastEntry = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    if (lastEntry.action === "save") {
      if (savedJobIds.has(lastEntry.jobId)) {
        toggleSaved.mutate(lastEntry.jobId);
      }
    } else if (lastEntry.action === "dismiss") {
      setSessionDismissedIds((prev) => {
        const next = new Set(prev);
        next.delete(lastEntry.jobId);
        return next;
      });
    }

    return lastEntry;
  }, [history, savedJobIds, toggleSaved]);

  return {
    history,
    canUndo: history.length > 0,
    sessionDismissedIds,
    handleSwipe,
    handleUndo,
    isSaving: toggleSaved.isPending,
  };
}
