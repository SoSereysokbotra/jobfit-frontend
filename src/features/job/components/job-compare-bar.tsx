"use client";

import React from "react";
import Link from "next/link";
import { X, GitCompareArrows, ArrowRight } from "lucide-react";
import { useJobCompare, clearCompare, removeJobFromCompare } from "@/stores/job-compare-store";

/**
 * Docked bottom bar that appears whenever ≥1 job is in the comparison selection.
 * Shows job logo chips, a Remove (×) per chip, and a Compare button once ≥2 are selected.
 *
 * Rendered as a fixed bar at the bottom of the viewport so it never interferes with
 * page scroll. z-index matches --z-toast (400) from the token scale.
 */
export function JobCompareBar() {
  const { compareJobs } = useJobCompare();

  if (compareJobs.length === 0) return null;

  const canCompare = compareJobs.length >= 2;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[400] border-t backdrop-blur-xl"
      style={{
        background: "rgba(255,255,255,0.95)",
        borderColor: "var(--color-border)",
        boxShadow: "0 -4px 24px rgba(91,24,154,0.10)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
        {/* Icon */}
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
          style={{ background: "var(--color-primary-50)" }}
        >
          <GitCompareArrows size={16} style={{ color: "var(--color-primary-600)" }} />
        </div>

        <span
          className="text-sm font-semibold shrink-0"
          style={{ color: "var(--color-text-primary)" }}
        >
          Compare
        </span>

        {/* Job chips */}
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          {compareJobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium"
              style={{
                background: "var(--color-primary-50)",
                borderColor: "var(--color-primary-200)",
                color: "var(--color-primary-700)",
              }}
            >
              {/* Logo badge */}
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-extrabold shrink-0"
                style={{ background: job.logoBg }}
              >
                {job.logo.slice(0, 1)}
              </span>
              <span className="max-w-[120px] truncate">{job.title}</span>
              <button
                onClick={() => removeJobFromCompare(job.id)}
                aria-label={`Remove ${job.title} from compare`}
                className="ml-0.5 rounded-full hover:bg-primary-100 transition-colors"
                style={{ color: "var(--color-primary-500)" }}
              >
                <X size={11} />
              </button>
            </div>
          ))}

          {/* Placeholder slots */}
          {Array.from({ length: 3 - compareJobs.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center justify-center w-20 h-7 rounded-full border border-dashed text-xs"
              style={{
                borderColor: "var(--color-neutral-300)",
                color: "var(--color-text-disabled)",
              }}
            >
              + Add job
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <button
            onClick={clearCompare}
            className="text-xs font-semibold hover:underline transition-all"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Clear all
          </button>
          {canCompare ? (
            <Link
              href="/jobs/compare"
              className="flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold text-white transition-all duration-200 active:scale-95"
              style={{ background: "var(--color-primary-600)" }}
            >
              Compare {compareJobs.length} jobs
              <ArrowRight size={13} />
            </Link>
          ) : (
            <span
              className="px-4 py-2 rounded-md text-xs font-bold opacity-50 cursor-not-allowed"
              style={{ background: "var(--color-neutral-200)", color: "var(--color-text-secondary)" }}
            >
              Select 2+ to compare
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
