"use client";

import React, { useState, useRef } from "react";
import {
  FileText, Upload, Star, Trash2, Plus, MoreHorizontal, Clock, TrendingUp, X
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Alert } from "@/shared/components/feedback/alert";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { StatCard } from "@/shared/components/data-display/stat-card";
import { cn } from "@/shared/utils/cn";
import {
  useResumes,
  useResumeMutations,
  useParsingStatus
} from "@/features/resume/hooks/use-resumes";
import { useResumeUpload } from "@/features/resume/hooks/use-resume-upload";
import { validateResumeFile, RESUME_ACCEPT_ATTR } from "@/features/resume/api/resume.api";
import { PARSING_STATUS_TONE, type ResumeView } from "@/features/resume/api/resume.mappers";

/** Resume display name: the user-given title, else the file name. */
function resumeName(r: ResumeView): string {
  return r.title?.trim() || r.fileName;
}

/* ─────────────────────────── REUSABLE COMPONENTS ───────────── */

/** Section card wrapper */
function SectionCard({
  title, icon: Icon, children, action, className
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-xl border", className)}
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary-50)" }}>
            <Icon className="w-4 h-4" style={{ color: "var(--color-primary-600)" }} />
          </div>
          <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/** Drag-and-drop upload zone */
function UploadZone({ onFile }: { onFile: (file: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-10 px-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200",
        dragging ? "border-primary-500 bg-primary-50" : "hover:border-primary-400 hover:bg-primary-50/40"
      )}
      style={{ borderColor: dragging ? "var(--color-primary-500)" : "var(--color-border)" }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={RESUME_ACCEPT_ATTR}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-200"
        style={{ background: dragging ? "var(--color-primary-100)" : "var(--color-primary-50)" }}
      >
        <Upload className="w-7 h-7" style={{ color: "var(--color-primary-600)" }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Drag your resume here
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
          or <span className="font-semibold" style={{ color: "var(--color-primary-600)" }}>click to choose file</span>
        </p>
      </div>
      {/* Matches the backend: PDF/DOCX only, 5 MB max. */}
      <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
        Accepted: PDF, DOCX · Max 5 MB
      </p>
    </div>
  );
}

/* ─────────────────────────── RESUME CARD ───────────────────── */
function ResumeCard({
  resume,
  onSetDefault,
  onDelete,
  isMutating
}: {
  resume: ResumeView;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  isMutating: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        "relative rounded-xl border transition-all duration-200",
        resume.isDefault ? "border-primary-300" : ""
      )}
      style={{
        background: "var(--color-card)",
        borderColor: resume.isDefault ? "var(--color-primary-300)" : "var(--color-border)",
        boxShadow: resume.isDefault ? "0 0 0 3px var(--color-primary-50)" : "var(--shadow-sm)"
      }}
    >
      {/* Default badge */}
      {resume.isDefault && (
        <div className="absolute -top-3 left-4">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
            style={{ background: "var(--color-primary-600)", color: "#fff" }}
          >
            {/* Pairs with the "Use this resume" button on the other cards, so the two read
                as one choice. "Default" named the database column, not what the user gets. */}
            <Star className="w-3 h-3" /> In use
          </span>
        </div>
      )}

      <div className="p-5 pt-6">
        {/* Top row */}
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--color-primary-50)" }}
          >
            <FileText className="w-6 h-6" style={{ color: "var(--color-primary-600)" }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-bold truncate" style={{ color: "var(--color-text-primary)" }}>
                  {resumeName(resume)}
                </h3>
                <p className="text-xs truncate mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                  {resume.fileName}
                </p>
              </div>
              {/* Context menu */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  disabled={isMutating}
                  className="p-1.5 rounded-md transition-colors hover:bg-neutral-100 disabled:opacity-50"
                >
                  <MoreHorizontal className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-8 z-20 w-48 rounded-lg border py-1 shadow-lg"
                    style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
                  >
                    {/* Switching résumés lives on the card as one labelled button, so the
                        menu holds only what has nowhere else to go. */}
                    {[
                      { icon: Trash2, label: "Delete", action: () => { onDelete(resume.id); setMenuOpen(false); }, danger: true },
                    ].map(({ icon: Icon, label, action, danger }) => (
                      <button
                        key={label}
                        onClick={action}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-neutral-50"
                        style={{ color: danger ? "var(--color-error-600)" : "var(--color-text-primary)" }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-2 mt-2">
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                <Clock className="w-3 h-3 inline mr-0.5" />{resume.uploadedLabel}
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>·</span>
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{resume.sizeLabel}</span>
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>·</span>
              <Badge variant={PARSING_STATUS_TONE[resume.parsingStatus]}>{resume.statusLabel}</Badge>
            </div>
          </div>
        </div>

        {/* Actions.
            The default résumé is the one the AI matches jobs with, so switching needs one
            obvious labelled control. It used to be a bare star icon here AND a menu item —
            two ways to do the same thing, neither of them saying what it did. */}
        <div className="flex items-center gap-2 mt-4">
          {!resume.isDefault && (
            <Button
              className="flex-1 text-xs py-2"
              onClick={() => onSetDefault(resume.id)}
              disabled={isMutating}
            >
              <Star className="w-3.5 h-3.5" />
              Use this resume
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── PAGE ──────────────────────────── */
export default function ResumesPage() {
  const { resumes, isLoading, error } = useResumes();
  const { remove, setDefault } = useResumeMutations();
  const {
    upload,
    state: uploadState,
    progress: uploadProgress,
    error: uploadError,
    resume: uploadedResume,
    reset: resetUpload
  } = useResumeUpload();

  // Poll parsing for the just-uploaded resume so its status flips live.
  useParsingStatus(uploadedResume?.id, uploadState === "success");

  const [showUpload, setShowUpload] = useState(false);
  const [localError, setLocalError] = useState("");

  const isMutating = remove.isPending || setDefault.isPending;
  const uploading = uploadState === "uploading";

  const parsedCount = resumes.filter(r => r.isParsed).length;

  const handleSetDefault = (id: string) => setDefault.mutate(id);
  const handleDelete = (id: string) => remove.mutate(id);

  const handleFileUpload = async (file: File) => {
    setLocalError("");
    const validationError = validateResumeFile(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setShowUpload(false);
    await upload(file, file.name.replace(/\.(pdf|docx)$/i, ""));
  };

  const uploadErrorMsg = localError || uploadError;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-full" style={{ background: "var(--color-bg-secondary)" }}>

      {/* ── PAGE HEADER ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>Resumes</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            Upload your CVs and choose which one JobFits matches jobs with
          </p>
        </div>
        <Button onClick={() => setShowUpload(v => !v)} disabled={uploading}>
          <Plus className="w-4 h-4" /> Upload Resume
        </Button>
      </div>

      {error && (
        <Alert variant="error">
          {error instanceof Error ? error.message : "Could not load your resumes."}
        </Alert>
      )}
      {uploadErrorMsg && <Alert variant="error">{uploadErrorMsg}</Alert>}

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Total Resumes"
          value={`${resumes.length}`}
          icon={<FileText className="w-[18px] h-[18px]" />}
          accentColor="var(--color-primary-600)"
          accentBg="var(--color-primary-50)"
        />
        <StatCard
          label="Parsed"
          value={`${parsedCount}`}
          icon={<TrendingUp className="w-[18px] h-[18px]" />}
          accentColor="var(--color-info-600)"
          accentBg="var(--color-info-50)"
        />
      </div>

      {/* ── UPLOAD PANEL ── */}
      {showUpload && (
        <SectionCard title="Upload New Resume" icon={Upload} action={
          <button onClick={() => setShowUpload(false)} className="p-1.5 rounded-md hover:bg-neutral-100 transition-colors">
            <X className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
          </button>
        }>
          <UploadZone onFile={handleFileUpload} />
        </SectionCard>
      )}

      {/* ── UPLOAD PROGRESS ── */}
      {uploading && uploadedResume === null && (
        <div
          className="rounded-xl border p-5 flex items-center gap-4"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "var(--color-primary-50)" }}>
            <FileText className="w-5 h-5" style={{ color: "var(--color-primary-600)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                Uploading resume…
              </span>
              <span className="text-xs font-semibold ml-4" style={{ color: "var(--color-primary-600)" }}>
                {uploadProgress < 100 ? `${uploadProgress}%` : "Parsing…"}
              </span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: "var(--color-border)" }}>
              <div
                className="h-2 rounded-full transition-all duration-200"
                style={{ width: `${uploadProgress}%`, background: "var(--color-primary-600)" }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
              {uploadProgress < 100 ? "Uploading to secure storage…" : "Parsing your resume…"}
            </p>
          </div>
          <button onClick={resetUpload} className="text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>
            Cancel
          </button>
        </div>
      )}

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 gap-6">

        {/* ── Resume List ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
              Your Resumes ({resumes.length})
            </h2>
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              The résumé marked &quot;In use&quot; is the one jobs are matched against
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          ) : resumes.length === 0 ? (
            /* Empty state */
            <div
              className="rounded-xl border p-12 flex flex-col items-center text-center"
              style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--color-primary-50)" }}>
                <FileText className="w-8 h-8" style={{ color: "var(--color-primary-400)" }} />
              </div>
              <h3 className="text-base font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>No resumes yet</h3>
              <p className="text-sm mb-4" style={{ color: "var(--color-text-tertiary)" }}>
                Upload your first resume to start getting job matches
              </p>
              <Button onClick={() => setShowUpload(true)}>
                <Upload className="w-4 h-4" /> Upload Resume
              </Button>
            </div>
          ) : (
            resumes.map(resume => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onSetDefault={handleSetDefault}
                onDelete={handleDelete}
                isMutating={isMutating}
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
}
