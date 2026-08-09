/**
 * Learning-path endpoints (backend module: `learning`).
 *   - GET /learning-paths/{userId} — auth, own-only. Current skills + skill-gap
 *     recommendations (in-demand skills the user lacks), each with resources.
 *   - GET /skills/{skillId}/learning-resources — public catalog for one skill.
 */

import { apiClient } from "@/lib/api/client";

export interface LearningResource {
  title: string;
  provider: string;
  url: string;
}

export interface SkillGapRecommendation {
  skill: string;
  resources: LearningResource[];
}

/** Mirrors LearningPathView. */
export interface LearningPathDto {
  userId: string;
  currentSkills: string[];
  gapSkills: SkillGapRecommendation[];
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

  /** GET /learning-paths/{userId} */
  learningPath: (userId: string) =>
    apiClient.get<LearningPathDto>(`/learning-paths/${userId}`),

  /** GET /skills/{skillId}/learning-resources (public) */
  skillResources: (skillId: string) =>
    apiClient.get<SkillResourcesDto>(`/skills/${skillId}/learning-resources`, { skipAuth: true }),
};
