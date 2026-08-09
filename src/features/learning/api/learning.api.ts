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

/** One requirement the user's applied jobs ask for that their CV does not evidence. */
export interface SkillGapDto {
  /** The employer's own wording — a full requirement sentence, never a short skill tag. */
  requirement: string;
  /** How many of the user's applications ask for it. A count, not a grade. */
  requiredBy: number;
  source: "EMPLOYER" | "AI_EXTRACTED";
  /** The jobs behind the count, so the number can be checked. */
  jobTitles?: string[];
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
  gaps: SkillGapDto[];
}

export const learningApi = {
  /** GET /learning/skill-gaps — own-only, derived from the token. */
  skillGaps: () => apiClient.get<SkillGapSummaryDto>("/learning/skill-gaps"),

  /** GET /skills/{skillId}/learning-resources (public) */
  skillResources: (skillId: string) =>
    apiClient.get<SkillResourcesDto>(`/skills/${skillId}/learning-resources`, { skipAuth: true }),
};
