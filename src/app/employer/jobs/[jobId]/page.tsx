"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Eye, Users, Target, Star, MapPin, DollarSign, ArrowRight } from "lucide-react";
import { Badge } from "@/shared/components/data-display/badge";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Button } from "@/shared/components/ui/button";
import {
  useEmployerJobs,
  useJobAnalytics,
  useEmployerApplications,
  usePublishJob,
  useCloseJob,
} from "@/features/employer/hooks/use-employer";

export default function EmployerJobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const { data: jobs = [], isLoading } = useEmployerJobs();
  const job = jobs.find((j) => j.id === params.jobId);
  const { data: analytics } = useJobAnalytics(params.jobId);
  const { data: applicants = [] } = useEmployerApplications(params.jobId);
  const publish = usePublishJob();
  const close = useCloseJob();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-5">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-20 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8">
        <EmptyState title="Job not found" description="This posting may have been removed." action={
          <Link href="/employer/jobs" className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all">Back to Jobs</Link>
        } />
      </div>
    );
  }

  const appCount = analytics?.applicationsCount ?? applicants.length;
  const bands = analytics?.candidateBands ?? null;
  // `views` is a declared placeholder on the API — JobAnalyticsResponseDto hardcodes 0
  // and nothing writes it, because no view tracking exists yet. Rendering "0 views" and
  // "0% apply rate" states as fact that nobody looked at the posting, which is not what
  // the API said; it said it does not know. Both read "—" until tracking is built, the
  // same way Strong Matches renders an absent value.
  const views = analytics?.views ?? 0;
  const hasViewTracking = views > 0;
  const applyRate = hasViewTracking ? `${((appCount / views) * 100).toFixed(1)}%` : "—";
  const recent = applicants.slice(0, 3);

  const tiles = [
    { label: "Views", value: hasViewTracking ? `${views}` : "—", icon: <Eye size={18} />, accent: "bg-info-50 text-info-600" },
    { label: "Applications", value: `${appCount}`, icon: <Users size={18} />, accent: "bg-primary-50 text-primary-600" },
    { label: "Apply Rate", value: applyRate, icon: <Target size={18} />, accent: "bg-success-50 text-success-600" },
    // Was "Avg Match", reading an average the API could never compute — it rendered "—"
    // on every load. A count of strong candidates is both real and what an employer
    // actually wants; the score behind it is evidenced for ordering, not magnitude.
    { label: "Strong Matches", value: bands ? `${bands.strong}` : "—", icon: <Star size={18} />, accent: "bg-warning-50 text-warning-600" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <Link href="/employer/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:underline">
        <ArrowLeft size={15} /> Back to Jobs
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-content">{job.title}</h1>
            <Badge tone={job.statusTone}>{job.status}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-content-tertiary">
            <span className="flex items-center gap-1"><MapPin size={13} /> {job.location}</span>
            {job.salary && (
              <span className="flex items-center gap-1 text-success-600"><DollarSign size={13} /> {job.salary}</span>
            )}
            <span>Posted {job.postedAt}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {job.status === "Draft" && (
            <Button
              variant="primary"
              loading={publish.isPending}
              loadingText="Publishing…"
              onClick={() => publish.mutate(job.id)}
            >
              Publish Job
            </Button>
          )}
          {/* Closing takes the posting down for good: reposting is not built on the
              backend yet, so this cannot be undone from here. Hence the confirm. */}
          {job.status === "Published" && (
            <Button
              variant="secondary"
              loading={close.isPending}
              loadingText="Closing…"
              onClick={() => {
                if (
                  window.confirm(
                    `Close "${job.title}"? It stops appearing in candidate search and stops accepting applications. Applications already received stay in your pipeline. This cannot be undone.`,
                  )
                ) {
                  close.mutate(job.id);
                }
              }}
            >
              Close Job
            </Button>
          )}
        </div>
      </div>

      {/* Analytics tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-lg border border-border bg-card shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-content-tertiary">{t.label}</p>
              <div className={`w-9 h-9 rounded-md flex items-center justify-center ${t.accent}`}>{t.icon}</div>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-content">{t.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job info */}
        <div className="lg:col-span-1 rounded-lg border border-border bg-card shadow-sm p-5">
          <h2 className="text-base font-bold mb-3 text-content">Job Information</h2>
          <dl className="space-y-2 text-sm">
            <InfoRow label="Type" value={`${job.employmentType} · ${job.remote}`} />
            <InfoRow label="Location" value={job.location} />
            <InfoRow label="Salary" value={job.salary ?? "Not stated"} />
            <InfoRow label="Skills" value={`${job.skillCount} listed`} />
          </dl>
        </div>

        {/* Recent applicants */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-base font-bold text-content">Recent Applicants</h2>
            <Link href={`/employer/jobs/${job.id}/applicants`} className="text-xs font-bold flex items-center gap-1 text-primary-600 hover:opacity-80">
              View all {appCount} <ArrowRight size={12} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-8"><EmptyState title="No applicants yet" description="Applicants will appear here once candidates apply." /></div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recent.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary-100 text-primary-700">{a.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-content">{a.name}</p>
                    <p className="text-xs text-content-tertiary">{a.email} · {a.appliedAt}</p>
                  </div>
                  {a.match !== null && <span className="text-sm font-extrabold text-primary-600">{a.match}%</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-content-secondary">{label}</dt>
      <dd className="font-medium text-right text-content">{value}</dd>
    </div>
  );
}
