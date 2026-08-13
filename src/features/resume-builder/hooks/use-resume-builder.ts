"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import {
  resumeBuilderApi,
  type CreateResumeDocumentInput,
  type ImportableSection,
  type ResumeDocumentDetailDto,
  type UpdateResumeDocumentInput,
} from "../api/resume-builder.api";

/**
 * Templates are seed-only and read-only, so they never change within a session.
 * `staleTime: Infinity` matches how the app treats other immutable catalogues.
 */
export function useResumeTemplates(params?: { atsOnly?: boolean; category?: string }) {
  const filters = {
    ...(params?.atsOnly ? { atsOnly: true } : {}),
    ...(params?.category ? { category: params.category } : {}),
  };
  return useQuery({
    queryKey: qk.resumeBuilder.templates(filters),
    queryFn: () => resumeBuilderApi.templates(params),
    staleTime: Infinity,
  });
}

export function useResumeDocuments() {
  return useQuery({
    queryKey: qk.resumeBuilder.documents(),
    queryFn: () => resumeBuilderApi.list(),
  });
}

export function useResumeDocument(documentId: string | undefined) {
  return useQuery({
    queryKey: qk.resumeBuilder.document(documentId ?? ""),
    queryFn: () => resumeBuilderApi.get(documentId!),
    enabled: Boolean(documentId),
  });
}

export function useCreateResumeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateResumeDocumentInput) => resumeBuilderApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.resumeBuilder.documents() }),
  });
}

/**
 * Settings/title/header updates.
 *
 * The detail cache is patched directly on success so the preview reflects a new
 * colour or spacing immediately, without a refetch round-trip. The list is
 * invalidated because PATCH moves the document in `updatedAt` ordering.
 */
export function useUpdateResumeDocument(documentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateResumeDocumentInput) =>
      resumeBuilderApi.update(documentId, input),
    onSuccess: (updated) => {
      qc.setQueryData<ResumeDocumentDetailDto>(
        qk.resumeBuilder.document(documentId),
        (previous) => (previous ? { ...previous, ...updated } : previous),
      );
      void qc.invalidateQueries({ queryKey: qk.resumeBuilder.documents() });
    },
  });
}

export function useDuplicateResumeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => resumeBuilderApi.duplicate(documentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.resumeBuilder.documents() }),
  });
}

export function useDeleteResumeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => resumeBuilderApi.remove(documentId),
    onSuccess: (_result, documentId) => {
      qc.removeQueries({ queryKey: qk.resumeBuilder.document(documentId) });
      void qc.invalidateQueries({ queryKey: qk.resumeBuilder.documents() });
    },
  });
}

/** Import returns the whole document, so the detail cache is replaced outright. */
export function useImportFromProfile(documentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sections: ImportableSection[]) =>
      resumeBuilderApi.importFromProfile(documentId, sections),
    onSuccess: (document) => {
      qc.setQueryData(qk.resumeBuilder.document(documentId), document);
      void qc.invalidateQueries({ queryKey: qk.resumeBuilder.documents() });
    },
  });
}

/**
 * Export.
 *
 * Also invalidates the resumes list: export creates a real `Resume` row (and
 * soft-deletes the previous one), so the Resumes page is stale the moment this
 * succeeds.
 */
export function useExportResumeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => resumeBuilderApi.export(documentId),
    onSuccess: (_result, documentId) => {
      // Export sets exportedResumeId, so the document itself is stale too.
      void qc.invalidateQueries({ queryKey: qk.resumeBuilder.document(documentId) });
      void qc.invalidateQueries({ queryKey: qk.resumeBuilder.documents() });
      void qc.invalidateQueries({ queryKey: qk.resumes.all });
    },
  });
}

/**
 * Local draft state for one section.
 *
 * The editor owns its section while the user types — re-seeding from the server
 * on every render would fight the cursor. It re-seeds only when `resetToken`
 * changes, which happens when the document is replaced wholesale (import from
 * profile), never on an ordinary autosave.
 */
export function useSectionDraft<T>(initial: T, resetToken: number) {
  const [draft, setDraft] = useState<T>(initial);

  const initialRef = useRef(initial);
  initialRef.current = initial;

  const firstRun = useRef(true);
  useEffect(() => {
    // Skip the mount pass — useState already seeded it.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setDraft(initialRef.current);
  }, [resetToken]);

  return [draft, setDraft] as const;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounced section autosave.
 *
 * Sections are bulk-replace, so the unit of saving is the whole section — there
 * is nothing finer to send. The debounce coalesces keystrokes into one PUT.
 *
 * Two details that matter:
 *  - The latest payload wins. A timer already pending is cleared and replaced, so
 *    a burst of edits produces exactly one request carrying the final state.
 *  - Responses are sequenced. A slow earlier PUT that lands after a later one
 *    must not flip the indicator back to "saved" for stale data, so each run
 *    carries a token and only the newest may report.
 */
export function useDebouncedSectionSave<T>(
  save: (value: T) => Promise<unknown>,
  options: { delay?: number; onSaved?: () => void } = {},
) {
  const { delay = 800, onSaved } = options;

  const [status, setStatus] = useState<SaveStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runRef = useRef(0);

  // Held in refs so the returned callback stays stable across renders — an
  // unstable schedule() would re-trigger effects in the section editors.
  const saveRef = useRef(save);
  saveRef.current = save;
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      // Anything in flight is disowned rather than allowed to setState after unmount.
      runRef.current += 1;
    },
    [],
  );

  const flush = useCallback(async (value: T) => {
    const run = (runRef.current += 1);
    setStatus("saving");
    try {
      await saveRef.current(value);
      if (runRef.current !== run) return;
      setStatus("saved");
      onSavedRef.current?.();
    } catch {
      if (runRef.current !== run) return;
      setStatus("error");
    }
  }, []);

  const schedule = useCallback(
    (value: T) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void flush(value), delay);
    },
    [delay, flush],
  );

  /** Save immediately — used on blur, so leaving a field commits it. */
  const saveNow = useCallback(
    (value: T) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      return flush(value);
    },
    [flush],
  );

  return { status, schedule, saveNow };
}
