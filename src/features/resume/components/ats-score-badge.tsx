"use client";

import React from "react";
import { cn } from "@/shared/utils/cn";
import { scoreTone } from "../api/resume.mappers";

interface AtsScoreBadgeProps {
  /** 0–100. */
  score: number;
  label?: string;
  /** Ring shows the score as a dial; pill is a compact inline chip. */
  variant?: "ring" | "pill";
  className?: string;
}

const TONE_TEXT = {
  success: "text-success-600",
  warning: "text-warning-600",
  error: "text-error-600",
} as const;

const TONE_BG = {
  success: "bg-success-100 text-success-600",
  warning: "bg-warning-100 text-warning-600",
  error: "bg-error-100 text-error-600",
} as const;

const TONE_STROKE = {
  success: "var(--color-success-600)",
  warning: "var(--color-warning-600)",
  error: "var(--color-error-600)",
} as const;

/** Resume score dial/chip. Tone thresholds live in resume.mappers (scoreTone). */
export function AtsScoreBadge({ score, label, variant = "ring", className }: AtsScoreBadgeProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const { label: toneLabel, tone } = scoreTone(clamped);

  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full",
          TONE_BG[tone],
          className,
        )}
      >
        {label ?? "ATS"} {clamped}
      </span>
    );
  }

  const circumference = 2 * Math.PI * 28;
  const dash = (clamped / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 64 64" className="w-20 h-20 -rotate-90" aria-hidden="true">
          <circle cx="32" cy="32" r="28" fill="none" strokeWidth="5" stroke="var(--color-neutral-100)" />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            stroke={TONE_STROKE[tone]}
            strokeDasharray={`${dash} ${circumference}`}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-xl font-bold", TONE_TEXT[tone])}>{clamped}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-neutral-700">{label ?? "ATS Score"}</p>
        <p className={cn("text-xs font-medium", TONE_TEXT[tone])}>{toneLabel}</p>
      </div>
    </div>
  );
}
