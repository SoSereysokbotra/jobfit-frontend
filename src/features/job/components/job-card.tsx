"use client";

import React from "react";
import Link from "next/link";
import { MapPin, DollarSign, Clock, Heart } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import MatchScoreBadge from "@/shared/components/data-display/match-score-badge";
import { formatPostedDate, formatSalaryRange, type Job } from "@/shared/types/shared.types";

interface JobCardProps {
  job: Job;
  /** "list" = horizontal row (desktop results, dashboard); "grid" = vertical tile. */
  variant?: "list" | "grid";
  /** Hide the description excerpt / posted date (compact contexts like the dashboard). */
  compact?: boolean;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
  onApply?: (id: string) => void;
}

function TypePill({ children, tone = "primary" }: { children: React.ReactNode; tone?: "primary" | "neutral" }) {
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={
        tone === "primary"
          ? { background: "var(--color-primary-50)", color: "var(--color-primary-700)" }
          : { background: "var(--color-neutral-100)", color: "var(--color-neutral-600)" }
      }
    >
      {children}
    </span>
  );
}

/**
 * Job listing card (ui-reference §8 "Job Card"). Reused by search results,
 * recommendations, saved jobs, and the dashboard. Save state is controlled
 * by the parent so lists can persist it.
 */
export function JobCard({
  job,
  variant = "list",
  compact = false,
  saved = false,
  onToggleSave,
  onApply,
}: JobCardProps) {
  const actions = (
    <>
      <button
        onClick={() => onApply?.(job.id)}
        className="px-3 py-1.5 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 active:scale-95"
      >
        Apply
      </button>
      <button
        onClick={() => onToggleSave?.(job.id)}
        aria-label={saved ? "Remove from saved jobs" : "Save job"}
        className={cn(
          "px-3 py-1.5 rounded-md text-xs font-bold border transition-all duration-200 active:scale-95 inline-flex items-center justify-center gap-1",
          saved
            ? "border-primary-300 text-primary-600 bg-primary-50"
            : "border-neutral-200 text-neutral-500 bg-transparent hover:bg-neutral-50",
        )}
      >
        <Heart size={12} className={saved ? "fill-current" : ""} />
        {saved ? "Saved" : "Save"}
      </button>
    </>
  );

  const meta = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
        <MapPin size={11} /> {job.location}
      </span>
      <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--color-success-600)" }}>
        <DollarSign size={11} /> {formatSalaryRange(job)}
      </span>
      <TypePill>{job.type}</TypePill>
      <TypePill tone="neutral">{job.remote}</TypePill>
    </div>
  );

  if (variant === "grid") {
    return (
      <div
        className="rounded-lg border p-5 flex flex-col transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
        style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-extrabold text-base"
            style={{ background: job.logoBg, boxShadow: "var(--shadow-sm)" }}
          >
            {job.logo}
          </div>
          <MatchScoreBadge score={job.match} size="sm" />
        </div>
        <Link href={`/jobs/${job.id}`} className="block">
          <h3 className="text-sm font-bold group-hover:text-primary-700 transition-colors" style={{ color: "var(--color-text-primary)" }}>
            {job.title}
          </h3>
        </Link>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{job.company}</p>
        {meta}
        {!compact && (
          <p className="text-xs mt-3 line-clamp-2" style={{ color: "var(--color-text-tertiary)" }}>
            {job.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: "var(--color-neutral-100)" }}>
          <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-disabled)" }}>
            <Clock size={11} /> {formatPostedDate(job.postedDaysAgo)}
          </span>
          <div className="flex gap-1.5">{actions}</div>
        </div>
      </div>
    );
  }

  /* LIST variant */
  return (
    <div className="flex items-start gap-4 px-5 py-4 hover:bg-primary-50 transition-colors group">
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-extrabold text-base shrink-0"
        style={{ background: job.logoBg, boxShadow: "var(--shadow-sm)" }}
      >
        {job.logo}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/jobs/${job.id}`} className="block">
              <h3 className="text-sm font-bold truncate group-hover:text-primary-700 transition-colors" style={{ color: "var(--color-text-primary)" }}>
                {job.title}
              </h3>
            </Link>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{job.company}</p>
          </div>
          <MatchScoreBadge score={job.match} size="sm" className="shrink-0 mt-0.5" />
        </div>
        {meta}
        {!compact && (
          <>
            <p className="text-xs mt-2 line-clamp-1" style={{ color: "var(--color-text-tertiary)" }}>
              {job.description}
            </p>
            <span className="flex items-center gap-1 text-xs mt-1.5" style={{ color: "var(--color-text-disabled)" }}>
              <Clock size={11} /> {formatPostedDate(job.postedDaysAgo)}
            </span>
          </>
        )}
      </div>
      <div className="flex flex-col gap-1.5 shrink-0">{actions}</div>
    </div>
  );
}
