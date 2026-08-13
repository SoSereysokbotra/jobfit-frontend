/**
 * Jobs saved from the browser extension (backend module: `saved-job`).
 *   - GET    /saved-jobs/external      — auth, own-only. Newest first.
 *   - DELETE /saved-jobs/external/{id} — auth, owner-scoped in the WHERE clause.
 *
 * SEPARATE FROM `saved-jobs.api.ts` on purpose, and the split is not cosmetic: that one
 * deals in internal `jobId`s (a foreign key into our own `jobs` table) and returns a list
 * of ids the job endpoints then resolve. A LinkedIn posting has no such row, so these
 * carry their own copy of the title/company/description the user saved.
 *
 * The web app only READS these. They are written from the extension, on the job page,
 * because that is the only place the posting is visible.
 */

import { apiClient } from "@/lib/api/client";

export interface SavedExternalJob {
  id: string;
  /** "linkedin", … */
  source: string;
  externalId: string;
  title: string;
  company: string | null;
  /** What the user chose to save from the posting. May be long. */
  description: string | null;
  url: string | null;
  /** Free text — postings write "$70k–90k", "1,200 USD/month", "negotiable". */
  salary: string | null;
  notes: string | null;
  savedAt: string;
}

export const savedExternalJobsApi = {
  list: () => apiClient.get<SavedExternalJob[]>("/saved-jobs/external"),

  remove: (id: string) =>
    apiClient.delete<{ removed: boolean }>(`/saved-jobs/external/${id}`),
};
