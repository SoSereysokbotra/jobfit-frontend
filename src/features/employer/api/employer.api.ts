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
  averageMatchScore: number | null;
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
  matchScore: number | null;
  appliedAt: string;
}

export interface CreateJobInput {
  title: string;
  description: string;
  remoteType: "REMOTE" | "HYBRID" | "ON_SITE";
  location?: string;
  minSalary?: number;
  maxSalary?: number;
  skillIds?: string[];
}

export type UpdateJobInput = Partial<CreateJobInput>;

export interface UpdateCompanyInput {
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
};
