"use client";

import React, { useState } from "react";
import {
  Download,
  Users,
  FileText,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/shared/components/ui/button";
import { toast } from "@/stores/toast-store";

const ACTIVITY_DATA = [
  { month: "Sep", users: 1200, applications: 3400, matches: 8500 },
  { month: "Oct", users: 1850, applications: 4800, matches: 12400 },
  { month: "Nov", users: 2400, applications: 6200, matches: 16800 },
  { month: "Dec", users: 2900, applications: 7100, matches: 19500 },
  { month: "Jan", users: 3800, applications: 9400, matches: 24200 },
  { month: "Feb", users: 4650, applications: 11800, matches: 31000 },
];

const SKILL_DISTRIBUTION = [
  { skill: "React / Next.js", count: 420 },
  { skill: "TypeScript", count: 390 },
  { skill: "Python / AI", count: 340 },
  { skill: "Node.js", count: 280 },
  { skill: "PostgreSQL", count: 240 },
  { skill: "Cloud / DevOps", count: 195 },
];

const FUNNEL_DATA = [
  { name: "Applied", value: 11800, color: "#7B2CBF" },
  { name: "Screened", value: 6400, color: "#9D4EDD" },
  { name: "Interviewed", value: 2900, color: "#3B82F6" },
  { name: "Offered", value: 840, color: "#10B981" },
  { name: "Rejected", value: 4100, color: "#EF4444" },
];

const RECENT_EXPORTS = [
  {
    id: "rep-1",
    title: "Monthly Application Funnel Report — Feb 2026",
    type: "CSV",
    size: "2.4 MB",
    generatedAt: "2026-02-16 09:30",
  },
  {
    id: "rep-2",
    title: "Skill Demand & Gap Diagnostics — Q1 2026",
    type: "PDF",
    size: "5.1 MB",
    generatedAt: "2026-02-15 14:15",
  },
  {
    id: "rep-3",
    title: "Employer Compliance & Verification Audit",
    type: "CSV",
    size: "1.2 MB",
    generatedAt: "2026-02-10 11:00",
  },
];

const TIME_RANGES = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "Year to Date"] as const;

export default function AdminReportsPage() {
  const [timeRange, setTimeRange] = useState<(typeof TIME_RANGES)[number]>("Last 30 Days");

  const handleExport = (format: "CSV" | "PDF", title?: string) => {
    const reportName = title || `Platform-Analytics-${timeRange.replace(/\s+/g, "-")}.${format.toLowerCase()}`;
    toast.success(`Export started: Downloading ${reportName}…`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content">
            Platform Reports & Analytics
          </h1>
          <p className="text-sm mt-1 text-content-secondary">
            Cross-platform health metrics, conversion funnels, and scheduled data exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-card border border-border rounded-lg p-1">
            {TIME_RANGES.map((t) => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  timeRange === t
                    ? "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300"
                    : "text-content-secondary hover:text-content"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <Button variant="primary" size="sm" onClick={() => handleExport("PDF")}>
            <Download size={14} className="mr-1.5" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* ── Key Metrics Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between text-content-tertiary">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Users</span>
            <Users size={16} />
          </div>
          <div className="text-2xl font-extrabold text-content mt-2">4,650</div>
          <div className="flex items-center gap-1 text-xs font-semibold text-success-600 mt-1">
            <ArrowUpRight size={14} />
            <span>+22.4% vs last period</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between text-content-tertiary">
            <span className="text-xs font-semibold uppercase tracking-wider">Applications</span>
            <FileText size={16} />
          </div>
          <div className="text-2xl font-extrabold text-content mt-2">11,800</div>
          <div className="flex items-center gap-1 text-xs font-semibold text-success-600 mt-1">
            <ArrowUpRight size={14} />
            <span>+18.1% vs last period</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between text-content-tertiary">
            <span className="text-xs font-semibold uppercase tracking-wider">Match Accuracy</span>
            <Sparkles size={16} />
          </div>
          <div className="text-2xl font-extrabold text-primary-600 mt-2">94.2%</div>
          <div className="flex items-center gap-1 text-xs font-semibold text-success-600 mt-1">
            <ArrowUpRight size={14} />
            <span>+3.1% algorithmic gain</span>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between text-content-tertiary">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Time-to-Offer</span>
            <Calendar size={16} />
          </div>
          <div className="text-2xl font-extrabold text-content mt-2">14.2 Days</div>
          <div className="flex items-center gap-1 text-xs font-semibold text-success-600 mt-1">
            <ArrowDownRight size={14} />
            <span>-2.8 days faster</span>
          </div>
        </div>
      </div>

      {/* ── Main Growth & Activity Chart ── */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-content">Growth & Activity Trajectory</h2>
            <p className="text-xs text-content-secondary mt-0.5">
              Monthly active seekers, applications processed, and AI match calculations
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-content-secondary">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary-600 inline-block" />
              Applications
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-400 inline-block" />
              Active Users
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ACTIVITY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7B2CBF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7B2CBF" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9D4EDD" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9D4EDD" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="month" tickLine={false} stroke="var(--color-text-tertiary)" fontSize={12} />
              <YAxis tickLine={false} stroke="var(--color-text-tertiary)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  borderColor: "var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  boxShadow: "var(--shadow-md)",
                }}
              />
              <Area
                type="monotone"
                dataKey="applications"
                stroke="#7B2CBF"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorApplications)"
              />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#9D4EDD"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Sub-Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill In-Demand Bar Chart */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
          <h2 className="text-base font-bold text-content mb-1">Most In-Demand Skills</h2>
          <p className="text-xs text-content-secondary mb-5">
            Active job posting requirements across verified companies
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={SKILL_DISTRIBUTION}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-text-tertiary)" fontSize={11} />
                <YAxis dataKey="skill" type="category" stroke="var(--color-text-secondary)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#7B2CBF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel Distribution Pie Chart */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm">
          <h2 className="text-base font-bold text-content mb-1">Application Funnel Stages</h2>
          <p className="text-xs text-content-secondary mb-5">
            Overall conversion breakdown across all candidate applications
          </p>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={FUNNEL_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {FUNNEL_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-xs text-content">{val}</span>}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Generated Reports Table ── */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-content">Available Report Downloads</h2>
            <p className="text-xs text-content-secondary mt-0.5">
              Pre-computed platform datasets and audit summaries
            </p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {RECENT_EXPORTS.map((rep) => (
            <div
              key={rep.id}
              className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {rep.type}
                </div>
                <div>
                  <div className="text-sm font-bold text-content">{rep.title}</div>
                  <div className="text-xs text-content-secondary mt-0.5">
                    {rep.size} • Generated on {rep.generatedAt}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(rep.type as "CSV" | "PDF", rep.title)}
                >
                  <Download size={13} className="mr-1" />
                  <span>Download</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
