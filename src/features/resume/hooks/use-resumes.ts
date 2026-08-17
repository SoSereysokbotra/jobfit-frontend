"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { resumeApi } from "../api/resume.api";
import { toResumeView, type ResumeView } from "../api/resume.mappers";

/** Poll interval while a resume is PENDING/PROCESSING. */
const PARSING_POLL_MS = 2000;
/** Stop polling after ~2 minutes so a stuck queue doesn't poll forever. */
const PARSING_POLL_TIMEOUT_MS = 2 * 60 * 1000;

export function useResumes() {
  const query = useQuery({
    queryKey: qk.resumes.list(),
    queryFn: async () => (await resumeApi.list()).map(toResumeView),
  });

  const resumes = query.data ?? [];
  return {
    resumes,
    /** The default resume, or the newest one when none is flagged. */
    defaultResume: resumes.find((r) => r.isDefault) ?? resumes[0] ?? null,
    isLoading: query.isPending,
    error: query.error,
  };
}

export function useResume(resumeId: string | undefined) {
  const query = useQuery({
    queryKey: qk.resumes.detail(resumeId ?? "unknown"),
    queryFn: async (): Promise<ResumeView> => toResumeView(await resumeApi.get(resumeId!)),
    enabled: Boolean(resumeId),
  });

  return { resume: query.data ?? null, isLoading: query.isPending && Boolean(resumeId), error: query.error };
}

/**
 * Polls GET /{id}/parsing-status until it leaves PENDING/PROCESSING.
 *
 * Parsing is done by a BullMQ worker, so this resolves only when Redis and the
 * worker are running; `hasTimedOut` lets the UI say so instead of spinning
 * forever.
 */
export function useParsingStatus(resumeId: string | undefined, enabled = true) {
  const queryClient = useQueryClient();
  const startedAt = useRef<number>(Date.now());

  const query = useQuery({
    queryKey: qk.resumes.parsingStatus(resumeId ?? "unknown"),
    queryFn: () => resumeApi.parsingStatus(resumeId!),
    enabled: Boolean(resumeId) && enabled,
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (status === "SUCCESS" || status === "FAILED") return false;
      if (Date.now() - startedAt.current > PARSING_POLL_TIMEOUT_MS) return false;
      return PARSING_POLL_MS;
    },
  });

  const status = query.data?.status;
  const isSettled = status === "SUCCESS" || status === "FAILED";

  // Once parsing finishes the resume row itself changed (scores land on it).
  useEffect(() => {
    if (!isSettled || !resumeId) return;
    void queryClient.invalidateQueries({ queryKey: qk.resumes.detail(resumeId) });
    void queryClient.invalidateQueries({ queryKey: qk.resumes.lists() });
  }, [isSettled, resumeId, queryClient]);

  return {
    status: status ?? null,
    error: query.data?.error,
    isPolling: Boolean(resumeId) && enabled && !isSettled,
    hasTimedOut:
      !isSettled && Date.now() - startedAt.current > PARSING_POLL_TIMEOUT_MS && Boolean(query.data),
  };
}

/**
 * Scores for a parsed resume. Deliberately gated on `isParsed`: the endpoints
 * 400 with "Resume has not been parsed yet" before that.
 *
 * GET /scores is not a plain read — the backend calculates on demand and CACHES the
 * result onto the resume row (ResumeScorerService.scoreResume). Uploading never scores,
 * so a résumé has no atsScore until something calls this. That is why the list has to be
 * invalidated afterwards: the row the cards render from is stale the moment this returns.
 *
 * `enabled` is the caller's gate, not just "is it parsed". ResumeScorerService re-runs the
 * AI on EVERY call rather than returning the cached value, so a caller that already has a
 * score should pass false instead of paying for an identical one.
 */
export function useResumeScores(resumeId: string | undefined, enabled: boolean) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: qk.resumes.scores(resumeId ?? "unknown"),
    queryFn: () => resumeApi.scores(resumeId!),
    enabled: Boolean(resumeId) && enabled,
    // Each refetch is a fresh AI call; a window focus is not a reason to buy another.
    staleTime: Infinity,
  });

  const isScored = query.isSuccess;

  // Picks up the freshly cached atsScore/qualityScore. Invalidating the list does not
  // re-run this query (different key), so there is no loop.
  useEffect(() => {
    if (!isScored || !resumeId) return;
    void queryClient.invalidateQueries({ queryKey: qk.resumes.detail(resumeId) });
    void queryClient.invalidateQueries({ queryKey: qk.resumes.lists() });
  }, [isScored, resumeId, queryClient]);

  return { scores: query.data ?? null, isLoading: query.isPending && enabled, error: query.error };
}

export function useResumeMutations() {
  const queryClient = useQueryClient();
  const invalidateList = () => queryClient.invalidateQueries({ queryKey: qk.resumes.lists() });

  const remove = useMutation({
    mutationFn: (resumeId: string) => resumeApi.remove(resumeId),
    onSuccess: invalidateList,
  });

  const setDefault = useMutation({
    mutationFn: (resumeId: string) => resumeApi.setDefault(resumeId),
    // Every row's isDefault can change, so refetch the list rather than patch one.
    onSuccess: invalidateList,
  });

  const recalculateScore = useMutation({
    mutationFn: (resumeId: string) => resumeApi.calculateScore(resumeId),
    onSuccess: (_data, resumeId) => {
      void queryClient.invalidateQueries({ queryKey: qk.resumes.detail(resumeId) });
      void queryClient.invalidateQueries({ queryKey: qk.resumes.scores(resumeId) });
      void invalidateList();
    },
  });

  return { remove, setDefault, recalculateScore };
}

/** TODO(backend): mock-backed — see resume.api.ts getParsedData. */
export function useParsedData(resumeId: string | undefined, isParsed: boolean) {
  const query = useQuery({
    queryKey: [...qk.resumes.detail(resumeId ?? "unknown"), "parsed-data"] as const,
    queryFn: () => resumeApi.getParsedData(resumeId!),
    enabled: Boolean(resumeId) && isParsed,
  });

  return { parsed: query.data ?? null, isLoading: query.isPending && isParsed };
}
