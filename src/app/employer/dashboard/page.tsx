"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, Users, Target, TrendingUp, ArrowRight, DownloadCloud, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { StatCard } from "@/shared/components/data-display/stat-card";
import { Badge } from "@/shared/components/data-display/badge";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { useEmployerJobs, useEmployerApplications, useIngestJobs } from "@/features/employer/hooks/use-employer";
import { EMPLOYER_TREND_PLACEHOLDER } from "@/features/employer/api/employer.mappers";
import { ApiError } from "@/lib/api/client";

/**
 * Job ingestion control (FR-JOBS-001). Pulls external jobs from TheMuse into the
 * shared job pool and shows a run summary. Employer-managed per product decision.
 */
function JobIngestionPanel() {
  const ingest = useIngestJobs();
  const [pages, setPages] = useState(1);
  const result = ingest.data;
  const errorMsg = ingest.error
    ? ingest.error instanceof ApiError
      ? ingest.error.messages.join(" ")
      : "Ingestion failed. Please try again."
    : "";

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md flex items-center justify-center bg-primary-50 text-primary-600">
            <DownloadCloud size={16} />
          </div>
          <div>
            <h2 className="text-base font-bold text-content">Import External Jobs</h2>
            <p className="text-xs mt-0.5 text-content-tertiary">Pull live postings from TheMuse into the job board.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold text-content-secondary flex items-center gap-2">
          Pages
          <select
            value={pages}
            onChange={(e) => setPages(Number(e.target.value))}
            disabled={ingest.isPending}
            className="text-xs font-semibold rounded-md border border-border bg-bg px-2 py-1.5 outline-none cursor-pointer text-content"
          >
            {[1, 2, 3, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <button
          onClick={() => ingest.mutate(pages)}
          disabled={ingest.isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {ingest.isPending ? <><Loader2 size={13} className="animate-spin" /> Fetching…</> : <><DownloadCloud size={13} /> Fetch jobs</>}
        </button>
      </div>

      {errorMsg && (
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-error-600">
          <AlertTriangle size={13} /> {errorMsg}
        </div>
      )}

      {result && !ingest.isPending && (
        <div className="mt-4 rounded-md border border-success-100 bg-success-50 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-success-700 mb-2">
            <CheckCircle2 size={14} /> Ingestion complete
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { label: "Fetched", value: result.fetched },
              { label: "Created", value: result.created },
              { label: "Updated", value: result.updated },
              { label: "Skipped", value: result.skipped },
            ].map((s) => (
              <div key={s.label} className="rounded bg-card border border-border px-2.5 py-1.5">
                <p className="text-sm font-bold text-content leading-none">{s.value}</p>
                <p className="text-content-tertiary mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {result.errors.length > 0 && (
            <p className="text-xs text-warning-600 mt-2">{result.errors.length} error(s) during this run — see server logs.</p>
          )}
        </div>
      )}
    </div>
  );
}

const SERIES = { applications: "var(--color-primary-600)", views: "var(--color-primary-400)" };
const DOT_CLASS: Record<string, string> = { Applications: "bg-primary-600", Views: "bg-primary-400" };

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-md text-xs border border-border bg-card shadow-md">
      <p className="font-bold mb-1.5 text-content">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5 text-content-secondary">
          <span className={`w-2 h-2 rounded-full ${DOT_CLASS[p.name] ?? "bg-primary-500"}`} />
          {p.name}: <span className="font-bold text-content">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function EmployerAnalyticsPage() {
  const { data: jobs = [], isLoading } = useEmployerJobs();
  const { data: applicants = [] } = useEmployerApplications();

  const activeJobs = jobs.filter((j) => j.status === "Published").length;
  const totalApps = applicants.length;
  const scored = applicants.filter((a) => a.match > 0);
  const avgMatch = scored.length ? Math.round(scored.reduce((s, a) => s + a.match, 0) / scored.length) : null;

  const countByJob = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of applicants) m.set(a.jobId, (m.get(a.jobId) ?? 0) + 1);
    return m;
  }, [applicants]);

  const recent = applicants.slice(0, 4);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">Analytics</h1>
        <p className="text-sm mt-1 text-content-secondary">How your job postings are performing.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Jobs" value={`${activeJobs}`} change="Published & accepting" icon={<Briefcase size={18} />} accentColor="var(--color-primary-600)" accentBg="var(--color-primary-50)" href="/employer/jobs" />
        <StatCard label="Applicants" value={`${totalApps}`} change="across all roles" icon={<Users size={18} />} accentColor="var(--color-info-600)" accentBg="var(--color-info-50)" href="/employer/applications" />
        <StatCard label="Total Jobs" value={`${jobs.length}`} change="draft + published" icon={<Target size={18} />} accentColor="var(--color-success-600)" accentBg="var(--color-success-50)" href="/employer/jobs" />
        <StatCard label="Avg Match" value={avgMatch !== null ? `${avgMatch}%` : "—"} change="scored candidates" icon={<TrendingUp size={18} />} accentColor="var(--color-warning-600)" accentBg="var(--color-warning-50)" />
      </div>

      <JobIngestionPanel />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart — TODO(backend): no trend endpoint; placeholder series. */}
        <div className="xl:col-span-2 rounded-lg border border-border bg-card shadow-sm p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-content">Applications &amp; Views</h2>
              <p className="text-xs mt-0.5 text-content-tertiary">Last 7 months</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-content-tertiary">Sample</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={EMPLOYER_TREND_PLACEHOLDER} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="appsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={SERIES.applications} stopOpacity={0.14} /><stop offset="95%" stopColor={SERIES.applications} stopOpacity={0} /></linearGradient>
                <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={SERIES.views} stopOpacity={0.14} /><stop offset="95%" stopColor={SERIES.views} stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-100)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-neutral-200)" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="applications" name="Applications" stroke={SERIES.applications} strokeWidth={2} fill="url(#appsFill)" dot={{ r: 3, fill: SERIES.applications, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }} />
              <Area type="monotone" dataKey="views" name="Views" stroke={SERIES.views} strokeWidth={2} fill="url(#viewsFill)" dot={{ r: 3, fill: SERIES.views, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent applicants */}
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <h2 className="text-base font-bold text-content">Recent Applicants</h2>
            <Link href="/employer/applications" className="text-xs font-bold flex items-center gap-1 text-primary-600 hover:opacity-80">All <ArrowRight size={12} /></Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-center py-10 text-content-tertiary">No applicants yet.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recent.map((a) => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary-100 text-primary-700">{a.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate text-content">{a.name}</p>
                    <p className="text-xs text-content-tertiary truncate">{a.jobTitle} · {a.appliedAt}</p>
                  </div>
                  {a.match > 0 && <span className="text-sm font-extrabold text-primary-600">{a.match}%</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Job performance table */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-base font-bold text-content">Job Performance</h2>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 rounded" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-content-tertiary">
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Job</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Applicants</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} className="border-t border-neutral-100">
                    <td className="px-5 py-3">
                      <Link href={`/employer/jobs/${j.id}`} className="font-semibold text-content hover:text-primary-700 transition-colors">{j.title}</Link>
                    </td>
                    <td className="px-5 py-3"><Badge tone={j.statusTone}>{j.status}</Badge></td>
                    <td className="px-5 py-3 font-bold text-content">{countByJob.get(j.id) ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
