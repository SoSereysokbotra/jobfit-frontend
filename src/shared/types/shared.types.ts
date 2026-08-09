/* Shared domain types used across features (job, dashboard, saved-jobs, recommendations). */

export type EmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Temporary"
  | "Freelance";
export type RemoteType = "On-site" | "Hybrid" | "Remote";
export type ExperienceLevel =
  | "Intern"
  | "Entry-level"
  | "Mid-level"
  | "Senior"
  | "Lead"
  | "Manager"
  | "Director"
  | "C-level";

export interface Job {
  id: string;
  title: string;
  company: string;
  /** 1–2 letter mark shown in the logo block. */
  logo: string;
  /** Token-backed background for the logo block, e.g. "var(--color-primary-700)". */
  logoBg: string;
  location: string;
  /** Salary bounds in $K/year. */
  salaryMin: number;
  salaryMax: number;
  /** Match score 0–100 (shown only when profile is complete). */
  match: number;
  /**
   * ABSENT when the employer has not said, and absent must render as nothing.
   *
   * These three used to be required, which the mapper satisfied by hardcoding
   * "Full-time" / "Mid-level" / "Technology" on every job — so every card in search,
   * saved jobs, the dashboard and recommendations asserted all three, including on a
   * part-time teaching post. Making them optional is what forces each call site to
   * decide what "not known" looks like, instead of being handed a plausible lie.
   */
  type?: EmploymentType;
  remote: RemoteType;
  level?: ExperienceLevel;
  /** Resolved from the posting company, and present on the job DETAIL response only. */
  industry?: string;
  postedDaysAgo: number;
  description: string;
  /** Employer-authored structured content (absent/empty when unset). */
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  /** Target annual bonus, % of base. */
  bonusPct?: number;
  /** Sub-scores behind `match` (0–100 each) when this job came from recommendations. */
  matchBreakdown?: Record<string, number>;
  /** Human-readable "why this matched", when available. */
  matchReason?: string;
  /**
   * INTERNAL — apply inside JobFits. EXTERNAL — ingested from another site; the user must
   * apply at `externalUrl`, and the server rejects in-app applications to it.
   */
  sourceType?: "INTERNAL" | "EXTERNAL";
  /** The original posting, for EXTERNAL jobs. */
  externalUrl?: string;
  /**
   * Real company facts, present on the job detail page only. Fields the database has no
   * value for are absent and must render as nothing rather than a placeholder.
   */
  companyProfile?: {
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
}

export function formatSalaryRange(job: Pick<Job, "salaryMin" | "salaryMax">): string {
  return `$${job.salaryMin}K – $${job.salaryMax}K`;
}

export function formatPostedDate(daysAgo: number): string {
  if (daysAgo <= 0) return "Posted today";
  if (daysAgo === 1) return "Posted yesterday";
  return `Posted ${daysAgo} days ago`;
}
