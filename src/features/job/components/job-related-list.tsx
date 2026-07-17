"use client";

import React from "react";
import Link from "next/link";
import { useJobs } from "../hooks/use-job";
import { formatSalaryRange } from "@/shared/types/shared.types";

interface JobRelatedListProps {
  currentJobId: string;
}

/**
 * "Similar jobs" rail on the job detail page. Sources live published jobs and
 * excludes the current one. TODO(backend): true relatedness (shared skills /
 * match score) needs the AI matching service — until then this is "other open
 * roles", so we show salary rather than a placeholder match %.
 */
export function JobRelatedList({ currentJobId }: JobRelatedListProps) {
  const { data: jobs = [] } = useJobs();
  const relatedJobs = jobs.filter((j) => j.id !== currentJobId).slice(0, 3);

  if (relatedJobs.length === 0) return null;

  return (
    <div
      className="p-6 rounded-lg border"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h3 className="text-sm font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
        Other open roles
      </h3>

      <div className="space-y-4">
        {relatedJobs.map((job) => (
          <div key={job.id} className="flex gap-3 pb-4 border-b last:border-b-0 last:pb-0" style={{ borderColor: "var(--color-border)" }}>
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
              style={{ background: job.logoBg }}
            >
              {job.logo}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/jobs/${job.id}`}
                className="text-sm font-semibold truncate block hover:underline"
                style={{ color: "var(--color-text-primary)" }}
              >
                {job.title}
              </Link>
              <p className="text-xs truncate mb-1" style={{ color: "var(--color-text-secondary)" }}>
                {job.company}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-medium" style={{ color: "var(--color-success-600)" }}>
                  {formatSalaryRange(job)}
                </span>
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-xs font-medium px-3 py-1 rounded-md border transition-colors hover:bg-neutral-50"
                  style={{
                    color: "var(--color-text-secondary)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
