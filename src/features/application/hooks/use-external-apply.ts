"use client";

import { ApiError } from "@/lib/api/client";
import { useAddTrackedJob } from "@/features/job-tracker/hooks/use-tracker";
import { openExternalPosting, type ApplyTarget } from "../lib/external-apply";

/** What the caller needs to identify the job and reach the posting. */
export type ExternalApplyJob = ApplyTarget & { id: string };

/**
 * Applying to a job that lives on another site.
 *
 * TWO THINGS HAPPEN, and they are separate on purpose:
 *  1. the original posting opens, because that is where the application is actually made;
 *  2. a card is added to the Job Tracker under Applied, because otherwise the user has no
 *     record of it anywhere in JobFits — which is exactly what made this feature necessary.
 *
 * `window.open` runs FIRST and synchronously. Awaiting the tracker write before opening
 * would put an async gap between the click and the window, and popup blockers close that
 * gap by blocking the window. The tracker write follows and its failure never prevents the
 * user from reaching the posting.
 *
 * A 409 means the job is already on the board, which is the end state we wanted — reported
 * as success, not as an error the user has to think about.
 *
 * One hook rather than a copy in each list page, for the same reason `external-apply.ts`
 * exists: the jobs list, the recommendations list and the detail page all made this
 * decision independently once, and drifted.
 */
export function useExternalApply() {
  const track = useAddTrackedJob();

  return (job: ExternalApplyJob | undefined): { tone: "success" | "error"; text: string } => {
    const opened = openExternalPosting(job);
    // No URL, or the popup was blocked — nothing was applied to, so nothing is tracked.
    if (opened.tone === "error" || !job) return opened;

    track.mutate(
      { jobId: job.id, stage: "APPLIED" },
      {
        onError: (e) => {
          if (e instanceof ApiError && e.statusCode === 409) return; // already on the board
          // Deliberately quiet otherwise: the posting is open and the user is mid-apply.
          // Interrupting that to report a bookkeeping failure helps nobody, and the card
          // can be added by hand from the tracker.
          console.warn("Could not add this job to the tracker", e);
        },
      },
    );

    return {
      tone: "success",
      text: "Opened the original posting, and added it to your Job Tracker under Applied.",
    };
  };
}
