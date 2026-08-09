/**
 * Learning endpoints (backend module: `learning`).
 *   - GET /learning/skill-gaps — auth, own-only. What the jobs YOU applied to ask for that
 *     your CV does not evidence. Replaced GET /learning-paths/{userId}, which returned ten
 *     hardcoded technology skills as anyone's learning path.
 *   - GET /skills/{skillId}/learning-resources — public catalog for one skill.
 */

import { apiClient } from "@/lib/api/client";

export interface LearningResource {
  title: string;
  provider: string;
  url: string;
}

/** Mirrors SkillResourcesView. */
export interface SkillResourcesDto {
  skillId: string;
  skillName: string;
  resources: LearningResource[];
}

/**
 * MISSING — nothing on the CV evidences this.
 * PARTIAL — something adjacent matched. Worth showing, but it must NOT read as covered:
 *   a CV listing "Effective Time Management" once counted as covering "Classroom behaviour
 *   management", because both contain the word `management`.
 */
export type GapCoverage = "MISSING" | "PARTIAL";

/** One requirement a job asks for that the user's CV does not clearly evidence. */
export interface SkillGapDto {
  /** The employer's own wording — a full requirement sentence, never a short skill tag. */
  requirement: string;
  coverage: GapCoverage;
  /** For PARTIAL only: the CV skills that caused the weak match, so the user can overrule it. */
  matchedSkills: string[];
  /** How many of the user's applications ask for it, across all of them. A count, not a grade. */
  requiredBy: number;
}

/** The gaps for one application, so the job is the heading rather than a footnote. */
export interface ApplicationGapsDto {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  source: "EMPLOYER" | "AI_EXTRACTED";
  requirementsTotal: number;
  gaps: SkillGapDto[];
}

/**
 * Mirrors SkillGapSummaryDto.
 *
 * The three empty answers are NOT the same answer and must render differently:
 * `hasApplications: false` (nothing to compute from), `hasParsedResume: false` (no skills to
 * compare against, so every requirement would look like a gap), and empty `gaps` with both
 * flags true (genuinely covered).
 */
export interface SkillGapSummaryDto {
  hasApplications: boolean;
  hasParsedResume: boolean;
  jobsConsidered: number;
  /** Grouped by application, most gaps first. */
  applications: ApplicationGapsDto[];
}

export const learningApi = {
  /** GET /learning/skill-gaps — own-only, derived from the token. */
  skillGaps: () => apiClient.get<SkillGapSummaryDto>("/learning/skill-gaps"),

  /** GET /skills/{skillId}/learning-resources (public) */
  skillResources: (skillId: string) =>
    apiClient.get<SkillResourcesDto>(`/skills/${skillId}/learning-resources`, { skipAuth: true }),
};
