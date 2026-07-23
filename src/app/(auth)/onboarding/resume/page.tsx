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
  DollarSign,
  Clock,
  Wifi,
  BarChart2,
  Sparkles,
  Info,
  Check,
  Search,
  HelpCircle
} from "lucide-react";
import { useResumeUpload } from "@/features/resume/hooks/use-resume-upload";
import { useParsingStatus, useParsedData } from "@/features/resume/hooks/use-resumes";
import {
  validateResumeFile,
  RESUME_ACCEPT_ATTR,
  type ParsedResumeDataDto,
} from "@/features/resume/api/resume.api";
import { useSession, displayName } from "@/features/auth/hooks/use-session";
import { useCreateProfile, useUpdatePreferences, useProfile } from "@/features/user-profile/hooks/use-profile";
import { parseLocationInput } from "@/features/user-profile/api/profile.mappers";
import type { EmploymentType, RemoteType } from "@/features/user-profile/api/profile.api";
import { ApiError } from "@/lib/api/client";
import { Alert } from "@/shared/components/feedback/alert";

/* ─────────────────────────── TYPES ─────────────────────────── */
type Step = 1 | 2 | 3;

interface ParsedResume {
  skills: string[];
  experience: { title: string; company: string; years: string }[];
  education: string;
  confidence: number;
}

/** Map the backend's parsed-data DTO onto this wizard's ParsedResume shape. */
function toWizardParsed(d: ParsedResumeDataDto): ParsedResume {
  return {
    skills: d.skills ?? [],
    experience: (d.experiences ?? []).map((e) => ({
      title: e.title || "—",
      company: e.company || "",
      years: e.dates ?? "",
    })),
    education:
      (d.educations ?? [])
        .map((ed) => [ed.degree, ed.institution].filter(Boolean).join(" — "))
        .filter(Boolean)
        .join("; ") || "—",
    // AI parses are higher-fidelity than the regex fallback; surface that as confidence.
    confidence: d.parsedBy === "ai" ? 92 : 75,
  };
}

