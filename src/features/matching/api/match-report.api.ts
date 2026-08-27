/**
 * Match-report endpoints (backend module: `match-report`).
 *   - GET /match-report/{id} — auth, OWNER-ONLY. The stored, full-page résumé↔job report
 *     the browser extension generated with POST /match-report.
 *
 * The web app only ever READS a report. It is generated from the extension, on the job
 * page, because that is the only place the posting's text is visible — see the extension's
 * SiteAdapter.getDescription for what is captured and what is (not) kept.
 *
 * These types mirror the backend's MatchReportPayload verbatim. Every section is nullable
 * on purpose: a user with no profile, a user with no parsed résumé and an AI service that
 * was down are three different partial reports, and the page renders each one honestly
 * rather than pretending a missing section is a zero.
 */

import { apiClient } from "@/lib/api/client";

export type CheckStatus = "pass" | "warn" | "fail";

export interface SearchabilityCheck {
  label: string;
  status: CheckStatus;
  /** What to fix — absent when the check passes cleanly. */
  hint?: string;
}

/**
 * Pay as the POSTING advertises it — shown, never scored.
 *
 * The candidate's expected salary is stored without a period, so comparing a monthly
 * advert against it would mean inventing a unit. The advert's own words are shown
 * instead, period included.
 */
export interface PostedSalary {
  min: number | null;
  max: number | null;
  currency: string | null;
  /** "MONTH" | "YEAR" | "HOUR" … Null when the posting doesn't say. */
  period: string | null;
}

export interface ReportJob {
  externalId: string;
  source: string;
  title: string;
  company: string | null;
  location: string | null;
  /** What the posting advertises, when it publishes it as structured data. */
  salary: PostedSalary | null;
}

export interface ReportMatchRate {
  /**
   * Null when it could not be computed. Skills is the only sub-score that measures fit
   * to THIS role, so without it there is no honest total — render the absence, not a 0.
   */
  overall: number | null;
  subScores: {
    skills: number;
    experience: number;
    location: number;
    salary: number;
    other: number;
  };
  /**
   * False when the skills sub-score had no embedding to work from. Then `overall` is
   * null and `subScores.skills` is a placeholder to render as "not computed".
   */
  semantic: boolean;
  /** What `subScores.experience` measured — see ReportExperience. */
  experience: ReportExperience;
}

/**
 * Which question the experience row answered.
 *
 * REQUIREMENT — the posting stated a years bar and the CV's dates were read: a real
 *   per-job number.
 * CV_DEPTH — no bar stated, or the CV couldn't be dated, so it falls back to counting CV
 *   entries. That number is the SAME for every job this user opens, so it must not be
 *   labelled as fit to this one.
 */
export interface ReportExperience {
  basis: "REQUIREMENT" | "CV_DEPTH";
  requiredYears: number | null;
  candidateYears: number | null;
  /** Null when either side is unknown — not the same as "doesn't meet it". */
  met: boolean | null;
  /**
   * Where the bar came from, or null when none was found.
   *
   * `posting-data` — the site published it as a NUMBER (schema.org
   *   `monthsOfExperience`): language-proof and exact, so it works on a Khmer advert.
   * `posting-text` — read out of the prose, which is guarded against age ranges and
   *   negations but is still a reading, not a fact.
   */
  statedIn: "posting-data" | "posting-text" | null;
}

export interface ReportSearchability {
  atsScore: number;
  /** Sub-score names differ between the AI and heuristic scorers, so this is open-ended. */
  breakdown: Record<string, number>;
  checks: SearchabilityCheck[];
}

export interface ReportSkill {
  skill: string;
  inResume: boolean;
  /** How prominently the posting mentions it. */
  count: number;
  /** Which résumé skills carried the match — lets the reader overrule a weak one. */
  matchedSkills?: string[];
  matchQuality?: "EXACT" | "PARTIAL";
  /**
   * The posting hedged this one — "an advantage", "a plus", "preferred". Shown, but
   * excluded from the matched/missing counts: it isn't something the employer requires.
   */
  optional?: boolean;
}

export interface ReportSkills {
  /** False when requirement extraction was unavailable — NOT the same as "no requirements". */
  available: boolean;
  hard: ReportSkill[];
  soft: ReportSkill[];
  matchedCount: number;
  missingCount: number;
}

export interface ReportRecruiterTips {
  qualityScore: number;
  /** Ungated: the extension has no premium tier, so nothing here is blurred or locked. */
  suggestions: string[];
}

export interface ReportResume {
  id: string;
  fileName: string;
  summaryPresent: boolean;
}

/**
 * A requirement a candidate either has or hasn't: a qualification or a language.
 *
 * These WARN and never penalise — they do not move the match rate. Employers hire under
 * their stated bar routinely, and a score that silently absorbs a penalty stops being
 * interpretable.
 */
export interface HardRequirement {
  kind: "DEGREE" | "LANGUAGE";
  label: string;
  /** Null = couldn't check (no parsed CV). NEVER render null as "you lack this". */
  met: boolean | null;
  /** The posting's own words, so the reader can overrule our reading. */
  quote: string;
}

export interface MatchReportPayload {
  job: ReportJob;
  /** Degree/language bars stated by the posting. Empty for most postings. */
  hardRequirements: HardRequirement[];
  matchRate: ReportMatchRate | null;
  searchability: ReportSearchability | null;
  skills: ReportSkills;
  recruiterTips: ReportRecruiterTips | null;
  resume: ReportResume | null;
  /** True when there was no parsed résumé — the page prompts an upload. */
  needsResume: boolean;
  generatedAt: string;
}

export const matchReportApi = {
  /**
   * GET /match-report/{id} — owner-only.
   *
   * Resolves to `null` for a report that does not exist (the backend returns a `null`
   * data key rather than 404-ing), and throws ApiError(403) for someone else's.
   */
  get: (id: string) => apiClient.get<MatchReportPayload | null>(`/match-report/${id}`),
};
