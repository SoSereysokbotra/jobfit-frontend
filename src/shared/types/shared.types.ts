/* Shared domain types used across features (job, dashboard, saved-jobs, recommendations). */

export type EmploymentType = "Full-time" | "Contract" | "Part-time" | "Freelance";
export type RemoteType = "On-site" | "Hybrid" | "Remote";
export type ExperienceLevel = "Entry-level" | "Mid-level" | "Senior" | "Lead/Manager";

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
  type: EmploymentType;
  remote: RemoteType;
  level: ExperienceLevel;
  industry: string;
  postedDaysAgo: number;
  description: string;
}

export function formatSalaryRange(job: Pick<Job, "salaryMin" | "salaryMax">): string {
  return `$${job.salaryMin}K – $${job.salaryMax}K`;
}

export function formatPostedDate(daysAgo: number): string {
  if (daysAgo <= 0) return "Posted today";
  if (daysAgo === 1) return "Posted yesterday";
  return `Posted ${daysAgo} days ago`;
}
