"use client";

import React from "react";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import type { TimelineEntryView } from "../api/application.mappers";

const DOT_COLOR: Record<TimelineEntryView["tone"], string> = {
  primary: "var(--color-primary-500)",
  success: "var(--color-success-500)",
  warning: "var(--color-warning-500)",
  error: "var(--color-error-500)",
  info: "var(--color-info-500)",
  neutral: "var(--color-neutral-400)",
};

interface ApplicationTimelineProps {
  entries: TimelineEntryView[];
  loading?: boolean;
}

/** Vertical status history for an application (GET /applications/{id}/timeline). */
export function ApplicationTimeline({ entries, loading = false }: ApplicationTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-3 h-3 rounded-full mt-1 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
        No history yet.
      </p>
    );
  }

  return (
    <ol className="relative">
      {entries.map((entry, i) => (
        <li key={entry.id} className="flex gap-3 pb-5 last:pb-0">
          {/* Rail + dot */}
          <div className="relative flex flex-col items-center">
            <span
              className="w-3 h-3 rounded-full mt-1 shrink-0 ring-4"
              style={{ background: DOT_COLOR[entry.tone], boxShadow: "0 0 0 4px var(--color-card)" }}
            />
            {i < entries.length - 1 && (
              <span
                className="w-px flex-1 mt-1"
                style={{ background: "var(--color-border)" }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0 -mt-0.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {entry.label}
              </p>
              {entry.dateLabel && (
                <span className="text-xs shrink-0" style={{ color: "var(--color-text-tertiary)" }}>
                  {entry.dateLabel}
                </span>
              )}
            </div>
            {entry.description && (
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
                {entry.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
