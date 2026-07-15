"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase, Calendar, Award, Target, TrendingUp,
  CheckCircle2, Eye, Star, ArrowRight, Search, Upload,
  BarChart3, Zap, Clock, MapPin, DollarSign, ChevronRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import MatchScoreBadge from "@/shared/components/data-display/match-score-badge";

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

const topMatches = [
  {
    title: "Senior Frontend Engineer",
    company: "Stripe",
    location: "San Francisco, CA",
    salary: "$165K – $210K",
    match: 94,
    type: "Hybrid",
    logo: "S",
    logoColor: "#635BFF",
  },
  {
    title: "React Specialist Developer",
    company: "Airbnb",
    location: "Remote (US)",
    salary: "$150K – $195K",
    match: 89,
    type: "Remote",
    logo: "A",
    logoColor: "#FF5A5F",
  },
  {
    title: "Software Engineer – Platforms",
    company: "Figma",
    location: "New York, NY",
    salary: "$140K – $185K",
    match: 85,
    type: "Hybrid",
    logo: "F",
    logoColor: "#7B2CBF",
  },
];

const profileChecklist = [
  { label: "Basic Info", done: true },
  { label: "Resume Uploaded", done: true },
  { label: "Skills Added", done: true },
  { label: "Education", done: false },
  { label: "Cover Letter", done: false },
];

