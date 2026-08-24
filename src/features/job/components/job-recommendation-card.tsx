"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, DollarSign, Heart, X, ChevronDown, ChevronUp, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { AppliedPill } from "@/features/application/components/applied-pill";
import { formatSalaryRange, type Job } from "@/shared/types/shared.types";

/** Display labels for the match sub-scores returned by the backend. */
const BREAKDOWN_LABELS: Record<string, string> = {
  skills: "Skills",
  experience: "Experience",
  location: "Location",
  salary: "Salary",
  other: "Industry",
};

interface JobRecommendationCardProps {
  job: Job;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  onApply?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function JobRecommendationCard({
  job,
  saved = false,
  onToggleSave,
  onApply,
  onDismiss,
}: JobRecommendationCardProps) {
  const salary = formatSalaryRange(job);
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.(job.id);
  };

  // Real sub-scores from the recommendations endpoint (skills/experience/location/…).
  const breakdownEntries = Object.entries(job.matchBreakdown ?? {});
  const strong = breakdownEntries.filter(([, v]) => v >= 70);
  const gaps = breakdownEntries.filter(([, v]) => v < 50);
  const label = (k: string) => BREAKDOWN_LABELS[k] ?? k;

  return (
    <div
      className="rounded-lg border p-5 transition-all duration-200 hover:shadow-md mb-4 relative group"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 hover:bg-[var(--color-surface-hover)]"
        style={{ color: "var(--color-text-tertiary)" }}
        aria-label="Dismiss recommendation"
      >
        <X size={16} />
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Match Score (Very Prominent) */}
        <div className="flex flex-col items-center justify-center shrink-0 w-32 border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-6" style={{ borderColor: "var(--color-border)" }}>
          <div className="relative w-24 h-24 mb-2">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path
                strokeWidth="3"
                stroke="var(--color-border)"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                style={{ color: job.match >= 90 ? "var(--color-success-600)" : job.match >= 75 ? "var(--color-warning-500)" : "var(--color-primary-500)" }}
                strokeWidth="3"
                strokeDasharray={`${job.match}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold leading-none" style={{ color: "var(--color-text-primary)" }}>
                {job.match}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: "var(--color-text-tertiary)" }}>Match</span>
            </div>
          </div>
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-semibold flex items-center gap-1 hover:underline"
            style={{ color: "var(--color-primary-500)" }}
          >
            Click to see why {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Right Side: Job Details */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: job.logoBg }}
            >
              {job.logo}
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--color-text-secondary)" }}>
              {job.company}
            </p>
          </div>
          
          <Link href={`/jobs/${job.id}`} className="block mb-3">
            <h3 className="text-xl font-extrabold hover:underline" style={{ color: "var(--color-text-primary)" }}>
              {job.title}
            </h3>
          </Link>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
              <MapPin size={16} /> {job.location} ({job.remote})
            </span>
            {salary && (
              <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: "var(--color-success-600)" }}>
                <DollarSign size={16} /> {salary}
              </span>
            )}
          </div>
          
          <p className="text-sm font-medium mb-4" style={{ color: "var(--color-text-secondary)" }}>
            {job.matchReason ?? `Semantic match score: ${job.match}%`}
          </p>

          <div className="flex flex-wrap gap-2">
            {/* Same treatment as the job detail page and the search results. */}
            <AppliedPill jobId={job.id}>
              <button
                onClick={() => onApply?.(job.id)}
                className="px-6 py-2 rounded-md text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
                style={{ background: "var(--color-primary-600)" }}
              >
                Apply Now
              </button>
            </AppliedPill>
            <button
              onClick={() => onToggleSave?.(job.id)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-bold border transition-all duration-200 active:scale-95 inline-flex items-center gap-2",
                saved
                  ? "border-primary-300 text-primary-600 bg-primary-50"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] bg-transparent hover:bg-[var(--color-surface-hover)]",
              )}
            >
              <Heart size={16} className={saved ? "fill-current" : ""} />
              {saved ? "Saved" : "Save"}
            </button>
            <Link
              href={`/jobs/${job.id}`}
              className="px-4 py-2 rounded-md text-sm font-bold transition-colors inline-flex items-center hover:bg-[var(--color-surface-hover)]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              View Details
            </Link>
          </div>
        </div>
      </div>

      {/* Expandable Breakdown — driven by the real backend sub-scores. */}
      {expanded && (
        <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--color-border)" }}>
          <h4 className="text-sm font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>Match Breakdown</h4>
          {breakdownEntries.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>No breakdown available for this recommendation.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                {breakdownEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="p-2.5 rounded-lg border text-center"
                    style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}
                  >
                    <p className="text-lg font-extrabold" style={{ color: "var(--color-text-primary)" }}>{value}%</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>{label(key)}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="p-3 rounded-lg border"
                  style={{ background: "var(--color-bg-secondary)", borderColor: "var(--color-border)" }}
                >
                  <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: "var(--color-success-600)" }}>
                    <Check size={14} /> Strong Alignments
                  </p>
                  <ul className="text-xs space-y-1.5" style={{ color: "var(--color-text-secondary)" }}>
                    {strong.length > 0 ? (
                      strong.map(([key, value]) => <li key={key}>• {label(key)}: {value}%</li>)
                    ) : (
                      <li style={{ color: "var(--color-text-tertiary)" }}>No standout strengths yet.</li>
                    )}
                  </ul>
                </div>
                <div
                  className="p-3 rounded-lg border"
                  style={{ background: "var(--color-warning-50)", borderColor: "var(--color-warning-100)" }}
                >
                  <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: "var(--color-warning-600)" }}>
                    <AlertTriangle size={14} /> Areas to Improve
                  </p>
                  <ul className="text-xs space-y-1.5" style={{ color: "var(--color-text-secondary)" }}>
                    {gaps.length > 0 ? (
                      gaps.map(([key, value]) => <li key={key}>• {label(key)}: {value}%</li>)
                    ) : (
                      <li style={{ color: "var(--color-text-tertiary)" }}>No significant gaps.</li>
                    )}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
