import type { Job } from "@/shared/types/shared.types";

/** The job fields that decide how an application is made. */
export type ApplyTarget = Pick<Job, "sourceType" | "externalUrl">;

/**
 * EXTERNAL jobs are ingested from another site: no employer in JobFits receives the
 * application and the real posting lives elsewhere, so `POST /applications` rejects them.
 * A list view that fires the mutation anyway shows the user a red error where a redirect
 * was the correct action.
 *
 * Shared by every one-click apply surface so they cannot drift apart — the job detail page,
 * the jobs list and the recommendations list all made the same call independently.
 */
export function isExternalApply(job: ApplyTarget | undefined): boolean {
  return job?.sourceType === "EXTERNAL";
}

/**
 * Open the original posting in a new tab. Returns a message for the caller's banner, so the
 * user is told what happened whether or not the popup was blocked.
 */
export function openExternalPosting(job: ApplyTarget | undefined): {
  tone: "success" | "error";
  text: string;
} {
  if (!job?.externalUrl) {
    // Missing URL is an ingestion data gap. Say so rather than silently doing nothing.
    return {
      tone: "error",
      text: "This job is posted on another site, but we don't have the link to it.",
    };
  }

  // noopener/noreferrer: the target is a third-party site we do not control.
  const opened = window.open(job.externalUrl, "_blank", "noopener,noreferrer");

  return opened
    ? {
        tone: "success",
        text: "Opened the original posting in a new tab. Applications made there can't be tracked in JobFits.",
      }
    : {
        tone: "error",
        text: "We couldn't open the posting — please allow pop-ups, or open the job to apply.",
      };
}
