"use client";

import React from "react";
import Link from "next/link";
import { Plus, Eye, Pencil } from "lucide-react";
import { Badge } from "@/shared/components/data-display/badge";
import { EMPLOYER_JOBS, type JobStatus } from "@/features/employer/api/employer.api";

const STATUS_TONE: Record<JobStatus, "success" | "neutral" | "warning"> = {
  Published: "success", Draft: "neutral", Closed: "warning",
};

export default function EmployerJobsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content">My Jobs</h1>
          <p className="text-sm mt-1 text-content-secondary">{EMPLOYER_JOBS.length} job postings</p>
        </div>
        <Link href="/employer/jobs/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all active:scale-[0.98]">
          <Plus size={16} /> Create New Job
        </Link>
      </div>

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
              {EMPLOYER_JOBS.map((j) => (
                <tr key={j.id} className="border-t border-neutral-100 transition-colors hover:bg-primary-50">
                  <td className="px-5 py-3">
                    <Link href={`/employer/jobs/${j.id}`} className="font-semibold text-content hover:text-primary-700 transition-colors">{j.title}</Link>
                    <p className="text-xs mt-0.5 text-content-tertiary">{j.location} · {j.employmentType}</p>
                  </td>
                  <td className="px-5 py-3"><Badge tone={STATUS_TONE[j.status]}>{j.status}</Badge></td>
                  <td className="px-5 py-3 hidden sm:table-cell text-content-secondary">{j.postedAt}</td>
                  <td className="px-5 py-3 font-bold text-content">{j.applications}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/employer/jobs/${j.id}`} aria-label="View" className="p-2 rounded-md border border-border text-content-secondary transition-colors hover:bg-neutral-50"><Eye size={14} /></Link>
                      <button aria-label="Edit" className="p-2 rounded-md border border-border text-content-secondary transition-colors hover:bg-neutral-50"><Pencil size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
