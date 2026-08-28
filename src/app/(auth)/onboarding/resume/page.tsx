"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  X,
  Briefcase,
  MapPin,
  Clock,
  Wifi,
  BarChart2,
  Sparkles,
  Info,
  Check,
  Search,
  HelpCircle,
  Zap,
} from "lucide-react";
import { useResumeUpload } from "@/features/resume/hooks/use-resume-upload";
import { useParsingStatus, useParsedData } from "@/features/resume/hooks/use-resumes";
import { validateResumeFile, RESUME_ACCEPT_ATTR, type ParsedResumeDataDto } from "@/features/resume/api/resume.api";
import { useSession, displayName } from "@/features/auth/hooks/use-session";
import { useCreateProfile, useUpdatePreferences, useProfile } from "@/features/user-profile/hooks/use-profile";
import { parseLocationInput } from "@/features/user-profile/api/profile.mappers";
import type { EmploymentType, RemoteType } from "@/features/user-profile/api/profile.api";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/shared/components/feedback/alert";
import { useMatchReadiness } from "@/features/matching/hooks/use-match-readiness";
import { useRecommendations } from "@/features/matching/hooks/use-recommendations";

/* ─────────────────────────── TYPES ─────────────────────────── */
type Step = 1 | 2 | 3;

interface ParsedResume {
  skills: string[];
  experience: {
    title: string;
    company: string;
    years: string;
    highlights: string[];
  }[];
  education: string;
  educations: { degree: string; institution: string; years: string }[];
  projects: { name: string; years: string; technologies: string[] }[];
  summary?: string;
  parsedBy?: string;
}

/** Map the backend's parsed-data DTO onto this wizard's ParsedResume shape. */
function toWizardParsed(d: ParsedResumeDataDto): ParsedResume {
  return {
    skills: d.skills ?? [],
    experience: (d.experiences ?? []).map((e) => ({
      title: e.title || "—",
      company: e.company || "",
      years: e.dates ?? "",
      highlights: e.highlights ?? [],
    })),
    // Kept for the editable low-confidence view, which edits education as free text.
    education:
      (d.educations ?? [])
        .map((ed) => [ed.degree, ed.institution].filter(Boolean).join(" — "))
        .filter(Boolean)
        .join("; ") || "—",
    // Structured form, so the read-only view can show one row per qualification
    // instead of a single run-on string.
    educations: (d.educations ?? []).map((ed) => ({
      degree: ed.degree || "—",
      institution: ed.institution || "",
      years: ed.dates ?? "",
    })),
    summary: d.summary,
    // On student CVs this is where the real technical signal lives — the SKILLS
    // section is often soft skills only.
    projects: (d.projects ?? []).map((p) => ({
      name: p.name || "—",
      years: p.dates ?? "",
      technologies: p.technologies ?? [],
    })),
    parsedBy: d.parsedBy,
  };
}

interface ProfileData {
  jobTitle: string;
  locations: string[];
  salaryMin?: number;
  salaryMax?: number;
  isSalaryNegotiable?: boolean;
  preferNotToDiscloseSalary?: boolean;
  employmentTypes: string[];
  remotePreference: string;
  industries: string[];
  completeness: "complete" | "partial";
}

const SALARY_PRESETS = [
  { id: "80-120", label: "80K-120K", min: 80, max: 120 },
  { id: "120-160", label: "120K-160K", min: 120, max: 160 },
  { id: "160-200", label: "160K-200K", min: 160, max: 200 },
  { id: "200-plus", label: "200K+", min: 200, max: 350 },
  { id: "custom", label: "Custom", min: null, max: null },
] as const;

function getMarketSalaryInsight(jobTitle: string, locations: string[]): { title: string; min: number; max: number; locationText: string } {
  const titleLower = (jobTitle || "").toLowerCase().trim();
  const locationText = locations.length > 0 ? `in ${locations[0]}` : "in your area";

  let min = 95;
  let max = 185;
  let title = jobTitle.trim() || "Software Engineers";

  if (!titleLower) {
    title = "Software Engineers";
    min = 95;
    max = 185;
  } else if (titleLower.includes("executive") || titleLower.includes("director") || titleLower.includes("vp") || titleLower.includes("lead")) {
    min = 180;
    max = 300;
  } else if (titleLower.includes("senior") || titleLower.includes("staff") || titleLower.includes("principal")) {
    min = 150;
    max = 240;
  } else if (titleLower.includes("data scientist") || titleLower.includes("machine learning") || titleLower.includes("ai")) {
    min = 130;
    max = 210;
  } else if (titleLower.includes("product manager")) {
    min = 110;
    max = 190;
  } else if (titleLower.includes("designer") || titleLower.includes("ux") || titleLower.includes("ui")) {
    min = 85;
    max = 155;
  } else if (titleLower.includes("data analyst") || titleLower.includes("analyst")) {
    min = 75;
    max = 130;
  } else if (titleLower.includes("marketing") || titleLower.includes("sales")) {
    min = 70;
    max = 140;
  } else if (titleLower.includes("software") || titleLower.includes("developer") || titleLower.includes("engineer") || titleLower.includes("frontend") || titleLower.includes("backend")) {
    min = 95;
    max = 185;
  } else {
    min = 80;
    max = 160;
  }

  return { title, min, max, locationText };
}

