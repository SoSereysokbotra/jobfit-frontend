/**
 * Analytics endpoints (backend module: `user` — analytics controller). Auth required;
 * always scoped to the current user (the JWT subject).
 *
 * Contract read off the backend, not guessed:
 *   - Rates are fractions in [0,1]: applicationRate = interviews/applications,
 *     interviewRate = offers/interviews, offerRate = offers/applications.
 *
 * TODO(backend): there is no salary-insights endpoint. The salary section of the
 * insights page has no live source (INTEGRATION_PLAN.md Phase 10).
 */

import { apiClient } from "@/lib/api/client";

/** Mirrors AnalyticsStatsResponseDto. */
export interface MyStatsDto {
  totalApplications: number;
  totalInterviews: number;
  totalOffers: number;
  applicationRate: number;
  interviewRate: number;
  offerRate: number;
  profileViewCount: number;
  lastProfileViewDate?: string;
}

export const insightsApi = {
  /** GET /analytics/my-stats */
  myStats: () => apiClient.get<MyStatsDto>("/analytics/my-stats"),
};
