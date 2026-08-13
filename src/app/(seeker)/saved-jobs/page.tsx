"use client";

/**
 * Saved Jobs — two sources, one page.
 *
 * Jobs saved inside JobFits carry an internal `jobId` and resolve to full `Job` rows;
 * jobs saved from the browser extension are postings on sites we don't ingest and carry
 * their own copy of the title/company/description. They cannot share a list (different
 * ids, different endpoints, different actions), but they ARE the same idea to the user,
 * so they share a page and the tab styling used elsewhere in the app.
 */

import React from "react";
import Link from "next/link";
import { Chrome, Heart, Search } from "lucide-react";
import { JobCard } from "@/features/job/components";
import {
  useSavedJobs,
  useSavedJobIds,
  useToggleSavedJob,
} from "@/features/saved-jobs/hooks/use-saved-jobs";
import {
  useRemoveSavedExternalJob,
  useSavedExternalJobs,
} from "@/features/saved-jobs/hooks/use-saved-external-jobs";
import { SavedExternalJobCard } from "@/features/saved-jobs/components/saved-external-job-card";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { JobCardSkeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import { cn } from "@/shared/utils/cn";

const cta =
  "px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 inline-flex items-center gap-1.5";

/** The shared list surface, so both tabs sit on identical cards. */
function ListSurface({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg border divide-y overflow-hidden"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-neutral-100)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {children}
    </div>
  );
}

type TabId = "jobfits" | "extension";

export default function SavedJobsPage() {
  const [tab, setTab] = React.useState<TabId>("jobfits");

  const { ids } = useSavedJobIds();
  const { data: jobs = [], isLoading } = useSavedJobs();
  const toggleSave = useToggleSavedJob();

  const {
    data: externalJobs = [],
    isLoading: externalLoading,
    isError: externalError,
    error: externalErrorValue,
  } = useSavedExternalJobs();
  const removeExternal = useRemoveSavedExternalJob();

  const hasSaved = ids.size > 0;
  const total = ids.size + externalJobs.length;

  const tabs: Array<{ id: TabId; label: string; count: number }> = [
    { id: "jobfits", label: "From JobFits", count: ids.size },
    { id: "extension", label: "From the extension", count: externalJobs.length },
  ];

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 space-y-5 min-h-full"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Saved Jobs
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          {total > 0
            ? `${total} job${total === 1 ? "" : "s"} saved for later`
            : "Jobs you save appear here"}
        </p>
      </div>

      <div
        className="flex gap-1 overflow-x-auto border-b"
        style={{ borderColor: "var(--color-border)" }}
        role="tablist"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-all duration-200",
              tab === item.id
                ? "border-primary-500 text-primary-700"
                : "border-transparent text-neutral-500 hover:text-neutral-700",
            )}
          >
            {item.label}
            {item.count > 0 && (
              <span
                className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: "var(--color-primary-50)",
                  color: "var(--color-primary-700)",
                }}
              >
                {item.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "jobfits" ? (
        !hasSaved ? (
          <EmptyState
            icon={<Heart size={26} />}
            title="No saved jobs yet"
            description="Tap the heart on any job to save it here for later."
            action={
              <Link href="/jobs" className={cta}>
                <Search size={14} /> Browse jobs
              </Link>
            }
          />
        ) : isLoading ? (
          <ListSurface>
            {[1, 2, 3].map((i) => (
              <JobCardSkeleton key={i} />
            ))}
          </ListSurface>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={<Heart size={26} />}
            title="Saved jobs are no longer available"
            description="The postings you saved have been closed or removed."
          />
        ) : (
          <ListSurface>
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                variant="list"
                saved
                onToggleSave={() => toggleSave.mutate(job.id)}
              />
            ))}
          </ListSurface>
        )
      ) : externalError ? (
        <Alert variant="error">
          {externalErrorValue instanceof Error
            ? externalErrorValue.message
            : "Could not load the jobs saved from your extension."}
        </Alert>
      ) : externalLoading ? (
        <ListSurface>
          {[1, 2, 3].map((i) => (
            <JobCardSkeleton key={i} />
          ))}
        </ListSurface>
      ) : externalJobs.length === 0 ? (
        // Deliberately different from the other tab's empty state: nothing on this page
        // can create one of these, so pointing at /jobs would be a dead end.
        <EmptyState
          icon={<Chrome size={26} />}
          title="Nothing saved from the extension yet"
          description="On any LinkedIn job, open the JobFit badge and press Save Job. What you save there — title, company, salary and your own notes — shows up here."
        />
      ) : (
        <ListSurface>
          {externalJobs.map((job) => (
            <SavedExternalJobCard
              key={job.id}
              job={job}
              removing={removeExternal.isPending && removeExternal.variables === job.id}
              onRemove={() => removeExternal.mutate(job.id)}
            />
          ))}
        </ListSurface>
      )}
    </div>
  );
}
