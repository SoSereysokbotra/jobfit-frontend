/**
 * Job endpoints (backend module: `job`). Public — no auth required.
 *
 * Contract read off the running backend, not guessed:
 *   - `GET /jobs` does NOT default to published: with no `status` it returns
 *     DRAFT + PUBLISHED + CLOSED. A public board must send `status=PUBLISHED`.
 *   - `remoteType` is one of the canonical tokens REMOTE | HYBRID | ON_SITE.
 *   - `salaryRange` is absolute yearly amounts ({ min, max, currency }) or absent.
 *   - `companyName` is enriched by JobService from the Company table (the Job
 *     aggregate itself only carries `companyId`); it can be absent.
 *
 * TODO(backend): the Job model has no employment type, experience level, industry,
 * or match score. Those frontend `Job` fields are defaulted in job.mappers.ts and
 * flagged there — swap when the backend exposes them (match depends on the AI
 * service; see INTEGRATION_PLAN.md Phase 10).
 */

import { apiClient } from "@/lib/api/client";

/** Mirrors JobResponseDto. */
export interface JobDto {
  id: string;
  companyId: string;
  companyName?: string;
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  remoteType: string;
  location?: string;
  salaryRange?: { min: number; max: number; currency: string };
  skillIds: string[];
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  bonusPct?: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Query params accepted by `GET /jobs` (SearchJobQueryDto). */
export interface SearchJobsParams {
  q?: string;
  status?: "DRAFT" | "PUBLISHED" | "CLOSED";
  remoteType?: string;
  location?: string;
  skillIds?: string[];
  minSalary?: number;
  maxSalary?: number;
  limit?: number;
  offset?: number;
}

export const jobApi = {
  /**
   * GET /jobs — public search. Defaults to PUBLISHED and a generous page size,
   * because the current UI filters/sorts client-side over the fetched set (the
   * facets it filters on — type, level, industry, match — have no server-side
   * equivalent yet).
   */
  search: (params: SearchJobsParams = {}) =>
    apiClient.get<JobDto[]>("/jobs", {
      skipAuth: true,
      query: { status: "PUBLISHED", limit: 100, ...params },
    }),

  /** GET /jobs/{id} — public. */
  get: (jobId: string) => apiClient.get<JobDto>(`/jobs/${jobId}`, { skipAuth: true }),
};
