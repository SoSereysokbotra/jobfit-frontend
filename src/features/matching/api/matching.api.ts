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

export const matchingApi = {
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
