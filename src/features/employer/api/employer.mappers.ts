/** Backend DTO -> view adapters for the employer feature. */

import type { BadgeTone } from "@/shared/components/data-display/badge";
import type { ApplicationStatus } from "@/features/application/api/application.api";
import { daysSince, initialsFrom, toSalaryK } from "@/lib/utils/format";
import type {
  EmployerApplicationDto,
  EmployerCompanyDto,
  EmployerJobDto,
} from "./employer.api";

// ── Job status (display) ─────────────────────────────────────────────────────
export type JobStatusDisplay = "Published" | "Draft" | "Closed";

const JOB_STATUS_LABEL: Record<string, JobStatusDisplay> = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
  CLOSED: "Closed",
};

export const JOB_STATUS_TONE: Record<JobStatusDisplay, BadgeTone> = {
  Published: "success",
  Draft: "neutral",
  Closed: "warning",
};

const REMOTE_LABEL: Record<string, string> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ON_SITE: "On-site",
  ONSITE: "On-site",
};

function postedLabel(iso: string): string {
  const d = daysSince(iso);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  return `${d} days ago`;
}

export interface EmployerJobView {
  id: string;
  title: string;
  status: JobStatusDisplay;
  statusTone: BadgeTone;
  postedAt: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  remote: string;
  /** TODO(backend): Job has no employmentType column — defaulted. */
  employmentType: string;
  /** Skill names aren't exposed to the client; we only have ids. */
  skillCount: number;
}

export function toEmployerJobView(dto: EmployerJobDto): EmployerJobView {
  const status = JOB_STATUS_LABEL[dto.status] ?? "Draft";
  return {
    id: dto.id,
    title: dto.title,
    status,
    statusTone: JOB_STATUS_TONE[status],
    postedAt: postedLabel(dto.createdAt),
    location: dto.location?.trim() || (REMOTE_LABEL[dto.remoteType] === "Remote" ? "Remote" : "—"),
    salaryMin: toSalaryK(dto.salaryRange?.min),
    salaryMax: toSalaryK(dto.salaryRange?.max),
    remote: REMOTE_LABEL[(dto.remoteType ?? "").toUpperCase()] ?? "On-site",
    employmentType: "Full-time",
    skillCount: dto.skillIds.length,
  };
}

// ── Application pipeline stages ──────────────────────────────────────────────
export type ApplicationStage = "Applied" | "Interview" | "Offer" | "Hired" | "Rejected";

/** Backend status -> employer board stage. */
const STATUS_TO_STAGE: Record<ApplicationStatus, ApplicationStage> = {
  DRAFT: "Applied",
  SUBMITTED: "Applied",
  SCREENING: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  NEGOTIATING: "Offer",
  ACCEPTED: "Hired",
  REJECTED: "Rejected",
  WITHDRAWN: "Rejected",
  ARCHIVED: "Rejected",
};

/** Board stage -> the backend status to set when a card is dropped there. */
export const STAGE_TO_STATUS: Record<ApplicationStage, ApplicationStatus> = {
  Applied: "SUBMITTED",
  Interview: "INTERVIEW",
  Offer: "OFFER",
  Hired: "ACCEPTED",
  Rejected: "REJECTED",
};

export const STAGE_TONE: Record<ApplicationStage, BadgeTone> = {
  Applied: "info",
  Interview: "primary",
  Offer: "warning",
  Hired: "success",
  Rejected: "error",
};

export interface ApplicantView {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  initials: string;
  email: string;
  /** TODO(backend): match score depends on the AI service — 0 when unavailable. */
  match: number;
  stage: ApplicationStage;
  status: ApplicationStatus;
  appliedAt: string;
  notes: string | null;
}

export function toApplicantView(dto: EmployerApplicationDto): ApplicantView {
  const name = dto.candidate.name?.trim() || dto.candidate.email.split("@")[0];
  return {
    id: dto.id,
    jobId: dto.jobId,
    jobTitle: dto.jobTitle,
    name,
    initials: initialsFrom(name),
    email: dto.candidate.email,
    match: dto.matchScore ?? 0,
    stage: STATUS_TO_STAGE[dto.status] ?? "Applied",
    status: dto.status,
    appliedAt: postedLabel(dto.appliedAt),
    notes: dto.employerNotes,
  };
}

// ── Company ──────────────────────────────────────────────────────────────────
export interface CompanyView {
  id: string;
  name: string;
  description: string;
  website: string;
  industry: string;
  size: string;
  isVerified: boolean;
  city: string;
  state: string;
  country: string;
  logoUrl: string | null;
}

export function toCompanyView(dto: EmployerCompanyDto): CompanyView {
  const location = [dto.city, dto.state, dto.country].filter(Boolean).join(", ");
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? "",
    website: dto.website ?? "",
    industry: dto.industry ?? "",
    size: dto.size ?? "",
    isVerified: dto.isVerified,
    city: dto.city ?? "",
    state: dto.state ?? "",
    country: dto.country ?? "",
    logoUrl: dto.logoUrl,
  };
}

/**
 * TODO(backend): there is no time-series analytics endpoint. The dashboard trend
 * chart uses this placeholder series (INTEGRATION_PLAN.md Phase 10). Swap when a
 * `GET /employer/analytics/trend` (or similar) exists.
 */
export const EMPLOYER_TREND_PLACEHOLDER = [
  { month: "Jan", applications: 8, views: 120 },
  { month: "Feb", applications: 14, views: 210 },
  { month: "Mar", applications: 22, views: 340 },
  { month: "Apr", applications: 18, views: 290 },
  { month: "May", applications: 31, views: 460 },
  { month: "Jun", applications: 27, views: 410 },
  { month: "Jul", applications: 38, views: 540 },
];
