"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Alert } from "@/shared/components/feedback/alert";
import { TextField } from "@/shared/components/ui/text-field";
import { cn } from "@/shared/utils/cn";
import { RESUME_ACCEPT_ATTR, validateResumeFile, type ResumeDto } from "../api/resume.api";
import { formatFileSize } from "../api/resume.mappers";
import { useResumeUpload } from "../hooks/use-resume-upload";

interface ResumeUploaderProps {
  onUploaded?: (resume: ResumeDto) => void;
  /** Ask for an optional title alongside the file. */
  showTitle?: boolean;
  className?: string;
}

/** Drag-and-drop resume upload — real multipart POST /resumes with progress. */
export function ResumeUploader({ onUploaded, showTitle = true, className }: ResumeUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  const { upload, cancel, reset, state, progress, error, isUploading } = useResumeUpload();

  const pick = (candidate: File | undefined) => {
    if (!candidate) return;
    const validationError = validateResumeFile(candidate);
    if (validationError) {
      setLocalError(validationError);
      setFile(null);
      return;
    }
    setLocalError("");
    setFile(candidate);
    // Default the title to the filename without its extension.
    if (!title) setTitle(candidate.name.replace(/\.(pdf|docx)$/i, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const created = await upload(file, showTitle ? title : undefined);
    if (created) onUploaded?.(created);
  };

  const clear = () => {
    setFile(null);
    setTitle("");
    setLocalError("");
    reset();
    if (inputRef.current) inputRef.current.value = "";
  };

  if (state === "success") {
    return (
      <div className={cn("rounded-lg border border-border bg-card p-6 text-center", className)}>
        <div className="mx-auto w-12 h-12 rounded-full bg-success-100 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6 text-success-600" />
        </div>
        <p className="text-sm font-bold text-neutral-900">Resume uploaded</p>
        <p className="text-xs text-neutral-500 mt-1">
          We&apos;re analysing it now — scores appear once it finishes.
        </p>
        <div className="mt-4">
          <Button variant="outline" onClick={clear}>
            Upload another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
      {(localError || error) && <Alert variant="error">{localError || error}</Alert>}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200",
          dragging ? "border-primary-500 bg-primary-50" : "border-neutral-200 bg-white",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={RESUME_ACCEPT_ATTR}
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0] ?? undefined)}
        />

        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-primary-600 shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-sm font-semibold text-neutral-900 truncate">{file.name}</p>
              <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
            </div>
            {!isUploading && (
              <button
                type="button"
                onClick={clear}
                aria-label="Remove file"
                className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mx-auto w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6 text-primary-500" />
            </div>
            <p className="text-sm font-semibold text-neutral-900">
              Drag your resume here, or{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="text-primary-600 hover:underline"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-neutral-400 mt-1">PDF or DOCX, up to 5 MB</p>
          </>
        )}

        {isUploading && (
          <div className="mt-5">
            <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{ width: `${progress}%`, background: "var(--color-primary-500)" }}
              />
            </div>
            <p className="text-xs text-neutral-500 mt-1.5">Uploading… {progress}%</p>
          </div>
        )}
      </div>

      {showTitle && file && !isUploading && (
        <TextField
          id="resume-title"
          label="Title"
          placeholder="Frontend Engineer CV"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          hint="Optional — at least 2 characters if provided."
        />
      )}

      <div className="flex justify-end gap-2">
        {isUploading ? (
          <Button type="button" variant="ghost" onClick={cancel}>
            Cancel
          </Button>
        ) : (
          <Button type="submit" disabled={!file}>
            <UploadCloud className="w-4 h-4" /> Upload resume
          </Button>
        )}
      </div>
    </form>
  );
}
