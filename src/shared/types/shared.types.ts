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
  /**
   * The posting's pay band, ABSOLUTE and exactly as the employer stated it — 140000 is
   * one hundred and forty thousand. `null` means the posting did not say, which is 348
   * of the 367 jobs in the corpus.
   *
   * These used to be "$K/year" numbers produced by dividing the API value by 1000, and
   * null became 0. Both halves were wrong (MENTOR_REVIEW_2026-08-18 §12): "$0K – $0K"
   * showed on almost every card, and the rounding destroyed the range the product
   * actually targets — a $300/month Phnom Penh salary became `0`, indistinguishable
   * from "unknown". Never scale these; `formatSalaryRange` abbreviates for display.
   */
  salaryMin: number | null;
  salaryMax: number | null;
  /** ISO 4217, from the API. Absent means the API did not say — do not assume USD. */
  salaryCurrency?: string;
  /**
   * How often the band is paid. ABSENT means unknown and must not be rendered as a
   * period: 500 monthly and 500 annual are the same number without this.
   */
  salaryPeriod?: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" | "ANNUAL";
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

export { formatSalaryRange, formatPostedDate } from "@/shared/utils/formatters";
