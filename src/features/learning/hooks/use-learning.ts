"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { useAuth } from "@/providers/auth-provider";
import { learningApi } from "../api/learning.api";

/**
 * What the jobs this user applied to ask for that their CV does not evidence.
 *
 * Replaced a hook that measured every user against the same ten hardcoded technology
 * skills — so a mathematics teacher was told to learn Docker. These gaps come from her own
 * applications, so they follow her field.
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

// useLearningPath is gone with the endpoint behind it: it fetched ten hardcoded technology
// skills as anyone's learning path, whatever field they were in.
