"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Badge, type BadgeTone } from "@/shared/components/data-display/badge";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { jobById, APPLICANTS, type ApplicationStage } from "@/features/employer/api/employer.api";

const STAGE_TONE: Record<ApplicationStage, BadgeTone> = {
  Applied: "info", Interview: "primary", Offer: "warning", Hired: "success", Rejected: "error",
};

export default function JobApplicantsPage() {
  const params = useParams<{ jobId: string }>();
  const job = jobById(params.jobId);
  const applicants = APPLICANTS.filter((a) => a.jobId === params.jobId);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      <Link href={`/employer/jobs/${params.jobId}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:underline">
        <ArrowLeft size={15} /> Back to Job
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">Applicants</h1>
        <p className="text-sm mt-1 text-content-secondary">{job ? job.title : "Job"} · {applicants.length} candidates</p>
      </div>

      {applicants.length === 0 ? (
        <EmptyState title="No applicants yet" description="Candidates who apply to this role will show up here." />
      ) : (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-content-tertiary">
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Candidate</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Match</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Stage</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Applied</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a) => (
                  <tr key={a.id} className="border-t border-neutral-100 transition-colors hover:bg-primary-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary-100 text-primary-700">{a.initials}</div>
                        <div>
                          <p className="font-semibold text-content">{a.name}</p>
                          <p className="text-xs text-content-tertiary">{a.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-extrabold text-primary-600">{a.match}%</td>
                    <td className="px-5 py-3"><Badge tone={STAGE_TONE[a.stage]}>{a.stage}</Badge></td>
                    <td className="px-5 py-3 hidden sm:table-cell text-content-tertiary">{a.appliedAt}</td>
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
