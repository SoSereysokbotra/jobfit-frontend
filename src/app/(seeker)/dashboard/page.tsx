"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase, Calendar, Award, Target, TrendingUp,
  CheckCircle2, Eye, Star, ArrowRight, Search, Upload,
  BarChart3, Clock, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { JobCard } from "@/features/job/components";
import { useSession, displayName } from "@/features/auth/hooks/use-session";
import { useMyStats } from "@/features/insights/hooks/use-insights";
import { useJobs } from "@/features/job/hooks/use-job";
import { useSavedJobIds, useToggleSavedJob } from "@/features/saved-jobs/hooks/use-saved-jobs";
import { useProfile } from "@/features/user-profile/hooks/use-profile";
import { profileCompleteness } from "@/features/user-profile/api/profile.mappers";
import { StatCard } from "@/shared/components/data-display/stat-card";

/** Small "Sample" pill for sections with no backend endpoint yet. */
function SamplePill() {
  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: "var(--color-neutral-100)", color: "var(--color-text-tertiary)" }}
    >
      Sample
    </span>
  );
}

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
  // Personalize the greeting from the real session (GET /auth/me). `name` is
  // optional at registration, so fall back to a neutral greeting.
  const { user } = useSession();
  const firstName = displayName(user).firstName || "there";

  // Real seeker funnel stats (GET /analytics/my-stats) drive the stat tiles.
  const { data: stats } = useMyStats();
  // Saved jobs are now backend-backed; the count feeds the "Saved Jobs" tile.
  const { ids: savedIds } = useSavedJobIds();
  const toggleSaved = useToggleSavedJob();
  const toggleSave = (id: string) => toggleSaved.mutate(id);
  // Real published jobs — shown as "Recent openings" (match scores await the AI service).
  const { data: jobs = [] } = useJobs();
  const topJobs = jobs.slice(0, 3);
  // Real profile drives the completeness score + checklist.
  const { profile } = useProfile();
  const profileScore = profileCompleteness(profile);

  const num = (n: number | undefined) => (typeof n === "number" ? String(n) : "—");
  const savedCount = savedIds.size;

  // Checklist derived from the real profile (skills/resume/cover-letter have no
  // reliable field here, so we track the profile fields the backend does store).
  const profileChecklist = [
    { label: "Name", done: Boolean(profile?.firstName && profile?.lastName) },
    { label: "Headline", done: Boolean(profile?.headline) },
    { label: "Bio", done: Boolean(profile?.bio) },
    { label: "Location", done: Boolean(profile?.locationLabel) },
    { label: "Job preferences", done: (profile?.desiredJobLevels.length ?? 0) > 0 },
    { label: "Salary range", done: Boolean(profile?.salaryRange) },
  ];
  const checklistDone = profileChecklist.filter((c) => c.done).length;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

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
              You have <span className="text-on-primary font-bold">{num(stats?.totalInterviews)} interviews</span> in progress and{" "}
              <span className="text-on-primary font-bold">{num(stats?.totalApplications)} applications</span> submitted.
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
                  strokeDasharray={`${(profileScore / 100) * 2 * Math.PI * 22} ${2 * Math.PI * 22}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-on-primary font-extrabold text-sm">{profileScore}%</span>
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
          value={num(stats?.totalApplications)}
          icon={<Briefcase size={18} />}
          accentColor="var(--color-primary-600)"
          accentBg="var(--color-primary-50)"
          href="/applications"
        />
        <StatCard
          label="Interviews"
          value={num(stats?.totalInterviews)}
          icon={<Calendar size={18} />}
          accentColor="var(--color-info-600)"
          accentBg="var(--color-info-50)"
          href="/applications"
        />
        <StatCard
          label="Offers"
          value={num(stats?.totalOffers)}
          icon={<Award size={18} />}
          accentColor="var(--color-success-600)"
          accentBg="var(--color-success-50)"
          href="/offers"
        />
        <StatCard
          label="Saved Jobs"
          value={String(savedCount)}
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

          {/* Application Trend Chart — TODO(backend): no trend endpoint (Phase 10). */}
          <SectionCard
            title="Application Activity"
            subtitle="Applications & interviews over the last 7 months"
            action={<SamplePill />}
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

          {/* Recent openings — real published jobs. Match scores await the AI service. */}
          <SectionCard
            title="Recent Openings"
            subtitle="Latest jobs on JobFits"
            flush
            action={
              <Link
                href="/jobs"
                className="text-xs font-bold flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color: "var(--color-primary-600)" }}
              >
                View all <ArrowRight size={13} />
              </Link>
            }
          >
            {topJobs.length === 0 ? (
              <p className="p-5 text-sm text-center" style={{ color: "var(--color-text-tertiary)" }}>
                No openings to show yet.
              </p>
            ) : (
              <div className="divide-y" style={{ borderColor: "var(--color-neutral-100)" }}>
                {topJobs.map((job) => (
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
            )}
          </SectionCard>

          {/* Upcoming Interviews */}
          {upcomingInterviews.length > 0 && (
            <SectionCard
              title="Upcoming Interviews"
              action={<SamplePill />}
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
            action={<span className="text-xs font-bold" style={{ color: "var(--color-primary-600)" }}>{checklistDone} / {profileChecklist.length} done</span>}
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="relative w-16 h-16 shrink-0">
                <svg width={64} height={64} className="-rotate-90" viewBox="0 0 64 64">
                  <circle cx={32} cy={32} r={26} fill="none" stroke="var(--color-neutral-100)" strokeWidth={7} />
                  <circle
                    cx={32} cy={32} r={26} fill="none" stroke="var(--color-primary-500)" strokeWidth={7}
                    strokeDasharray={`${(profileScore / 100) * 2 * Math.PI * 26} ${2 * Math.PI * 26}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  className="absolute inset-0 flex items-center justify-center text-sm font-extrabold"
                  style={{ color: "var(--color-primary-600)" }}
                >{profileScore}%</span>
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {profileScore >= 100 ? "Profile complete!" : "Almost there!"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                  {profileScore >= 100
                    ? "Your profile is fully set up."
                    : `Complete ${profileChecklist.length - checklistDone} more item${profileChecklist.length - checklistDone === 1 ? "" : "s"} to unlock better matches`}
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
            action={<SamplePill />}
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
