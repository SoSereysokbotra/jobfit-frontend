"use client";

import React, { useState } from "react";
import {
  BarChart3, TrendingUp, Target, BookOpen, DollarSign,
  Globe, Briefcase, Zap, ChevronRight, ArrowUp, ArrowDown,
  Star, CheckCircle2, AlertCircle, Lock, ExternalLink,
  Award, Users, Clock, Lightbulb, Flame, Activity,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from "recharts";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/cn";

/* ═══════════════════════════════════════════════════════════════
   CHART DATA
   ═══════════════════════════════════════════════════════════════ */
const applicationTrend = [
  { month: "Jan", applications: 4, interviews: 1, offers: 0 },
  { month: "Feb", applications: 7, interviews: 2, offers: 0 },
  { month: "Mar", applications: 12, interviews: 4, offers: 1 },
  { month: "Apr", applications: 9,  interviews: 3, offers: 0 },
  { month: "May", applications: 15, interviews: 5, offers: 1 },
  { month: "Jun", applications: 18, interviews: 7, offers: 2 },
  { month: "Jul", applications: 22, interviews: 9, offers: 2 },
];

const salaryForecast = [
  { year: "2024", current: 120, market: 130 },
  { year: "2025", current: 135, market: 145 },
  { year: "2026", current: 155, market: 162 },
  { year: "2027", current: 172, market: 180 },
  { year: "2028", current: 188, market: 198 },
];

const skillsRadar = [
  { skill: "React", you: 90, market: 80 },
  { skill: "TypeScript", you: 85, market: 88 },
  { skill: "Node.js", you: 78, market: 75 },
  { skill: "AWS", you: 65, market: 82 },
  { skill: "Docker", you: 72, market: 78 },
  { skill: "SQL", you: 88, market: 70 },
];

const marketDemandData = [
  { role: "Sr. Software Eng.", openings: 4200, growth: 18 },
  { role: "Data Scientist", openings: 3100, growth: 24 },
  { role: "DevOps Engineer", openings: 2800, growth: 22 },
  { role: "Product Manager", openings: 2100, growth: 14 },
  { role: "ML Engineer", openings: 1900, growth: 31 },
];

const industryData = [
  { name: "Technology", value: 45 },
  { name: "Finance", value: 22 },
  { name: "Healthcare", value: 15 },
  { name: "E-Commerce", value: 12 },
  { name: "Other", value: 6 },
];

const INDUSTRY_COLORS = [
  "var(--color-primary-600)",
  "var(--color-primary-400)",
  "var(--color-info-500)",
  "var(--color-warning-500)",
  "var(--color-neutral-400)",
];

const responseRateData = [
  { week: "W1", rate: 12 },
  { week: "W2", rate: 18 },
  { week: "W3", rate: 15 },
  { week: "W4", rate: 22 },
  { week: "W5", rate: 28 },
  { week: "W6", rate: 32 },
  { week: "W7", rate: 38 },
];

/* ═══════════════════════════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/** Shared chart tooltip — same pattern as Dashboard */
function ChartTooltip({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { name: string; value: number | string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-lg border text-xs shadow-md"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
    >
      {label && <p className="font-bold mb-1.5" style={{ color: "var(--color-text-primary)" }}>{label}</p>}
      {payload.map(p => (
        <p key={p.name} className="flex items-center gap-1.5" style={{ color: "var(--color-text-secondary)" }}>
          <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: p.color }} />
          {p.name}: <span className="font-bold ml-0.5" style={{ color: "var(--color-text-primary)" }}>{p.value}</span>
        </p>
      ))}
    </div>
  );
}

