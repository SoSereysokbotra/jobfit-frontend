/**
 * Recommendations / matching.
 *
 * TODO(backend): personalized recommendations depend on the AI matching service
 * (sibling `jobfits-ai-service`), which is not yet wired to the backend. Until then
 * this serves the mock job set behind a real async interface so the recommendations
 * UI works and swapping in the live source is a one-file change (Phase 10).
 */

import type { Job } from "@/shared/types/shared.types";
import { MOCK_JOBS } from "@/features/job/api/job.mock";

export const matchingApi = {
  /** Recommended jobs for the current user (mock until the AI service lands). */
  recommendations: async (): Promise<Job[]> => [...MOCK_JOBS],
};
