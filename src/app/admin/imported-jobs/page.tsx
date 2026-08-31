"use client";

import React, { useState } from "react";
import { DownloadCloud, ExternalLink, MapPin, Wifi, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/shared/components/data-display/badge";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import { ApiError } from "@/lib/api/client";
import { useImportedJobs, useIngestJobs } from "@/features/admin/hooks/use-admin";
import { formatDate as helperFormatDate } from "@/shared/utils/formatters";

/** "2026-07-20T..." → "Jul 20, 2026" */
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : helperFormatDate(d, { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Job ingestion control (FR-JOBS-001). Pulls external jobs from TheMuse into the shared
 * job pool and shows a run summary.
 *
 * Admin-owned. A run creates companies and jobs that every seeker then sees, which makes
 * it platform content management rather than something one customer should be able to
 * start. It sat on the employer dashboard until 2026-08-31.
 */
function JobIngestionPanel() {
  const ingest = useIngestJobs();
  const [pages, setPages] = useState(1);
  const result = ingest.data;
  const errorMsg = ingest.error
    ? ingest.error instanceof ApiError
      ? ingest.error.messages.join(" ")
      : "Ingestion failed. Please try again."
    : "";

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md flex items-center justify-center bg-primary-50 text-primary-600">
            <DownloadCloud size={16} />
          </div>
          <div>
            <h2 className="text-base font-bold text-content">Import External Jobs</h2>
            <p className="text-xs mt-0.5 text-content-tertiary">Pull live postings from TheMuse into the job board.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold text-content-secondary flex items-center gap-2">
          Pages
          <select
            value={pages}
            onChange={(e) => setPages(Number(e.target.value))}
            disabled={ingest.isPending}
            className="text-xs font-semibold rounded-md border border-border bg-bg px-2 py-1.5 outline-none cursor-pointer text-content"
          >
            {[1, 2, 3, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <button
          onClick={() => ingest.mutate(pages)}
          disabled={ingest.isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {ingest.isPending ? <><Loader2 size={13} className="animate-spin" /> Fetching…</> : <><DownloadCloud size={13} /> Fetch jobs</>}
        </button>
      </div>

      {errorMsg && (
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-error-600">
          <AlertTriangle size={13} /> {errorMsg}
        </div>
      )}

      {result && !ingest.isPending && (
        <div className="mt-4 rounded-md border border-success-100 bg-success-50 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-success-700 mb-2">
            <CheckCircle2 size={14} /> Ingestion complete
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { label: "Fetched", value: result.fetched },
              { label: "Created", value: result.created },
              { label: "Updated", value: result.updated },
              { label: "Skipped", value: result.skipped },
            ].map((s) => (
              <div key={s.label} className="rounded bg-card border border-border px-2.5 py-1.5">
                <p className="text-sm font-bold text-content leading-none">{s.value}</p>
                <p className="text-content-tertiary mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {result.errors.length > 0 && (
            <p className="text-xs text-warning-600 mt-2">{result.errors.length} error(s) during this run — see server logs.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminImportedJobsPage() {
  const { data: jobs = [], isLoading, isError, error } = useImportedJobs();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">Imported Jobs</h1>
        <p className="text-sm mt-1 text-content-secondary">
          External postings pulled into the shared job board via ingestion (FR-JOBS-001).
          These reach every seeker, and are not tied to any one employer.
        </p>
      </div>

      <JobIngestionPanel />

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
          description="Use “Import External Jobs” above to pull postings from TheMuse."
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