/* ─────────────────────────── CONSTANTS ─────────────────────── */
const TOTAL_STEPS = 3;
const LOCATION_OPTIONS = ["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Los Angeles, CA", "Chicago, IL", "Boston, MA", "Remote"];
const INDUSTRY_OPTIONS = ["Technology", "Finance", "Healthcare", "Education", "E-Commerce", "Media", "Consulting", "Logistics", "Government", "Non-profit"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Freelance"];
const REMOTE_OPTIONS = ["On-site", "Hybrid", "Fully Remote", "No preference"];

// Wizard labels -> backend enums. The wizard's labels differ from the canonical
// label tables (e.g. "Fully Remote" vs "Remote"), so the mapping is explicit.
const EMPLOYMENT_TYPE_MAP: Record<string, EmploymentType> = {
  "Full-time": "FULL_TIME",
  "Part-time": "PART_TIME",
  Contract: "CONTRACT",
  Freelance: "FREELANCE",
};
const REMOTE_TYPE_MAP: Record<string, RemoteType> = {
  "On-site": "ON_SITE",
  Hybrid: "HYBRID",
  "Fully Remote": "REMOTE",
  // "No preference" is intentionally absent → no remote preference sent.
};

const JOB_TITLE_SUGGESTIONS = [
  "Senior Software Engineer",
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "Data Analyst",
  "UX Designer",
  "Product Designer",
  "DevOps Engineer",
  "Marketing Manager",
  "Sales Executive"
];

/* ═════════════════════════════════════════════════════════════ */
/*  STEP INDICATOR COMPONENT                                       */
/* ═════════════════════════════════════════════════════════════ */
function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { num: 1, label: "Upload Resume" },
    { num: 2, label: "Profile Setup" },
    { num: 3, label: "Your Matches" },
  ];
  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-4">
      {/* Tracker headers */}
      <div className="relative flex items-center justify-center text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
        <span>Onboarding Progress</span>
        <span className="absolute right-0">Step {current} of 3</span>
      </div>
      {/* Tracker Visual */}
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-neutral-200 -z-10" />
        {/* Progress Line */}
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-primary-600 transition-all duration-500 -z-10"
          style={{ width: `${((current - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
        />

        {steps.map((s) => {
          const isActive = current === s.num;
          const isCompleted = current > s.num;

          return (
            <div key={s.num} className="flex flex-col items-center relative bg-white px-2">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${isCompleted
                    ? "bg-primary-600 border-primary-600 text-white"
                    : isActive
                      ? "bg-primary-800 border-primary-800 text-white ring-4 ring-primary-100"
                      : "bg-white border-neutral-300 text-neutral-400"
                  }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
              </div>
              <span
                className={`absolute top-11 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${isActive || isCompleted ? "text-primary-800" : "text-neutral-400"
                  }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-6" /> {/* Spacer for labels */}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════ */
/*  STEP 1: RESUME UPLOAD                                          */
/* ═════════════════════════════════════════════════════════════ */
function ResumeUploadStep({
  onNext,
  onSetParsedData,
  parsedData,
  setSkipResume
}: {
  onNext: () => void;
  onSetParsedData: (data: ParsedResume | null) => void;
  parsedData: ParsedResume | null;
  setSkipResume: (skip: boolean) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState("");

  // Fields for the editable low-confidence flow
  const [editSkills, setEditSkills] = useState("");
  const [editEducation, setEditEducation] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  // Real multipart upload (POST /resumes) with progress.
  const {
    upload,
    state: uploadState,
    progress: uploadProgress,
    error: uploadError,
    resume: uploadedResume,
    reset: resetUpload,
  } = useResumeUpload();
  const uploading = uploadState === "uploading";

  // Parsing runs in a BullMQ worker; poll until it settles.
  const { status: parsingStatus, hasTimedOut } = useParsingStatus(
    uploadedResume?.id,
    Boolean(uploadedResume) && uploadState === "success",
  );
  const parsing = Boolean(uploadedResume) && parsingStatus !== "SUCCESS" && parsingStatus !== "FAILED";

  // Real structured data extracted by the backend (AI, or heuristic fallback).
  const { parsed: parsedData_ } = useParsedData(
    uploadedResume?.id,
    parsingStatus === "SUCCESS",
  );

  const errorMsg = localError || uploadError;
  const parseSteps = ["Extracting text…", "Finding skills…", "Parsing experience…", "Extracting education…"];
  // Cosmetic only: the backend reports a single status, not per-stage progress.
  const parseStep = parsing ? Math.min(3, Math.floor((Date.now() / 800) % 4)) : 3;

  const handleFile = async (f: File) => {
    setLocalError("");
    // Mirrors the backend: PDF/DOCX only, 5 MB max (it rejects legacy .doc).
    const validationError = validateResumeFile(f);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setFile(f);
    await upload(f, f.name.replace(/\.(pdf|docx)$/i, ""));
  };

  // Project the real parsed data into the wizard once both parsing has settled
  // SUCCESS and the parsed-data fetch has returned.
  useEffect(() => {
    if (parsingStatus !== "SUCCESS" || !parsedData_) return;
    onSetParsedData(toWizardParsed(parsedData_));
    setSkipResume(false);
  }, [parsingStatus, parsedData_, onSetParsedData, setSkipResume]);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const resetFile = () => {
    setFile(null);
    resetUpload();
    onSetParsedData(null);
    setLocalError("");
    setIsEditing(false);
    setIsSkipping(false);
  };

  const handleConfirmData = () => {
    if (isEditing && parsedData) {
      const skillsArray = editSkills.split(",").map(s => s.trim()).filter(s => s.length > 0);
      onSetParsedData({
        ...parsedData,
        skills: skillsArray,
        education: editEducation,
      });
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* The parser-simulation switcher was removed with the mock upload: the
          upload and parsing status are real now. */}
      {!isSkipping ? (
        <>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Let&apos;s get you started – upload your resume</h2>
            <p className="text-sm text-neutral-500 mt-1">
              We&apos;ll analyze it to find better matches
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-md px-2.5 py-1">
              <BarChart2 className="w-3.5 h-3.5" />
              Resume users see 50% more matches
            </div>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-lg border text-sm flex flex-col gap-2 bg-red-50 border-red-200 text-red-700">
              <div className="flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              {uploadState === "error" && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={resetFile}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold rounded-md transition-colors"
                  >
                    Try uploading again
                  </button>
                  <button
                    onClick={() => {
                      resetFile();
                      setSkipResume(true);
                      onNext();
                    }}
                    className="px-3 py-1.5 bg-white border border-red-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-md transition-colors"
                  >
                    Enter data manually
                  </button>
                  <button
                    onClick={() => setIsSkipping(true)}
                    className="px-3 py-1.5 bg-white border border-red-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-md transition-colors"
                  >
                    Skip for now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* DROP ZONE */}
          {!file && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`relative border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200 ${dragOver ? "border-primary-500 bg-primary-50" : "border-neutral-300 bg-neutral-50 hover:border-primary-400 hover:bg-primary-50/50"
                }`}
              onClick={() => document.getElementById("resume-file-input")?.click()}
            >
              <input
                id="resume-file-input"
                type="file"
                accept={RESUME_ACCEPT_ATTR}
                className="hidden"
                onChange={onInputChange}
              />
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center transition-colors duration-200 ${dragOver ? "bg-primary-200" : "bg-primary-100"}`}>
                  <Upload className={`w-7 h-7 ${dragOver ? "text-primary-700" : "text-primary-500"}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-700">
                    Drag your resume here
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    or <span className="text-primary-700 font-semibold hover:underline">Choose file</span>
                  </p>
                </div>
                {/* Matches the backend: MIME_TO_TYPE accepts PDF/DOCX only, 5 MB max. */}
                <p className="text-xs text-neutral-400">Accepted formats: PDF, DOCX (Max 5MB)</p>
              </div>
            </div>
          )}

          {/* FILE SELECTED — UPLOAD / PARSE PROGRESS */}
          {file && !parsedData && uploadState !== "error" && (
            <div className="border border-neutral-200 rounded-lg p-5 space-y-4 bg-neutral-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">{file.name}</p>
                  <p className="text-xs text-neutral-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                {!parsing && (
                  <button onClick={resetFile} className="text-neutral-400 hover:text-red-500 transition-colors p-1">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Upload progress */}
              {uploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-neutral-600 font-semibold">
                    <span>Uploading... {uploadProgress}%</span>
                    <button
                      onClick={resetFile}
                      className="text-primary-600 hover:underline hover:text-primary-700 font-bold"
                    >
                      Cancel upload
                    </button>
                  </div>
                  <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-200 bg-primary-600"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400">Usually &lt;10 seconds</p>
                </div>
              )}

              {/* Parse steps */}
              {parsing && !hasTimedOut && (
                <div className="space-y-2 border-t border-neutral-200 pt-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-neutral-700">We&apos;re parsing your resume now...</span>
                    <span className="text-[11px] text-neutral-400">Usually ~30 seconds</span>
                  </div>
                  {parseSteps.map((label, i) => (
                    <div key={label} className={`flex items-center gap-2 text-xs transition-all duration-300 ${i <= parseStep ? "text-neutral-700" : "text-neutral-300"}`}>
                      {i < parseStep ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      ) : i === parseStep ? (
                        <Loader2 className="w-4 h-4 text-primary-600 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-neutral-300 shrink-0" />
                      )}
                      {label}
                    </div>
                  ))}
                </div>
              )}

              {/* Parsing is done by a background worker. If it never reports back,
                  the resume is still saved — never trap the user on this step. */}
              {hasTimedOut && (
                <div className="border-t border-neutral-200 pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    Your resume is saved, but analysis is still queued.
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    You can carry on — we&apos;ll add the insights to your profile once it finishes.
                  </p>
                  <button
                    onClick={() => {
                      setSkipResume(true);
                      onNext();
                    }}
                    className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-md transition-colors duration-200"
                  >
                    Continue anyway
                  </button>
                </div>
              )}

              {parsingStatus === "FAILED" && (
                <div className="border-t border-neutral-200 pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    We couldn&apos;t read this resume.
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={resetFile}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold rounded-md transition-colors duration-200"
                    >
                      Try another file
                    </button>
                    <button
                      onClick={() => {
                        setSkipResume(true);
                        onNext();
                      }}
                      className="px-3 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-md transition-colors duration-200"
                    >
                      Continue without it
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PARSED RESULTS */}
          {parsedData && (
            <div className="border border-green-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all duration-200">
              <div className="bg-green-50 px-4 py-3 flex items-center gap-2 border-b border-green-100">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-800">Resume parsed successfully</span>
                {/* Says which pipeline produced this, not a confidence score. The old
                    badge showed a hardcoded "92%" that was never measured — it read 92%
                    over a parse that got most fields wrong. */}
                <span className="ml-auto text-xs text-green-700 font-bold bg-green-100 px-2.5 py-0.5 rounded-full border border-green-200">
                  {parsedData.parsedBy === "ai" ? "AI-parsed" : "Basic parse"}
                </span>
              </div>

              {isEditing ? (
                /* LOW CONFIDENCE EDITABLE VIEW */
                <div className="p-5 space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs flex gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <div>
                      <p className="font-semibold">⚠️ Some data may be incomplete</p>
                      <p>Please review and edit the parsed information below to ensure matches are accurate.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                      Extracted Skills (comma separated)
                    </label>
                    <textarea
                      value={editSkills}
                      onChange={(e) => setEditSkills(e.target.value)}
                      className="block w-full px-3 py-2 border border-neutral-200 rounded-md text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                      Extracted Education
                    </label>
                    <input
                      type="text"
                      value={editEducation}
                      onChange={(e) => setEditEducation(e.target.value)}
                      className="block w-full px-3 py-2 border border-neutral-200 rounded-md text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                      Experience (review only)
                    </label>
                    <div className="bg-neutral-50 border border-neutral-200 rounded p-3 space-y-2">
                      {parsedData.experience.map((exp, idx) => (
                        <div key={idx} className="text-xs flex justify-between border-b border-neutral-100 last:border-0 pb-1.5 last:pb-0">
                          <span className="font-medium text-neutral-800">{exp.title} at {exp.company}</span>
                          <span className="text-neutral-500">{exp.years}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* READ-ONLY SUMMARY VIEW */
                <div className="p-5 space-y-4">
                  {parsedData.summary && (
                    <div>
                      <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Summary</p>
                      <p className="text-xs text-neutral-700 leading-relaxed">{parsedData.summary}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Skills ({parsedData.skills.length} found)</p>
                    <div className="flex flex-wrap gap-1.5">
                      {parsedData.skills.map((s) => (
                        <span key={s} className="text-xs font-semibold text-primary-800 bg-primary-50 border border-primary-200 rounded-full px-2.5 py-0.5">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Experience ({parsedData.experience.length} positions)</p>
                    <div className="space-y-2.5">
                      {parsedData.experience.map((exp, idx) => (
                        <div key={idx} className="text-xs py-1 border-b border-neutral-100 last:border-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-semibold text-neutral-800">{exp.title}</span>
                              {/* Many CVs never name the employer; don't render a dangling "at". */}
                              {exp.company && <span className="text-neutral-500"> at {exp.company}</span>}
                            </div>
                            <span className="text-neutral-400 shrink-0 ml-2 font-mono">{exp.years}</span>
                          </div>
                          {/* The achievements the CV is actually judged on. These were
                              parsed all along but dropped before reaching the client. */}
                          {exp.highlights.length > 0 && (
                            <ul className="mt-1 ml-3.5 space-y-0.5 list-disc marker:text-neutral-300">
                              {exp.highlights.map((h, i) => (
                                <li key={i} className="text-[11px] text-neutral-600 leading-relaxed">{h}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Hidden when empty: plenty of CVs have no projects section. */}
                  {parsedData.projects.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Projects ({parsedData.projects.length})</p>
                      <div className="space-y-2.5">
                        {parsedData.projects.map((proj, idx) => (
                          <div key={idx} className="text-xs py-1 border-b border-neutral-100 last:border-0">
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-neutral-800">{proj.name}</span>
                              <span className="text-neutral-400 shrink-0 ml-2 font-mono">{proj.years}</span>
                            </div>
                            {proj.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {proj.technologies.map((t) => (
                                  <span key={t} className="text-[11px] font-semibold text-neutral-700 bg-neutral-100 border border-neutral-200 rounded px-1.5 py-0.5">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">Education ({parsedData.educations.length})</p>
                    {/* One row per qualification; the single joined string made two
                        degrees read as one. */}
                    <div className="space-y-1.5">
                      {parsedData.educations.map((ed, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs py-1 border-b border-neutral-100 last:border-0">
                          <div>
                            <span className="font-semibold text-neutral-800">{ed.degree}</span>
                            {ed.institution && <span className="text-neutral-500"> — {ed.institution}</span>}
                          </div>
                          <span className="text-neutral-400 shrink-0 ml-2 font-mono">{ed.years}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 px-5 pb-5 pt-2 border-t border-neutral-100 bg-neutral-50">
                <button
                  onClick={resetFile}
                  className="flex-1 py-2 text-xs font-semibold border border-neutral-200 rounded-md text-neutral-600 hover:bg-white hover:border-neutral-300 transition-all bg-transparent"
                >
                  Upload Different Resume
                </button>
                {isEditing && (
                  <button
                    onClick={handleConfirmData}
                    className="flex-1 py-2 text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-all shadow-sm"
                  >
                    Confirm data and continue
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4">
            {(!file || (parsedData && !isEditing)) && (
              <button
                onClick={handleConfirmData}
                disabled={uploading || parsing}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600 hover:bg-primary-700 active:scale-[0.98]"
              >
                {parsedData ? (
                  <><span>Confirm &amp; Continue</span><ArrowRight className="w-4.5 h-4.5" /></>
                ) : (
                  <><span>Continue without resume</span><ArrowRight className="w-4.5 h-4.5" /></>
                )}
              </button>
            )}
            {!parsedData && (
              <button
                onClick={() => setIsSkipping(true)}
                className="text-xs text-neutral-500 hover:text-primary-700 hover:underline text-center transition-colors font-medium py-1"
              >
                Skip for now
              </button>
            )}
          </div>
        </>
      ) : (
        /* SKIP DIALOG VIEW */
        <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50 space-y-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-neutral-900">Resume not required – you can add it later</h3>
              <p className="text-xs text-neutral-500 mt-1">
                You&apos;ll see fewer personalized matches without a resume.
              </p>
            </div>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs font-semibold">
            🎯 Complete your profile now → 50% more matches
          </div>
          <p className="text-[11px] text-neutral-400">Note: Profile will be marked &quot;25% complete&quot; if you skip resume upload.</p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsSkipping(false)}
              className="flex-1 py-2 text-xs font-semibold border border-neutral-200 rounded-md text-neutral-600 hover:bg-white transition-colors bg-white"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                setSkipResume(true);
                onNext();
              }}
              className="flex-1 py-2 text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
            >
              Continue to profile setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════ */
/*  STEP 2: QUICK PROFILE SETUP                                    */
/* ═════════════════════════════════════════════════════════════ */
function ProfileSetupStep({
  onNext,
  onBack,
  parsedResumeData,
  // Passed by the parent but not read here; the prop stays in the contract.
  skipResume: _skipResume
}: {
  onNext: (data: ProfileData) => void;
  onBack: () => void;
  parsedResumeData: ParsedResume | null;
  skipResume: boolean;
}) {
  const [jobTitle, setJobTitle] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showWhyAsk, setShowWhyAsk] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [locationSearch, setLocationSearch] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [salaryMin, setSalaryMin] = useState<number | string>(100);
  const [salaryMax, setSalaryMax] = useState<number | string>(200);
  const [isSalaryNegotiable, setIsSalaryNegotiable] = useState(false);
  const [preferNotToDisclose, setPreferNotToDisclose] = useState(false);
  const [salaryError, setSalaryError] = useState("");
  const [showSalaryWhyAsk, setShowSalaryWhyAsk] = useState(false);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>(["Full-time"]);
  const [remotePreference, setRemotePreference] = useState("Fully Remote");
  const [industries, setIndustries] = useState<string[]>([]);
  const [industrySearch, setIndustrySearch] = useState("");
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Field validations
  const [titleError, setTitleError] = useState("");
  const [locError, setLocError] = useState("");
  const [saveError, setSaveError] = useState("");

  // Real profile persistence — this step doubles as Flow 1 Phase 2 "Quick Profile
  // Setup", so it must create the backend profile (satisfying the onboarding gate).
  const { user } = useSession();
  const { profile: existingProfile } = useProfile();
  const createProfile = useCreateProfile();
  const updatePreferences = useUpdatePreferences();

  const titleRef = useRef<HTMLDivElement>(null);
  const locRef = useRef<HTMLDivElement>(null);
  const indRef = useRef<HTMLDivElement>(null);

  // Active preset determination
  const activePreset = React.useMemo(() => {
    if (preferNotToDisclose) return null;
    const min = Number(salaryMin);
    const max = Number(salaryMax);
    if (min === 80 && max === 120) return "80-120";
    if (min === 120 && max === 160) return "120-160";
    if (min === 160 && max === 200) return "160-200";
    if (min === 200 && max === 350) return "200-plus";
    return "custom";
  }, [salaryMin, salaryMax, preferNotToDisclose]);

  const handlePresetClick = (preset: typeof SALARY_PRESETS[number]) => {
    if (preferNotToDisclose) return;
    if (preset.id === "custom") {
      setSalaryError("");
      return;
    }
    if (preset.min !== null && preset.max !== null) {
      setSalaryMin(preset.min);
      setSalaryMax(preset.max);
      setSalaryError("");
    }
  };

  const handleSalaryChange = (field: "min" | "max", value: string) => {
    setSalaryError("");
    if (field === "min") {
      setSalaryMin(value);
      const minNum = Number(value);
      const maxNum = Number(salaryMax);
      if (value !== "" && salaryMax !== "" && !isNaN(minNum) && !isNaN(maxNum)) {
        if (minNum >= maxNum) {
          setSalaryError("Minimum salary must be less than maximum");
        }
      }
    } else {
      setSalaryMax(value);
      const minNum = Number(salaryMin);
      const maxNum = Number(value);
      if (salaryMin !== "" && value !== "" && !isNaN(minNum) && !isNaN(maxNum)) {
        if (minNum >= maxNum) {
          setSalaryError("Minimum salary must be less than maximum");
        }
      }
    }
  };

  // Autofill if resume details are available
  useEffect(() => {
    if (parsedResumeData) {
      // Guess job title from primary experience
      if (parsedResumeData.experience && parsedResumeData.experience.length > 0) {
        setJobTitle(parsedResumeData.experience[0].title);
      }
      // Guess locations
      setLocations(["San Francisco, CA", "Remote"]);
      // Guess industries
      setIndustries(["Technology"]);
    }
  }, [parsedResumeData]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (titleRef.current && !titleRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (locRef.current && !locRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (indRef.current && !indRef.current.contains(event.target as Node)) {
        setShowIndustryDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleListItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const handleLocationSelect = (loc: string) => {
    if (!locations.includes(loc)) {
      setLocations([...locations, loc]);
    }
    setLocationSearch("");
    setShowLocationDropdown(false);
    setLocError("");
  };

  const handleIndustrySelect = (ind: string) => {
    if (industries.length >= 5) return;
    if (!industries.includes(ind)) {
      setIndustries([...industries, ind]);
    }
    setIndustrySearch("");
    setShowIndustryDropdown(false);
  };

  const validateForm = () => {
    let valid = true;
    if (jobTitle.trim().length === 0) {
      setTitleError("Job title is required for recommendation matches.");
      valid = false;
    } else {
      setTitleError("");
    }

    if (locations.length === 0) {
      setLocError("Select at least one preferred location.");
      valid = false;
    } else {
      setLocError("");
    }

    if (!preferNotToDisclose) {
      const min = Number(salaryMin);
      const max = Number(salaryMax);
      if (salaryMin === "" || salaryMax === "" || isNaN(min) || isNaN(max)) {
        setSalaryError("Please enter valid minimum and maximum salary or choose 'Prefer not to disclose'.");
        valid = false;
      } else if (min >= max) {
        setSalaryError("Minimum salary must be less than maximum");
        valid = false;
      } else if (min < 10) {
        setSalaryError("Minimum salary is too low (minimum is $10K).");
        valid = false;
      } else {
        setSalaryError("");
      }
    } else {
      setSalaryError("");
    }

    return valid;
  };

  /**
   * Persist the profile to the backend. Creating the profile (POST /profiles) is
   * what marks onboarding complete for the seeker gate; preferences are a separate,
   * non-fatal endpoint so a hiccup there can't strand the user on this step.
   */
  const persistProfile = async (data: ProfileData) => {
    const { firstName, lastName } = displayName(user);
    // POST /profiles requires non-empty first AND last name; `name` is optional at
    // signup, so fall back to the email local-part and never send an empty string.
    const safeFirst = firstName || user?.email?.split("@")[0] || "New";
    const safeLast = lastName || safeFirst;

    if (!existingProfile) {
      try {
        const minSalaryVal = data.preferNotToDiscloseSalary || data.salaryMin === undefined
          ? undefined
          : data.salaryMin * 1000;
        const maxSalaryVal = data.preferNotToDiscloseSalary || data.salaryMax === undefined
          ? undefined
          : data.salaryMax * 1000;

        await createProfile.mutateAsync({
          firstName: safeFirst,
          lastName: safeLast,
          headline: data.jobTitle.trim() || undefined,
          location: parseLocationInput(data.locations[0] ?? ""),
          minSalary: minSalaryVal,
          maxSalary: maxSalaryVal,
        });
      } catch (error) {
        // Already created (e.g. a re-run) — treat as done and carry on.
        if (!(error instanceof ApiError && error.statusCode === 409)) throw error;
      }
    }

    try {
      const remoteType = REMOTE_TYPE_MAP[data.remotePreference];
      await updatePreferences.mutateAsync({
        employmentTypes: data.employmentTypes
          .map((t) => EMPLOYMENT_TYPE_MAP[t])
          .filter(Boolean) as EmploymentType[],
        remoteTypes: remoteType ? [remoteType] : undefined,
        industries: data.industries,
      });
    } catch {
      /* non-fatal: the profile exists; preferences can be set later on /profile */
    }
  };

  const submit = async (data: ProfileData) => {
    setIsLoading(true);
    setSaveError("");
    try {
      await persistProfile(data);
      onNext(data);
    } catch (error) {
      setSaveError(
        error instanceof ApiError
          ? error.messages.join(" ")
          : "Could not save your profile. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    void submit({
      jobTitle,
      locations,
      salaryMin: preferNotToDisclose ? undefined : Number(salaryMin),
      salaryMax: preferNotToDisclose ? undefined : Number(salaryMax),
      isSalaryNegotiable,
      preferNotToDiscloseSalary: preferNotToDisclose,
      employmentTypes,
      remotePreference,
      industries,
      completeness: "complete",
    });
  };

  const handleSkipOptional = () => {
    if (jobTitle.trim().length === 0 || locations.length === 0) {
      // Must fill jobTitle and locations even when skipping optional
      validateForm();
      return;
    }
    void submit({
      jobTitle,
      locations,
      salaryMin: 100, // Default values
      salaryMax: 200,
      isSalaryNegotiable: true,
      preferNotToDiscloseSalary: false,
      employmentTypes: ["Full-time"],
      remotePreference: "No preference",
      industries: [],
      completeness: "partial",
    });
  };

  const marketInsight = getMarketSalaryInsight(jobTitle, locations);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Quick Profile Setup</h2>
          <p className="text-sm text-neutral-500 mt-1">Help us find better matches for you</p>
        </div>
        <button
          onClick={handleSkipOptional}
          className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline px-2 py-1"
        >
          Skip optional fields
        </button>
      </div>

      <form className="space-y-5" onSubmit={handleContinue}>
        {/* Job Title */}
        <div ref={titleRef} className="relative">
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1">
              Current or most recent job title <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowWhyAsk(!showWhyAsk)}
              className="text-[11px] font-semibold text-neutral-400 hover:text-primary-600 flex items-center gap-0.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Why we ask
            </button>
          </div>

          {showWhyAsk && (
            <div className="p-3 bg-primary-50 border border-primary-200 rounded-md text-[11px] text-primary-800 mb-2.5 animate-fade-in flex gap-2">
              <Info className="w-4 h-4 shrink-0 text-primary-600" />
              <span>We use your job title to analyze market trends and recommend matching positions matching your career path.</span>
            </div>
          )}

          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="e.g. Senior Software Engineer"
              value={jobTitle}
              onChange={(e) => {
                setJobTitle(e.target.value);
                setShowSuggestions(true);
                setTitleError("");
              }}
              onFocus={() => setShowSuggestions(true)}
              className={`block w-full pl-10 pr-4 py-2.5 border rounded-md text-sm text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${titleError ? "border-red-400 ring-1 ring-red-400" : "border-neutral-200"
                }`}
            />
          </div>

          {titleError && <p className="text-[11px] text-red-600 mt-1 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{titleError}</p>}

          {/* Autocomplete Dropdown */}
          {showSuggestions && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {JOB_TITLE_SUGGESTIONS.filter(item => item.toLowerCase().includes(jobTitle.toLowerCase())).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setJobTitle(item);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-primary-50 hover:text-primary-800 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preferred Location */}
        <div ref={locRef} className="relative">
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Preferred Location(s) <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-1.5 p-1.5 border border-neutral-200 rounded-md bg-white min-h-[42px] items-center">
            {locations.map((loc) => (
              <span key={loc} className="inline-flex items-center gap-1 text-xs font-bold bg-primary-100 text-primary-800 rounded px-2 py-0.5 border border-primary-200">
                <MapPin className="w-3 h-3 shrink-0" />
                {loc}
                <button type="button" onClick={() => setLocations(locations.filter(l => l !== loc))} className="text-primary-600 hover:text-red-500 transition-colors p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={locations.length === 0 ? "Search cities (e.g. San Francisco)" : "Add more locations..."}
              value={locationSearch}
              onChange={(e) => {
                setLocationSearch(e.target.value);
                setShowLocationDropdown(true);
              }}
              onFocus={() => setShowLocationDropdown(true)}
              className="flex-1 bg-transparent border-0 outline-none text-xs min-w-[120px] p-0.5"
            />
          </div>

          {locError && <p className="text-[11px] text-red-600 mt-1 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{locError}</p>}

          {/* Location suggestions */}
          {showLocationDropdown && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {LOCATION_OPTIONS.filter(opt => opt.toLowerCase().includes(locationSearch.toLowerCase())).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleLocationSelect(opt)}
                  className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-primary-50 hover:text-primary-800 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          <p className="text-[10px] text-neutral-400 mt-1">This helps us filter relevant jobs matching your regions.</p>
        </div>

        {/* Salary Expectations */}
        <div>
          <div className="flex justify-between items-start mb-1.5">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Base salary expectations (USD/year)
              </label>
              <p className="text-xs text-neutral-500 mt-0.5">
                Help us find opportunities that match your goals
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSalaryWhyAsk(!showSalaryWhyAsk)}
              className="text-[11px] font-semibold text-neutral-400 hover:text-primary-600 flex items-center gap-1 shrink-0 ml-2"
              title="Why we ask for salary expectations"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why we ask</span>
            </button>
          </div>

          {showSalaryWhyAsk && (
            <div className="p-3 bg-primary-50 border border-primary-200 rounded-md text-[11px] text-primary-800 mb-2.5 animate-fade-in flex gap-2">
              <Info className="w-4 h-4 shrink-0 text-primary-600" />
              <span>We use this to filter jobs matching your expectations.</span>
            </div>
          )}

          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-4">
            {/* Quick select buttons */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Quick select (optional):
              </label>
              <div className="flex flex-wrap gap-2">
                {SALARY_PRESETS.map((preset) => {
                  const isActive = !preferNotToDisclose && activePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={preferNotToDisclose}
                      onClick={() => handlePresetClick(preset)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-md border transition-all duration-150 ${isActive
                          ? "bg-primary-800 border-primary-800 text-white shadow-sm"
                          : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                        } ${preferNotToDisclose ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Range Inputs */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                Or enter custom range:
              </label>
              <div className="flex items-center gap-3">
                {/* Min salary input */}
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold text-sm pointer-events-none">$</span>
                    <input
                      type="number"
                      placeholder="100"
                      value={preferNotToDisclose ? "" : salaryMin}
                      disabled={preferNotToDisclose}
                      onChange={(e) => handleSalaryChange("min", e.target.value)}
                      className={`block w-full pl-7 pr-8 py-2 border rounded-md text-sm text-neutral-900 bg-white font-semibold placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${salaryError ? "border-red-400 ring-1 ring-red-400" : "border-neutral-200"
                        } ${preferNotToDisclose ? "bg-neutral-100 opacity-50 cursor-not-allowed" : ""}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs pointer-events-none">K</span>
                  </div>
                  <span className="block text-[11px] font-medium text-neutral-500 mt-1 pl-0.5">Min salary</span>
                </div>

                <span className="text-neutral-400 text-base font-bold select-none mb-4">—</span>

                {/* Max salary input */}
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-semibold text-sm pointer-events-none">$</span>
                    <input
                      type="number"
                      placeholder="200"
                      value={preferNotToDisclose ? "" : salaryMax}
                      disabled={preferNotToDisclose}
                      onChange={(e) => handleSalaryChange("max", e.target.value)}
                      className={`block w-full pl-7 pr-8 py-2 border rounded-md text-sm text-neutral-900 bg-white font-semibold placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${salaryError ? "border-red-400 ring-1 ring-red-400" : "border-neutral-200"
                        } ${preferNotToDisclose ? "bg-neutral-100 opacity-50 cursor-not-allowed" : ""}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-xs pointer-events-none">K</span>
                  </div>
                  <span className="block text-[11px] font-medium text-neutral-500 mt-1 pl-0.5">Max salary</span>
                </div>
              </div>

              {salaryError && !preferNotToDisclose && (
                <p className="text-[11px] text-red-600 mt-1.5 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {salaryError}
                </p>
              )}
            </div>

            {/* Flexibility Options */}
            <div className="pt-2 border-t border-neutral-200/70 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isSalaryNegotiable}
                  onChange={(e) => setIsSalaryNegotiable(e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-neutral-700">Salary is negotiable</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={preferNotToDisclose}
                  onChange={(e) => {
                    setPreferNotToDisclose(e.target.checked);
                    if (e.target.checked) {
                      setSalaryError("");
                    }
                  }}
                  className="w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500 cursor-pointer"
                />
                <span className="text-xs font-medium text-neutral-700">Prefer not to disclose</span>
              </label>
            </div>

            {/* Smart Helper Text / Market Insight */}
            {/* <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-md text-[11px] text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Market insight:</span>{" "}
                {marketInsight.title.endsWith("s") || marketInsight.title.toLowerCase().includes("engineer")
                  ? marketInsight.title
                  : `Roles like "${marketInsight.title}"`}{" "}
                {marketInsight.locationText} typically earn{" "}
                <span className="font-bold">${marketInsight.min}K–${marketInsight.max}K</span> per year.
              </div>
            </div> */}
          </div>
        </div>

        {/* Employment Preference */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Employment Type Preferences
          </label>
          <div className="flex flex-wrap gap-2">
            {EMPLOYMENT_TYPES.map((type) => {
              const selected = employmentTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleListItem(employmentTypes, setEmploymentTypes, type)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-md border transition-all duration-150 ${selected
                      ? "bg-primary-800 border-primary-800 text-white shadow-sm"
                      : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Remote preference */}
        <div>
          <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
            Remote Work Flexibility
          </label>
          <div className="grid grid-cols-4 gap-2">
            {REMOTE_OPTIONS.map((opt) => {
              const selected = remotePreference === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setRemotePreference(opt)}
                  className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-md border transition-all duration-150 ${selected
                      ? "bg-primary-800 border-primary-800 text-white shadow-sm"
                      : "bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                >
                  <Wifi className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Industries of interest */}
        <div ref={indRef} className="relative">
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Industries of Interest <span className="text-neutral-400 font-normal normal-case">(up to 5)</span>
            </label>
            <span className="text-[10px] font-bold text-neutral-400">
              {industries.length} of 5 selected
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 p-1.5 border border-neutral-200 rounded-md bg-white min-h-[42px] items-center">
            {industries.map((ind) => (
              <span key={ind} className="inline-flex items-center gap-1 text-xs font-bold bg-neutral-100 text-neutral-800 rounded px-2 py-0.5 border border-neutral-200">
                {ind}
                <button type="button" onClick={() => setIndustries(industries.filter(i => i !== ind))} className="text-neutral-500 hover:text-red-500 transition-colors p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder={industries.length === 0 ? "Search industries (e.g. Finance)" : "Add industry..."}
              value={industrySearch}
              disabled={industries.length >= 5}
              onChange={(e) => {
                setIndustrySearch(e.target.value);
                setShowIndustryDropdown(true);
              }}
              onFocus={() => setShowIndustryDropdown(true)}
              className="flex-1 bg-transparent border-0 outline-none text-xs min-w-[120px] p-0.5 disabled:opacity-50"
            />
          </div>

          {/* Industry Suggestions */}
          {showIndustryDropdown && industries.length < 5 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {INDUSTRY_OPTIONS.filter(opt => opt.toLowerCase().includes(industrySearch.toLowerCase())).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleIndustrySelect(opt)}
                  className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-primary-50 hover:text-primary-800 transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {saveError && <Alert variant="error">{saveError}</Alert>}

        {/* Buttons */}
        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-md border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600 hover:bg-primary-700 active:scale-[0.98]"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving Profile...</span></>
            ) : (
              <><span>Continue to Matches</span><ArrowRight className="w-4.5 h-4.5" /></>
            )}
          </button>
        </div>

        {/* Sets the expectation for step 3 before they get there. "About a minute" is
            the embedding's real cost, and the same figure the backend's own readiness
            copy uses - not an invented duration. */}
        <p className="text-xs text-center pt-1" style={{ color: "var(--color-text-tertiary)" }}>
          Next, we&rsquo;ll analyze your profile to find your best matches. This usually takes about a minute.
        </p>
      </form>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════ */
/*  STEP 3: FIRST RECOMMENDATIONS / MATCHES PAGE                  */
/* ═════════════════════════════════════════════════════════════ */
function FirstMatchesStep({
  onBack,
  // Passed by the parent but not read here; the prop stays in the contract.
  profileData: _profileData
}: {
  onBack: () => void;
  profileData: ProfileData | null;
}) {
  const router = useRouter();

  /**
   * THE BRIDGE SCREEN.
   *
   * This step used to assert a nightly batch at 11:00 PM PT and a 4-20 hour wait, and
   * then - seventy lines further down, in this same component - that matches were ready.
   * Both were fiction: there is no cron in the backend, and `RecommendationsQueryService`
   * recomputes lazily on read. The only real wait is the profile embedding, which the
   * backend itself describes as "about a minute".
   *
   * So nothing here invents a duration. `GET /recommendations/readiness` already answers
   * "can we match this person yet, and if not, whose move is it" - and ships a `message`
   * written for the candidate. We render that string rather than writing a second,
   * competing copy of it that can drift from what the server believes.
   */
  const { data: readiness, isLoading, isError, refetch } = useMatchReadiness();

  // Warm the list while they are still on this screen, so "View my matches" lands on
  // data instead of a spinner. This is also what triggers the lazy recompute.
  const ready = readiness?.state === "READY";
  const { data: matches } = useRecommendations({ enabled: ready });

  const goToDashboard = () => router.push("/dashboard");

  // -- First load ----------------------------------------------------------
  if (isLoading) {
    return (
      <BridgeShell>
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: "var(--color-primary-500)" }} />
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Checking your matches...
        </p>
      </BridgeShell>
    );
  }

  // -- The readiness call itself failed (network, auth) --------------------
  // Distinct from EMBEDDING_FAILED: we do not know the state, so we must not claim one.
  if (isError || !readiness) {
    return (
      <BridgeShell>
        <BridgeIcon tone="warning"><AlertTriangle className="w-7 h-7" /></BridgeIcon>
        <BridgeCopy
          title="We couldn't check your matches"
          body="Something went wrong reaching our servers. Your profile is saved."
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <BridgeButton onClick={() => void refetch()}>Try again</BridgeButton>
          <BridgeButton variant="ghost" onClick={goToDashboard}>Go to dashboard</BridgeButton>
        </div>
      </BridgeShell>
    );
  }

  // -- Scenario A: still working. The only honest spinner. -----------------
  // `transient` is the backend's own statement that this resolves by itself; the hook
  // polls on exactly that flag, so there is no interval to manage here.
  if (readiness.state === "EMBEDDING_PENDING") {
    return (
      <BridgeShell>
        <div className="relative flex items-center justify-center">
          <span
            className="absolute w-16 h-16 rounded-full animate-pulse-soft"
            style={{ background: "var(--color-primary-100)" }}
          />
          <Loader2 className="w-8 h-8 animate-spin relative" style={{ color: "var(--color-primary-600)" }} />
        </div>
        <BridgeCopy title="Analyzing your profile" body={readiness.message} />
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          This page updates on its own - no need to refresh.
        </p>
        <BridgeButton variant="ghost" onClick={goToDashboard}>
          Browse jobs while you wait
        </BridgeButton>
      </BridgeShell>
    );
  }

  // -- Scenario B: it broke, and it will not fix itself --------------------
  // Warning, not error: nothing the candidate did caused this, and their data is intact.
  // The embed is a one-shot listener with no retry, so the only way out is an event that
  // fires it again - which is precisely what editing the profile does. Never a dead end.
  if (readiness.state === "EMBEDDING_FAILED") {
    return (
      <BridgeShell>
        <BridgeIcon tone="warning"><AlertTriangle className="w-7 h-7" /></BridgeIcon>
        <BridgeCopy title="We hit a snag" body={readiness.message} />
        <div className="flex flex-col sm:flex-row gap-2">
          <BridgeButton onClick={onBack}>
            <ArrowLeft className="w-4 h-4" /> Update profile &amp; retry
          </BridgeButton>
          <BridgeButton variant="ghost" onClick={goToDashboard}>Skip for now</BridgeButton>
        </div>
      </BridgeShell>
    );
  }

  // -- NO_PROFILE: onboarding is genuinely incomplete ----------------------
  // Reachable if the profile write failed silently on step 2. Sending them forward to an
  // empty dashboard would strand them, so the only offer is the step that fixes it.
  if (readiness.state === "NO_PROFILE") {
    return (
      <BridgeShell>
        <BridgeIcon tone="info"><AlertCircle className="w-7 h-7" /></BridgeIcon>
        <BridgeCopy title="One step left" body={readiness.message} />
        <BridgeButton onClick={onBack}>
          <ArrowLeft className="w-4 h-4" /> Complete my profile
        </BridgeButton>
      </BridgeShell>
    );
  }

  // -- Scenario C: READY ---------------------------------------------------
  const count = matches?.length ?? 0;
  return (
    <BridgeShell>
      <BridgeIcon tone="success"><CheckCircle2 className="w-7 h-7" /></BridgeIcon>
      <BridgeCopy
        title="Your matches are ready"
        body={
          count > 0
            ? `We found ${count} ${count === 1 ? "job" : "jobs"} matched to your profile.`
            : readiness.message
        }
      />
      <BridgeButton onClick={goToDashboard}>
        View my matches <ArrowRight className="w-4 h-4" />
      </BridgeButton>
      <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
        Your matches update automatically when you change your profile or when new jobs are posted.
      </p>
    </BridgeShell>
  );
}

/* ----------------- Bridge screen primitives -----------------
   Local to this step: one centred column, so every readiness state has identical
   geometry and only the icon, words and action change between them. */

function BridgeShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center gap-4 py-12 px-6 rounded-xl border min-h-[22rem]"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {children}
    </div>
  );
}

function BridgeIcon({
  tone,
  children,
}: {
  tone: "success" | "warning" | "info";
  children: React.ReactNode;
}) {
  const tones = {
    success: { bg: "var(--color-success-50)", fg: "var(--color-success-600)" },
    warning: { bg: "var(--color-warning-50)", fg: "var(--color-warning-600)" },
    info: { bg: "var(--color-primary-50)", fg: "var(--color-primary-600)" },
  }[tone];

  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center"
      style={{ background: tones.bg, color: tones.fg }}
    >
      {children}
    </div>
  );
}

function BridgeCopy({ title, body }: { title: string; body: string }) {
  return (
    <div className="space-y-1.5 max-w-md">
      <h2 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h2>
      {/* Server-authored and documented as safe to display verbatim. */}
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        {body}
      </p>
    </div>
  );
}

function BridgeButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold transition-all duration-200";
  if (variant === "ghost") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} border`}
        style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} bg-primary-600 hover:bg-primary-700 text-white shadow-sm`}
    >
      {children}
    </button>
  );
}

/* ═════════════════════════════════════════════════════════════ */
/*  PAGE ROOT                                                       */
/* ═════════════════════════════════════════════════════════════ */
export default function OnboardingResumePage() {
  const [step, setStep] = useState<Step>(1);
  const [parsedResumeData, setParsedResumeData] = useState<ParsedResume | null>(null);
  const [skipResume, setSkipResume] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const stepQuotes = [
    { text: "Your resume is the first chapter of your success story.", author: "JobFits Team" },
    { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  ];
  const currentQuote = stepQuotes[step - 1];

  return (
    <div
      className="min-h-screen w-full flex items-start justify-center px-4 py-10"
      style={{
        background: "linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 40%, var(--color-primary-600) 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{ background: "var(--color-primary-400)", filter: "blur(100px)" }} />
      <div className="fixed bottom-0 left-0 w-72 h-72 rounded-full opacity-10 pointer-events-none" style={{ background: "var(--color-primary-300)", filter: "blur(80px)" }} />

      <div className="relative z-10 w-full max-w-4xl">
        {/* Logo & Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-3">
            <img
              src="/logo.png"
              alt="JobFits Logo"
              className="w-12 h-12 rounded-full object-cover shadow-lg"
            />
            <span className="text-xl font-extrabold text-white tracking-tight">JobFits</span>
          </div>
          {/* Step Quote */}
          <p className="text-sm italic text-white/60 max-w-xs mx-auto">
            &ldquo;{currentQuote.text}&rdquo;
          </p>
          <p className="text-xs text-white/40 mt-1 uppercase tracking-wider font-semibold">— {currentQuote.author}</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--color-card)", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
        >
          <div className="p-6 sm:p-10">
            <StepIndicator current={step} />

            {step === 1 && (
              <ResumeUploadStep
                onNext={() => setStep(2)}
                onSetParsedData={setParsedResumeData}
                parsedData={parsedResumeData}
                setSkipResume={setSkipResume}
              />
            )}
            {step === 2 && (
              <ProfileSetupStep
                onBack={() => setStep(1)}
                onNext={(data) => {
                  setProfileData(data);
                  setStep(3);
                }}
                parsedResumeData={parsedResumeData}
                skipResume={skipResume}
              />
            )}
            {step === 3 && (
              <FirstMatchesStep
                onBack={() => setStep(2)}
                profileData={profileData}
              />
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-white/40 mt-5">
          Your data is secure and encrypted. JobFits never sells your information.
        </p>
      </div>
    </div>
  );
}
