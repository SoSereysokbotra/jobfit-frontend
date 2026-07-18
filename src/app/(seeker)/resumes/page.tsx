"use client";

import React, { useState, useRef } from "react";
import {
  FileText, Upload, Star, StarOff, Trash2, Download,
  Plus, CheckCircle2, AlertTriangle, Info, AlertCircle,
  ChevronDown, ChevronUp, Eye, MoreHorizontal, Clock,
  Zap, Shield, TrendingUp, RefreshCw, X, Check,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";

/* ─────────────────────────── TYPES ─────────────────────────── */
type ResumeStatus = "parsed" | "parsing" | "failed";

interface Resume {
  id: number;
  name: string;
  fileName: string;
  size: string;
  uploadedAt: string;
  isDefault: boolean;
  status: ResumeStatus;
  atsScore: number | null;
  usedInApplications: number;
  tags: string[];
}

interface AtsIssue {
  level: "critical" | "warning" | "info";
  title: string;
  desc: string;
}

/* ─────────────────────────── MOCK DATA ─────────────────────── */
const MOCK_RESUMES: Resume[] = [
  {
    id: 1,
    name: "Main Resume",
    fileName: "Resume_Senior_SE_v3.pdf",
    size: "248 KB",
    uploadedAt: "Jul 10, 2026",
    isDefault: true,
    status: "parsed",
    atsScore: 87,
    usedInApplications: 8,
    tags: ["Software Engineering", "Full-Stack"],
  },
  {
    id: 2,
    name: "Data Science Variant",
    fileName: "Resume_DataScience_v1.pdf",
    size: "182 KB",
    uploadedAt: "Jun 28, 2026",
    isDefault: false,
    status: "parsed",
    atsScore: 72,
    usedInApplications: 3,
    tags: ["Data Science", "ML"],
  },
  {
    id: 3,
    name: "Backend Focus",
    fileName: "Resume_Backend_v2.docx",
    size: "134 KB",
    uploadedAt: "Jun 15, 2026",
    isDefault: false,
    status: "parsed",
    atsScore: 91,
    usedInApplications: 5,
    tags: ["Backend", "APIs"],
  },
];

const ATS_ISSUES: AtsIssue[] = [
  { level: "critical", title: "Missing contact phone number", desc: "Many ATS systems require a phone number to complete the candidate record." },
  { level: "critical", title: "No LinkedIn URL", desc: "Recruiters and ATS often look for a LinkedIn profile link to verify candidate information." },
  { level: "warning", title: "Skills section too far down", desc: "ATS parsers rank resumes higher when skills appear in the top third of the document." },
  { level: "warning", title: "Date format inconsistency", desc: "Some dates use 'Jan 2022' and others use '01/2022'. Standardize for better parsing." },
  { level: "info", title: "Consider adding a summary section", desc: "A 2–3 sentence professional summary increases ATS keyword matching by up to 20%." },
  { level: "info", title: "Font size acceptable", desc: "Body text is 11pt — within the recommended 10–12pt range for ATS compatibility." },
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

/** ATS issue row */
function IssueRow({ issue }: { issue: AtsIssue }) {
  const config = {
    critical: { Icon: AlertCircle, color: "var(--color-error-600)", bg: "var(--color-error-50)", badge: "error" as const, label: "Critical" },
    warning:  { Icon: AlertTriangle, color: "var(--color-warning-600)", bg: "var(--color-warning-50)", badge: "warning" as const, label: "Warning" },
    info:     { Icon: Info, color: "var(--color-info-600)", bg: "var(--color-info-50)", badge: "info" as const, label: "Info" },
  };
  const { Icon, color, bg, badge, label } = config[issue.level];

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: bg }}>
      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{issue.title}</span>
          <Badge variant={badge}>{label}</Badge>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{issue.desc}</p>
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
        accept=".pdf,.doc,.docx"
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
      <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
        Accepted: PDF, DOCX, DOC · Max 10 MB
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
}: {
  resume: Resume;
  onSetDefault: (id: number) => void;
  onDelete: (id: number) => void;
  onSelectForAts: (id: number) => void;
  isSelectedForAts: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className={cn(
        "relative rounded-xl border transition-all duration-200",
        isSelectedForAts ? "ring-2" : "",
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
                  {resume.name}
                </h3>
                <p className="text-xs truncate mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                  {resume.fileName}
                </p>
              </div>
              {/* Context menu */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="p-1.5 rounded-md transition-colors hover:bg-neutral-100"
                >
                  <MoreHorizontal className="w-4 h-4" style={{ color: "var(--color-text-tertiary)" }} />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-8 z-20 w-48 rounded-lg border py-1 shadow-lg"
                    style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
                  >
                    {[
                      { icon: Eye, label: "Preview", action: () => {} },
                      { icon: Download, label: "Download", action: () => {} },
                      { icon: Star, label: "Set as Default", action: () => { onSetDefault(resume.id); setMenuOpen(false); } },
                      { icon: RefreshCw, label: "Re-analyse ATS", action: () => { onSelectForAts(resume.id); setMenuOpen(false); } },
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
                <Clock className="w-3 h-3 inline mr-0.5" />{resume.uploadedAt}
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>·</span>
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{resume.size}</span>
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>·</span>
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Used in {resume.usedInApplications} application{resume.usedInApplications !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Tags */}
            {resume.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {resume.tags.map(tag => <Badge key={tag} variant="neutral">{tag}</Badge>)}
              </div>
            )}
          </div>
        </div>

        {/* ATS Score bar */}
        {resume.atsScore !== null && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                ATS Score
              </span>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: atsBg(resume.atsScore), color: atsColor(resume.atsScore) }}
                >
                  {resume.atsScore}/100 · {atsLabel(resume.atsScore)}
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: "var(--color-border)" }}>
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${resume.atsScore}%`, background: atsColor(resume.atsScore) }}
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
            {isSelectedForAts ? "Analysing…" : "ATS Analysis"}
          </Button>
          <Button variant="ghost" className="text-xs py-2 px-3" onClick={() => {}}>
            <Download className="w-3.5 h-3.5" />
          </Button>
          {!resume.isDefault && (
            <Button variant="ghost" className="text-xs py-2 px-3" onClick={() => onSetDefault(resume.id)} title="Set as default">
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
  const [resumes, setResumes] = useState<Resume[]>(MOCK_RESUMES);
  const [selectedAtsId, setSelectedAtsId] = useState<number | null>(1);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expandedIssues, setExpandedIssues] = useState(true);

  const selectedResume = resumes.find(r => r.id === selectedAtsId) ?? resumes[0];

  const handleSetDefault = (id: number) => {
    setResumes(prev => prev.map(r => ({ ...r, isDefault: r.id === id })));
  };

  const handleDelete = (id: number) => {
    setResumes(prev => {
      const filtered = prev.filter(r => r.id !== id);
      // If we deleted the default, set first as default
      if (!filtered.some(r => r.isDefault) && filtered.length > 0) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
    if (selectedAtsId === id) setSelectedAtsId(resumes.find(r => r.id !== id)?.id ?? null);
  };

  const handleFileUpload = (file: File) => {
    setUploadingFile(file);
    setShowUpload(false);
    let progress = 0;
    const iv = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 8;
      if (progress >= 100) {
        clearInterval(iv);
        setUploadProgress(100);
        const newId = Date.now();
        setResumes(prev => [
          ...prev,
          {
            id: newId,
            name: file.name.replace(/\.[^.]+$/, ""),
            fileName: file.name,
            size: `${Math.round(file.size / 1024)} KB`,
            uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            isDefault: false,
            status: "parsing",
            atsScore: null,
            usedInApplications: 0,
            tags: [],
          },
        ]);
        setTimeout(() => {
          setResumes(prev => prev.map(r =>
            r.id === newId ? { ...r, status: "parsed", atsScore: Math.floor(Math.random() * 30) + 65 } : r
          ));
          setUploadingFile(null);
          setUploadProgress(0);
        }, 3000);
      } else {
        setUploadProgress(progress);
      }
    }, 140);
  };

  const issuesByLevel = {
    critical: ATS_ISSUES.filter(i => i.level === "critical"),
    warning: ATS_ISSUES.filter(i => i.level === "warning"),
    info: ATS_ISSUES.filter(i => i.level === "info"),
  };

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
        <Button onClick={() => setShowUpload(v => !v)}>
          <Plus className="w-4 h-4" /> Upload Resume
        </Button>
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Resumes", value: resumes.length, icon: FileText, color: "var(--color-primary-600)", bg: "var(--color-primary-50)" },
          { label: "Avg ATS Score", value: `${Math.round(resumes.filter(r => r.atsScore).reduce((a, r) => a + (r.atsScore ?? 0), 0) / resumes.filter(r => r.atsScore).length)}`, icon: Shield, color: "var(--color-success-600)", bg: "var(--color-success-50)" },
          { label: "Applications", value: resumes.reduce((a, r) => a + r.usedInApplications, 0), icon: TrendingUp, color: "var(--color-info-600)", bg: "var(--color-info-50)" },
          { label: "Best Score", value: `${Math.max(...resumes.filter(r => r.atsScore).map(r => r.atsScore ?? 0))}/100`, icon: Zap, color: "var(--color-warning-600)", bg: "var(--color-warning-50)" },
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
      {uploadingFile && (
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
                {uploadingFile.name}
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
              {uploadProgress < 100 ? "Uploading to secure storage…" : "AI is parsing your resume…"}
            </p>
          </div>
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

          {resumes.length === 0 ? (
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
                isSelectedForAts={selectedAtsId === resume.id}
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
                  {selectedResume?.name ?? "Select a resume"}
                </Badge>
              }
            >
              {selectedResume?.atsScore ? (
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
                        {selectedResume.atsScore >= 80
                          ? "Your resume passes most ATS filters."
                          : "Fix the issues below to improve your score."}
                      </p>
                    </div>
                  </div>

                  {/* Issue count pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: "var(--color-error-50)", color: "var(--color-error-600)" }}>
                      <AlertCircle className="w-3 h-3" />
                      {issuesByLevel.critical.length} Critical
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: "var(--color-warning-50)", color: "var(--color-warning-600)" }}>
                      <AlertTriangle className="w-3 h-3" />
                      {issuesByLevel.warning.length} Warnings
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: "var(--color-info-50)", color: "var(--color-info-600)" }}>
                      <Info className="w-3 h-3" />
                      {issuesByLevel.info.length} Suggestions
                    </div>
                  </div>

                  {/* Issues list */}
                  <div>
                    <button
                      className="w-full flex items-center justify-between py-2 text-sm font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                      onClick={() => setExpandedIssues(v => !v)}
                    >
                      <span>Issues &amp; Recommendations</span>
                      {expandedIssues ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {expandedIssues && (
                      <div className="space-y-2 mt-1">
                        {ATS_ISSUES.map((issue, i) => (
                          <IssueRow key={i} issue={issue} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col gap-2 pt-1">
                    <Button fullWidth onClick={() => {}}>
                      <Download className="w-4 h-4" />
                      Download Optimised Version
                    </Button>
                    <Button variant="outline" fullWidth onClick={() => {}}>
                      <RefreshCw className="w-4 h-4" />
                      Re-run Analysis
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center py-8 gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--color-primary-50)" }}>
                    <Zap className="w-6 h-6" style={{ color: "var(--color-primary-400)" }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Select a resume to analyse
                  </p>
                  <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                    Click &quot;ATS Analysis&quot; on any resume card to see a detailed compatibility report.
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
