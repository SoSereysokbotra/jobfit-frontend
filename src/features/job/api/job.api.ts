/**
 * Job endpoints (backend module: `job`). Public — no auth required.
 *
 * Contract read off the running backend, not guessed:
 *   - `GET /jobs` does NOT default to published: with no `status` it returns
 *     DRAFT + PUBLISHED + CLOSED. A public board must send `status=PUBLISHED`.
 *   - `remoteType` is one of the canonical tokens REMOTE | HYBRID | ON_SITE.
 *   - `salaryRange` is ABSOLUTE amounts ({ min, max, currency, period }) or absent.
 *     `period` is absent when the posting did not state one — do not assume yearly.
 *   - `companyName` is enriched by JobService from the Company table (the Job
 *     aggregate itself only carries `companyId`); it can be absent.
 *
 * `employmentType` and `experienceLevel` are OPTIONAL and are omitted for every posting
 * whose employer has not set them — which is all 55 that existed before the columns did.
 * Absent means absent; job.mappers.ts leaves the field undefined rather than defaulting.
 *
 * TODO(backend): `match` still has no source (depends on the AI service; see
 * INTEGRATION_PLAN.md Phase 10).
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
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
    /** Absent when unknown. Never default this to ANNUAL — see §12. */
    period?: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" | "ANNUAL";
  };
  skillIds: string[];
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  bonusPct?: number | null;
  /** Absent when the employer has not said. Never render a default for these. */
  employmentType?: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY" | "FREELANCE";
  experienceLevel?:
    | "INTERN" | "ENTRY" | "MID" | "SENIOR" | "LEAD" | "MANAGER" | "DIRECTOR" | "C_LEVEL";
  /**
   * INTERNAL — apply inside JobFits. EXTERNAL — ingested from another site; the user must
   * apply at `externalUrl`. The server REJECTS applications to EXTERNAL jobs, so the UI
   * must send the user onward rather than showing an apply button that will fail.
   * Optional so a response from an older backend still parses (treated as INTERNAL).
   */
  sourceType?: "INTERNAL" | "EXTERNAL";
  /** The original posting, for EXTERNAL jobs. */
  externalUrl?: string;
  /**
   * Real company facts, on the DETAIL endpoint only. Every field is omitted when the
   * database has no value — render nothing for a missing field, never a default.
   */
  company?: {
    name: string;
    description?: string;
    website?: string;
    industry?: string;
    size?: string;
    foundedYear?: number;
    location?: string;
    glassdoorRating?: number;
    glassdoorReviews?: number;
  };
  createdAt: string;
  updatedAt: string;
}

/** Query params accepted by `GET /jobs` (SearchJobQueryDto). */
export interface SearchJobsParams {
  q?: string;
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
      // No `status` here. Public browse is PUBLISHED-only server-side and the parameter
      // was removed from the API contract, because accepting it meant `?status=DRAFT`
      // listed every unpublished posting on the platform to anyone. Sending it now is a
      // 400 (forbidNonWhitelisted), which took the seeker job list down entirely.
      query: { limit: 100, ...params },
    }),

  /** GET /jobs/{id} — public. */
  get: (jobId: string) => apiClient.get<JobDto>(`/jobs/${jobId}`, { skipAuth: true }),
};
