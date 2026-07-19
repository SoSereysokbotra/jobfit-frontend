"use client";

import React, { useState, useRef } from "react";
import {
  FileText, Upload, Star, StarOff, Trash2, Download,
  Plus, AlertTriangle, Info, AlertCircle,
  ChevronDown, ChevronUp, MoreHorizontal, Clock,
  Zap, Shield, TrendingUp, RefreshCw, X, Loader2,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Alert } from "@/shared/components/feedback/alert";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { cn } from "@/shared/utils/cn";
import {
  useResumes,
  useResumeMutations,
  useParsingStatus,
} from "@/features/resume/hooks/use-resumes";
import { useResumeUpload } from "@/features/resume/hooks/use-resume-upload";
import { validateResumeFile, RESUME_ACCEPT_ATTR } from "@/features/resume/api/resume.api";
import { PARSING_STATUS_TONE, type ResumeView } from "@/features/resume/api/resume.mappers";

/* ─────────────────────────── TYPES ─────────────────────────── */
interface AtsTip {
  level: "warning" | "info";
  title: string;
  desc: string;
}

/**
 * General ATS best-practices. These are static guidance, NOT an analysis of the
 * user's resume. TODO(backend): there is no per-resume ATS-issues endpoint — the
 * backend exposes only numeric `atsScore`/`qualityScore`, so a real issue
 * breakdown would need a new endpoint.
 */
const ATS_TIPS: AtsTip[] = [
  { level: "warning", title: "Put skills in the top third", desc: "ATS parsers rank resumes higher when a clear skills section appears near the top." },
  { level: "warning", title: "Use consistent date formats", desc: "Mixing 'Jan 2022' and '01/2022' can confuse parsers — pick one and stick to it." },
  { level: "info", title: "Add a short professional summary", desc: "A 2–3 sentence summary can increase ATS keyword matching noticeably." },
  { level: "info", title: "Keep body text 10–12pt", desc: "Fonts in this range parse reliably across most ATS software." },
];

/* ─────────────────────────── HELPERS ───────────────────────── */
function atsColor(score: number) {
  if (score >= 80) return "var(--color-success-500)";
  if (score >= 60) return "var(--color-warning-500)";
  return "var(--color-error-500)";
}

function atsBg(score: number) {
  if (score >= 80) return "var(--color-success-50)";
  if (score >= 60) return "var(--color-warning-50)";
  return "var(--color-error-50)";
}

function atsLabel(score: number) {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Moderate";
  return "Needs Work";
}

/** Resume display name: the user-given title, else the file name. */
function resumeName(r: ResumeView): string {
  return r.title?.trim() || r.fileName;
}

/* ─────────────────────────── REUSABLE COMPONENTS ───────────── */

/** Section card wrapper */
function SectionCard({
  title, icon: Icon, children, action, className,
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

/** ATS score ring */
function AtsRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative flex-shrink-0">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle cx="34" cy="34" r={r} fill="none" stroke="var(--color-border)" strokeWidth="7" />
        <circle
          cx="34" cy="34" r={r} fill="none"
          stroke={atsColor(score)}
          strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 34 34)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: atsColor(score) }}>
        {score}
      </span>
    </div>
  );
}

