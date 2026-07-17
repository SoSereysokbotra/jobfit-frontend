/** Backend DTO -> view adapters for the application feature. */

import type { ApplicationDto, ApplicationStatus, TimelineEntryDto } from "./application.api";
import type { Job } from "@/shared/types/shared.types";
import type { BadgeTone } from "@/shared/components/data-display/badge";
import { daysSince, initialsFrom, logoBgFor } from "@/lib/utils/format";

interface StatusMeta {
  label: string;
  tone: BadgeTone;
}

/** Presentation for each of the 10 backend statuses. */
export const STATUS_META: Record<ApplicationStatus, StatusMeta> = {
  DRAFT: { label: "Draft", tone: "neutral" },
  SUBMITTED: { label: "Submitted", tone: "info" },
  SCREENING: { label: "Screening", tone: "info" },
  INTERVIEW: { label: "Interview", tone: "primary" },
  OFFER: { label: "Offer", tone: "warning" },
  NEGOTIATING: { label: "Negotiating", tone: "warning" },
  ACCEPTED: { label: "Accepted", tone: "success" },
  REJECTED: { label: "Rejected", tone: "error" },
  WITHDRAWN: { label: "Withdrawn", tone: "neutral" },
  ARCHIVED: { label: "Archived", tone: "neutral" },
};

/** Kanban columns. Every status maps to exactly one column (see COLUMN_OF). */
export interface BoardColumn {
  id: string;
  label: string;
  statuses: ApplicationStatus[];
}

export const BOARD_COLUMNS: BoardColumn[] = [
  { id: "applied", label: "Applied", statuses: ["DRAFT", "SUBMITTED"] },
  { id: "screening", label: "Screening", statuses: ["SCREENING"] },
  { id: "interview", label: "Interview", statuses: ["INTERVIEW"] },
  { id: "offer", label: "Offer", statuses: ["OFFER", "NEGOTIATING"] },
  { id: "accepted", label: "Accepted", statuses: ["ACCEPTED"] },
  { id: "closed", label: "Closed", statuses: ["REJECTED", "WITHDRAWN", "ARCHIVED"] },
];

const COLUMN_OF: Record<ApplicationStatus, string> = BOARD_COLUMNS.reduce(
  (acc, col) => {
    col.statuses.forEach((s) => (acc[s] = col.id));
    return acc;
  },
  {} as Record<ApplicationStatus, string>,
);

export function columnIdForStatus(status: ApplicationStatus): string {
  return COLUMN_OF[status] ?? "applied";
}

/** Statuses a user can move an application to from the detail view. */
export const SELECTABLE_STATUSES: ApplicationStatus[] = [
  "SUBMITTED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "NEGOTIATING",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
  "ARCHIVED",
];

function appliedLabel(iso: string): string {
  const days = daysSince(iso);
  if (days === 0) return "Applied today";
  if (days === 1) return "Applied yesterday";
  return `Applied ${days} days ago`;
}

export interface ApplicationView extends ApplicationDto {
  jobTitle: string;
  company: string;
  logo: string;
  logoBg: string;
  location: string;
  appliedLabel: string;
  statusMeta: StatusMeta;
}

/**
 * Build a view from an application and its (optionally resolved) job. The job is
 * fetched separately because ApplicationResponseDto has no embedded job; when it
 * can't be resolved (closed/removed posting) we degrade to a readable placeholder.
 */
export function toApplicationView(dto: ApplicationDto, job?: Job | null): ApplicationView {
  return {
    ...dto,
    jobTitle: job?.title ?? "Job posting",
    company: job?.company ?? "Unknown company",
    logo: job?.logo ?? initialsFrom("Job"),
    logoBg: job?.logoBg ?? logoBgFor(dto.jobId),
    location: job?.location ?? "—",
    appliedLabel: appliedLabel(dto.appliedAt),
    statusMeta: STATUS_META[dto.status] ?? { label: dto.status, tone: "neutral" },
  };
}

export interface TimelineEntryView {
  id: string;
  label: string;
  tone: BadgeTone;
  eventType: string;
  description?: string;
  dateLabel: string;
}

export function toTimelineView(entry: TimelineEntryDto): TimelineEntryView {
  const meta = STATUS_META[entry.status] ?? { label: entry.status, tone: "neutral" as BadgeTone };
  const date = new Date(entry.eventDate);
  return {
    id: entry.id,
    label: meta.label,
    tone: meta.tone,
    eventType: entry.eventType,
    description: entry.description,
    dateLabel: Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
  };
}
