"use client";

import React from "react";
import Link from "next/link";
import { Heart, Search } from "lucide-react";
import { JobCard } from "@/features/job/components";
import { useSavedJobs, useSavedJobIds, useToggleSavedJob } from "@/features/saved-jobs/hooks/use-saved-jobs";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { JobCardSkeleton } from "@/shared/components/feedback/skeleton";

export default function SavedJobsPage() {
  const { ids } = useSavedJobIds();
  const { data: jobs = [], isLoading } = useSavedJobs();
  const toggleSave = useToggleSavedJob();

  const hasSaved = ids.size > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 min-h-full" style={{ background: "var(--color-bg-secondary)" }}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Saved Jobs
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          {hasSaved ? `${ids.size} job${ids.size === 1 ? "" : "s"} saved for later` : "Jobs you save appear here"}
        </p>
      </div>

      {!hasSaved ? (
        <EmptyState
          icon={<Heart size={26} />}
          title="No saved jobs yet"
          description="Tap the heart on any job to save it here for later."
          action={
            <Link href="/jobs" className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all inline-flex items-center gap-1.5">
              <Search size={14} /> Browse jobs
            </Link>
          }
        />
      ) : isLoading ? (
        <div className="rounded-lg border divide-y overflow-hidden" style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}>
          {[1, 2, 3].map((i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Heart size={26} />}
          title="Saved jobs are no longer available"
          description="The postings you saved have been closed or removed."
        />
      ) : (
        <div className="rounded-lg border divide-y overflow-hidden" style={{ background: "var(--color-card)", borderColor: "var(--color-neutral-100)", boxShadow: "var(--shadow-sm)" }}>
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              variant="list"
              saved
              onToggleSave={() => toggleSave.mutate(job.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
