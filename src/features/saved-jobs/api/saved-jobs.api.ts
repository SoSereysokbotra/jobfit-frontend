/**
 * Saved jobs — backed by the live `saved-jobs` endpoints (JWT-scoped to the
 * current user). Each call resolves to the user's full list of saved job ids
 * (most-recently-saved first); mutations return the refreshed list so the caller
 * can replace its cache wholesale. The hooks/pages above are unchanged.
 */

import { apiClient } from "@/lib/api/client";

/** Body of every saved-jobs response (after the client unwraps the envelope). */
interface SavedJobsResponse {
  jobIds: string[];
}

export const savedJobsApi = {
  /** All saved job IDs (most-recently-saved first). */
  list: async (): Promise<string[]> =>
    (await apiClient.get<SavedJobsResponse>("/saved-jobs")).jobIds,

  /**
   * Save a job explicitly; resolves to the new full list.
   *
   * Separate from `toggle` because a toggle is not replay-safe: retrying it
   * flips the state a second time, so the offline queue — which retries by
   * design — must state the intended end state rather than "invert whatever is
   * there". This is also the route that honours `Idempotency-Key`.
   */
  save: async (jobId: string, idempotencyKey?: string): Promise<string[]> =>
    (
      await apiClient.post<SavedJobsResponse>("/saved-jobs", { jobId }, { idempotencyKey })
    ).jobIds,

  /** Toggle a job's saved state; resolves to the new full list. */
  toggle: async (jobId: string): Promise<string[]> =>
    (
      await apiClient.post<SavedJobsResponse>(
        `/saved-jobs/${jobId}/toggle`,
        undefined,
      )
    ).jobIds,

  /** Remove a job from the saved list; resolves to the new full list. */
  remove: async (jobId: string, idempotencyKey?: string): Promise<string[]> =>
    (await apiClient.delete<SavedJobsResponse>(`/saved-jobs/${jobId}`, { idempotencyKey }))
      .jobIds,
};
