"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, Users, Target, TrendingUp, ArrowRight } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { StatCard } from "@/shared/components/data-display/stat-card";
import { Badge } from "@/shared/components/data-display/badge";
import { EMPLOYER_JOBS, APPLICANTS, EMPLOYER_TREND } from "@/features/employer/api/employer.api";

/* Recharts consumes color strings (not Tailwind classes) for stroke/fill. */
const SERIES = { applications: "var(--color-primary-600)", views: "var(--color-primary-400)" };
/* Tailwind dot classes for the tooltip legend, keyed by series name. */
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
  const activeJobs = EMPLOYER_JOBS.filter((j) => j.status === "Published").length;
  const totalApps = EMPLOYER_JOBS.reduce((sum, j) => sum + j.applications, 0);
  const totalViews = EMPLOYER_JOBS.reduce((sum, j) => sum + j.views, 0);
  const applyRate = totalViews ? ((totalApps / totalViews) * 100).toFixed(1) : "0";
  const recent = [...APPLICANTS].slice(0, 4);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">Analytics</h1>
        <p className="text-sm mt-1 text-content-secondary">How your job postings are performing.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Jobs" value={`${activeJobs}`} hint="Published & accepting" icon={<Briefcase size={18} />} accent="bg-primary-50 text-primary-600" href="/employer/jobs" />
        <StatCard label="Applicants" value={`${totalApps}`} hint="+4 today" trend="up" icon={<Users size={18} />} accent="bg-info-50 text-info-600" href="/employer/applications" />
        <StatCard label="Apply Rate" value={`${applyRate}%`} hint="views → applies" icon={<Target size={18} />} accent="bg-success-50 text-success-600" />
        <StatCard label="Avg Match" value="80%" hint="across all roles" trend="up" icon={<TrendingUp size={18} />} accent="bg-warning-50 text-warning-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="xl:col-span-2 rounded-lg border border-border bg-card shadow-sm p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-content">Applications & Views</h2>
            <p className="text-xs mt-0.5 text-content-tertiary">Last 7 months</p>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={EMPLOYER_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
          <div className="divide-y divide-neutral-100">
            {recent.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-primary-100 text-primary-700">{a.initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-content">{a.name}</p>
                  <p className="text-xs text-content-tertiary">{a.appliedAt}</p>
                </div>
                <span className="text-sm font-extrabold text-primary-600">{a.match}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job performance table */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-base font-bold text-content">Job Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-content-tertiary">
                <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Job</th>
                <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Status</th>
                <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Views</th>
                <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Applicants</th>
              </tr>
            </thead>
            <tbody>
              {EMPLOYER_JOBS.map((j) => (
                <tr key={j.id} className="border-t border-neutral-100">
                  <td className="px-5 py-3">
                    <Link href={`/employer/jobs/${j.id}`} className="font-semibold text-content hover:text-primary-700 transition-colors">{j.title}</Link>
                  </td>
                  <td className="px-5 py-3"><Badge tone={j.status === "Published" ? "success" : j.status === "Draft" ? "neutral" : "warning"}>{j.status}</Badge></td>
                  <td className="px-5 py-3 hidden sm:table-cell text-content-secondary">{j.views}</td>
                  <td className="px-5 py-3 font-bold text-content">{j.applications}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
