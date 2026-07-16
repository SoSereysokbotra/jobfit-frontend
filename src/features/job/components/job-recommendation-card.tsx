"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, DollarSign, Heart, X, ChevronDown, ChevronUp, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { formatSalaryRange, type Job } from "@/shared/types/shared.types";

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
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.(job.id);
  };

  return (
    <div
      className="rounded-lg border p-5 transition-all duration-200 hover:shadow-md mb-4 bg-white relative group"
      style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
        aria-label="Dismiss recommendation"
      >
        <X size={16} />
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Side: Match Score (Very Prominent) */}
        <div className="flex flex-col items-center justify-center shrink-0 w-32 border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-6" style={{ borderColor: "var(--color-neutral-100)" }}>
          <div className="relative w-24 h-24 mb-2">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path
                className="text-neutral-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                style={{ color: job.match >= 90 ? "var(--color-success-600)" : job.match >= 75 ? "var(--color-warning-600)" : "var(--color-primary-500)" }}
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
              <span className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: "var(--color-text-secondary)" }}>Match</span>
            </div>
          </div>
          
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-semibold flex items-center gap-1 hover:underline"
            style={{ color: "var(--color-primary-600)" }}
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
            <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: "var(--color-success-600)" }}>
              <DollarSign size={16} /> {formatSalaryRange(job)}
            </span>
          </div>
          
          <p className="text-sm font-medium mb-4" style={{ color: "var(--color-text-secondary)" }}>
            Quick Stats: {Math.floor(job.match / 10)} of 10 required skills match
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onApply?.(job.id)}
              className="px-6 py-2 rounded-md text-sm font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{ background: "var(--color-primary-600)" }}
            >
              Apply Now
            </button>
            <button
              onClick={() => onToggleSave?.(job.id)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-bold border transition-all duration-200 active:scale-95 inline-flex items-center gap-2",
                saved
                  ? "border-primary-300 text-primary-600 bg-primary-50"
                  : "border-neutral-200 text-neutral-600 bg-transparent hover:bg-neutral-50",
              )}
            >
              <Heart size={16} className={saved ? "fill-current" : ""} />
              {saved ? "Saved" : "Save"}
            </button>
            <Link
              href={`/jobs/${job.id}`}
              className="px-4 py-2 rounded-md text-sm font-bold text-neutral-600 hover:bg-neutral-100 transition-colors inline-flex items-center"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>

      {/* Expandable Breakdown */}
      {expanded && (
        <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--color-neutral-100)" }}>
          <h4 className="text-sm font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>Match Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-100">
              <p className="text-xs font-bold text-success-700 mb-2 flex items-center gap-1.5">
                <Check size={14} /> Strong Alignments
              </p>
              <ul className="text-xs space-y-1.5 text-neutral-600">
                <li>• Skills Match: 95% (React, TypeScript, Next.js)</li>
                <li>• Experience: 88% (Senior Level fit)</li>
                <li>• Location: 100% (Remote preference matches)</li>
              </ul>
            </div>
            <div className="p-3 rounded-lg bg-warning-50 border border-warning-100">
              <p className="text-xs font-bold text-warning-700 mb-2 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Minor Gaps
              </p>
              <ul className="text-xs space-y-1.5 text-neutral-600">
                <li>• Missing Skill: GraphQL (Learnable in 1-2 weeks)</li>
                <li>• Missing Skill: AWS (Preferred, not required)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
