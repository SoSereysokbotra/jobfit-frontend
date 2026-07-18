"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase, Calendar, Award, Target, TrendingUp,
  CheckCircle2, Eye, Star, ArrowRight, Search, Upload,
  BarChart3, Zap, Clock, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { JobCard } from "@/features/job/components";
import { MOCK_JOBS } from "@/features/job/api/job.api";
import { useSession, displayName } from "@/features/auth/hooks/use-session";
import { StatCard } from "@/shared/components/data-display/stat-card";

/* ─── CHART SERIES COLORS ───────────────────────────────────────
   Categorical pair from the brand ramp (primary-600 + primary-400).
   CVD-validated: worst adjacent ΔE 20.7 (protan) on white surface. */
const SERIES = {
  applications: "var(--color-primary-600)",
  interviews: "var(--color-primary-400)",
};

/* ─── MOCK DATA ─────────────────────────────────────────────── */
const applicationTrendData = [
  { month: "Jan", applications: 4, interviews: 1 },
  { month: "Feb", applications: 7, interviews: 2 },
  { month: "Mar", applications: 12, interviews: 4 },
  { month: "Apr", applications: 9, interviews: 3 },
  { month: "May", applications: 15, interviews: 5 },
  { month: "Jun", applications: 18, interviews: 7 },
  { month: "Jul", applications: 22, interviews: 9 },
];

const recentActivity = [
  {
    icon: <Eye size={15} />,
    text: "Stripe viewed your application",
    sub: "Senior Frontend Engineer",
    time: "2 hours ago",
    color: "var(--color-info-500)",
    bg: "var(--color-info-50)",
  },
  {
    icon: <CheckCircle2 size={15} />,
    text: "Applied to TechCorp",
    sub: "Senior Software Engineer",
    time: "5 hours ago",
    color: "var(--color-success-500)",
    bg: "var(--color-success-50)",
  },
  {
    icon: <Star size={15} />,
    text: "20 new job recommendations",
    sub: "Matching your profile",
    time: "1 day ago",
    color: "var(--color-primary-500)",
    bg: "var(--color-primary-50)",
  },
  {
    icon: <Calendar size={15} />,
    text: "Interview scheduled",
    sub: "CloudBase — Tomorrow 2:00 PM",
    time: "2 days ago",
    color: "var(--color-warning-500)",
    bg: "var(--color-warning-50)",
  },
  {
    icon: <TrendingUp size={15} />,
    text: "Profile score increased to 75%",
    sub: "Add education to reach 90%",
    time: "3 days ago",
    color: "var(--color-success-600)",
    bg: "var(--color-success-50)",
  },
];

/* Top 3 matches come from the shared job dataset — same source as /jobs. */
const topMatches = [...MOCK_JOBS].sort((a, b) => b.match - a.match).slice(0, 3);

const profileChecklist = [
  { label: "Basic Info", done: true },
  { label: "Resume Uploaded", done: true },
  { label: "Skills Added", done: true },
  { label: "Education", done: false },
  { label: "Cover Letter", done: false },
];

const quickActions = [
  { icon: <Search size={20} />, label: "Search Jobs", href: "/jobs", color: "var(--color-info-600)", bg: "var(--color-info-50)" },
  { icon: <Upload size={20} />, label: "Upload Resume", href: "/resumes", color: "var(--color-primary-600)", bg: "var(--color-primary-50)" },
  { icon: <Star size={20} />, label: "View Matches", href: "/recommendations", color: "var(--color-warning-600)", bg: "var(--color-warning-50)" },
  { icon: <BarChart3 size={20} />, label: "Career Insights", href: "/insights", color: "var(--color-success-600)", bg: "var(--color-success-50)" },
];

const upcomingInterviews = [
  {
    company: "CloudBase",
    role: "DevOps Lead",
    date: "Tomorrow",
    time: "2:00 PM PT",
    type: "Video Interview",
  },
];

/* ─── CHART TOOLTIP ─────────────────────────────────────────────
   Values wear text tokens; a colored chip beside them carries
   series identity (never colored text). */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-md text-xs border"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <p className="font-bold mb-1.5" style={{ color: "var(--color-text-primary)" }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5" style={{ color: "var(--color-text-secondary)" }}>
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <span className="font-bold" style={{ color: "var(--color-text-primary)" }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
}

