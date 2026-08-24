/**
 * Job Tracker — the board for jobs applied to on OTHER sites.
 *
 * Deliberately separate from `/applications`. An application is a record of what an
 * employer decided and its status is the employer's to set; a tracked job is the user's
 * own note about a hunt happening on bongthom, jobnet or anywhere else, where nothing
 * reports back. The backend enforces that split with its own table and enum — see
 * jobfit-backend/docs/JOB_TRACKER_PLAN.md.
 */

import { apiClient } from "@/lib/api/client";

/** Board columns, in the order they are shown. Mirrors the backend enum exactly. */
export const TRACKER_STAGES = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
] as const;

export type TrackerStage = (typeof TRACKER_STAGES)[number];

/** Column headings and the sentence under each, from the product design. */
export const STAGE_META: Record<TrackerStage, { title: string; blurb: string }> = {
  SAVED: {
    title: "Saved",
    blurb: "Jobs you want to come back to. Nothing has been sent yet.",
  },
  APPLIED: {
    title: "Applied",
    blurb: "Application sent. Awaiting a response from the employer.",
  },
  INTERVIEW: {
    title: "Interview",
    blurb: "Invited to interview. Keep the dates and your notes here.",
  },
  OFFER: {
    title: "Offer",
    blurb: "Interviews done. Negotiating, or waiting on the employer.",
  },
  REJECTED: {
    title: "Rejected",
    blurb: "No response or a rejection. Worth reviewing your approach.",
  },
};

export interface TrackedJob {
  id: string;
  /** Set when the card came from a posting JobFits holds; null for anything hand-entered. */
  jobId: string | null;
  title: string;
  companyName: string;
  url: string | null;
  location: string | null;
  stage: TrackerStage;
  position: number;
  minSalary: number | null;
  maxSalary: number | null;
  notes: string | null;
  appliedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
}

/** Every stage is present, possibly empty — the server owns the column vocabulary. */
export interface TrackerBoard {
  columns: Record<TrackerStage, TrackedJob[]>;
  total: number;
}

export interface AddTrackedJobInput {
  /** A posting we hold. Title and company are then copied FROM it, server-side. */
  jobId?: string;
  /** Required unless `jobId` is given. */
  title?: string;
  companyName?: string;
  url?: string;
  location?: string;
  stage?: TrackerStage;
}

export interface UpdateTrackedJobInput {
  title?: string;
  companyName?: string;
  url?: string;
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  notes?: string;
}

export const trackerApi = {
  board: () => apiClient.get<TrackerBoard>("/tracker"),
  archived: () => apiClient.get<TrackedJob[]>("/tracker/archived"),
  add: (input: AddTrackedJobInput) => apiClient.post<TrackedJob>("/tracker", input),
  /**
   * One drag. `position` is the index in the DESTINATION column, from 0; omitting it
   * appends. The server clamps an out-of-range index rather than refusing, so a stale
   * index cannot fail a drag the user already saw land.
   */
  move: (id: string, stage: TrackerStage, position?: number) =>
    apiClient.patch<TrackedJob>(`/tracker/${id}/move`, { stage, position }),
  update: (id: string, input: UpdateTrackedJobInput) =>
    apiClient.patch<TrackedJob>(`/tracker/${id}`, input),
  archive: (id: string) => apiClient.post<TrackedJob>(`/tracker/${id}/archive`),
  restore: (id: string) => apiClient.post<TrackedJob>(`/tracker/${id}/restore`),
  remove: (id: string) => apiClient.delete<void>(`/tracker/${id}`),
};

/** An empty board, used as the placeholder while loading so columns never flicker in. */
export function emptyBoard(): TrackerBoard {
  const columns = {} as TrackerBoard["columns"];
  for (const stage of TRACKER_STAGES) columns[stage] = [];
  return { columns, total: 0 };
}

/** "$40K – $65K", "from $40K", or null when the user has not said. */
export function formatTrackedSalary(job: TrackedJob): string | null {
  const k = (n: number) => `$${Math.round(n / 1000)}K`;
  if (job.minSalary != null && job.maxSalary != null) return `${k(job.minSalary)} – ${k(job.maxSalary)}`;
  if (job.minSalary != null) return `from ${k(job.minSalary)}`;
  if (job.maxSalary != null) return `up to ${k(job.maxSalary)}`;
  return null;
}
