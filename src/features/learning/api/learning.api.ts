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

export const learningApi = {
  /** GET /learning-paths/{userId} */
  learningPath: (userId: string) =>
    apiClient.get<LearningPathDto>(`/learning-paths/${userId}`),

  /** GET /skills/{skillId}/learning-resources (public) */
  skillResources: (skillId: string) =>
    apiClient.get<SkillResourcesDto>(`/skills/${skillId}/learning-resources`, { skipAuth: true }),
};
