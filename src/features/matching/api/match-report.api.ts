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

export interface ReportJob {
  externalId: string;
  source: string;
  title: string;
  company: string | null;
  location: string | null;
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

export interface MatchReportPayload {
  job: ReportJob;
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
