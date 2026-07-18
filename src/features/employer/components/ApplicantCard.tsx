"use client";

import React from "react";
import { MapPin, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import MatchScoreBadge from "@/shared/components/data-display/match-score-badge";
import { StageMovePicker } from "./StageMovePicker";
import { type Applicant, type ApplicationStage, EMPLOYER_JOBS } from "@/features/employer/api/employer.api";

interface ApplicantCardProps {
  applicant: Applicant;
  onSelect: (applicant: Applicant) => void;
  onStageMove: (id: string, stage: ApplicationStage) => void;
  isSelected?: boolean;
}

/**
 * Applicant card used in the Pipeline list view.
 * Shows avatar, name, job title, location, applied date, match ring, and stage picker.
 */
export function ApplicantCard({ applicant: a, onSelect, onStageMove, isSelected }: ApplicantCardProps) {
  const jobTitle = EMPLOYER_JOBS.find((j) => j.id === a.jobId)?.title ?? "Unknown Job";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(a)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(a)}
      className={cn(
        "group flex items-center gap-4 px-5 py-4 rounded-lg border transition-all duration-200 cursor-pointer",
        isSelected
          ? "border-primary-300 bg-primary-50 shadow-md"
          : "border-border bg-card hover:border-primary-200 hover:bg-card-hover hover:shadow-sm",
      )}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-200"
        style={{
          background: isSelected
            ? "var(--color-primary-200)"
            : "var(--color-primary-100)",
          color: "var(--color-primary-700)",
        }}
      >
        {a.initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-bold text-content truncate">{a.name}</p>
        </div>
        <p className="text-xs text-content-tertiary truncate">{jobTitle}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {a.location && (
            <span className="flex items-center gap-1 text-xs text-content-tertiary">
              <MapPin size={11} />
              {a.location}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-content-tertiary">
            <Clock size={11} />
            {a.appliedAt}
          </span>
        </div>
      </div>

      {/* Match Score */}
      <div className="shrink-0 hidden sm:block">
        <MatchScoreBadge score={a.match} size="sm" />
      </div>

      {/* Stage Picker — stop propagation so clicking it doesn't open the detail panel */}
      <div
        className="shrink-0"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <StageMovePicker
          current={a.stage}
          onMove={(stage) => onStageMove(a.id, stage)}
        />
      </div>

      {/* Chevron hint */}
      <ChevronRight
        size={16}
        className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
        style={{ color: "var(--color-text-disabled)" }}
      />
    </div>
  );
}
