"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BadgeDollarSign, Sparkles } from "lucide-react";
import { Badge } from "@/shared/components/data-display/badge";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { useEmployerApplications } from "@/features/employer/hooks/use-employer";
import { STAGE_TONE } from "@/features/employer/api/employer.mappers";
import { MakeOfferModal } from "@/features/employer/components/make-offer-modal";

export default function JobApplicantsPage() {
  const params = useParams<{ jobId: string }>();
  const { data: applicants = [], isLoading } = useEmployerApplications(params.jobId);
  const jobTitle = applicants[0]?.jobTitle ?? "Job";
  const [offerFor, setOfferFor] = useState<{ id: string; name: string } | null>(null);
  const aiExtracted = applicants.some((a) => a.requirementsSource === "AI_EXTRACTED");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      <Link href={`/employer/jobs/${params.jobId}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 transition-colors hover:underline">
        <ArrowLeft size={15} /> Back to Job
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">Applicants</h1>
        <p className="text-sm mt-1 text-content-secondary">
          {jobTitle} · {applicants.length} candidates · ranked by requirements met
        </p>
        {/* The employer is judging candidates against these requirements, so they are
            entitled to know the requirements were read out of their job description by
            AI rather than written by them. */}
        {aiExtracted && (
          <p className="text-xs mt-1.5 inline-flex items-start gap-1.5 text-content-tertiary">
            <Sparkles size={12} className="shrink-0 mt-0.5" />
            This job had no requirements list, so candidates were screened against
            requirements AI read from the description.
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
      ) : applicants.length === 0 ? (
        <EmptyState title="No applicants yet" description="Candidates who apply to this role will show up here." />
      ) : (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-content-tertiary">
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Candidate</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Requirements met</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Match</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Stage</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Applied</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a) => (
                  <tr key={a.id} className="border-t border-neutral-100 transition-colors hover:bg-primary-50">
                    <td className="px-5 py-3 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary-100 text-primary-700">{a.initials}</div>
                        <div>
                          <p className="font-semibold text-content">{a.name}</p>
                          <p className="text-xs text-content-tertiary">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* The ranking signal, and the reason behind it. An employer can
                        act on "missing Docker, CI/CD"; they cannot act on a bare score. */}
                    <td className="px-5 py-3 align-top">
                      {a.screened ? (
                        <>
                          <span className="font-bold text-content">
                            {a.requirementsCovered} of {a.requirementsTotal}
                          </span>
                          {a.missing.length > 0 && (
                            <ul className="mt-1 space-y-0.5">
                              {a.missing.slice(0, 3).map((m, i) => (
                                <li key={i} className="text-xs text-content-tertiary">
                                  ✗ {m.length > 58 ? `${m.slice(0, 58)}…` : m}
                                </li>
                              ))}
                              {a.missing.length > 3 && (
                                <li className="text-xs text-content-tertiary">
                                  + {a.missing.length - 3} more
                                </li>
                              )}
                            </ul>
                          )}
                        </>
                      ) : (
                        // Never render "0 of 0" — an unscreened candidate is unknown,
                        // not unqualified.
                        <span className="text-xs text-content-tertiary">Not screened</span>
                      )}
                    </td>
                    <td className="px-5 py-3 align-top font-extrabold text-primary-600">
                      {a.match !== null ? `${a.match}%` : "—"}
                    </td>
                    <td className="px-5 py-3 align-top"><Badge tone={STAGE_TONE[a.stage]}>{a.stage}</Badge></td>
                    <td className="px-5 py-3 align-top hidden sm:table-cell text-content-tertiary">{a.appliedAt}</td>
                    <td className="px-5 py-3 align-top text-right">
                      {a.stage !== "Rejected" && a.stage !== "Hired" && (
                        <button
                          onClick={() => setOfferFor({ id: a.id, name: a.name })}
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md border border-border text-primary-600 transition-colors hover:bg-primary-50"
                        >
                          <BadgeDollarSign size={13} /> {a.stage === "Offer" ? "Edit offer" : "Make offer"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <MakeOfferModal
        open={offerFor !== null}
        onClose={() => setOfferFor(null)}
        applicationId={offerFor?.id ?? ""}
        candidateName={offerFor?.name ?? ""}
      />
    </div>
  );
}