interface ProfileData {
  jobTitle: string;
  locations: string[];
  salaryMin: number;
  salaryMax: number;
  employmentTypes: string[];
  remotePreference: string;
  industries: string[];
  completeness: "complete" | "partial";
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
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary-600 border-primary-600 text-white"
                    : isActive
                    ? "bg-primary-800 border-primary-800 text-white ring-4 ring-primary-100"
                    : "bg-white border-neutral-300 text-neutral-400"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
              </div>
              <span
                className={`absolute top-11 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${
                  isActive || isCompleted ? "text-primary-800" : "text-neutral-400"
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
        confidence: 85 // Boost confidence on manual validation
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
              className={`relative border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-200 ${
                dragOver ? "border-primary-500 bg-primary-50" : "border-neutral-300 bg-neutral-50 hover:border-primary-400 hover:bg-primary-50/50"
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
                <span className="ml-auto text-xs text-green-700 font-bold bg-green-100 px-2.5 py-0.5 rounded-full border border-green-200">
                  {parsedData.confidence}% confidence
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
                /* HIGH CONFIDENCE READ-ONLY SUMMARY VIEW */
                <div className="p-5 space-y-4">
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
                    <div className="space-y-2">
                      {parsedData.experience.map((exp, idx) => (
                        <div key={idx} className="flex justify-between items-start text-xs py-1 border-b border-neutral-100 last:border-0">
                          <div>
                            <span className="font-semibold text-neutral-800">{exp.title}</span>
                            <span className="text-neutral-500"> at {exp.company}</span>
                          </div>
                          <span className="text-neutral-400 shrink-0 ml-2 font-mono">{exp.years}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Education</p>
                    <p className="text-xs text-neutral-700 font-medium">{parsedData.education}</p>
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
  skipResume
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
  const [salaryMin, setSalaryMin] = useState(100);
  const [salaryMax, setSalaryMax] = useState(200);
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
        await createProfile.mutateAsync({
          firstName: safeFirst,
          lastName: safeLast,
          headline: data.jobTitle.trim() || undefined,
          location: parseLocationInput(data.locations[0] ?? ""),
          minSalary: data.salaryMin * 1000,
          maxSalary: data.salaryMax * 1000,
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
      salaryMin,
      salaryMax,
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
      employmentTypes: ["Full-time"],
      remotePreference: "No preference",
      industries: [],
      completeness: "partial",
    });
  };

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
              className={`block w-full pl-10 pr-4 py-2.5 border rounded-md text-sm text-neutral-900 bg-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                titleError ? "border-red-400 ring-1 ring-red-400" : "border-neutral-200"
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

        {/* Salary Slider */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Salary Expectations
            </label>
          </div>
          
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between text-sm font-semibold text-neutral-800">
              <span>Range Expectations:</span>
              <span className="text-primary-700">${salaryMin}K – ${salaryMax}K / yr</span>
            </div>
            
            {/* Custom dual sliders / inputs */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="number"
                  min={20}
                  max={salaryMax - 10}
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(Math.max(20, Number(e.target.value)))}
                  className="block w-full pl-9 pr-3 py-2 border border-neutral-200 bg-white rounded-md text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 font-semibold"
                />
              </div>
              <span className="text-neutral-400 text-sm font-semibold">to</span>
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="number"
                  min={salaryMin + 10}
                  max={600}
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(Math.min(600, Number(e.target.value)))}
                  className="block w-full pl-9 pr-3 py-2 border border-neutral-200 bg-white rounded-md text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 font-semibold"
                />
              </div>
            </div>
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
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-md border transition-all duration-150 ${
                    selected
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
                  className={`inline-flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-md border transition-all duration-150 ${
                    selected
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
      </form>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════ */
/*  STEP 3: FIRST RECOMMENDATIONS / MATCHES PAGE                  */
/* ═════════════════════════════════════════════════════════════ */
function FirstMatchesStep({ 
  onBack, 
  profileData 
}: { 
  onBack: () => void; 
  profileData: ProfileData | null;
}) {
  const router = useRouter();

  // Simulation mode switcher
  const [recommendationPath, setRecommendationPath] = useState<"pending" | "ready">("pending");
  const [expandedMatchIdx, setExpandedMatchIdx] = useState<number | null>(null);

  const demoJobs = [
    { 
      title: "Senior Frontend Engineer", 
      company: "Stripe", 
      location: "San Francisco, CA (Hybrid)", 
      salary: "$165,000 – $210,000 / yr", 
      match: 94, 
      logoColor: "bg-indigo-600",
      logoLetter: "S",
      breakdown: { skills: 95, exp: 90, loc: 98 },
      explanation: "Matches your expertise in React & TypeScript. Matches hybrid preference. Lies directly within your expected salary range."
    },
    { 
      title: "React Specialist Developer", 
      company: "Airbnb", 
      location: "Remote (US)", 
      salary: "$150,000 – $195,000 / yr", 
      match: 89, 
      logoColor: "bg-rose-500",
      logoLetter: "A",
      breakdown: { skills: 92, exp: 85, loc: 90 },
      explanation: "High alignment with front-end technologies extracted from your resume. Strong company alignment with Technology interest."
    },
    { 
      title: "Software Engineer - UI/UX Platforms", 
      company: "Figma", 
      location: "New York, NY (Hybrid)", 
      salary: "$140,000 – $185,000 / yr", 
      match: 85, 
      logoColor: "bg-purple-600",
      logoLetter: "F",
      breakdown: { skills: 82, exp: 88, loc: 85 },
      explanation: "Matches your React/TypeScript requirements. Standard location criteria meets NYC requirements."
    },
    { 
      title: "Lead Web Developer", 
      company: "Notion", 
      location: "Remote (Global)", 
      salary: "$180,000 – $230,000 / yr", 
      match: 81, 
      logoColor: "bg-black",
      logoLetter: "N",
      breakdown: { skills: 80, exp: 85, loc: 78 },
      explanation: "Offers remote flexibility with high compensation matching your upper expectations."
    },
  ];

  // The session is now real (httpOnly refresh cookie + in-memory access token),
  // so there is nothing to persist here.
  // TODO(phase-3): "onboarding complete" needs a real source — the backend has
  // no such flag on the user; it is derived from the profile endpoints.
  const handleDashboardRedirect = () => {
    router.push("/dashboard");
  };

  return (
    <div className="space-y-6">
      {/* SIMULATOR SWITCHER */}
      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
        <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2 text-center">
          Recommendation Simulation Path
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRecommendationPath("pending")}
            className={`py-1.5 px-2 text-xs font-semibold rounded border transition-all duration-150 ${
              recommendationPath === "pending"
                ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400"
            }`}
          >
            Path B: Pending Matches
          </button>
          <button
            type="button"
            onClick={() => setRecommendationPath("ready")}
            className={`py-1.5 px-2 text-xs font-semibold rounded border transition-all duration-150 ${
              recommendationPath === "ready"
                ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                : "bg-white text-neutral-600 border-neutral-300 hover:border-neutral-400"
            }`}
          >
            Path A: Matches Ready
          </button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center bg-primary-600 text-white shadow-md">
            <Sparkles className="w-7 h-7" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Your First Matches</h2>
        <p className="text-sm text-neutral-500">
          We&apos;re analyzing your profile and finding opportunities
        </p>
      </div>

      {recommendationPath === "pending" ? (
        /* PATH B: RECOMMENDATIONS PENDING (MOST LIKELY FLOW) */
        <div className="space-y-5">
          <div className="border rounded-lg p-5 bg-primary-50 border-primary-200 text-sm space-y-3 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-primary-800 text-base">
              Your personalized matches will be ready in a few hours
            </div>
            <p className="text-primary-700 text-xs leading-relaxed">
              We run our complex matching and analytics engine nightly (typically 11:00 PM PT).
            </p>
            <div className="border-t border-primary-200/50 pt-2.5 mt-1 space-y-1.5 text-xs text-primary-800 font-semibold">
              <div className="flex justify-between">
                <span>Nightly Batch Schedule:</span>
                <span>11:00 PM PT</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Estimated Wait Time:</span>
                <span>4 - 20 hours</span>
              </div>
              <p className="text-[11px] text-primary-600 italic font-medium">We will email you immediately when matches are ready.</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">In the meantime, you can:</p>
            
            <button
              onClick={handleDashboardRedirect}
              className="w-full flex items-center justify-between p-3.5 bg-white border border-neutral-200 rounded-lg hover:border-primary-400 hover:bg-primary-50/20 text-left transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 group-hover:text-primary-700">Browse all jobs now</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Directly search and apply manually</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
            </button>

            <button
              onClick={handleDashboardRedirect}
              className="w-full flex items-center justify-between p-3.5 bg-white border border-neutral-200 rounded-lg hover:border-primary-400 hover:bg-primary-50/20 text-left transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 group-hover:text-primary-700">Save job searches for alerts</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Get notified immediately when matches align</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
            </button>

            <button
              onClick={handleDashboardRedirect}
              className="w-full flex items-center justify-between p-3.5 bg-white border border-neutral-200 rounded-lg hover:border-primary-400 hover:bg-primary-50/20 text-left transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 group-hover:text-primary-700">Complete your profile</p>
                  <p className="text-xs text-neutral-500 mt-0.5">Add portfolio, certs, and resume credentials</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 transition-colors" />
            </button>
          </div>
        </div>
      ) : (
        /* PATH A: RECOMMENDATIONS READY */
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>✓ Your matches are ready! Based on your profile, here are your top matches:</span>
          </div>

          <div className="space-y-3">
            {demoJobs.map((job, idx) => {
              const isExpanded = expandedMatchIdx === idx;
              return (
                <div
                  key={job.title}
                  className="border border-neutral-200 rounded-lg bg-white overflow-hidden hover:border-primary-400 transition-all duration-200 shadow-sm"
                >
                  <div 
                    onClick={() => setExpandedMatchIdx(isExpanded ? null : idx)}
                    className="p-4 cursor-pointer flex items-start justify-between gap-3 hover:bg-neutral-50/40"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-md ${job.logoColor} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                        {job.logoLetter}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-neutral-900 truncate hover:text-primary-700 transition-colors">{job.title}</p>
                        <p className="text-xs text-neutral-600 mt-0.5">{job.company} · {job.location}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{job.salary}</p>
                      </div>
                    </div>

                    <div className="shrink-0 text-center flex flex-col items-center">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center font-black text-sm ${
                        job.match >= 90 ? "bg-green-100 text-green-700" : "bg-primary-100 text-primary-700"
                      }`}>
                        {job.match}%
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1 font-bold">match</span>
                    </div>
                  </div>

                  {/* Accordion content */}
                  {isExpanded && (
                    <div className="bg-neutral-50 border-t border-neutral-100 p-4 text-xs space-y-3 animate-slide-down">
                      <div>
                        <p className="font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">Match breakdown</p>
                        <div className="grid grid-cols-3 gap-2 text-center text-neutral-700 font-semibold bg-white p-2 rounded border border-neutral-200">
                          <div>
                            <p className="text-neutral-400 text-[9px] uppercase">Skills</p>
                            <p className="text-primary-700 font-bold">{job.breakdown.skills}%</p>
                          </div>
                          <div className="border-x border-neutral-200">
                            <p className="text-neutral-400 text-[9px] uppercase">Experience</p>
                            <p className="text-primary-700 font-bold">{job.breakdown.exp}%</p>
                          </div>
                          <div>
                            <p className="text-neutral-400 text-[9px] uppercase">Location</p>
                            <p className="text-primary-700 font-bold">{job.breakdown.loc}%</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="font-bold text-neutral-700 uppercase tracking-wider text-[10px] mb-1">Why this match?</p>
                        <p className="text-neutral-600 leading-relaxed">{job.explanation}</p>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleDashboardRedirect}
                          className="flex-1 py-1.5 px-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded text-xs transition-colors"
                        >
                          Apply Now
                        </button>
                        <button
                          onClick={() => alert(`Saved ${job.title} to saved jobs list!`)}
                          className="py-1.5 px-3 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold rounded text-xs transition-colors"
                        >
                          Save for later
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-center border-t border-neutral-100 bg-neutral-50/20 py-1">
                    <button 
                      onClick={() => setExpandedMatchIdx(isExpanded ? null : idx)}
                      className="text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      {isExpanded ? "Collapse info" : "Why this match?"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      <div className="space-y-2.5 pt-3">
        <button
          onClick={handleDashboardRedirect}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-md text-sm text-white font-bold transition-all duration-200 bg-primary-600 hover:bg-primary-700 active:scale-[0.98]"
        >
          <span>Continue to My Dashboard</span>
          <ArrowRight className="w-4.5 h-4.5" />
        </button>
        
        <button
          onClick={onBack}
          className="w-full text-xs text-neutral-500 hover:text-neutral-700 hover:underline py-1 text-center font-semibold"
        >
          ← Back to profile setup
        </button>
      </div>
    </div>
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
