"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { type ApplicationStage } from "@/features/employer/api/employer.api";

const ALL_STAGES: ApplicationStage[] = ["Applied", "Interview", "Offer", "Hired", "Rejected"];

interface StageMovePickerProps {
  current: ApplicationStage;
  onMove: (stage: ApplicationStage) => void;
  className?: string;
}

const STAGE_COLORS: Record<ApplicationStage, string> = {
  Applied:   "bg-info-50 text-info-600 border-info-100",
  Interview: "bg-primary-50 text-primary-700 border-primary-100",
  Offer:     "bg-warning-50 text-warning-600 border-warning-100",
  Hired:     "bg-success-50 text-success-600 border-success-100",
  Rejected:  "bg-error-50 text-error-600 border-error-100",
};

/**
 * Inline stage selector — no drag required.
 * Renders as a styled native select with the current stage highlighted.
 */
export function StageMovePicker({ current, onMove, className }: StageMovePickerProps) {
  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <select
        value={current}
        onChange={(e) => onMove(e.target.value as ApplicationStage)}
        aria-label="Move to stage"
        className={cn(
          "appearance-none pr-6 pl-2.5 py-1 text-xs font-semibold rounded-full border cursor-pointer transition-all duration-200 outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
          STAGE_COLORS[current],
        )}
      >
        {ALL_STAGES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <ChevronDown
        size={11}
        className="absolute right-1.5 pointer-events-none"
        style={{ color: "currentColor" }}
      />
    </div>
  );
}
