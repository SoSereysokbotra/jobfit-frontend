"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Eye, Users, Target, Star, MapPin, DollarSign, ArrowRight } from "lucide-react";
import { Badge } from "@/shared/components/data-display/badge";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { jobById, APPLICANTS } from "@/features/employer/api/employer.api";

export default function EmployerJobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const job = jobById(params.jobId);

  if (!job) {
    return (
      <div className="p-8">
        <EmptyState title="Job not found" description="This posting may have been removed." action={
          <Link href="/employer/jobs" className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all">Back to Jobs</Link>
        } />
      </div>
    );
  }

  const applicants = APPLICANTS.filter((a) => a.jobId === job.id).slice(0, 3);
  const applyRate = job.views ? ((job.applications / job.views) * 100).toFixed(1) : "0";

  const tiles = [
    { label: "Views", value: `${job.views}`, icon: <Eye size={18} />, accent: "bg-info-50 text-info-600" },
    { label: "Applications", value: `${job.applications}`, icon: <Users size={18} />, accent: "bg-primary-50 text-primary-600" },
    { label: "Apply Rate", value: `${applyRate}%`, icon: <Target size={18} />, accent: "bg-success-50 text-success-600" },
    { label: "Avg Match", value: `${job.avgMatch}%`, icon: <Star size={18} />, accent: "bg-warning-50 text-warning-600" },
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
            <Badge tone={job.status === "Published" ? "success" : job.status === "Draft" ? "neutral" : "warning"}>{job.status}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-content-tertiary">
            <span className="flex items-center gap-1"><MapPin size={13} /> {job.location}</span>
            <span className="flex items-center gap-1 text-success-600"><DollarSign size={13} /> ${job.salaryMin}K – ${job.salaryMax}K</span>
            <span>Posted {job.postedAt}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-md text-sm font-bold border border-border bg-background text-content transition-colors hover:bg-neutral-50">Edit</button>
          <button className="px-4 py-2 rounded-md text-sm font-bold border border-border bg-background text-warning-600 transition-colors hover:bg-neutral-50">Close Job</button>
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
            <InfoRow label="Salary" value={`$${job.salaryMin}K – $${job.salaryMax}K`} />
          </dl>
          <p className="text-xs font-bold uppercase tracking-wider mt-4 mb-2 text-content-tertiary">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {job.skills.map((s) => (
              <span key={s} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-700">{s}</span>
            ))}
          </div>
        </div>

        {/* Recent applicants */}
        <div className="lg:col-span-2 rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-base font-bold text-content">Recent Applicants</h2>
            <Link href={`/employer/jobs/${job.id}/applicants`} className="text-xs font-bold flex items-center gap-1 text-primary-600 hover:opacity-80">
              View all {job.applications} <ArrowRight size={12} />
            </Link>
          </div>
          {applicants.length === 0 ? (
            <div className="p-8"><EmptyState title="No applicants yet" description="Applicants will appear here once candidates apply." /></div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {applicants.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary-100 text-primary-700">{a.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-content">{a.name}</p>
                    <p className="text-xs text-content-tertiary">{a.location} · {a.appliedAt}</p>
                  </div>
                  <span className="text-sm font-extrabold text-primary-600">{a.match}%</span>
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
