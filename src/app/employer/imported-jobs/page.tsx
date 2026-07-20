"use client";

import React from "react";
import { DownloadCloud, ExternalLink, MapPin, Wifi } from "lucide-react";
import { Badge } from "@/shared/components/data-display/badge";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import { useImportedJobs } from "@/features/employer/hooks/use-employer";

/** "2026-07-20T..." → "Jul 20, 2026" */
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ImportedJobsPage() {
  const { data: jobs = [], isLoading, isError, error } = useImportedJobs();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">Imported Jobs</h1>
        <p className="text-sm mt-1 text-content-secondary">
          External postings pulled into the job board via ingestion (FR-JOBS-001).
        </p>
      </div>

      {isError && (
        <Alert variant="error">
          {error instanceof Error ? error.message : "Could not load imported jobs."}
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<DownloadCloud size={26} />}
          title="No imported jobs yet"
          description="Use “Import External Jobs” on the Analytics dashboard to pull postings from TheMuse."
        />
      ) : (
        <>
          <p className="text-xs text-content-tertiary">
            Showing {jobs.length} imported job{jobs.length === 1 ? "" : "s"}, most recently seen first.
          </p>
          <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            <div className="divide-y divide-neutral-100">
              {jobs.map((job) => (
                <div key={job.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-content truncate">{job.title}</h3>
                      <Badge tone="neutral">{job.source}</Badge>
                      <Badge tone={job.remoteType === "REMOTE" ? "success" : "neutral"}>
                        {job.remoteType === "REMOTE" ? "Remote" : "On-site"}
                      </Badge>
                    </div>
                    <p className="text-xs text-content-secondary mt-1 font-semibold">{job.companyName}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-content-tertiary flex-wrap">
                      {job.location && (
                        <span className="inline-flex items-center gap-1"><MapPin size={11} /> {job.location}</span>
                      )}
                      <span className="inline-flex items-center gap-1"><Wifi size={11} /> Seen {formatDate(job.lastSeenAt)}</span>
                    </div>
                  </div>
                  {job.externalUrl && (
                    <a
                      href={job.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-bold text-content-secondary hover:bg-neutral-50 transition-colors"
                    >
                      View source <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
