"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { List, LayoutGrid, FileText, Search } from "lucide-react";
import { useApplications } from "@/features/application/hooks/use-applications";
import { ApplicationCard } from "@/features/application/components/application-card";
import { ApplicationKanban } from "@/features/application/components/application-kanban";
import { STATUS_META } from "@/features/application/api/application.mappers";
import type { ApplicationStatus } from "@/features/application/api/application.api";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";

type StatusFilter = ApplicationStatus | "ALL";

export default function ApplicationsPage() {
  const { data: applications = [], isLoading, isError, error } = useApplications();
  const [view, setView] = useState<"list" | "board">("list");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const filtered = useMemo(
    () =>
      statusFilter === "ALL"
        ? applications
        : applications.filter((a) => a.status === statusFilter),
    [applications, statusFilter],
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 min-h-full" style={{ background: "var(--color-bg-secondary)" }}>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            My Applications
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {applications.length > 0
              ? `Tracking ${applications.length} application${applications.length === 1 ? "" : "s"}`
              : "Track every job you apply to in one place"}
          </p>
        </div>

        {/* View toggle */}
        <div className="flex rounded-md border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
          {([["list", List], ["board", LayoutGrid]] as const).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              aria-label={`${mode} view`}
              className="p-2 transition-colors"
              style={{
                background: view === mode ? "var(--color-primary-50)" : "var(--color-bg)",
                color: view === mode ? "var(--color-primary-600)" : "var(--color-text-tertiary)",
              }}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <Alert variant="error">
          {error instanceof Error ? error.message : "Could not load your applications."}
        </Alert>
      )}

      {/* Status filter (list view only) */}
      {view === "list" && !isLoading && applications.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {(["ALL", "SUBMITTED", "SCREENING", "INTERVIEW", "OFFER", "ACCEPTED", "REJECTED"] as StatusFilter[]).map(
            (s) => {
              const active = statusFilter === s;
              const label = s === "ALL" ? "All" : STATUS_META[s].label;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className="px-3 py-1 rounded-full text-xs font-semibold border transition-colors"
                  style={
                    active
                      ? { background: "var(--color-primary-600)", color: "var(--color-text-on-primary)", borderColor: "var(--color-primary-600)" }
                      : { background: "var(--color-bg)", color: "var(--color-text-secondary)", borderColor: "var(--color-border)" }
                  }
                >
                  {label}
                </button>
              );
            },
          )}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={<FileText size={26} />}
          title="No applications yet"
          description="When you apply to a job, it will show up here so you can track its progress."
          action={
            <Link
              href="/jobs"
              className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 inline-flex items-center gap-1.5"
            >
              <Search size={14} /> Browse jobs
            </Link>
          }
        />
      ) : view === "board" ? (
        <ApplicationKanban applications={applications} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={26} />}
          title="No applications in this stage"
          description="Try a different status filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  );
}
