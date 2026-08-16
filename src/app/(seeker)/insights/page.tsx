"use client";

import React from "react";
import Link from "next/link";
import {
  Send,
  CalendarCheck,
  Award,
  Eye,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
} from "lucide-react";
import {
  FunnelChart,
  Funnel,
  LabelList,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useMyStats } from "@/features/insights/hooks/use-insights";
import { useApplications } from "@/features/application/hooks/use-applications";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import { StatCard } from "@/shared/components/data-display/stat-card";
import { ApplicationsChart } from "@/features/insights/components/applications-chart";
import { SkillGapChartSection } from "@/features/insights/components/skill-gap-chart-section";
import { formatDate } from "@/shared/utils/formatters";

const pct = (fraction: number) => `${Math.round(fraction * 100)}%`;

/** Funnel step colours — primary scale from the design system. */
const FUNNEL_COLORS = ["#5A189A", "#7B2CBF", "#9D4EDD"];

export default function InsightsPage() {
  const { data: stats, isLoading, isError, error } = useMyStats();
  const { data: applications = [], isLoading: appsLoading } = useApplications();

  const funnelData = stats
    ? [
        { name: "Applications", value: stats.totalApplications, fill: FUNNEL_COLORS[0] },
        { name: "Interviews", value: stats.totalInterviews, fill: FUNNEL_COLORS[1] },
        { name: "Offers", value: stats.totalOffers, fill: FUNNEL_COLORS[2] },
      ]
    : [];

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-full"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          Insights
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Your job-search funnel and engagement at a glance.
        </p>
      </div>

      {isError && (
        <Alert variant="error">
          {error instanceof Error ? error.message : "Could not load your insights."}
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-56 rounded-lg" />
        </div>
      ) : !stats ? null : stats.totalApplications === 0 ? (
        <EmptyState
          icon={<Send size={26} />}
          title="No application data yet"
          description="Apply to a few jobs and your funnel, conversion rates, and engagement will show up here."
          action={
            <Link
              href="/jobs"
              className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all"
            >
              Browse jobs
            </Link>
          }
        />
      ) : (
        <>
          {/* ── Stat cards ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Applications"
              value={`${stats.totalApplications}`}
              icon={<Send size={18} />}
              accentColor="var(--color-primary-600)"
              accentBg="var(--color-primary-50)"
            />
            <StatCard
              label="Interviews"
              value={`${stats.totalInterviews}`}
              icon={<CalendarCheck size={18} />}
              accentColor="var(--color-info-600)"
              accentBg="var(--color-info-50)"
            />
            <StatCard
              label="Offers"
              value={`${stats.totalOffers}`}
              icon={<Award size={18} />}
              accentColor="var(--color-success-600)"
              accentBg="var(--color-success-50)"
            />
            <StatCard
              label="Profile Views"
              value={`${stats.profileViewCount}`}
              icon={<Eye size={18} />}
              accentColor="var(--color-warning-600)"
              accentBg="var(--color-warning-50)"
            />
          </div>

          {/* ── Applications over time + Funnel ──────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 2c — Applications over time chart */}
            <div
              className="lg:col-span-2 rounded-lg border p-6"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center"
                  style={{ background: "var(--color-primary-50)" }}
                >
                  <BarChart3 size={16} style={{ color: "var(--color-primary-600)" }} />
                </div>
                <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                  Applications over time
                </h2>
              </div>
              {appsLoading ? (
                <Skeleton className="h-52 rounded" />
              ) : (
                <ApplicationsChart applications={applications} />
              )}
            </div>

            {/* Conversion rates */}
            <div
              className="rounded-lg border p-6 space-y-4"
              style={{
                background: "var(--color-card)",
                borderColor: "var(--color-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center"
                  style={{ background: "var(--color-success-50)" }}
                >
                  <TrendingUp size={16} style={{ color: "var(--color-success-600)" }} />
                </div>
                <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                  Conversion Rates
                </h2>
              </div>
              <Rate label="Application → Interview" value={pct(stats.applicationRate)} />
              <Rate label="Interview → Offer" value={pct(stats.interviewRate)} />
              <Rate label="Application → Offer" value={pct(stats.offerRate)} />
              {stats.lastProfileViewDate && (
                <p
                  className="text-xs pt-2 border-t flex items-center gap-1.5"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}
                >
                  <Eye size={12} />
                  Last profile view {formatDate(stats.lastProfileViewDate)}
                </p>
              )}
            </div>
          </div>

          {/* ── 2b — Recharts Funnel chart ────────────────────────── */}
          <div
            className="rounded-lg border p-6"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center"
                style={{ background: "var(--color-primary-50)" }}
              >
                <Send size={16} style={{ color: "var(--color-primary-600)" }} />
              </div>
              <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                Application Funnel
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <FunnelChart>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: 12,
                    color: "var(--color-text-primary)",
                    boxShadow: "var(--shadow-md)",
                  }}
                  formatter={(value: number, _name: string, props: { payload?: { name?: string } }) =>
                    [`${props?.payload?.name ?? ""}: ${value}`, ""]
                  }
                />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <LabelList
                    dataKey="name"
                    position="inside"
                    style={{ fill: "#ffffff", fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif" }}
                  />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>

          {/* ── 2a — Skill-gap radar ─────────────────────────────── */}
          <SkillGapChartSection applications={applications} />

          {/* ── Salary insights — pending backend ───────────────── */}
          <div
            className="rounded-lg border p-6 flex items-center gap-3"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
              style={{ background: "var(--color-neutral-100)", color: "var(--color-text-tertiary)" }}
            >
              <DollarSign size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                Salary insights
              </h2>
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Market salary benchmarking is coming soon.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Rate({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
        {label}
      </span>
      <span className="text-lg font-extrabold" style={{ color: "var(--color-primary-600)" }}>
        {value}
      </span>
    </div>
  );
}
