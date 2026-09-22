/** Backend DTO -> view adapters for the employer feature. */
import type { BadgeTone } from "@/shared/components/data-display/badge";
import type { ApplicationStatus } from "@/features/application/api/application.api";
import { daysSince, initialsFrom } from "@/lib/utils/format";
import { formatSalaryRange } from "@/shared/utils/formatters";
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
  /**
   * Preformatted pay band, or null when the posting states none. A STRING, not two
   * numbers, so the two screens that render it cannot re-invent the "$…K" they both
   * hardcoded (MENTOR_REVIEW_2026-08-18 §12) — the currency and period live in the
   * formatter, which reads them off the API.
   */
  salary: string | null;
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
    salary: formatSalaryRange({
      salaryMin: dto.salaryRange?.min ?? null,
      salaryMax: dto.salaryRange?.max ?? null,
      salaryCurrency: dto.salaryRange?.currency,
      salaryPeriod: dto.salaryRange?.period,
    }),
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
  // Legacy only — nothing writes this status any more. It used to arrive here whenever
  // EITHER party archived, so a candidate tidying a job they had accepted showed up on
  // the employer's board as rejected. Archiving is now a per-side flag that never changes
  // the status; rows still carrying ARCHIVED predate that change.
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
  /**
   * Deterministic match score, or null when screening never ran. NOT the ranking signal —
   * measured across a senior engineer and a graphic designer it moved only 50 → 46.
   */
  match: number | null;
  /** How many of the job's stated requirements the résumé evidences. Ranks the list. */
  requirementsCovered: number;
  requirementsTotal: number;
  /** Requirements with no supporting skill — what the employer should probe in interview. */
  missing: string[];
  /** Whether the employer wrote the requirements or AI read them from the description. */
  requirementsSource: "EMPLOYER" | "AI_EXTRACTED" | "NONE";
  /** False when screening never ran, so "0 of 0" is never mistaken for a bad candidate. */
  screened: boolean;
  stage: ApplicationStage;
  status: ApplicationStatus;
  /**
   * Where this candidate can legally go next, straight from the backend.
   *
   * Deliberately kept as raw statuses rather than mapped to stage names: several statuses
   * share a column (SUBMITTED and SCREENING are both "Applied"), so mapping here would
   * lose the distinction the check depends on. The board compares at drop time instead.
   */
  availableActions: ApplicationStatus[];
  /** Unread messages from this candidate about their offer. Drives the board badge. */
  unreadMessages: number;
  appliedAt: string;
  /**
   * The raw ISO timestamp behind `appliedAt`. Kept alongside the human label because the
   * label ("3 days ago") cannot be bucketed, sorted or compared — the dashboard trend
   * chart groups applications by month off this.
   */
  appliedAtISO: string;
  notes: string | null;
  /**
   * The CV this candidate applied with — metadata only, so the card can name the file and
   * show the button. NULL when the candidate has since deleted it, which is a real state
   * and not an error: the button is hidden rather than handed a link that cannot resolve.
   */
  resume: { fileName: string; fileType: string; fileSize: number } | null;
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
    match: dto.screening.matchScore,
    requirementsCovered: dto.screening.requirementsCovered,
    requirementsTotal: dto.screening.requirementsTotal,
    missing: dto.screening.missingRequirements,
    requirementsSource: dto.screening.requirementsSource,
    screened: dto.screening.screenedAt !== null,
    stage: STATUS_TO_STAGE[dto.status] ?? "Applied",
    status: dto.status,
    availableActions: dto.availableActions ?? [],
    unreadMessages: dto.unreadMessages ?? 0,
    appliedAt: postedLabel(dto.appliedAt),
    appliedAtISO: dto.appliedAt,
    notes: dto.employerNotes,
    resume: dto.resume
      ? {
          fileName: dto.resume.fileName,
          fileType: dto.resume.fileType,
          fileSize: dto.resume.fileSize,
        }
      : null,
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
  foundedYear: number | null;
  isVerified: boolean;
  city: string;
  state: string;
  country: string;
  logoUrl: string | null;
}

export function toCompanyView(dto: EmployerCompanyDto): CompanyView {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? "",
    website: dto.website ?? "",
    industry: dto.industry ?? "",
    size: dto.size ?? "",
    foundedYear: dto.foundedYear ?? null,
    isVerified: dto.isVerified,
    city: dto.city ?? "",
    state: dto.state ?? "",
    country: dto.country ?? "",
    logoUrl: dto.logoUrl,
  };
}

/**
 * Applications per month, derived from the applications the employer already has.
 *
 * Computed client-side on purpose: there is no time-series analytics endpoint, but
 * `GET /employer/applications` returns every row unpaginated with a real `appliedAt`,
 * so the applications series needs no backend work. Views are NOT charted — nothing in
 * the system records job-post impressions (the per-job analytics endpoint hardcodes
 * `views: 0`), and an invented second line would misreport reach.
 *
 * Months with no applications are kept as zeroes rather than skipped, so the gaps read
 * as quiet months instead of compressing the x-axis into a misleading straight line.
 */
export interface TrendPoint {
  month: string;
  applications: number;
}

export function buildApplicationTrend(
  applicants: Pick<ApplicantView, "appliedAtISO">[],
  months = 6,
  now = new Date(),
): TrendPoint[] {
  const buckets = new Map<string, TrendPoint>();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.set(`${d.getFullYear()}-${d.getMonth()}`, {
      month: d.toLocaleString("en-US", { month: "short" }),
      applications: 0,
    });
  }

  for (const a of applicants) {
    const d = new Date(a.appliedAtISO);
    // A malformed timestamp must not become a phantom data point.
    if (Number.isNaN(d.getTime())) continue;
    const point = buckets.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (point) point.applications++;
  }

  return [...buckets.values()];
}