/** Section card — consistent with Profile & Resumes pages */
function SectionCard({
  title, subtitle, icon: Icon, children, action, className,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-xl border overflow-hidden", className)}
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary-50)" }}>
            <Icon className="w-4 h-4" style={{ color: "var(--color-primary-600)" }} />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</h2>
            {subtitle && <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/** Single stat tile */
function StatTile({
  label, value, sub, icon: Icon, color, bg, delta, deltaLabel,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  delta?: number;
  deltaLabel?: string;
}) {
  return (
    <div
      className="rounded-xl border p-5 flex items-start gap-4"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium" style={{ color: "var(--color-text-tertiary)" }}>{label}</p>
        <p className="text-2xl font-bold mt-0.5 leading-none" style={{ color: "var(--color-text-primary)" }}>{value}</p>
        {sub && <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>{sub}</p>}
        {delta !== undefined && (
          <div className="flex items-center gap-1 mt-1.5">
            {delta >= 0
              ? <ArrowUp className="w-3 h-3" style={{ color: "var(--color-success-600)" }} />
              : <ArrowDown className="w-3 h-3" style={{ color: "var(--color-error-600)" }} />
            }
            <span className="text-xs font-semibold" style={{ color: delta >= 0 ? "var(--color-success-600)" : "var(--color-error-600)" }}>
              {Math.abs(delta)}% {deltaLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Skill gap row */
function SkillGapRow({
  skill, yours, market, status,
}: {
  skill: string;
  yours: number;
  market: number;
  status: "strong" | "gap" | "match";
}) {
  const gap = market - yours;
  const config = {
    strong: { color: "var(--color-success-600)", bg: "var(--color-success-50)", label: "Above Market", icon: Star },
    match:  { color: "var(--color-info-600)",    bg: "var(--color-info-50)",    label: "On Par",       icon: CheckCircle2 },
    gap:    { color: "var(--color-warning-600)", bg: "var(--color-warning-50)", label: "Skill Gap",    icon: AlertCircle },
  };
  const { color, bg, label, icon: Icon } = config[status];

  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
      <div className="w-28 flex-shrink-0">
        <span className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{skill}</span>
      </div>
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs w-8 text-right flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }}>You</span>
          <div className="flex-1 h-2 rounded-full" style={{ background: "var(--color-border)" }}>
            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${yours}%`, background: "var(--color-primary-600)" }} />
          </div>
          <span className="text-xs w-7 flex-shrink-0 font-semibold" style={{ color: "var(--color-text-primary)" }}>{yours}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs w-8 text-right flex-shrink-0" style={{ color: "var(--color-text-tertiary)" }}>Mkt</span>
          <div className="flex-1 h-2 rounded-full" style={{ background: "var(--color-border)" }}>
            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${market}%`, background: "var(--color-neutral-300)" }} />
          </div>
          <span className="text-xs w-7 flex-shrink-0 font-semibold" style={{ color: "var(--color-text-secondary)" }}>{market}</span>
        </div>
      </div>
      <div
        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: bg, color }}
      >
        <Icon className="w-3 h-3" />
        {status === "gap" ? `−${gap}` : label}
      </div>
    </div>
  );
}

/** Learning path card */
function LearningCard({
  title, provider, duration, level, match, enrolled,
}: {
  title: string;
  provider: string;
  duration: string;
  level: string;
  match: number;
  enrolled: boolean;
}) {
  const [done, setDone] = useState(enrolled);
  return (
    <div
      className={cn("p-4 rounded-xl border transition-all duration-200", done ? "opacity-70" : "hover:border-primary-300 hover:shadow-sm")}
      style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: "var(--color-text-primary)" }}>{title}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{provider}</p>
        </div>
        <Badge variant={done ? "success" : "primary"}>{match}% match</Badge>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-tertiary)" }}>
          <Clock className="w-3 h-3" />{duration}
        </span>
        <span className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-tertiary)" }}>
          <Award className="w-3 h-3" />{level}
        </span>
      </div>
      <button
        onClick={() => setDone(v => !v)}
        className={cn(
          "w-full text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200",
          done ? "" : "hover:opacity-90"
        )}
        style={done
          ? { background: "var(--color-success-50)", color: "var(--color-success-600)" }
          : { background: "var(--color-primary-600)", color: "#fff" }
        }
      >
        {done ? <><CheckCircle2 className="w-3.5 h-3.5" /> Enrolled</> : <><ExternalLink className="w-3.5 h-3.5" /> Start Learning</>}
      </button>
    </div>
  );
}

