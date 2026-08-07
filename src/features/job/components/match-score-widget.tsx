"use client";

import React from "react";
import { Info } from "lucide-react";
import { useJobMatch } from "@/features/matching/hooks/use-job-match";

interface MatchScoreWidgetProps {
  jobId: string;
}

/**
 * The user's match score for this job.
 *
 * Every number and sentence comes from `GET /recommendations/for-job`. This panel
 * previously rendered `job.match ± 3` — where `job.match` is hardcoded to 0 on the job
 * detail page, producing the 0% / 3% / 0% / 3% bars — beneath four literal <li> elements
 * asserting "React, TypeScript, and Node.js align perfectly" and "Missing GraphQL" for
 * every job and every user, welding roles included.
 *
 * The score is the DETERMINISTIC scorer: embedding cosine for skills plus rule-based
 * experience/location/salary. Not the LLM fitScore, which Phase C measured as
 * uncorrelated with real fit and which stays out of user-facing paths.
 */
export function MatchScoreWidget({ jobId }: MatchScoreWidgetProps) {
  const { data, isLoading, isError } = useJobMatch(jobId);

  if (isLoading) {
    return (
      <Shell>
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          Calculating your match…
        </p>
      </Shell>
    );
  }

  // No profile, unknown job, or a failed request. Rendering "0%" would state a fit we
  // never computed.
  if (isError || !data) {
    return (
      <Shell>
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          Complete your profile to see how you match this role.
        </p>
      </Shell>
    );
  }

  const score = Math.round(data.score);
  const bars = [
    { label: "Skills", score: data.breakdown.skills },
    { label: "Experience", score: data.breakdown.experience },
    { label: "Location", score: data.breakdown.location },
    { label: "Salary", score: data.breakdown.salary },
  ];
  const circumference = 42 * 2 * Math.PI;

  return (
    <Shell>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-neutral-100)" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--color-primary-500)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold" style={{ color: "var(--color-primary-600)" }}>
              {score}%
            </span>
          </div>
        </div>
        <div>
          <p className="font-bold" style={{ color: "var(--color-text-primary)" }}>
            {label(score)}
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            Based on your profile and résumé
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {bars.map((b) => (
          <div key={b.label} className="flex items-center gap-3">
            <span className="text-xs w-20 truncate" style={{ color: "var(--color-text-secondary)" }}>
              {b.label}
            </span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--color-neutral-100)" }}>
              <div
                className="h-2 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${b.score}%`,
                  background: b.score >= 70 ? "var(--color-primary-500)" : "var(--color-warning-500)",
                }}
              />
            </div>
            <span className="text-xs font-semibold w-8 text-right shrink-0" style={{ color: "var(--color-primary-600)" }}>
              {Math.round(b.score)}%
            </span>
          </div>
        ))}
      </div>

      {/* Without an embedding the skills sub-score is 0, which drags the total down. Say
          that, rather than presenting a deflated number as a verdict. */}
      {!data.skillsScored && (
        <p className="flex items-start gap-1.5 text-[11px] mt-3" style={{ color: "var(--color-text-tertiary)" }}>
          <Info size={12} className="shrink-0 mt-0.5" />
          <span>
            This job hasn&apos;t been indexed for skills matching yet, so the score counts
            only experience, location and salary.
          </span>
        </p>
      )}

      {data.reasons.length > 0 && (
        <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
          <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
            Why this match?
          </p>
          <ul className="text-xs space-y-1.5" style={{ color: "var(--color-text-secondary)" }}>
            {data.reasons.map((reason, i) => (
              <li key={i}>{reason}</li>
            ))}
          </ul>
        </div>
      )}
    </Shell>
  );
}

function label(score: number): string {
  if (score >= 80) return "Strong Match";
  if (score >= 60) return "Good Match";
  if (score >= 40) return "Fair Match";
  return "Weak Match";
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-4 rounded-lg border"
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
