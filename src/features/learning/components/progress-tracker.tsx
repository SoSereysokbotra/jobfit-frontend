"use client";

import React from "react";
import { CheckCircle2, Target } from "lucide-react";

interface ProgressTrackerProps {
  currentCount: number;
  gapCount: number;
}

/** Skill coverage: how many in-demand skills the user already has vs. gaps. */
export function ProgressTracker({ currentCount, gapCount }: ProgressTrackerProps) {
  const total = currentCount + gapCount;
  const percent = total > 0 ? Math.round((currentCount / total) * 100) : 0;

  return (
    <div
      className="rounded-lg border p-5"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>Skill Coverage</h2>
        <span className="text-2xl font-extrabold" style={{ color: "var(--color-primary-600)" }}>{percent}%</span>
      </div>

      <div className="h-2.5 rounded-full overflow-hidden mb-4" style={{ background: "var(--color-neutral-100)" }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%`, background: "var(--color-primary-500)" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 size={18} style={{ color: "var(--color-success-500)" }} />
          <div>
            <p className="text-lg font-extrabold leading-none" style={{ color: "var(--color-text-primary)" }}>{currentCount}</p>
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Skills you have</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Target size={18} style={{ color: "var(--color-warning-500)" }} />
          <div>
            <p className="text-lg font-extrabold leading-none" style={{ color: "var(--color-text-primary)" }}>{gapCount}</p>
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Skills to learn</p>
          </div>
        </div>
      </div>
    </div>
  );
}
