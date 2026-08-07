/**
 * Recommendations / matching.
 *
 * Backed by GET /recommendations (semantic match over BGE-M3 embeddings, scored
 * skills/experience/location/salary). The endpoint returns JobDto-shaped rows
 * plus a `match` score, so we reuse the job feature's `toJobView` mapper and
 * overlay the real match score.
 */

import { apiClient } from "@/lib/api/client";
import type { Job } from "@/shared/types/shared.types";
import type { JobDto } from "@/features/job/api/job.api";
import { toJobView } from "@/features/job/api/job.mappers";

/** GET /recommendations item: a JobDto plus match metadata. */
export interface RecommendedJobDto extends JobDto {
  match: number;
  reason?: string;
  breakdown?: Record<string, number>;
}

/** Why a skill gap may be empty — an empty `missing` list means different things. */
export type SkillGapStatus = "OK" | "JOB_HAS_NO_REQUIREMENTS" | "NO_PARSED_RESUME";

/** Whether the requirements are the employer's own words or the model's reading. */
export type RequirementsSource = "EMPLOYER" | "AI_EXTRACTED" | "NONE";

export interface SkillGapDto {
  status: SkillGapStatus;
  requirementsSource: RequirementsSource;
  requirements: {
    text: string;
    matchedSkills: string[];
    /**
     * EXACT — the skill appears verbatim. PARTIAL — only part of a multi-word skill
     * appears. Real evidence, but weaker; must not be shown as a full match.
     */
    matchQuality?: "EXACT" | "PARTIAL";
  }[];
  /** Requirements with no supporting skill — what the user should act on. */
  missing: string[];
  matchedCount: number;
  skillsConsidered: string[];
}

export const matchingApi = {
  /**
   * Which of a job's stated requirements the user's résumé does not evidence.
   *
   * Deliberately carries NO match percentage: the LLM fitScore was measured as
   * uncorrelated with real fit, so the backend serves only the requirement lists.
   */
  skillGap: (jobId: string): Promise<SkillGapDto> =>
    apiClient.get<SkillGapDto>(
      `/recommendations/skill-gap?jobId=${encodeURIComponent(jobId)}`,
    ),

  /** Recommended jobs for the current user, ranked by match score. */
  recommendations: async (): Promise<Job[]> => {
    const dtos = await apiClient.get<RecommendedJobDto[]>("/recommendations");
    // toJobView defaults match to 0; overlay the real score + breakdown + reason.
    return dtos.map((dto) => ({
      ...toJobView(dto),
      match: dto.match,
      matchBreakdown: dto.breakdown,
      matchReason: dto.reason,
    }));
  },
};