/* ─── SECTION CARD ──────────────────────────────────────────── */
function SectionCard({
  title, subtitle, action, children, headerIcon, flush = false,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  headerIcon?: React.ReactNode;
  children: React.ReactNode;
  /** Remove body padding (for list rows that span full width). */
  flush?: boolean;
}) {
  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--color-neutral-100)" }}>
        <div className="flex items-center gap-3">
          {headerIcon}
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</h2>
            {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className={flush ? "" : "p-5"}>{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE ROOT
   ═══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Personalize the greeting from the real session (GET /auth/me). `name` is
  // optional at registration, so fall back to a neutral greeting.
  const { user } = useSession();
  const firstName = displayName(user).firstName || "there";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-full" style={{ background: "var(--color-bg-secondary)" }}>

      {/* ── WELCOME BANNER ────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-700) 60%, var(--color-primary-600) 100%)" }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-10"
          style={{ background: "var(--color-primary-300)", filter: "blur(60px)" }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-10"
          style={{ background: "var(--color-primary-200)", filter: "blur(50px)" }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-on-primary-muted uppercase tracking-wider mb-1">{today}</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-primary tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="text-sm text-on-primary-muted mt-1.5">
              You have <span className="text-on-primary font-bold">2 upcoming interviews</span> and{" "}
              <span className="text-on-primary font-bold">20 new matches</span> waiting for you.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                href="/recommendations"
                className="px-4 py-2 rounded-md text-xs font-bold bg-on-primary text-primary-800 hover:bg-primary-50 transition-all duration-200 active:scale-[0.98] inline-flex items-center gap-1.5"
              >
                <Star size={13} /> View New Matches
              </Link>
              <Link
                href="/applications"
                className="px-4 py-2 rounded-md text-xs font-bold text-on-primary border border-on-primary-border hover:bg-on-primary-surface transition-all duration-200 active:scale-[0.98] inline-flex items-center gap-1.5"
              >
                <Briefcase size={13} /> Track Applications
              </Link>
            </div>
          </div>

          {/* Profile completeness */}
          <div className="sm:shrink-0 flex items-center gap-4 rounded-xl px-5 py-4 bg-on-primary-surface border border-on-primary-border backdrop-blur-sm">
            <div className="relative w-14 h-14">
              <svg width={56} height={56} className="-rotate-90" viewBox="0 0 56 56">
                <circle cx={28} cy={28} r={22} fill="none" stroke="var(--color-border-on-primary)" strokeWidth={6} />
                <circle
                  cx={28} cy={28} r={22} fill="none" stroke="var(--color-text-on-primary)" strokeWidth={6}
                  strokeDasharray={`${(75 / 100) * 2 * Math.PI * 22} ${2 * Math.PI * 22}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-on-primary font-extrabold text-sm">75%</span>
            </div>
            <div>
              <p className="text-on-primary font-bold text-sm">Profile Score</p>
              <p className="text-on-primary-muted text-xs mt-0.5">Add education to reach 90%</p>
              <Link
                href="/profile"
                className="text-xs font-bold text-on-primary-muted hover:text-on-primary mt-1 inline-flex items-center gap-1 transition-colors"
              >
                Complete profile <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ROW ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Applications"
          value="15"
          change="+3 this week"
          changeUp
          icon={<Briefcase size={18} />}
          accentColor="var(--color-primary-600)"
          accentBg="var(--color-primary-50)"
          href="/applications"
        />
        <StatCard
          label="Interviews"
          value="2"
          change="Next: Tomorrow, 2:00 PM"
          icon={<Calendar size={18} />}
          accentColor="var(--color-info-600)"
          accentBg="var(--color-info-50)"
          href="/learning"
        />
        <StatCard
          label="Offers"
          value="1"
          change="Respond by Jun 30"
          icon={<Award size={18} />}
          accentColor="var(--color-success-600)"
          accentBg="var(--color-success-50)"
          href="/offers"
        />
        <StatCard
          label="Saved Jobs"
          value="34"
          change="+12 from last week"
          changeUp
          icon={<Target size={18} />}
          accentColor="var(--color-warning-600)"
          accentBg="var(--color-warning-50)"
          href="/saved-jobs"
        />
      </div>

      {/* ── MAIN 2-COLUMN GRID ────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT COLUMN (2/3) */}
        <div className="xl:col-span-2 space-y-6">

          {/* Application Trend Chart */}
          <SectionCard
            title="Application Activity"
            subtitle="Applications & interviews over the last 7 months"
            action={
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "var(--color-primary-50)", color: "var(--color-primary-700)" }}
              >
                Last 7 months
              </span>
            }
          >
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={applicationTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SERIES.applications} stopOpacity={0.14} />
                    <stop offset="95%" stopColor={SERIES.applications} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={SERIES.interviews} stopOpacity={0.14} />
                    <stop offset="95%" stopColor={SERIES.interviews} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-100)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-neutral-200)", strokeWidth: 1 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone" dataKey="applications" name="Applications"
                  stroke={SERIES.applications} strokeWidth={2} fill="url(#colorApps)"
                  dot={{ r: 3, fill: SERIES.applications, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }}
                />
                <Area
                  type="monotone" dataKey="interviews" name="Interviews"
                  stroke={SERIES.interviews} strokeWidth={2} fill="url(#colorInterviews)"
                  dot={{ r: 3, fill: SERIES.interviews, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* Top Job Matches */}
          <SectionCard
            title="Top Job Matches"
            subtitle="AI-curated matches for your profile"
            flush
            action={
              <Link
                href="/recommendations"
                className="text-xs font-bold flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color: "var(--color-primary-600)" }}
              >
                View all <ArrowRight size={13} />
              </Link>
            }
          >
            <div className="divide-y" style={{ borderColor: "var(--color-neutral-100)" }}>
              {topMatches.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="list"
                  compact
                  saved={savedIds.has(job.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          </SectionCard>

          {/* Upcoming Interviews */}
          {upcomingInterviews.length > 0 && (
            <SectionCard
              title="Upcoming Interviews"
              headerIcon={
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center"
                  style={{ background: "var(--color-info-50)", color: "var(--color-info-600)" }}
                >
                  <Calendar size={16} />
                </div>
              }
            >
              {upcomingInterviews.map((iv) => (
                <div
                  key={iv.company}
                  className="p-4 rounded-lg border-l-4"
                  style={{ background: "var(--color-info-50)", borderLeftColor: "var(--color-info-500)" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: "var(--color-info-100)", color: "var(--color-info-600)" }}
                    >
                      {iv.type} — {iv.date}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                      <Clock size={11} /> {iv.time}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm mt-2" style={{ color: "var(--color-text-primary)" }}>{iv.company}</h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{iv.role}</p>
                  <div className="flex gap-2 mt-3">
                    <Link
                      href="/learning"
                      className="px-4 py-1.5 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 active:scale-95"
                    >
                      Prep for Interview
                    </Link>
                    <button className="px-4 py-1.5 rounded-md text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all duration-200 active:scale-95 bg-white">
                      Add to Calendar
                    </button>
                  </div>
                </div>
              ))}
            </SectionCard>
          )}
        </div>

        {/* RIGHT COLUMN (1/3) */}
        <div className="space-y-6">

          {/* Quick Actions */}
          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-lg border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-bg-secondary)" }}
                >
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{ background: action.bg, color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <span className="text-xs font-semibold text-center leading-tight" style={{ color: "var(--color-text-secondary)" }}>
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </SectionCard>

          {/* Profile Completion */}
          <SectionCard
            title="Profile Checklist"
            action={<span className="text-xs font-bold" style={{ color: "var(--color-primary-600)" }}>3 / 5 done</span>}
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="relative w-16 h-16 shrink-0">
                <svg width={64} height={64} className="-rotate-90" viewBox="0 0 64 64">
                  <circle cx={32} cy={32} r={26} fill="none" stroke="var(--color-neutral-100)" strokeWidth={7} />
                  <circle
                    cx={32} cy={32} r={26} fill="none" stroke="var(--color-primary-500)" strokeWidth={7}
                    strokeDasharray={`${(75 / 100) * 2 * Math.PI * 26} ${2 * Math.PI * 26}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-sm font-extrabold"
                  style={{ color: "var(--color-primary-600)" }}
                >75%</span>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>Almost there!</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                  Complete 2 more items to unlock better matches
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {profileChecklist.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  {item.done ? (
                    <CheckCircle2 size={16} className="shrink-0" style={{ color: "var(--color-success-500)" }} />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 shrink-0" style={{ borderColor: "var(--color-neutral-300)" }} />
                  )}
                  <span
                    className={`text-sm ${item.done ? "line-through font-normal" : "font-semibold"}`}
                    style={{ color: item.done ? "var(--color-text-tertiary)" : "var(--color-text-primary)" }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/profile"
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200"
            >
              Complete Profile <ArrowRight size={13} />
            </Link>
          </SectionCard>

          {/* Recent Activity */}
          <SectionCard
            title="Recent Activity"
            flush
            action={<Zap size={16} style={{ color: "var(--color-primary-400)" }} />}
          >
            <div className="p-2">
              {recentActivity.map((item) => (
                <div
                  key={item.text}
                  className="flex items-start gap-3 p-3 rounded-md hover:bg-neutral-50 transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: item.bg, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold leading-snug" style={{ color: "var(--color-text-primary)" }}>
                      {item.text}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                      {item.sub}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--color-text-disabled)" }}>
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t text-center" style={{ borderColor: "var(--color-neutral-100)" }}>
              <Link
                href="/notifications"
                className="text-xs font-bold inline-flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: "var(--color-primary-600)" }}
              >
                View all activity <ArrowRight size={12} />
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
