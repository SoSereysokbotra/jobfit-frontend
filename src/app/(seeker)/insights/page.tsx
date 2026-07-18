"use client";

import React from "react";
import Link from "next/link";
import { Send, CalendarCheck, Award, Eye, TrendingUp, DollarSign } from "lucide-react";
import { useMyStats } from "@/features/insights/hooks/use-insights";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";

const pct = (fraction: number) => `${Math.round(fraction * 100)}%`;

export default function InsightsPage() {
  const { data: stats, isLoading, isError, error } = useMyStats();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-full" style={{ background: "var(--color-bg-secondary)" }}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Insights
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Your job-search funnel and engagement at a glance.
        </p>
      </div>

      {isError && <Alert variant="error">{error instanceof Error ? error.message : "Could not load your insights."}</Alert>}

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)}</div>
          <Skeleton className="h-56 rounded-lg" />
        </div>
      ) : !stats ? null : stats.totalApplications === 0 ? (
        <EmptyState
          icon={<Send size={26} />}
          title="No application data yet"
          description="Apply to a few jobs and your funnel, conversion rates, and engagement will show up here."
          action={
            <Link href="/jobs" className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all">
              Browse jobs
            </Link>
          }
        />
      ) : (
        <>
          {/* Funnel counts */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Tile label="Applications" value={stats.totalApplications} icon={<Send size={18} />} accent="var(--color-primary-600)" bg="var(--color-primary-50)" />
            <Tile label="Interviews" value={stats.totalInterviews} icon={<CalendarCheck size={18} />} accent="var(--color-info-600)" bg="var(--color-info-50)" />
            <Tile label="Offers" value={stats.totalOffers} icon={<Award size={18} />} accent="var(--color-success-600)" bg="var(--color-success-50)" />
            <Tile label="Profile Views" value={stats.profileViewCount} icon={<Eye size={18} />} accent="var(--color-warning-600)" bg="var(--color-warning-50)" />
          </div>

          {/* Funnel + conversion */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              className="lg:col-span-2 rounded-lg border p-6"
              style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
            >
              <h2 className="text-base font-bold mb-5" style={{ color: "var(--color-text-primary)" }}>Application Funnel</h2>
              <FunnelBar label="Applications" value={stats.totalApplications} max={stats.totalApplications} color="var(--color-primary-500)" />
              <FunnelBar label="Interviews" value={stats.totalInterviews} max={stats.totalApplications} color="var(--color-info-500)" />
              <FunnelBar label="Offers" value={stats.totalOffers} max={stats.totalApplications} color="var(--color-success-500)" />
            </div>

            <div
              className="rounded-lg border p-6 space-y-4"
              style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
            >
              <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>Conversion Rates</h2>
              <Rate label="Application → Interview" value={pct(stats.applicationRate)} />
              <Rate label="Interview → Offer" value={pct(stats.interviewRate)} />
              <Rate label="Application → Offer" value={pct(stats.offerRate)} />
              {stats.lastProfileViewDate && (
                <p className="text-xs pt-2 border-t flex items-center gap-1.5" style={{ borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}>
                  <TrendingUp size={12} /> Last profile view {new Date(stats.lastProfileViewDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Salary insights — TODO(backend): no salary-insights endpoint (Phase 10). */}
          <div
            className="rounded-lg border p-6 flex items-center gap-3"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0" style={{ background: "var(--color-neutral-100)", color: "var(--color-text-tertiary)" }}>
              <DollarSign size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>Salary insights</h2>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Market salary benchmarking is coming soon.</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Tile({ label, value, icon, accent, bg }: { label: string; value: number; icon: React.ReactNode; accent: string; bg: string }) {
  return (
    <div className="rounded-lg border p-5" style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>{label}</p>
        <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: bg, color: accent }}>{icon}</div>
      </div>
      <p className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>{value}</p>
    </div>
  );
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
        <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{value}</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--color-neutral-100)" }}>
        <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${percent}%`, background: color }} />
      </div>
    </div>
  );
}

function Rate({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      <span className="text-lg font-extrabold" style={{ color: "var(--color-primary-600)" }}>{value}</span>
    </div>
  );
}