/** Recommendation insight card */
function InsightCard({
  icon: Icon, color, bg, title, desc, cta, ctaHref,
}: {
  icon: React.ElementType;
  color: string;
  bg: string;
  title: string;
  desc: string;
  cta: string;
  ctaHref: string;
}) {
  return (
    <div
      className="flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-sm"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{title}</p>
        <p className="text-xs leading-relaxed mt-1" style={{ color: "var(--color-text-secondary)" }}>{desc}</p>
        <a
          href={ctaHref}
          className="inline-flex items-center gap-1 text-xs font-semibold mt-2 transition-colors"
          style={{ color: "var(--color-primary-600)" }}
        >
          {cta} <ChevronRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE ROOT
   ═══════════════════════════════════════════════════════════════ */
export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "market" | "applications">("overview");

  const tabs = [
    { id: "overview",      label: "Overview",     icon: BarChart3 },
    { id: "skills",        label: "Skills",       icon: Target },
    { id: "market",        label: "Market",       icon: Globe },
    { id: "applications",  label: "Applications", icon: Briefcase },
  ] as const;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6" style={{ background: "var(--color-bg-secondary)" }}>

      {/* ── PAGE HEADER ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>Career Insights</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            Personalised analysis of your career trajectory, skills & market position
          </p>
        </div>
        <Badge variant="primary">
          <Activity className="w-3 h-3" /> Updated today
        </Badge>
      </div>

      {/* ── TABS ── */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl w-fit"
        style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
              activeTab === id ? "text-white shadow-sm" : "hover:bg-neutral-50"
            )}
            style={activeTab === id
              ? { background: "var(--color-primary-600)", color: "#fff" }
              : { color: "var(--color-text-secondary)" }
            }
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ─────────────── OVERVIEW TAB ─────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6">

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile label="Profile Score" value="75%" sub="Complete your profile" icon={Target}
              color="var(--color-primary-600)" bg="var(--color-primary-50)" delta={8} deltaLabel="this month" />
            <StatTile label="Match Score Avg" value="88%" sub="Top 15% of candidates" icon={Star}
              color="var(--color-warning-600)" bg="var(--color-warning-50)" delta={5} deltaLabel="vs last month" />
            <StatTile label="Skills vs Market" value="7/9" sub="Skills above market avg" icon={Zap}
              color="var(--color-success-600)" bg="var(--color-success-50)" />
            <StatTile label="Response Rate" value="32%" sub="Industry avg: 22%" icon={TrendingUp}
              color="var(--color-info-600)" bg="var(--color-info-50)" delta={10} deltaLabel="vs industry" />
          </div>

          {/* Application trend + Salary forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Application Activity" subtitle="7-month activity overview" icon={Briefcase}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={applicationTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary-600)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-primary-600)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradInt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-success-500)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--color-success-500)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="applications" name="Applications" stroke="var(--color-primary-600)" fill="url(#gradApps)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="interviews" name="Interviews" stroke="var(--color-success-500)" fill="url(#gradInt)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard title="Salary Forecast" subtitle="Projected vs market median (USD K)" icon={DollarSign}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={salaryForecast} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="current" name="Your Trajectory" stroke="var(--color-primary-600)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--color-primary-600)" }} />
                  <Line type="monotone" dataKey="market" name="Market Median" stroke="var(--color-neutral-400)" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="w-4 h-0.5 rounded-full inline-block" style={{ background: "var(--color-primary-600)" }} />
                  Your Trajectory
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="w-4 h-0.5 rounded-full inline-block border-dashed border-t-2" style={{ borderColor: "var(--color-neutral-400)" }} />
                  Market Median
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Personalised recommendations */}
          <SectionCard title="Personalised Recommendations" subtitle="Based on your profile & activity" icon={Lightbulb}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: Target, color: "var(--color-primary-600)", bg: "var(--color-primary-50)",
                  title: "Complete your profile to unlock 50% more matches",
                  desc: "Add your education and cover letter template to reach 100% profile strength.",
                  cta: "Go to Profile", ctaHref: "/profile",
                },
                {
                  icon: Zap, color: "var(--color-warning-600)", bg: "var(--color-warning-50)",
                  title: "Strengthen your AWS & Docker skills",
                  desc: "Market demand for cloud skills is up 24% this quarter. Closing this gap could add $15K to your salary.",
                  cta: "View Learning Paths", ctaHref: "#",
                },
                {
                  icon: Globe, color: "var(--color-info-600)", bg: "var(--color-info-50)",
                  title: "Tech sector is hiring — 4,200 openings match you",
                  desc: "Your top matching industries have accelerated hiring. Now is a great time to apply.",
                  cta: "Browse Jobs", ctaHref: "/jobs",
                },
                {
                  icon: TrendingUp, color: "var(--color-success-600)", bg: "var(--color-success-50)",
                  title: "Your response rate is 10% above industry average",
                  desc: "Keep up your application pace — you're outperforming most candidates in your level.",
                  cta: "View Applications", ctaHref: "/applications",
                },
              ].map(item => <InsightCard key={item.title} {...item} />)}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ─────────────── SKILLS TAB ─────────────── */}
      {activeTab === "skills" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Radar chart */}
            <SectionCard title="Skills vs Market Average" subtitle="Your proficiency compared to job market" icon={Target}>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={skillsRadar} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "var(--color-text-secondary)" }} />
                  <Radar name="You" dataKey="you" stroke="var(--color-primary-600)" fill="var(--color-primary-600)" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Market" dataKey="market" stroke="var(--color-neutral-400)" fill="var(--color-neutral-400)" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 3" />
                  <Tooltip content={<ChartTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: "var(--color-primary-100)", border: "2px solid var(--color-primary-600)" }} />
                  You
                </div>
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: "var(--color-neutral-100)", border: "2px solid var(--color-neutral-400)" }} />
                  Market Average
                </div>
              </div>
            </SectionCard>

            {/* Skill gap breakdown */}
            <SectionCard title="Skill Gap Analysis" subtitle="Where you stand against the market" icon={AlertCircle}>
              <div>
                {skillsRadar.map(s => {
                  const status = s.you > s.market ? "strong" : s.you === s.market ? "match" : "gap";
                  return <SkillGapRow key={s.skill} skill={s.skill} yours={s.you} market={s.market} status={status} />;
                })}
              </div>
            </SectionCard>
          </div>

          {/* Learning paths */}
          <SectionCard title="Recommended Learning Paths" subtitle="Close skill gaps and increase your salary range" icon={BookOpen}
            action={<Button variant="ghost" className="text-xs">View All</Button>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "AWS Solutions Architect", provider: "AWS Training", duration: "40h", level: "Intermediate", match: 95, enrolled: false },
                { title: "Docker & Kubernetes Mastery", provider: "Udemy", duration: "28h", level: "Intermediate", match: 91, enrolled: true },
                { title: "TypeScript Advanced Patterns", provider: "Frontend Masters", duration: "16h", level: "Advanced", match: 88, enrolled: false },
                { title: "GraphQL API Design", provider: "Apollo", duration: "12h", level: "Intermediate", match: 82, enrolled: false },
                { title: "System Design Interviews", provider: "ByteByByte", duration: "20h", level: "Advanced", match: 79, enrolled: false },
                { title: "Data Structures & Algorithms", provider: "LeetCode", duration: "Self-paced", level: "All levels", match: 76, enrolled: false },
              ].map(c => <LearningCard key={c.title} {...c} />)}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ─────────────── MARKET TAB ─────────────── */}
      {activeTab === "market" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Role demand bar chart */}
            <SectionCard title="Role Demand in Your Market" subtitle="Open positions & growth rate (last 90 days)" icon={Globe}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={marketDemandData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="role" tick={{ fontSize: 10, fill: "var(--color-text-secondary)" }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="openings" name="Open Roles" radius={[0, 6, 6, 0]} fill="var(--color-primary-600)" />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {marketDemandData.map(d => (
                  <div key={d.role} className="flex items-center justify-between p-2 rounded-lg"
                    style={{ background: "var(--color-bg-secondary)" }}>
                    <span className="text-xs truncate" style={{ color: "var(--color-text-secondary)" }}>{d.role}</span>
                    <span className="text-xs font-bold ml-2 flex items-center gap-1 flex-shrink-0"
                      style={{ color: "var(--color-success-600)" }}>
                      <ArrowUp className="w-3 h-3" />{d.growth}%
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Industry breakdown pie */}
            <SectionCard title="Industry Hiring Distribution" subtitle="Where matching jobs are concentrated" icon={Globe}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={industryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    dataKey="value" paddingAngle={3}>
                    {industryData.map((_, i) => (
                      <Cell key={i} fill={INDUSTRY_COLORS[i % INDUSTRY_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {industryData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: INDUSTRY_COLORS[i % INDUSTRY_COLORS.length] }} />
                      <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{d.name}</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: "var(--color-text-primary)" }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Salary benchmarks */}
          <SectionCard title="Salary Benchmarks — Senior Software Engineer · San Francisco" subtitle="Data from 1,200+ JobFits applications & postings" icon={DollarSign}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "25th Percentile", value: "$130K", note: "Entry senior" },
                { label: "Median (50th)", value: "$155K", note: "Market standard" },
                { label: "75th Percentile", value: "$180K", note: "Strong performer" },
                { label: "90th Percentile", value: "$210K", note: "Top-tier" },
              ].map(b => (
                <div key={b.label} className="p-4 rounded-xl text-center"
                  style={{ background: "var(--color-primary-50)", border: "1px solid var(--color-primary-100)" }}>
                  <p className="text-xl font-bold" style={{ color: "var(--color-primary-700)" }}>{b.value}</p>
                  <p className="text-xs font-semibold mt-1" style={{ color: "var(--color-primary-600)" }}>{b.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{b.note}</p>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl flex items-start gap-3"
              style={{ background: "var(--color-success-50)", border: "1px solid var(--color-success-100)" }}>
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--color-success-600)" }} />
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--color-success-700)" }}>Your current trajectory is above market median</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-success-600)" }}>
                  Based on your experience and skills, you should be targeting $155K–$180K in your next role.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ─────────────── APPLICATIONS TAB ─────────────── */}
      {activeTab === "applications" && (
        <div className="space-y-6">

          {/* Key metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile label="Total Applied" value={22} icon={Briefcase}
              color="var(--color-primary-600)" bg="var(--color-primary-50)" />
            <StatTile label="Interviews" value={9} sub="40.9% interview rate" icon={Users}
              color="var(--color-success-600)" bg="var(--color-success-50)" delta={14} deltaLabel="above avg" />
            <StatTile label="Offers" value={2} sub="22.2% offer rate" icon={Award}
              color="var(--color-warning-600)" bg="var(--color-warning-50)" />
            <StatTile label="Avg. Response Time" value="4.2d" sub="Industry avg: 7d" icon={Clock}
              color="var(--color-info-600)" bg="var(--color-info-50)" delta={40} deltaLabel="faster" />
          </div>

          {/* Response rate trend */}
          <SectionCard title="Response Rate Over Time" subtitle="% of applications that received a response" icon={TrendingUp}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={responseRateData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-success-500)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-success-500)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="rate" name="Response Rate" stroke="var(--color-success-500)" fill="url(#gradRate)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-success-500)" }} />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* Application tips */}
          <SectionCard title="Application Insights & Tips" subtitle="Personalised based on your history" icon={Lightbulb}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: Flame, color: "var(--color-error-600)", bg: "var(--color-error-50)",
                  title: "Apply within 48 hours of posting", desc: "Jobs posted less than 2 days ago get 3× more responses. You currently average 5.3 days.",
                  cta: "Browse fresh jobs", ctaHref: "/jobs",
                },
                {
                  icon: Star, color: "var(--color-warning-600)", bg: "var(--color-warning-50)",
                  title: "Focus on 85%+ match roles", desc: "Your interview rate for 85%+ match roles is 58% vs 18% for lower matches. Quality over quantity.",
                  cta: "View recommendations", ctaHref: "/recommendations",
                },
                {
                  icon: Briefcase, color: "var(--color-primary-600)", bg: "var(--color-primary-50)",
                  title: "Tuesday & Wednesday are best days to apply", desc: "Recruiters are most active mid-week. Applications sent Tue–Wed receive 28% faster responses.",
                  cta: "View open positions", ctaHref: "/jobs",
                },
                {
                  icon: CheckCircle2, color: "var(--color-success-600)", bg: "var(--color-success-50)",
                  title: "Customise your resume per application", desc: "Tailored resumes get 40% more callbacks. Use the Resumes page to create role-specific versions.",
                  cta: "Manage resumes", ctaHref: "/resumes",
                },
              ].map(item => <InsightCard key={item.title} {...item} />)}
            </div>
          </SectionCard>
        </div>
      )}

    </div>
  );
}
