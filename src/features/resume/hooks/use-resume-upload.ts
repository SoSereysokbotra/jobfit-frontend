"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { ApiError } from "@/lib/api/client";
import { resumeApi, validateResumeFile, type ResumeDto } from "../api/resume.api";

export type UploadState = "idle" | "uploading" | "success" | "error";

/**
 * Multipart resume upload with progress and cancellation.
 *
 * Client-side validation mirrors the backend (PDF/DOCX, ≤5 MB) so an obviously
 * bad file fails instantly instead of after a 5 MB round-trip.
 */
export function useResumeUpload() {
  const queryClient = useQueryClient();
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>("");
  const [resume, setResume] = useState<ResumeDto | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setState("idle");
    setProgress(0);
    setError("");
    setResume(null);
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    reset();
  }, [reset]);

  const upload = useCallback(
    async (file: File, title?: string): Promise<ResumeDto | null> => {
      const validationError = validateResumeFile(file);
      if (validationError) {
        setState("error");
        setError(validationError);
        return null;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setState("uploading");
      setProgress(0);
      setError("");

      try {
        const created = await resumeApi.upload(
          file,
          title,
          (p) => setProgress(p.percent),
          controller.signal,
        );
        setResume(created);
        setState("success");
        void queryClient.invalidateQueries({ queryKey: qk.resumes.lists() });
        return created;
      } catch (err) {
        setState("error");
        setError(
          err instanceof ApiError
            ? err.messages.join(" ")
            : "Upload failed. Please try again.",
        );
        return null;
      } finally {
        abortRef.current = null;
      }
    },
    [queryClient],
  );

  return {
    upload,
    cancel,
    reset,
    state,
    progress,
    error,
    resume,
    isUploading: state === "uploading",
  };
}