/** ATS tip row */
function TipRow({ tip }: { tip: AtsTip }) {
  const config = {
    warning: { Icon: AlertTriangle, color: "var(--color-warning-600)", bg: "var(--color-warning-50)", badge: "warning" as const, label: "Tip" },
    info:    { Icon: Info, color: "var(--color-info-600)", bg: "var(--color-info-50)", badge: "info" as const, label: "Info" },
  };
  const { Icon, color, bg, badge, label } = config[tip.level];

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: bg }}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{tip.title}</span>
          <Badge variant={badge}>{label}</Badge>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{tip.desc}</p>
      </div>
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
  onSelectForAts,
  isSelectedForAts,
  isMutating,
}: {
  resume: ResumeView;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  onSelectForAts: (id: string) => void;
  isSelectedForAts: boolean;
  isMutating: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hasScore = typeof resume.atsScore === "number";

  return (
    <div
      className={cn(
        "relative rounded-xl border transition-all duration-200",
        resume.isDefault ? "border-primary-300" : ""
      )}
      style={{
        background: "var(--color-card)",
        borderColor: resume.isDefault ? "var(--color-primary-300)" : "var(--color-border)",
        boxShadow: resume.isDefault ? "0 0 0 3px var(--color-primary-50)" : "var(--shadow-sm)",
        ...(isSelectedForAts ? { outline: `2px solid var(--color-primary-500)`, outlineOffset: "2px" } : {}),
      }}
    >
      {/* Default badge */}
      {resume.isDefault && (
        <div className="absolute -top-3 left-4">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"
            style={{ background: "var(--color-primary-600)", color: "#fff" }}
          >
            <Star className="w-3 h-3" /> Default
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
                    {[
                      ...(resume.isDefault
                        ? []
                        : [{ icon: Star, label: "Set as Default", action: () => { onSetDefault(resume.id); setMenuOpen(false); }, danger: false }]),
                      { icon: Zap, label: "ATS Analysis", action: () => { onSelectForAts(resume.id); setMenuOpen(false); }, danger: false },
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

        {/* ATS Score bar */}
        {hasScore && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                ATS Score
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: atsBg(resume.atsScore!), color: atsColor(resume.atsScore!) }}
                >
                  {resume.atsScore}/100 · {atsLabel(resume.atsScore!)}
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: "var(--color-border)" }}>
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${resume.atsScore}%`, background: atsColor(resume.atsScore!) }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant="outline"
            className="flex-1 text-xs py-2"
            onClick={() => onSelectForAts(resume.id)}
          >
            <Zap className="w-3.5 h-3.5" />
            ATS Analysis
          </Button>
          {!resume.isDefault && (
            <Button variant="ghost" className="text-xs py-2 px-3" onClick={() => onSetDefault(resume.id)} title="Set as default" disabled={isMutating}>
              <StarOff className="w-3.5 h-3.5" />
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
    reset: resetUpload,
  } = useResumeUpload();

  // Poll parsing for the just-uploaded resume so its status flips live.
  useParsingStatus(uploadedResume?.id, uploadState === "success");

  const [selectedAtsId, setSelectedAtsId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [expandedTips, setExpandedTips] = useState(true);
  const [localError, setLocalError] = useState("");

  const isMutating = remove.isPending || setDefault.isPending;
  const uploading = uploadState === "uploading";

  const selectedResume =
    resumes.find(r => r.id === selectedAtsId) ??
    resumes.find(r => r.isDefault) ??
    resumes[0] ??
    null;

  const scored = resumes.filter(r => typeof r.atsScore === "number");
  const avgAts = scored.length
    ? Math.round(scored.reduce((a, r) => a + (r.atsScore ?? 0), 0) / scored.length)
    : null;
  const bestAts = scored.length ? Math.max(...scored.map(r => r.atsScore ?? 0)) : null;
  const parsedCount = resumes.filter(r => r.isParsed).length;

  const handleSetDefault = (id: string) => setDefault.mutate(id);
  const handleDelete = (id: string) => {
    remove.mutate(id);
    if (selectedAtsId === id) setSelectedAtsId(null);
  };

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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* ── PAGE HEADER ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>Resumes</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            Manage your resume versions and track ATS compatibility
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Resumes", value: `${resumes.length}`, icon: FileText, color: "var(--color-primary-600)", bg: "var(--color-primary-50)" },
          { label: "Avg ATS Score", value: avgAts !== null ? `${avgAts}` : "—", icon: Shield, color: "var(--color-success-600)", bg: "var(--color-success-50)" },
          { label: "Best Score", value: bestAts !== null ? `${bestAts}/100` : "—", icon: Zap, color: "var(--color-warning-600)", bg: "var(--color-warning-50)" },
          { label: "Parsed", value: `${parsedCount}`, icon: TrendingUp, color: "var(--color-info-600)", bg: "var(--color-info-50)" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-xl border p-4 flex items-center gap-3"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-lg font-bold leading-none" style={{ color: "var(--color-text-primary)" }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{label}</p>
            </div>
          </div>
        ))}
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
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── LEFT: Resume List ── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
              Your Resumes ({resumes.length})
            </h2>
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Click &quot;ATS Analysis&quot; to inspect a resume
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
                Upload your first resume to get ATS analysis and better job matches
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
                onSelectForAts={id => setSelectedAtsId(id)}
                isSelectedForAts={selectedResume?.id === resume.id}
                isMutating={isMutating}
              />
            ))
          )}
        </div>

        {/* ── RIGHT: ATS Analysis Panel ── */}
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <SectionCard
              title="ATS Analysis"
              icon={Shield}
              action={
                <Badge variant={selectedResume?.atsScore && selectedResume.atsScore >= 80 ? "success" : "warning"}>
                  {selectedResume ? resumeName(selectedResume) : "Select a resume"}
                </Badge>
              }
            >
              {selectedResume && typeof selectedResume.atsScore === "number" ? (
                <div className="space-y-5">
                  {/* Score overview */}
                  <div
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: atsBg(selectedResume.atsScore) }}
                  >
                    <AtsRing score={selectedResume.atsScore} />
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                        {atsLabel(selectedResume.atsScore)} Compatibility
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                        {typeof selectedResume.qualityScore === "number"
                          ? `Quality score: ${selectedResume.qualityScore}/100`
                          : selectedResume.atsScore >= 80
                            ? "Your resume passes most ATS filters."
                            : "Review the tips below to improve your score."}
                      </p>
                    </div>
                  </div>

                  {/* General ATS tips (static guidance, not per-resume analysis) */}
                  <div>
                    <button
                      className="w-full flex items-center justify-between py-2 text-sm font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                      onClick={() => setExpandedTips(v => !v)}
                    >
                      <span>General ATS best practices</span>
                      {expandedTips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {expandedTips && (
                      <div className="space-y-2 mt-1">
                        {ATS_TIPS.map((tip, i) => <TipRow key={i} tip={tip} />)}
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedResume && selectedResume.isProcessing ? (
                <div className="flex flex-col items-center text-center py-8 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--color-primary-500)" }} />
                  <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Analysing this resume…
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    ATS scores appear here once parsing finishes.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-8 gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--color-primary-50)" }}>
                    <Zap className="w-6 h-6" style={{ color: "var(--color-primary-400)" }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    {selectedResume ? "No ATS score yet" : "Select a resume to analyse"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    {selectedResume
                      ? "This resume has no ATS score yet — it may still be parsing or parsing failed."
                      : "Click \"ATS Analysis\" on any resume card to see its compatibility report."}
                  </p>
                </div>
              )}
            </SectionCard>
          </div>
        </div>

      </div>
    </div>
  );
}
