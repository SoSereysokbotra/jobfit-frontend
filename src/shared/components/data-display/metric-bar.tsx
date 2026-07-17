import React from "react";

type MetricTone = "success" | "warning" | "error" | "primary";

const FILL: Record<MetricTone, string> = {
  success: "bg-success-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
  primary: "bg-primary-500",
};

interface MetricBarProps {
  label: string;
  /** Displayed value string, e.g. "145ms" or "99.8%". */
  display: string;
  /** Fill fraction 0–100. */
  percent: number;
  tone?: MetricTone;
}

/** Labeled horizontal metric bar (system-health style). */
export function MetricBar({ label, display, percent, tone = "primary" }: MetricBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-content-secondary">{label}</span>
        <span className="text-sm font-bold text-content">{display}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-neutral-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${FILL[tone]}`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}
