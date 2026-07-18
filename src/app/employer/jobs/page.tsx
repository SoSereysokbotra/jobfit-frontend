"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Plus, Eye } from "lucide-react";
import { Badge } from "@/shared/components/data-display/badge";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import { useEmployerJobs, useEmployerApplications } from "@/features/employer/hooks/use-employer";

export default function EmployerJobsPage() {
  const { data: jobs = [], isLoading, isError, error } = useEmployerJobs();
  const { data: applicants = [] } = useEmployerApplications();

  const countByJob = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of applicants) m.set(a.jobId, (m.get(a.jobId) ?? 0) + 1);
    return m;
  }, [applicants]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content">My Jobs</h1>
          <p className="text-sm mt-1 text-content-secondary">{jobs.length} job postings</p>
        </div>
        <Link href="/employer/jobs/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all active:scale-[0.98]">
          <Plus size={16} /> Create New Job
        </Link>
      </div>

      {isError && <Alert variant="error">{error instanceof Error ? error.message : "Could not load your jobs."}</Alert>}

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No job postings yet"
          description="Create your first job to start receiving applications."
          action={<Link href="/employer/jobs/new" className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all inline-flex items-center gap-1.5"><Plus size={14} /> Create New Job</Link>}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-content-tertiary">
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Title</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Posted</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Apps</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} className="border-t border-neutral-100 transition-colors hover:bg-primary-50">
                    <td className="px-5 py-3">
                      <Link href={`/employer/jobs/${j.id}`} className="font-semibold text-content hover:text-primary-700 transition-colors">{j.title}</Link>
                      <p className="text-xs mt-0.5 text-content-tertiary">{j.location} · {j.remote}</p>
                    </td>
                    <td className="px-5 py-3"><Badge tone={j.statusTone}>{j.status}</Badge></td>
                    <td className="px-5 py-3 hidden sm:table-cell text-content-secondary">{j.postedAt}</td>
                    <td className="px-5 py-3 font-bold text-content">{countByJob.get(j.id) ?? 0}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/employer/jobs/${j.id}`} aria-label="View" className="p-2 rounded-md border border-border text-content-secondary transition-colors hover:bg-neutral-50"><Eye size={14} /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
