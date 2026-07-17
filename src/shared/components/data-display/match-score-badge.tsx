"use client";

import React from "react";

interface MatchScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function MatchScoreBadge({ score, size = "md", className = "" }: MatchScoreBadgeProps) {
  const dimensions = { sm: 48, md: 64, lg: 80 };
  const strokeWidths = { sm: 6, md: 7, lg: 8 };
  const fontSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };
  
  const dim = dimensions[size];
  const sw = strokeWidths[size];
  const r = (dim / 2) - sw;
  const circumference = 2 * Math.PI * r;
  // A match score of 0 means "not scored yet" (the AI match service is not wired
  // in — see INTEGRATION_PLAN.md Phase 10), so render a neutral dash, not a red 0%.
  const scored = score > 0;
  const dashArray = `${(scored ? score / 100 : 0) * circumference} ${circumference}`;

  const scoreColor = !scored ? "var(--color-text-tertiary)" :
    score >= 85 ? "var(--color-primary-600)" :
    score >= 70 ? "var(--color-warning-500)" :
    "var(--color-error-500)";

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: dim, height: dim }}>
      <svg width={dim} height={dim} className="-rotate-90" viewBox={`0 0 ${dim} ${dim}`}>
        <circle
          cx={dim / 2} cy={dim / 2} r={r}
          fill="none"
          stroke="var(--color-neutral-100)"
          strokeWidth={sw}
        />
        <circle
          cx={dim / 2} cy={dim / 2} r={r}
          fill="none"
          stroke={scoreColor}
          strokeWidth={sw}
          strokeDasharray={dashArray}
          strokeLinecap="round"
        />
      </svg>
      <span
        className={`absolute font-bold ${fontSizes[size]}`}
        style={{ color: scoreColor }}
      >
        {scored ? `${score}%` : "—"}
      </span>
    </div>
  );
}
