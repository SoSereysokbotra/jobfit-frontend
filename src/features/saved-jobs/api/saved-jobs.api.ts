/**
 * Saved jobs.
 *
 * TODO(backend): there is no saved-jobs endpoint. Rather than fake it, this persists
 * the saved job IDs in localStorage — a genuinely working, if device-local, feature.
 * When a backend lands, swap the three functions below for HTTP calls and everything
 * above (hooks, pages) keeps working unchanged. (INTEGRATION_PLAN.md Phase 10.)
 */

const STORAGE_KEY = "jobfits_saved_jobs";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export const savedJobsApi = {
  /** All saved job IDs (most-recently-saved first). */
  list: async (): Promise<string[]> => read(),

  /** Toggle a job's saved state; resolves to the new full list. */
  toggle: async (jobId: string): Promise<string[]> => {
    const ids = read();
    const next = ids.includes(jobId) ? ids.filter((id) => id !== jobId) : [jobId, ...ids];
    write(next);
    return next;
  },

  /** Remove a job from the saved list. */
  remove: async (jobId: string): Promise<string[]> => {
    const next = read().filter((id) => id !== jobId);
    write(next);
    return next;
  },
};
