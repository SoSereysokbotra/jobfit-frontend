"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Star,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Sliders,
  DollarSign,
  Award,
  Zap,
} from "lucide-react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";
import MatchScoreBadge from "@/shared/components/data-display/match-score-badge";

/* ─── EXPANDED CARD 1: AI MATCH SCORING ──────────────────────────── */
function MatchScoringContent() {
  const breakdown = [
    {
      label: "Technical Skills",
      score: 96,
      weight: "40%",
      detail: "React, TypeScript, Next.js, GraphQL",
    },
    {
      label: "Experience Level",
      score: 90,
      weight: "25%",
      detail: "5 yrs experience vs 4+ yrs requested",
    },
    {
      label: "Location & Work Mode",
      score: 100,
      weight: "20%",
      detail: "Remote (Global) / Hybrid SF",
    },
    {
      label: "Salary Alignment",
      score: 92,
      weight: "15%",
      detail: "$165K–$210K aligns with your $175K target",
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Banner */}
      <div
        className="p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center gap-4">
          <MatchScoreBadge score={94} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-base font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Exceptional Match
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-success-50 text-success-600">
                Top 5% Candidate
              </span>
            </div>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Senior Frontend Architect · Stripe (Full-time / Remote)
            </p>
          </div>
        </div>

        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-sm"
        >
          Try Match Engine <ArrowRight size={13} />
        </Link>
      </div>

      {/* Breakdown Dimensions */}
      <div
        className="p-6 rounded-2xl border space-y-4"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between">
          <h4
            className="text-sm font-bold flex items-center gap-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            <Sliders size={16} className="text-primary-600" /> Transparent Score
            Composition
          </h4>
          <span
            className="text-xs font-medium"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Weighted Multi-factor Evaluation
          </span>
        </div>

        <div className="space-y-3.5 pt-2">
          {breakdown.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span
                  className="font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {item.label}{" "}
                  <span style={{ color: "var(--color-text-tertiary)" }}>
                    ({item.weight})
                  </span>
                </span>
                <span className="font-extrabold text-primary-600">
                  {item.score}%
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "var(--color-neutral-100)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.score}%`,
                    background:
                      item.score > 90
                        ? "var(--color-primary-500)"
                        : "var(--color-warning-500)",
                  }}
                />
              </div>
              <p
                className="text-[11px]"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Fit Rationale & Gap Analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="p-5 rounded-2xl border"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-2 text-primary-600 font-bold text-xs">
            <Sparkles size={15} /> AI Match Analysis
          </div>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Your experience leading large-scale React component systems matches
            96% of Stripe’s design system team requirements.
          </p>
        </div>

        <div
          className="p-5 rounded-2xl border"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <div className="flex items-center gap-2 mb-2 text-warning-600 font-bold text-xs">
            <Zap size={15} /> Opportunity Flag
          </div>
          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Optional requirement:{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              GraphQL federation
            </strong>
            . Estimated time to bridge:{" "}
            <strong style={{ color: "var(--color-text-primary)" }}>
              ~1 week
            </strong>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── EXPANDED CARD 2: RESUME AI ─────────────────────────────────── */
function ResumeAIContent() {
  const skills = [
    { name: "React 19", level: "Expert", tone: "primary" },
    { name: "TypeScript", level: "Expert", tone: "primary" },
    { name: "Next.js App Router", level: "Advanced", tone: "primary" },
    { name: "Tailwind CSS", level: "Advanced", tone: "primary" },
    { name: "Node.js", level: "Intermediate", tone: "neutral" },
    { name: "AWS Cloud", level: "Intermediate", tone: "neutral" },
    { name: "Docker", level: "Working Knowledge", tone: "neutral" },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* File Scanner Widget */}
      <div
        className="p-5 rounded-2xl border flex items-center justify-between gap-4"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-primary-600 shrink-0"
            style={{ background: "var(--color-primary-50)" }}
          >
            <FileText size={20} />
          </div>
          <div>
            <p
              className="text-sm font-bold truncate"
              style={{ color: "var(--color-text-primary)" }}
            >
              Alex_Rivera_Senior_Resume.pdf
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Parsed in 1.1s · 18 skills extracted · ATS Grade: 96/100
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success-50 text-success-600">
          <CheckCircle2 size={13} /> ATS Verified
        </span>
      </div>

      {/* Auto-extracted Skill Tags */}
      <div
        className="p-6 rounded-2xl border space-y-3"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex justify-between items-center">
          <h4
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Automatically Extracted Skills & Seniority
          </h4>
          <span className="text-xs font-bold text-primary-600">
            7 Core Competencies
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {skills.map((s) => (
            <span
              key={s.name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:scale-105"
              style={{
                background:
                  s.tone === "primary"
                    ? "var(--color-primary-50)"
                    : "var(--color-surface)",
                borderColor:
                  s.tone === "primary"
                    ? "var(--color-primary-200)"
                    : "var(--color-border)",
                color:
                  s.tone === "primary"
                    ? "var(--color-primary-700)"
                    : "var(--color-text-primary)",
              }}
            >
              <span>{s.name}</span>
              <span className="text-[10px] opacity-70 font-normal">
                ({s.level})
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* AI Bullet Enhancer Before & After */}
      <div
        className="p-6 rounded-2xl border space-y-3"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <h4
          className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <BrainCircuit size={15} className="text-primary-600" /> AI Bullet
          Point Optimizer
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl border bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] font-bold text-error-600 uppercase">
              Original Bullet
            </span>
            <p className="text-xs mt-1 text-neutral-600 dark:text-neutral-400">
              &ldquo;Helped build and maintain the web dashboard and fixed bugs
              for user login.&rdquo;
            </p>
          </div>
          <div className="p-3.5 rounded-xl border bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800">
            <span className="text-[11px] font-bold text-primary-600 uppercase flex items-center gap-1">
              <Sparkles size={11} /> AI Enhanced (Impact-Driven)
            </span>
            <p className="text-xs mt-1 font-medium text-neutral-800 dark:text-neutral-100">
              &ldquo;Architected secure auth flow &amp; responsive dashboard in
              Next.js 15, slashing page load times by 42% for 250K MAUs.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── EXPANDED CARD 3: CURATED DISCOVERY FEED ────────────────────── */
function DiscoveryFeedContent() {
  const jobs = [
    {
      title: "Staff Frontend Architect",
      company: "Stripe",
      loc: "San Francisco / Remote",
      pay: "$180K – $240K",
      match: 96,
      logo: "S",
      bg: "var(--color-primary-700)",
    },
    {
      title: "Senior Design Systems Engineer",
      company: "Figma",
      loc: "New York / Hybrid",
      pay: "$165K – $210K",
      match: 93,
      logo: "F",
      bg: "var(--color-neutral-800)",
    },
    {
      title: "Lead Full-Stack Developer",
      company: "Airbnb",
      loc: "Remote (Global)",
      pay: "$170K – $220K",
      match: 90,
      logo: "A",
      bg: "var(--color-info-600)",
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div
        className="p-5 rounded-2xl border flex items-center justify-between"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div>
          <h4
            className="text-sm font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Daily Curated Feed (24 New Matches Today)
          </h4>
          <p
            className="text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Filtered from 12,000+ postings across LinkedIn, Indeed, and direct
            company boards.
          </p>
        </div>
        <span className="text-xs font-bold text-primary-600 flex items-center gap-1">
          <Star size={13} className="fill-current" /> High Confidence
        </span>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.title}
            className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:scale-[1.01]"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-sm"
                style={{ background: job.bg }}
              >
                {job.logo}
              </div>
              <div>
                <p
                  className="text-sm font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {job.title}
                </p>
                <div
                  className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  <span>{job.company}</span>
                  <span>·</span>
                  <span>{job.loc}</span>
                  <span>·</span>
                  <span className="font-semibold text-success-600">
                    {job.pay}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
              <MatchScoreBadge score={job.match} size="sm" />
              <Link
                href="/jobs"
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                View Role
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── EXPANDED CARD 4: PIPELINE & OFFER TRACKER ──────────────────── */
function PipelineTrackingContent() {
  const stages = [
    { label: "Applied", count: 12, active: false, done: true },
    { label: "Screening", count: 5, active: false, done: true },
    { label: "Technical Round", count: 2, active: true, done: false },
    { label: "Final Offer", count: 1, active: false, done: false },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Pipeline Status Ribbon */}
      <div
        className="p-6 rounded-2xl border"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <h4
          className="text-xs font-bold uppercase tracking-wider mb-5"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Active Application Progress
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stages.map((st, i) => (
            <div
              key={st.label}
              className="p-3.5 rounded-xl border flex flex-col justify-between"
              style={{
                background: st.active
                  ? "var(--color-primary-50)"
                  : "var(--color-surface)",
                borderColor: st.active
                  ? "var(--color-primary-300)"
                  : "var(--color-border)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Step 0{i + 1}
                </span>
                {st.done && (
                  <CheckCircle2 size={14} className="text-success-500" />
                )}
                {st.active && (
                  <Sparkles size={14} className="text-primary-600" />
                )}
              </div>
              <div className="mt-3">
                <p className="text-lg font-extrabold text-primary-600">
                  {st.count}
                </p>
                <p
                  className="text-xs font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {st.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Offer Card */}
      <div
        className="p-5 rounded-2xl border"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-success-600" />
            <span
              className="text-sm font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Active Offer Received: Senior Engineer @ Stripe
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-success-50 text-success-600">
            Decision in 4 Days
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900">
          <div>
            <p
              className="text-[11px]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Base Salary
            </p>
            <p
              className="text-sm font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              $185,000
            </p>
          </div>
          <div>
            <p
              className="text-[11px]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Annual Equity
            </p>
            <p className="text-sm font-bold text-primary-600">$60,000 / yr</p>
          </div>
          <div>
            <p
              className="text-[11px]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Signing Bonus
            </p>
            <p className="text-sm font-bold text-success-600">$25,000</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── EXPANDED CARD 5: AI INTERVIEW PREPARATION ──────────────────── */
function InterviewPrepContent() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div
        className="p-5 rounded-2xl border"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center gap-2.5 mb-1.5 text-primary-600 font-bold text-sm">
          <BrainCircuit size={18} /> Role-Specific AI Mock Simulation
        </div>
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          Simulated questions generated based on Stripe&apos;s React
          architectural stack &amp; design system engineering expectations.
        </p>
      </div>

      <div
        className="p-5 rounded-2xl border space-y-3"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600">
            System Design Question
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            High Frequency · Difficulty: Hard
          </span>
        </div>

        <p
          className="text-sm font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          &ldquo;How would you architect a resilient, offline-capable dashboard
          that handles real-time payment webhook streaming and state
          synchronization?&rdquo;
        </p>

        <div className="p-4 rounded-xl border bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800 space-y-2">
          <p className="text-xs font-bold text-primary-700 dark:text-primary-300 flex items-center gap-1.5">
            <Sparkles size={13} /> Recommended Key Talking Points (STAR Method):
          </p>
          <ul className="text-xs space-y-1.5 list-disc list-inside text-neutral-700 dark:text-neutral-200">
            <li>
              Highlight optimistic UI updates with TanStack Query mutation
              rollbacks.
            </li>
            <li>
              Explain IndexedDB caching with Service Worker background
              synchronization.
            </li>
            <li>
              Discuss WebSockets fallback with exponential backoff heartbeat
              reconnection.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ─── EXPANDED CARD 6: COMPENSATION INTELLIGENCE ─────────────────── */
function CompensationContent() {
  const percentiles = [
    { label: "25th (Entry/Junior)", val: "$140,000" },
    { label: "50th (Market Median)", val: "$172,000", highlight: true },
    { label: "75th (Top Quartile)", val: "$198,000" },
    { label: "90th (Top Tier Tech)", val: "$235,000" },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div
        className="p-5 rounded-2xl border flex items-center justify-between"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div>
          <h4
            className="text-sm font-bold flex items-center gap-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            <TrendingUp size={16} className="text-success-600" /> Senior
            Frontend Engineer Benchmark
          </h4>
          <p
            className="text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Based on 3,400+ verified offers in San Francisco, New York, and US
            Remote.
          </p>
        </div>
        <DollarSign size={24} className="text-success-600 hidden sm:block" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {percentiles.map((p) => (
          <div
            key={p.label}
            className="p-4 rounded-xl border text-center"
            style={{
              background: p.highlight
                ? "var(--color-primary-50)"
                : "var(--color-card)",
              borderColor: p.highlight
                ? "var(--color-primary-300)"
                : "var(--color-border)",
            }}
          >
            <p
              className="text-[11px]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {p.label}
            </p>
            <p
              className="text-base font-extrabold mt-1.5"
              style={{
                color: p.highlight
                  ? "var(--color-primary-600)"
                  : "var(--color-text-primary)",
              }}
            >
              {p.val}
            </p>
          </div>
        ))}
      </div>

      <div
        className="p-5 rounded-2xl border flex items-center justify-between gap-4"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div>
          <p
            className="text-xs font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Ready to negotiate your highest offer?
          </p>
          <p
            className="text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Get AI-generated counter-offer emails and leverage scenarios.
          </p>
        </div>
        <Link
          href="/signup"
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all shrink-0"
        >
          Unlock Scripts
        </Link>
      </div>
    </div>
  );
}

/* ─── CAROUSEL CARDS DATA ────────────────────────────────────────── */
const CAROUSEL_CARDS = [
  {
    category: "AI Matching",
    title: "Transparent match score on every job.",
    src: "/section2/Transparentmatchscoreoneveryjob.jpg",
    content: <MatchScoringContent />,
  },
  {
    category: "Resume AI",
    title: "Upload once, get understood instantly.",
    src: "/section2/A%20daily%20feed%20built%20around%20you.jpg",
    content: <ResumeAIContent />,
  },
  {
    category: "Smart Discovery",
    title: "A daily feed built around you.",
    src: "/section2/A%20daily%20feed%20built%20around%20you.jpg",
    content: <DiscoveryFeedContent />,
  },
  {
    category: "Career Pipeline",
    title: "Track every application to the offer.",
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2600&auto=format&fit=crop",
    content: <PipelineTrackingContent />,
  },
  {
    category: "Interview Prep",
    title: "Ace interviews with role-tailored AI prep.",
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2600&auto=format&fit=crop",
    content: <InterviewPrepContent />,
  },
  {
    category: "Market Intel",
    title: "Know your true compensation value.",
    src: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=2600&auto=format&fit=crop",
    content: <CompensationContent />,
  },
];

/* ─── EXPORTED SECTION ───────────────────────────────────────────── */
export function FeaturesSection() {
  const cards = CAROUSEL_CARDS.map((card, index) => (
    <Card key={card.title} card={card} index={index} layout={true} />
  ));

  return (
    <section
      id="features"
      className="py-8 md:py-12 overflow-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-2">
        <div className="flex flex-col items-start">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Get to know your JobFits.
          </h2>

          <p
            className="mt-2 text-base sm:text-lg max-w-2xl leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Tap any card to explore how our intelligent matching, resume AI,
            interview prep, and pipeline tracking give you an unfair advantage.
          </p>
        </div>
      </div>

      {/* Aceternity Apple Cards Carousel */}
      <Carousel items={cards} />
    </section>
  );
}
