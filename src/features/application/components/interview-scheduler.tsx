"use client";

import React from "react";
import { CalendarClock } from "lucide-react";
import type { ApplicationStatus } from "../api/application.api";

interface InterviewSchedulerProps {
  status: ApplicationStatus;
}

/**
 * Interview panel on the application detail page.
 *
 * TODO(backend): there is no interview/scheduling endpoint yet (INTEGRATION_PLAN.md
 * Phase 10). This is presentational only — it surfaces the interview stage but does
 * not persist anything. Wire to real data when the endpoint exists.
 */
export function InterviewScheduler({ status }: InterviewSchedulerProps) {
  const isInterviewStage = status === "INTERVIEW";

  return (
    <div
      className="p-5 rounded-lg border"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <CalendarClock size={16} style={{ color: "var(--color-primary-600)" }} />
        <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
          Interviews
        </h3>
        <span
          className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "var(--color-neutral-100)", color: "var(--color-text-tertiary)" }}
        >
          Preview
        </span>
      </div>

      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        {isInterviewStage
          ? "You're in the interview stage. Scheduling isn't available yet — track it here once it ships."
          : "No interviews scheduled. This panel activates when the application reaches the interview stage."}
      </p>
    </div>
  );
}
