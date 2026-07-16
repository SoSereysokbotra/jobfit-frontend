import React from "react";
import Link from "next/link";
import { MOCK_JOBS } from "../api/job.api";

interface JobRelatedListProps {
  currentJobId: string;
}

export function JobRelatedList({ currentJobId }: JobRelatedListProps) {
  // Grab a few jobs from mock data to show as related
  const relatedJobs = MOCK_JOBS.filter((j) => j.id !== currentJobId).slice(0, 3);

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
        Similar high-matching jobs
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
                <span className="text-xs font-medium" style={{ color: "var(--color-primary-600)" }}>
                  {job.match}% Match
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
