import type { BadgeTone } from "@/shared/components/data-display/badge";
import type { EmployerRequestStatus } from "../api/employer-request.api";

/**
 * How each ticket state reads in the queue.
 *
 * Lives here rather than in the page because a Next.js `page.tsx` may only export the
 * route's own contract — any other named export is a build error.
 */
export const STATUS_TONE: Record<EmployerRequestStatus, BadgeTone> = {
  SUBMITTED: "info",
  REVIEWING: "primary",
  PENDING_INFO: "warning",
  APPROVED: "success",
  REJECTED: "neutral",
};

/**
 * Admin-facing labels, not the enum.
 *
 * "Waiting on them" says whose move it is, which is the thing an admin working a queue
 * actually needs to know; PENDING_INFO does not.
 */
export const STATUS_LABEL: Record<EmployerRequestStatus, string> = {
  SUBMITTED: "New",
  REVIEWING: "Reviewing",
  PENDING_INFO: "Waiting on them",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};
