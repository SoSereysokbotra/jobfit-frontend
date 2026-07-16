"use client";

import React, { useMemo } from "react";
import { Job } from "@/shared/types/shared.types";

interface MatchScoreWidgetProps {
  job: Job;
}

export function MatchScoreWidget({ job }: MatchScoreWidgetProps) {
  // Use useMemo to generate stable but pseudo-random sub-scores based on the overall match score
  // This simulates the sub-scores that would eventually come from the API
  const subScores = useMemo(() => {
    // Generate scores that average roughly to the overall match score
    const baseScore = job.match;
    return [
      { label: "Skills", score: Math.min(100, baseScore + 3) },
      { label: "Experience", score: Math.max(0, baseScore - 4) },
      { label: "Location", score: Math.min(100, baseScore + 3) },
      { label: "Seniority", score: Math.max(0, baseScore - 2) },
    ];
  }, [job.match]);

  const circumference = 42 * 2 * Math.PI;
  const strokeDasharray = `${(job.match / 100) * circumference} ${circumference}`;

  return (
    <div
      className="p-4 rounded-lg border"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--color-neutral-100)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--color-primary-500)"
              strokeWidth="8"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-lg font-bold"
            style={{ color: "var(--color-primary-600)" }}
          >
            {job.match}%
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
            {job.match >= 90
              ? "Excellent Match"
              : job.match >= 75
              ? "Good Match"
              : "Fair Match"}
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            Your profile aligns well with this role
          </p>
        </div>
      </div>
      <div className="space-y-2">
        {subScores.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="text-xs w-20 truncate" style={{ color: "var(--color-text-secondary)" }}>
              {s.label}
            </span>
            <div
              className="flex-1 h-2 rounded-full overflow-hidden"
              style={{ background: "var(--color-neutral-100)" }}
            >
              <div
                className="h-2 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${s.score}%`,
                  background:
                    s.score > 85
                      ? "var(--color-primary-500)"
                      : "var(--color-warning-500)",
                }}
              />
            </div>
            <span
              className="text-xs font-semibold w-8 text-right shrink-0"
              style={{ color: "var(--color-primary-600)" }}
            >
              {s.score}%
            </span>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
        <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Why this match?
        </p>
        <ul className="text-xs space-y-1.5 mb-4" style={{ color: "var(--color-text-secondary)" }}>
          <li><span style={{ color: "var(--color-success-600)" }}>✓</span> <strong>Skills:</strong> React, TypeScript, and Node.js align perfectly.</li>
          <li><span style={{ color: "var(--color-success-600)" }}>✓</span> <strong>Experience:</strong> Senior level matches expectations.</li>
          <li><span style={{ color: "var(--color-success-600)" }}>✓</span> <strong>Location:</strong> Matches your remote preference.</li>
          <li><span style={{ color: "var(--color-warning-600)" }}>⚠</span> <strong>Skill gap:</strong> Missing GraphQL (Learnable in 1-2 weeks).</li>
        </ul>
        <button
          className="w-full py-2 text-xs font-semibold rounded-md border"
          style={{
            borderColor: "var(--color-primary-200)",
            color: "var(--color-primary-700)",
            background: "var(--color-primary-50)",
          }}
        >
          Optimize resume for this job
        </button>
      </div>
    </div>
  );
}
