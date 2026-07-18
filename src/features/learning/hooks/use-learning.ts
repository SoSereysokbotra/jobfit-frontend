"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { useAuth } from "@/providers/auth-provider";
import { learningApi } from "../api/learning.api";

/**
 * The current user's skill-gap learning path. Resolves the user id from the
 * session (the endpoint is own-only), so callers don't pass it in.
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
