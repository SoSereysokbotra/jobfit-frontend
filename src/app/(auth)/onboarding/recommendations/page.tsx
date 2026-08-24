"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Bookmark,
  ArrowRight,
  MapPin,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Target,
  ArrowLeft,
} from "lucide-react";
import { toast } from "@/stores/toast-store";

interface DemoMatchJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  matchScore: number;
  skillsMatched: string[];
  skillsMissing: string[];
  explanation: string;
  logoLetter: string;
  logoColor: string;
}

const INITIAL_RECOMMENDATIONS: DemoMatchJob[] = [
  {
    id: "rec-1",
    title: "Senior Full Stack Engineer",
    company: "Stripe",
    location: "San Francisco, CA (Hybrid)",
    salary: "$165,000 - $195,000",
    type: "Full-time",
    matchScore: 95,
    skillsMatched: ["React", "TypeScript", "Node.js", "PostgreSQL", "Next.js"],
    skillsMissing: ["Kafka"],
    explanation:
      "Exceptional alignment with your modern React & TypeScript stack experience and recent full-stack system architecture projects.",
    logoLetter: "S",
    logoColor: "bg-indigo-600",
  },
  {
    id: "rec-2",
    title: "Frontend Platform Engineer",
    company: "Figma",
    location: "Remote (US/Canada)",
    salary: "$150,000 - $180,000",
    type: "Full-time",
    matchScore: 89,
    skillsMatched: ["React", "TypeScript", "Tailwind CSS", "Web Performance"],
    skillsMissing: ["WebAssembly"],
    explanation:
      "Strong match with your design system and component architecture skills, along with proven remote collaboration experience.",
    logoLetter: "F",
    logoColor: "bg-purple-600",
  },
  {
    id: "rec-3",
    title: "Lead UI/UX Engineer",
    company: "Linear",
    location: "Remote",
    salary: "$170,000 - $205,000",
    type: "Full-time",
    matchScore: 84,
    skillsMatched: ["React", "TypeScript", "UI Architecture", "Accessibility"],
    skillsMissing: ["GraphQL"],
    explanation:
      "Matches your career trajectory towards engineering leadership and precision craft in modern web interfaces.",
    logoLetter: "L",
    logoColor: "bg-amber-600",
  },
];

export default function OnboardingRecommendationsPage() {
  const router = useRouter();
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [expandedJobId, setExpandedJobId] = useState<string | null>("rec-1");

  const toggleSave = (id: string, title: string) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info(`Removed ${title} from saved jobs.`);
      } else {
        next.add(id);
        toast.success(`Saved ${title} to your list!`);
      }
      return next;
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 40%, var(--color-primary-600) 100%)",
      }}
    >
      {/* Decorative background glows */}
      <div
        className="fixed top-0 right-0 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: "var(--color-primary-400)", filter: "blur(100px)" }}
      />
      <div
        className="fixed bottom-0 left-0 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: "var(--color-primary-300)", filter: "blur(80px)" }}
      />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md"
              style={{
                background: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))",
              }}
            >
              JF
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">JobFits</span>
          </div>
          <p className="text-xs text-white/70 uppercase tracking-widest font-semibold">
            Onboarding Step 3 of 3 • AI Matching Complete
          </p>
        </div>

        {/* Main Card */}
        <div
          className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
          style={{ background: "var(--color-card)" }}
        >
          {/* Header Banner */}
          <div className="p-6 sm:p-8 border-b border-border bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success-100 text-success-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-content">
                  Your Initial Matches Are Ready!
                </h1>
                <p className="text-xs sm:text-sm text-content-secondary mt-0.5">
                  Our AI match engine analyzed your resume and preferences. Here are your top career fits:
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations List */}
          <div className="p-6 sm:p-8 space-y-4">
            {INITIAL_RECOMMENDATIONS.map((job) => {
              const isSaved = savedJobIds.has(job.id);
              const isExpanded = expandedJobId === job.id;

              return (
                <div
                  key={job.id}
                  className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary-300 transition-all duration-200 shadow-sm"
                >
                  <div
                    onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                    className="p-5 cursor-pointer flex items-start justify-between gap-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-lg ${job.logoColor} text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm`}
                      >
                        {job.logoLetter}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-sm sm:text-base font-bold text-content hover:text-primary-600 transition-colors">
                            {job.title}
                          </h2>
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                            {job.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-content-secondary mt-1">
                          <span className="font-semibold text-content">{job.company}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {job.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-medium text-content">
                            <DollarSign size={12} />
                            {job.salary}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="shrink-0 flex flex-col items-center">
                      <div
                        className={`px-3 py-1 rounded-lg font-black text-sm ${
                          job.matchScore >= 90
                            ? "bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300"
                            : "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"
                        }`}
                      >
                        {job.matchScore}%
                      </div>
                      <span className="text-[10px] text-content-tertiary font-bold mt-1 uppercase tracking-wider">
                        Fit Score
                      </span>
                    </div>
                  </div>

                  {/* Expanded Match Breakdown */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-border bg-neutral-50/50 dark:bg-neutral-800/20 text-xs space-y-4">
                      {/* Diagnostic Explanation */}
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-content-tertiary mb-1.5 flex items-center gap-1.5">
                          <Target size={13} className="text-primary-600" />
                          <span>Why this role matches your profile</span>
                        </div>
                        <p className="text-content-secondary leading-relaxed bg-card p-3 rounded-lg border border-border">
                          {job.explanation}
                        </p>
                      </div>

                      {/* Skills Overlap */}
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-content-tertiary mb-2">
                          Skill Alignment
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {job.skillsMatched.map((skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-success-50 text-success-700 border border-success-200 flex items-center gap-1"
                            >
                              <CheckCircle2 size={12} />
                              {skill}
                            </span>
                          ))}
                          {job.skillsMissing.map((skill) => (
                            <span
                              key={skill}
                              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"
                            >
                              Missing: {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Quick Action buttons */}
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                          onClick={() => toggleSave(job.id, job.title)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-border bg-card text-content hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-xs font-medium"
                        >
                          <Bookmark
                            size={14}
                            className={isSaved ? "fill-primary-600 text-primary-600" : ""}
                          />
                          <span>{isSaved ? "Saved" : "Save for later"}</span>
                        </button>

                        <Link
                          href={`/jobs`}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition-transform active:scale-[0.98]"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))",
                          }}
                        >
                          <span>View Full Role</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Toggle Accordion Indicator */}
                  <div
                    onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                    className="py-1 text-center border-t border-border cursor-pointer bg-neutral-50/30 dark:bg-neutral-800/10 hover:bg-neutral-100/50"
                  >
                    <span className="text-[11px] font-semibold text-primary-600 inline-flex items-center gap-1">
                      {isExpanded ? (
                        <>
                          Hide match insights <ChevronUp size={13} />
                        </>
                      ) : (
                        <>
                          View match diagnostic <ChevronDown size={13} />
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="p-6 sm:p-8 border-t border-border bg-neutral-50/50 dark:bg-neutral-800/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/onboarding/resume"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-secondary hover:text-content"
            >
              <ArrowLeft size={14} />
              <span>Back to Resume Upload</span>
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/recommendations"
                className="flex-1 sm:flex-initial text-center px-4 py-2.5 rounded-lg text-xs font-semibold border border-border bg-card text-content hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Browse All Recommendations
              </Link>
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition-transform active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))",
                }}
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-white/50 mt-5">
          You can update your skills, preferences, and target roles at any time in Profile Settings.
        </p>
      </div>
    </div>
  );
}
