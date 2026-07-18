"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/shared/utils/cn";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import {
  useEmployerApplications,
  useEmployerJobs,
  useUpdateApplicantStatus,
} from "@/features/employer/hooks/use-employer";
import {
  STAGE_TO_STATUS,
  type ApplicantView,
  type ApplicationStage,
} from "@/features/employer/api/employer.mappers";

/* Board stages (Rejected is handled outside the pipeline). */
const STAGES: ApplicationStage[] = ["Applied", "Interview", "Offer", "Hired"];
const STAGE_DOT: Record<ApplicationStage, string> = {
  Applied: "bg-info-500",
  Interview: "bg-primary-500",
  Offer: "bg-warning-500",
  Hired: "bg-success-500",
  Rejected: "bg-error-500",
};

export default function ApplicationsKanbanPage() {
  const { data: applicants = [], isLoading } = useEmployerApplications();
  const { data: jobs = [] } = useEmployerJobs();
  const updateStatus = useUpdateApplicantStatus();

  const [jobFilter, setJobFilter] = useState<string>("all");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<ApplicationStage | null>(null);

  const visible = useMemo(
    () =>
      applicants
        .filter((a) => a.stage !== "Rejected")
        .filter((a) => (jobFilter === "all" ? true : a.jobId === jobFilter)),
    [applicants, jobFilter],
  );

  const byStage = (stage: ApplicationStage) => visible.filter((a: ApplicantView) => a.stage === stage);

  const drop = (stage: ApplicationStage) => {
    const id = dragId;
    setDragId(null);
    setOverStage(null);
    if (!id) return;
    const card = applicants.find((a) => a.id === id);
    if (!card || card.stage === stage) return;
    updateStatus.mutate({ id, newStatus: STAGE_TO_STATUS[stage] });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content">Applications</h1>
          <p className="text-sm mt-1 text-content-secondary">Drag candidates between stages to update their status.</p>
        </div>
        <select
          value={jobFilter}
          onChange={(e) => setJobFilter(e.target.value)}
          className="text-sm font-semibold rounded-md border border-border bg-card text-content px-3 py-2 outline-none cursor-pointer"
        >
          <option value="all">All Jobs</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {STAGES.map((s) => <Skeleton key={s} className="h-40 rounded-lg" />)}
        </div>
      ) : applicants.length === 0 ? (
        <EmptyState title="No applications yet" description="Candidates who apply to your jobs will appear here." />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-4">
          {STAGES.map((stage) => {
            const cards = byStage(stage);
            const isOver = overStage === stage;
            return (
              <div
                key={stage}
                onDragOver={(e) => { e.preventDefault(); setOverStage(stage); }}
                onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
                onDrop={() => drop(stage)}
                className={cn(
                  "shrink-0 w-72 lg:w-auto rounded-lg border p-3 transition-colors",
                  isOver ? "bg-primary-50 border-primary-200" : "bg-background-secondary border-border",
                )}
              >
                <div className="flex items-center gap-2 px-1 pb-3">
                  <span className={`w-2 h-2 rounded-full ${STAGE_DOT[stage]}`} />
                  <h2 className="text-sm font-bold text-content">{stage}</h2>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-neutral-100 text-content-tertiary">{cards.length}</span>
                </div>

                <div className="space-y-2 min-h-16">
                  {cards.map((a) => (
                    <div
                      key={a.id}
                      draggable
                      onDragStart={() => setDragId(a.id)}
                      onDragEnd={() => { setDragId(null); setOverStage(null); }}
                      className={cn(
                        "rounded-lg border border-border bg-card shadow-sm p-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md",
                        dragId === a.id && "opacity-50",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary-100 text-primary-700">{a.initials}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate text-content">{a.name}</p>
                          <p className="text-xs text-content-tertiary truncate">{a.jobTitle}</p>
                        </div>
                        {a.match > 0 && <span className="text-sm font-extrabold shrink-0 text-primary-600">{a.match}%</span>}
                      </div>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <p className="text-xs text-center py-6 text-content-disabled">Drop candidates here</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