const quickActions = [
  { icon: <Search size={20} />, label: "Search Jobs", href: "/jobs", color: "var(--color-info-500)", bg: "var(--color-info-50)" },
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

/* ─── CUSTOM TOOLTIP ─────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-lg text-xs shadow-lg border"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <p className="font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

/* ─── STAT CARD ─────────────────────────────────────────────── */
function StatCard({
  label, value, change, icon, accentColor, accentBg
}: {
  label: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  accentColor: string;
  accentBg: string;
}) {
  return (
    <div
      className="rounded-xl border p-5 transition-all duration-200 hover:shadow-md group cursor-pointer"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
          style={{ background: accentBg, color: accentColor }}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>{value}</p>
      <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--color-text-tertiary)" }}>
        <TrendingUp size={11} style={{ color: "var(--color-success-500)" }} />
        {change}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE ROOT
   ═══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const [saveStates, setSaveStates] = useState<Record<number, boolean>>({});

  const toggleSave = (idx: number) => {
    setSaveStates((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-full"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      {/* ── WELCOME BANNER ────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--color-primary-800) 0%, var(--color-primary-700) 50%, var(--color-primary-600) 100%)",
        }}
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
            <p className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-1">Welcome back</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Hello, John!
            </h1>
            <p className="text-sm text-white/80 mt-1">
              You have <span className="text-white font-bold">2 upcoming interviews</span> and <span className="text-white font-bold">20 new matches</span> waiting.
            </p>
          </div>

          {/* Profile completeness */}
          <div
            className="sm:shrink-0 flex items-center gap-4 rounded-xl px-5 py-4"
            style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            <div className="relative w-14 h-14">
              <svg width={56} height={56} className="-rotate-90" viewBox="0 0 56 56">
                <circle cx={28} cy={28} r={22} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={6} />
                <circle
                  cx={28} cy={28} r={22} fill="none" stroke="white" strokeWidth={6}
                  strokeDasharray={`${(75 / 100) * 2 * Math.PI * 22} ${2 * Math.PI * 22}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-white font-extrabold text-sm">75%</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm">Profile Score</p>
              <p className="text-white/70 text-xs mt-0.5">Add education to reach 90%</p>
              <Link
                href="/profile"
                className="text-xs font-bold text-white/90 hover:text-white mt-1 inline-flex items-center gap-1 transition-colors"
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
          icon={<Briefcase size={18} />}
          accentColor="var(--color-primary-600)"
          accentBg="var(--color-primary-50)"
        />
        <StatCard
          label="Interviews"
          value="2"
          change="Next: Tomorrow"
          icon={<Calendar size={18} />}
          accentColor="var(--color-info-600)"
          accentBg="var(--color-info-50)"
        />
        <StatCard
          label="Offers"
          value="1"
          change="Respond by Jun 30"
          icon={<Award size={18} />}
          accentColor="var(--color-success-600)"
          accentBg="var(--color-success-50)"
        />
        <StatCard
          label="Saved Jobs"
          value="34"
          change="+12 from last week"
          icon={<Target size={18} />}
          accentColor="var(--color-warning-600)"
          accentBg="var(--color-warning-50)"
        />
      </div>

      {/* ── MAIN 2-COLUMN GRID ────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT COLUMN (2/3) */}
        <div className="xl:col-span-2 space-y-6">

          {/* Application Trend Chart */}
          <div
            className="rounded-xl border p-5 sm:p-6"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>Application Activity</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>Applications & interviews over 7 months</p>
              </div>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "var(--color-primary-50)", color: "var(--color-primary-700)" }}
              >
                Last 7 months
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={applicationTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-success-500)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--color-success-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-100)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="applications" stroke="var(--color-primary-500)" strokeWidth={2.5} fill="url(#colorApps)" name="Applications" dot={{ r: 3, fill: "var(--color-primary-500)" }} />
                <Area type="monotone" dataKey="interviews" stroke="var(--color-success-500)" strokeWidth={2.5} fill="url(#colorInterviews)" name="Interviews" dot={{ r: 3, fill: "var(--color-success-500)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Job Matches */}
          <div
            className="rounded-xl border"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              <div>
                <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>Top Job Matches</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>AI-curated matches for your profile</p>
              </div>
              <Link
                href="/recommendations"
                className="text-xs font-bold flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color: "var(--color-primary-600)" }}
              >
                View all <ArrowRight size={13} />
              </Link>
            </div>
            <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {topMatches.map((job, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-primary-50/30 transition-colors cursor-pointer group"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base shrink-0 shadow-sm"
                    style={{ background: job.logoColor }}
                  >
                    {job.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold truncate group-hover:text-primary-700 transition-colors" style={{ color: "var(--color-text-primary)" }}>
                          {job.title}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{job.company}</p>
                      </div>
                      <MatchScoreBadge score={job.match} size="sm" className="shrink-0 mt-0.5" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                        <MapPin size={11} /> {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-success-600)" }}>
                        <DollarSign size={11} /> {job.salary}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "var(--color-primary-50)", color: "var(--color-primary-700)" }}
                      >
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      className="px-3 py-1.5 rounded-md text-xs font-bold text-white transition-all duration-200 active:scale-95"
                      style={{ background: "var(--color-primary-600)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-700)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-primary-600)")}
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => toggleSave(idx)}
                      className="px-3 py-1.5 rounded-md text-xs font-bold border transition-all duration-200 active:scale-95"
                      style={{
                        borderColor: saveStates[idx] ? "var(--color-primary-300)" : "var(--color-border)",
                        color: saveStates[idx] ? "var(--color-primary-600)" : "var(--color-text-tertiary)",
                        background: saveStates[idx] ? "var(--color-primary-50)" : "transparent",
                      }}
                    >
                      {saveStates[idx] ? "Saved ✓" : "Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Interviews */}
          {upcomingInterviews.length > 0 && (
            <div
              className="rounded-xl border overflow-hidden"
              style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--color-info-50)", color: "var(--color-info-600)" }}
                >
                  <Calendar size={16} />
                </div>
                <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>Upcoming Interviews</h2>
              </div>
              {upcomingInterviews.map((iv, idx) => (
                <div key={idx} className="px-5 py-4 flex items-center gap-4">
                  <div
                    className="flex-1 p-4 rounded-xl border-l-4"
                    style={{
                      background: "var(--color-info-50)",
                      borderLeftColor: "var(--color-info-500)",
                    }}
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
                      <button
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
                        style={{ background: "var(--color-success-600)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                      >
                        Prep for Interview
                      </button>
                      <button
                        className="px-4 py-1.5 rounded-lg text-xs font-bold border transition-all"
                        style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                      >
                        Add to Calendar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (1/3) */}
        <div className="space-y-6">

          {/* Quick Actions */}
          <div
            className="rounded-xl border p-5"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <h2 className="text-base font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-bg-secondary)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
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
          </div>

          {/* Recent Activity */}
          <div
            className="rounded-xl border"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
              <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>Recent Activity</h2>
              <Zap size={16} style={{ color: "var(--color-primary-400)" }} />
            </div>
            <div className="p-2">
              {recentActivity.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50/80 transition-colors cursor-pointer"
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
                    <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                      {item.sub}
                    </p>
                    <p className="text-[10px] mt-1 font-medium" style={{ color: "var(--color-neutral-400)" }}>
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Completion */}
          <div
            className="rounded-xl border p-5"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>Profile Checklist</h2>
              <span className="text-xs font-bold" style={{ color: "var(--color-primary-600)" }}>3/5</span>
            </div>

            {/* Circular progress */}
            <div className="flex items-center gap-4 mb-5">
              <div className="relative w-16 h-16">
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
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>Complete 2 more items to<br />unlock better matches</p>
              </div>
            </div>

            <div className="space-y-2">
              {profileChecklist.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  {item.done ? (
                    <CheckCircle2 size={16} style={{ color: "var(--color-success-500)", flexShrink: 0 }} />
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full border-2 shrink-0"
                      style={{ borderColor: "var(--color-neutral-300)" }}
                    />
                  )}
                  <span
                    className="text-sm"
                    style={{
                      color: item.done ? "var(--color-text-tertiary)" : "var(--color-text-primary)",
                      textDecoration: item.done ? "line-through" : "none",
                      fontWeight: item.done ? 400 : 600,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/profile"
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-white transition-all duration-200"
              style={{ background: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))" }}
            >
              Complete Profile <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
