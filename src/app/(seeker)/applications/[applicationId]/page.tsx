"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Briefcase, Clock } from "lucide-react";
import {
  useApplication,
  useApplicationTimeline,
  useUpdateApplicationStatus,
} from "@/features/application/hooks/use-applications";
import { ApplicationTimeline } from "@/features/application/components/application-timeline";
import { STATUS_META } from "@/features/application/api/application.mappers";
import type { ApplicationStatus } from "@/features/application/api/application.api";
import { Badge } from "@/shared/components/data-display/badge";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { EmptyState } from "@/shared/components/data-display/empty-state";

export default function ApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { data: application, isLoading, isError, error } = useApplication(applicationId);
  const { data: timeline = [], isLoading: timelineLoading } = useApplicationTimeline(applicationId);
  const updateStatus = useUpdateApplicationStatus();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-56 rounded-lg" />
      </div>
    );
  }

  if (isError || !application) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <EmptyState
          title="Application not found"
          description={
            error instanceof Error ? error.message : "This application doesn't exist or isn't yours."
          }
          action={
            <Link
              href="/applications"
              className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200"
            >
              Back to applications
            </Link>
          }
        />
      </div>
    );
  }

  // What the candidate can actually do from this exact status, decided by the server.
  // Absent on an older backend, which degrades to "no actions" rather than to a menu of
  // choices that will be refused.
  const actions = application.availableActions ?? [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6" style={{ background: "var(--color-bg-secondary)" }}>
      <Link
        href="/applications"
        className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
        style={{ color: "var(--color-text-secondary)" }}
      >
        <ArrowLeft size={15} /> All applications
      </Link>

      {/* Header */}
      <div
        className="p-6 rounded-lg border"
        style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
      >
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
            style={{ background: application.logoBg }}
          >
            {application.logo}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                {application.jobTitle}
              </h1>
              <Badge tone={application.statusMeta.tone} dot className="shrink-0">
                {application.statusMeta.label}
              </Badge>
            </div>
            <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
              {application.company} · {application.location}
            </p>
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                <Clock size={13} /> {application.appliedLabel}
              </span>
              <Link
                href={`/jobs/${application.jobId}`}
                className="flex items-center gap-1.5 text-xs font-semibold hover:underline"
                style={{ color: "var(--color-primary-600)" }}
              >
                <Briefcase size={13} /> View job posting
              </Link>
            </div>
          </div>
        </div>

        {/* Candidate actions — NOT a status picker. The employer owns the stage. */}
        <div className="mt-5 pt-4 border-t flex flex-wrap items-center gap-3" style={{ borderColor: "var(--color-border)" }}>
          {/* Driven by the server's availableActions: what is reachable from this exact
              status AND the candidate's to decide. A fixed list offered choices that all
              answered "Invalid status transition" once the application reached a stage
              they cannot act on. */}
          {actions.length > 0 ? (
            <>
              <label className="text-xs font-semibold" style={{ color: "var(--color-text-secondary)" }}>
                Your options
              </label>
              <select
                value=""
                disabled={updateStatus.isPending}
                onChange={(e) => {
                  if (!e.target.value) return;
                  updateStatus.mutate({
                    id: application.id,
                    newStatus: e.target.value as ApplicationStatus,
                  });
                }}
                className="text-xs font-semibold rounded-md border px-2.5 py-1.5 outline-none cursor-pointer disabled:opacity-50"
                style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text-primary)" }}
              >
                <option value="">Choose an action…</option>
                {actions.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                The employer moves your application through screening, interview and offer.
              </span>
            </>
          ) : (
            // Nothing to do is a real state, not an error — say so instead of showing a
            // menu where every choice fails.
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              This application is {STATUS_META[application.status].label.toLowerCase()} — there&apos;s nothing left to do here.
            </span>
          )}
          {updateStatus.isPending && (
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Saving…</span>
          )}
          {updateStatus.isError && (
            <span className="text-xs" style={{ color: "var(--color-error-600)" }}>
              {updateStatus.error instanceof Error ? updateStatus.error.message : "Update failed"}
            </span>
          )}
        </div>
      </div>

      <div>
        {/* Timeline */}
        <div
          className="p-6 rounded-lg border"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <h2 className="text-sm font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
            Timeline
          </h2>
          <ApplicationTimeline entries={timeline} loading={timelineLoading} />
        </div>
      </div>
    </div>
  );
}
