/**
 * Employer endpoints (backend module: `employer`). All require an EMPLOYER JWT; every
 * route is scoped server-side to the employer's own company (resolved from their profile).
 *
 * Contract read off the running backend, not guessed:
 *   - `GET /employer/companies/me` resolves the company from the caller's profile — the
 *     frontend bootstraps with this (there's no other way to learn your companyId).
 *   - `GET /employer/jobs` lists ALL of the company's jobs (draft + published + closed).
 *   - Job routes require UUID ids (ParseUUIDPipe); the seed uses UUIDs accordingly.
 *   - Pipeline status uses `{ newStatus, notes? }`; the response is a lean
 *     { id, status, previousStatus } — NOT the full application.
 *   - Analytics `views` is always 0 (no view tracking exists yet).
 */

import { apiClient } from "@/lib/api/client";
import type { JobDto } from "@/features/job/api/job.api";
import type { ApplicationStatus } from "@/features/application/api/application.api";

/** Mirrors EmployerCompanyResponseDto. */
export interface EmployerCompanyDto {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  industry: string | null;
  size: string | null;
  foundedYear: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  isVerified: boolean;
  verificationMethod: string | null;
  verifiedAt: string | null;
}

/** Employer jobs reuse the shared JobResponseDto shape. */
export type EmployerJobDto = JobDto;

/** Mirrors JobAnalyticsResponseDto. */
export interface JobAnalyticsDto {
  jobId: string;
  applicationsCount: number;
  applicationsByStatus: Record<string, number>;
  /**
   * Matched candidates by confidence band.
   *
   * Replaces `averageMatchScore`, which the API sourced from a table with no rows — it
   * was null on every response ever sent. It is counts rather than an average because
   * the match score is calibrated for ORDERING, not magnitude
   * (MENTOR_REVIEW_2026-08-18 §13, §15).
   */
  candidateBands: { strong: number; possible: number; weak: number };
  views: number;
}

/** Mirrors EmployerApplicationResponseDto (pipeline row). */
export interface EmployerApplicationDto {
  id: string;
  jobId: string;
  jobTitle: string;
  candidate: { id: string; name: string; email: string };
  status: ApplicationStatus;
  employerNotes: string | null;
  /**
   * What automatic screening found when this candidate applied — a snapshot of that
   * moment, never recomputed. Replaces the old top-level `matchScore`, which read from a
   * table with zero rows and so could never hold a value.
   */
  screening: {
    screenedAt: string | null;
    /**
     * Deterministic scorer, never the LLM fitScore. A TIEBREAK, not the ranking:
     * measured across a senior engineer and a graphic designer it moved only 50 → 46,
     * while requirement coverage separated them cleanly.
     */
    matchScore: number | null;
    requirementsTotal: number;
    /** The ranking signal. */
    requirementsCovered: number;
    missingRequirements: string[];
    requirementsSource: "EMPLOYER" | "AI_EXTRACTED" | "NONE";
  };
  appliedAt: string;
  /**
   * Statuses the employer can move THIS application to right now — reachable from its
   * current status and theirs to decide. Derive affordances from this; do not restate the
   * rules client-side. It is per application, not per stage: from SUBMITTED it excludes
   * INTERVIEW, and unscreened applications sit in SUBMITTED whenever screening could not
   * run. An empty array is legitimate — an ARCHIVED application is finished.
   */
  availableActions: ApplicationStatus[];
  /**
   * Whether the EMPLOYER hid this from their board. The candidate has a separate flag;
   * theirs can never remove a row from here. Archiving used to be a shared status, so it
   * could — and a hired candidate tidying their list vanished from Hired.
   */
  archived: boolean;
  /**
   * Messages from this candidate about their offer that you have not read. A status alone
   * cannot tell a first message from a fifth, which is why later ones went unnoticed.
   */
  unreadMessages: number;
}

export interface CreateJobInput {
  title: string;
  description: string;
  remoteType: "REMOTE" | "HYBRID" | "ON_SITE";
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  skillIds?: string[];
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  bonusPct?: number;
  /** Omit when the employer has not said — the API stores NULL and clients render nothing. */
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY" | "FREELANCE";
  experienceLevel?:
    | "INTERN" | "ENTRY" | "MID" | "SENIOR" | "LEAD" | "MANAGER" | "DIRECTOR" | "C_LEVEL";
}

export type UpdateJobInput = Partial<CreateJobInput>;

export interface UpdateCompanyInput {
  name?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  industry?: string;
  size?: string;
  foundedYear?: number;
  city?: string;
  state?: string;
  country?: string;
}

export interface ListApplicationsParams {
  jobId?: string;
  status?: ApplicationStatus;
  skip?: number;
  take?: number;
}

export const employerApi = {
  // ── Company ──
  companyMe: () => apiClient.get<EmployerCompanyDto>("/employer/companies/me"),
  updateCompany: (companyId: string, input: UpdateCompanyInput) =>
    apiClient.patch<EmployerCompanyDto>(`/employer/companies/${companyId}`, input),
  verifyCompanyEmail: (companyId: string) =>
    apiClient.post<EmployerCompanyDto>(`/employer/companies/${companyId}/verify-email`),

  // ── Jobs ──
  listJobs: () => apiClient.get<EmployerJobDto[]>("/employer/jobs"),
  createJob: (input: CreateJobInput) =>
    apiClient.post<EmployerJobDto>("/employer/jobs", input),
  updateJob: (jobId: string, input: UpdateJobInput) =>
    apiClient.patch<EmployerJobDto>(`/employer/jobs/${jobId}`, input),
  publishJob: (jobId: string) =>
    apiClient.post<EmployerJobDto>(`/employer/jobs/${jobId}/publish`),
  jobAnalytics: (jobId: string) =>
    apiClient.get<JobAnalyticsDto>(`/employer/jobs/${jobId}/analytics`),

  // ── Applications (pipeline) ──
  listApplications: (params: ListApplicationsParams = {}) =>
    apiClient.get<EmployerApplicationDto[]>("/employer/applications", {
      query: { ...params },
    }),
  updateApplicationStatus: (id: string, newStatus: ApplicationStatus, notes?: string) =>
    apiClient.patch<{ id: string; status: ApplicationStatus; previousStatus: ApplicationStatus }>(
      `/employer/applications/${id}/status`,
      { newStatus, ...(notes ? { notes } : {}) },
    ),
  addApplicationNotes: (id: string, notes: string) =>
    apiClient.post<{ id: string; employerNotes: string }>(
      `/employer/applications/${id}/notes`,
      { notes },
    ),

  // ── Job ingestion (FR-JOBS-001) ──
  ingestThemuse: (pages = 1) =>
    apiClient.post<IngestionResult>(`/employer/ingest/themuse?pages=${pages}`),
  /** Externally-ingested jobs (most-recently-seen first). */
  importedJobs: () => apiClient.get<ImportedJob[]>("/employer/ingest/jobs"),
};

/** Summary returned by a job-ingestion run. */
export interface IngestionResult {
  source: string;
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
  ranAt: string;
}

/** A stored, externally-ingested job. */
export interface ImportedJob {
  id: string;
  title: string;
  companyName: string;
  location: string | null;
  remoteType: string;
  source: string;
  externalId: string;
  externalUrl: string | null;
  createdAt: string;
  lastSeenAt: string | null;
}
