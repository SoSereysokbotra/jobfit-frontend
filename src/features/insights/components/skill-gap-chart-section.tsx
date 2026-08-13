"use client";

import React, { useState } from "react";
import { Target } from "lucide-react";
import { useSkillGap } from "@/features/matching/hooks/use-skill-gap";
import { SkillGapChart } from "./skill-gap-chart";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import type { ApplicationView } from "@/features/application/api/application.mappers";

interface SkillGapChartSectionProps {
  applications: ApplicationView[];
}

/**
 * Wraps the SkillGapChart for the Insights page.
 *
 * The radar needs a `jobId`. Strategy:
 *   1. Default to the most recently applied job.
 *   2. Let the user pick a different job via a tab-strip of their most recent
 *      5 applications.
 *
 * If the user has no applications, renders a "nothing yet" hint.
 */
export function SkillGapChartSection({ applications }: SkillGapChartSectionProps) {
  // Sort applications newest-first and take up to 5
  const recent = [...applications]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = recent[selectedIdx];

  const { data, isLoading, isError } = useSkillGap(selected?.jobId);

  if (recent.length === 0) {
    return (
      <div
        className="rounded-lg border p-6"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: "var(--color-primary-50)" }}
          >
            <Target size={16} style={{ color: "var(--color-primary-600)" }} />
          </div>
          <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
            Skill-gap radar
          </h2>
        </div>
        <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          Apply to a job to see how your résumé covers its requirements here.
        </p>
      </div>
    );
  }

  const showContent = !isLoading && !isError && data && data.status === "OK" && data.requirements.length > 0;

  return (
    <div
      className="rounded-lg border p-6"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ background: "var(--color-primary-50)" }}
        >
          <Target size={16} style={{ color: "var(--color-primary-600)" }} />
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
            Skill-gap radar
          </h2>
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            How your résumé covers each job's stated requirements
          </p>
        </div>
      </div>

      {/* Job picker — tab strip */}
      {recent.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {recent.map((app, idx) => {
            const isActive = idx === selectedIdx;
            return (
              <button
                key={app.id}
                onClick={() => setSelectedIdx(idx)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                style={{
                  background: isActive ? "var(--color-primary-600)" : "var(--color-primary-50)",
                  color: isActive ? "#ffffff" : "var(--color-primary-700)",
                  border: `1px solid ${isActive ? "var(--color-primary-600)" : "var(--color-primary-200)"}`,
                }}
              >
                {app.jobTitle.length > 20 ? app.jobTitle.slice(0, 18) + "…" : app.jobTitle}
              </button>
            );
          })}
        </div>
      )}

      {/* Chart area */}
      {isLoading ? (
        <Skeleton className="h-80 rounded" />
      ) : isError ? (
        <p className="text-sm py-4" style={{ color: "var(--color-text-tertiary)" }}>
          Could not load skill gap data.
        </p>
      ) : !data || data.status === "NO_PARSED_RESUME" ? (
        <p className="text-sm py-4" style={{ color: "var(--color-text-tertiary)" }}>
          Upload a résumé on your{" "}
          <a
            href="/profile"
            className="underline"
            style={{ color: "var(--color-primary-600)" }}
          >
            profile page
          </a>{" "}
          to see your skill-gap radar.
        </p>
      ) : data.status === "JOB_HAS_NO_REQUIREMENTS" ? (
        <p className="text-sm py-4" style={{ color: "var(--color-text-tertiary)" }}>
          This job posting doesn't list specific requirements — nothing to compare against.
        </p>
      ) : showContent ? (
        <>
          <p className="text-xs mb-4" style={{ color: "var(--color-text-tertiary)" }}>
            Your résumé covers{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              {data.matchedCount} of {data.requirements.length}
            </strong>{" "}
            stated requirements for{" "}
            <span style={{ color: "var(--color-primary-600)", fontWeight: 600 }}>
              {selected?.jobTitle}
            </span>
            .
          </p>
          <SkillGapChart data={data} />
        </>
      ) : (
        <p className="text-sm py-4" style={{ color: "var(--color-text-tertiary)" }}>
          No requirements data available for this job.
        </p>
      )}
    </div>
  );
}
