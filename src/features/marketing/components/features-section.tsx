"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Sliders,
  DollarSign,
  Zap,
  X,
  Layers,
  MessageSquare,
} from "lucide-react";
import MatchScoreBadge from "@/shared/components/data-display/match-score-badge";
import { Reveal } from "@/shared/components/motion/reveal";

/* ─── EXPANDED CARD 1: AI MATCH SCORING ──────────────────────────── */
function MatchScoringContent() {
  const breakdown = [
    {
      label: "Technical Skills",
      score: 96,
      weight: "40%",
      detail: "React 19, TypeScript, Next.js, GraphQL",
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
              Candidate_Senior_Resume.pdf
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Parsed in 1.1s · 18 skills extracted · ATS Grade: 98/100
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

/* ─── EXPANDED CARD 3: COMPENSATION INTEL ────────────────────────── */
function CompensationContent() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div
        className="p-6 rounded-2xl border space-y-4"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h4
              className="text-sm font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              Verified Senior Frontend Compensation Band
            </h4>
            <p
              className="text-xs"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Based on 3,420 real data points for San Francisco &amp; Remote Tech
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-success-50 text-success-600">
            Median: $175K
          </span>
        </div>

        {/* Range Chart Graphic */}
        <div className="space-y-2 pt-2">
          <div
            className="relative h-5 rounded-full overflow-hidden flex"
            style={{ background: "var(--color-neutral-100)" }}
          >
            <div className="h-full bg-neutral-300 w-1/4" title="P25: $140K" />
            <div className="h-full bg-primary-500 w-2/4" title="P50-P75: $175K–$205K" />
            <div className="h-full bg-primary-700 w-1/4" title="P90: $230K+" />
          </div>
          <div
            className="flex justify-between text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <span>P25 ($140K)</span>
            <span className="font-bold text-primary-600">Median ($175K)</span>
            <span>P75 ($205K)</span>
            <span>P90 ($230K+)</span>
          </div>
        </div>
      </div>

      <div
        className="p-5 rounded-2xl border flex items-center justify-between gap-4"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div>
          <p
            className="text-xs font-bold uppercase"
            style={{ color: "var(--color-text-primary)" }}
          >
            AI Salary Negotiation Assistant
          </p>
          <p
            className="text-xs text-content-secondary mt-0.5"
          >
            Generate tailor-made counter-offer scripts and leverage scenarios.
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

/* ─── EXPANDED CARD 4: INTERVIEW PREP ────────────────────────────── */
function InterviewPrepContent() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div
        className="p-6 rounded-2xl border space-y-4"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between">
          <h4
            className="text-sm font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Role-Specific STAR Talking Points (Stripe)
          </h4>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-600">
            System Design Round
          </span>
        </div>

        <div className="space-y-3 pt-2">
          <div className="p-4 rounded-xl border bg-surface space-y-1">
            <span className="text-[11px] font-bold text-primary-600 uppercase">
              Question: Micro-frontends at scale
            </span>
            <p className="text-xs text-content-secondary leading-relaxed">
              &ldquo;How would you isolate mission-critical checkout modules from
              third-party merchant plugins without compromising bundle size?&rdquo;
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-primary-50/50 dark:bg-primary-950/20 border-primary-200 dark:border-primary-800 space-y-1">
            <span className="text-[11px] font-bold text-primary-700 dark:text-primary-300 uppercase flex items-center gap-1">
              <Sparkles size={11} /> Suggested STAR Framework
            </span>
            <p className="text-xs text-content-secondary leading-relaxed">
              Highlight your Module Federation rollout at your previous company:
              reduced incident blast radius by 70% while preserving sub-second hydration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── EXPANDED CARD 5: PIPELINE TRACKER ──────────────────────────── */
function PipelineTrackingContent() {
  const stages = [
    { label: "Applied", count: 12, done: true },
    { label: "Screening", count: 5, done: true },
    { label: "Tech Round", count: 2, active: true },
    { label: "Final Offer", count: 1, done: false },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
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
          {stages.map((st) => (
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
              <span className="text-xs font-semibold text-content-secondary">{st.label}</span>
              <span className="text-2xl font-black mt-2 text-primary-600">
                {st.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── BENTO CARDS METADATA ───────────────────────────────────────── */
const BENTO_FEATURES = [
  {
    id: "match",
    tag: "Core Matching Engine",
    title: "Transparent match scoring on every open tech role.",
    description:
      "Stop wondering why you didn’t hear back. JobFits calculates multi-factor technical, seniority, and compensation fit so you know exactly where you stand before applying.",
    content: <MatchScoringContent />,
  },
  {
    id: "resume",
    tag: "Resume AI",
    title: "Drop in your resume. Extract 20+ skills in 2.3 seconds.",
    description:
      "Our deep parser analyzes your accomplishments, generates impact-driven bullets, and verifies compatibility against major Applicant Tracking Systems.",
    content: <ResumeAIContent />,
  },
  {
    id: "comp",
    tag: "Market Compensation Intel",
    title: "Verified salary percentiles with equity breakdown.",
    description:
      "Explore real compensation benchmarks (P25 to P90) across thousands of verified tech offers so you always enter negotiations in a position of strength.",
    content: <CompensationContent />,
  },
  {
    id: "prep",
    tag: "Interview Simulation",
    title: "AI interview coach with role-specific STAR talking points.",
    description:
      "Get questions customized to the exact job description and company engineering culture, with real-time feedback on your answers.",
    content: <InterviewPrepContent />,
  },
  {
    id: "pipeline",
    tag: "Career Pipeline",
    title: "Track every opportunity from first click to signed offer.",
    description:
      "Centralize your entire job search: automated status detection, interview reminder scheduling, and offer comparison tools.",
    content: <PipelineTrackingContent />,
  },
];

/* ─── EXPORTED BENTO FEATURES SECTION ───────────────────────────── */
export function FeaturesSection() {
  const [activeModalFeature, setActiveModalFeature] = useState<typeof BENTO_FEATURES[0] | null>(null);

  return (
    <section id="features" className="py-16 sm:py-24 relative overflow-hidden" style={{ background: "var(--color-bg-secondary)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <Reveal variant="up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/40 mb-3">
              <Layers size={13} />
              Core Capabilities
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Engineered for an unfair advantage in{" "}
              <span className="text-gradient-animated">tech hiring</span>
            </h2>
            <p
              className="mt-4 text-base sm:text-lg leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Explore how transparent match scores, instant ATS resume extraction, verified market intelligence, and interview coaches help you land high-paying roles.
            </p>
          </Reveal>
        </div>

        {/* ─── MODERN BENTO GRID ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Main Engine (Large 2-column card) */}
          <Reveal variant="scale" delay={100} className="md:col-span-2">
            <div
              className="h-full p-6 sm:p-8 rounded-3xl border flex flex-col justify-between group hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                    <Sparkles size={14} /> {BENTO_FEATURES[0].tag}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-success-50 text-success-600 border border-success-200">
                    96% Precision Rate
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-content tracking-tight">
                  {BENTO_FEATURES[0].title}
                </h3>
                <p className="mt-3 text-sm text-content-secondary leading-relaxed max-w-2xl">
                  {BENTO_FEATURES[0].description}
                </p>

                {/* Live visual preview inside card */}
                <div className="mt-6 p-4 rounded-2xl bg-bg-secondary border border-border space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-content flex items-center gap-2">
                      <MatchScoreBadge score={96} size="sm" /> Senior Frontend Architect · Stripe
                    </span>
                    <span className="text-primary-600 font-bold">Exceptional Match</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-surface border border-border">
                      <p className="text-[11px] text-content-tertiary">Skills Fit</p>
                      <p className="font-bold text-primary-600 mt-0.5">98%</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface border border-border">
                      <p className="text-[11px] text-content-tertiary">Experience</p>
                      <p className="font-bold text-primary-600 mt-0.5">94%</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface border border-border">
                      <p className="text-[11px] text-content-tertiary">Work Mode</p>
                      <p className="font-bold text-success-600 mt-0.5">100%</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface border border-border">
                      <p className="text-[11px] text-content-tertiary">Comp Fit</p>
                      <p className="font-bold text-primary-600 mt-0.5">92%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveModalFeature(BENTO_FEATURES[0])}
                  className="text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Explore full breakdown demo</span>
                  <ArrowRight size={14} />
                </button>
                <span className="text-xs text-content-tertiary">Interactive Demo</span>
              </div>
            </div>
          </Reveal>

          {/* Card 2: Instant ATS Resume Scanner */}
          <Reveal variant="scale" delay={180}>
            <div
              className="h-full p-6 sm:p-8 rounded-3xl border flex flex-col justify-between group hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 flex items-center gap-1.5 mb-4">
                  <FileText size={14} /> {BENTO_FEATURES[1].tag}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-content tracking-tight">
                  {BENTO_FEATURES[1].title}
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
                  {BENTO_FEATURES[1].description}
                </p>

                {/* Visual preview */}
                <div className="mt-5 p-3.5 rounded-2xl bg-bg-secondary border border-border">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-content">ATS Compatibility</span>
                    <span className="font-black text-success-600">98 / 100</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-950 text-[10px] font-bold text-primary-700">React 19</span>
                    <span className="px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-950 text-[10px] font-bold text-primary-700">TypeScript</span>
                    <span className="px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-950 text-[10px] font-bold text-primary-700">GraphQL</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveModalFeature(BENTO_FEATURES[1])}
                  className="text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5"
                >
                  <span>Test ATS Extractor</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </Reveal>

          {/* Card 3: Market Compensation Intel */}
          <Reveal variant="scale" delay={240}>
            <div
              className="h-full p-6 sm:p-8 rounded-3xl border flex flex-col justify-between group hover:shadow-xl transition-all duration-300"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 flex items-center gap-1.5 mb-4">
                  <DollarSign size={14} /> {BENTO_FEATURES[2].tag}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-content tracking-tight">
                  {BENTO_FEATURES[2].title}
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
                  {BENTO_FEATURES[2].description}
                </p>

                <div className="mt-5 p-4 rounded-2xl bg-bg-secondary border border-border/80 space-y-2">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-content-secondary font-medium">Senior Architect Band</span>
                    <span className="text-primary-600 font-extrabold text-sm">$175K Median</span>
                  </div>
                  <div className="relative pt-1 pb-1">
                    <div className="w-full h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex">
                      <div className="w-1/4 bg-neutral-300 dark:bg-neutral-700" />
                      <div className="w-2/4 bg-gradient-to-r from-primary-500 to-primary-600" />
                      <div className="w-1/4 bg-primary-800" />
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-content-tertiary">
                    <span>P25 ($140K)</span>
                    <span className="font-bold text-primary-600">P50 ($175K)</span>
                    <span>P90 ($230K+)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveModalFeature(BENTO_FEATURES[2])}
                  className="text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5"
                >
                  <span>View salary radar</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </Reveal>

          {/* Card 4: AI Interview Prep Coach */}
          <Reveal variant="scale" delay={300}>
            <div
              className="h-full p-6 sm:p-8 rounded-3xl border border-border/80 flex flex-col justify-between group hover:border-primary-500/40 hover:shadow-xl transition-all duration-300 bg-surface"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 flex items-center gap-1.5 mb-4">
                  <MessageSquare size={14} /> {BENTO_FEATURES[3].tag}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-content tracking-tight">
                  {BENTO_FEATURES[3].title}
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
                  {BENTO_FEATURES[3].description}
                </p>

                <div className="mt-5 p-3.5 rounded-2xl bg-primary-50/60 dark:bg-primary-950/30 border border-primary-200/80 dark:border-primary-800/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary-700 dark:text-primary-300 text-[11px] flex items-center gap-1">
                      <Sparkles size={12} /> Stripe Prep Prompt
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border text-content-tertiary">
                      System Round
                    </span>
                  </div>
                  <p className="text-content-secondary text-[11px] leading-relaxed">
                    &ldquo;Structure your answer around high-throughput cache invalidation and bundle splitting.&rdquo;
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveModalFeature(BENTO_FEATURES[3])}
                  className="text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5"
                >
                  <span>Explore interview coach</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </Reveal>

          {/* Card 5: Pipeline & Offer Tracker */}
          <Reveal variant="scale" delay={360}>
            <div
              className="h-full p-6 sm:p-8 rounded-3xl border border-border/80 flex flex-col justify-between group hover:border-primary-500/40 hover:shadow-xl transition-all duration-300 bg-surface"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 flex items-center gap-1.5 mb-4">
                  <TrendingUp size={14} /> {BENTO_FEATURES[4].tag}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-content tracking-tight">
                  {BENTO_FEATURES[4].title}
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-content-secondary leading-relaxed">
                  {BENTO_FEATURES[4].description}
                </p>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-bg-secondary border border-border">
                    <span className="text-[10px] text-content-tertiary font-medium">Applied</span>
                    <p className="font-extrabold text-content text-base mt-0.5">12</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800">
                    <span className="text-[10px] text-primary-600 dark:text-primary-400 font-medium">Interview</span>
                    <p className="font-extrabold text-primary-600 dark:text-primary-400 text-base mt-0.5">3</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-success-50 dark:bg-success-950/40 text-success-600 border border-success-200 dark:border-success-800">
                    <span className="text-[10px] font-medium">Offers</span>
                    <p className="font-extrabold text-base mt-0.5">1</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveModalFeature(BENTO_FEATURES[4])}
                  className="text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5"
                >
                  <span>See pipeline manager</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ─── MODAL DIALOG FOR DETAILED FEATURE DEEP-DIVE ───────────── */}
      {activeModalFeature && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn"
          onClick={() => setActiveModalFeature(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 sm:p-8 shadow-2xl animate-scaleUp"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setActiveModalFeature(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-surface-hover text-content-secondary hover:text-content hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>

            <div className="mb-6 pr-8">
              <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                {activeModalFeature.tag}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-content mt-1">
                {activeModalFeature.title}
              </h3>
            </div>

            {/* Feature Component Content */}
            <div className="mt-4">{activeModalFeature.content}</div>
          </div>
        </div>
      )}
    </section>
  );
}
