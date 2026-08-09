"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { useAuth } from "@/providers/auth-provider";
import { learningApi } from "../api/learning.api";

/**
 * What the jobs this user applied to ask for that their CV does not evidence.
 *
 * Replaces useLearningPath, which measured every user against the same ten hardcoded
 * technology skills — so a mathematics teacher was told to learn Docker. These gaps come
 * from her own applications, so they follow her field.
 */
export function useSkillGaps() {
  const { user } = useAuth();
  return useQuery({
    queryKey: qk.learning.gaps(user?.id ?? ""),
    queryFn: () => learningApi.skillGaps(),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });
}

/**
 * The current user's skill-gap learning path. Resolves the user id from the
 * session (the endpoint is own-only), so callers don't pass it in.
 *
 * @deprecated superseded by useSkillGaps; removed in Phase 4 of LEARNING_PATH_PLAN.md.
 */
export function useLearningPath() {
  const { user } = useAuth();
  const userId = user?.id;
  return useQuery({
    queryKey: qk.learning.path(userId ?? ""),
    queryFn: () => learningApi.learningPath(userId as string),
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}
