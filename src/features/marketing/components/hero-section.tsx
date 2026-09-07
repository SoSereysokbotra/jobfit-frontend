"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  Search,
  MapPin,
  CheckCircle2,
  FileText,
  Calendar,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { Reveal } from "@/shared/components/motion/reveal";
import { LogoMarquee, type MarqueeLogo } from "./logo-marquee";
import { useTranslation } from "@/providers/locale-provider";

/* Auto-scrolling platform logos */
const PLATFORM_LOGOS: MarqueeLogo[] = [
  { src: "/linkedin.png", label: "LinkedIn" },
  { src: "/slack.png", label: "Slack" },
  { src: "/telegram.png", label: "Telegram" },
  { src: "/communication.png", label: "Facebook" },
  { src: "/unnamed.png", label: "Khmer24" },
  { src: "/Indeed-wordmark.webp" },
];

const POPULAR_TAGS = ["React 19", "TypeScript", "AI / LLMs", "Staff Engineer", "Remote"];

export function HeroSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (locationQuery.trim()) params.set("location", locationQuery.trim());
    router.push(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden pt-8 sm:pt-14 pb-14 sm:pb-20" style={{ background: "var(--color-bg)" }}>
      {/* ── Ambient Radial Mesh Glow ── */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[520px] rounded-full opacity-30 dark:opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, var(--color-primary-500) 0%, var(--color-primary-200) 45%, transparent 75%)",
          filter: "blur(110px)",
        }}
      />
      <div
        className="absolute top-1/4 right-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--color-primary-600) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Center Hero Header ── */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Announcement pill with subtle glowing border */}
          <Reveal variant="fade">
            <Link
              href="#simulator"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border border-primary-500/25 bg-primary-50/70 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 hover:bg-primary-100/80 transition-all duration-200 group mb-6 shadow-sm hover:border-primary-500/40 backdrop-blur-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary-600 animate-pulse" />
              <span>Next-Gen Semantic Match Engine · 94.8% Precision</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5 text-primary-600" />
            </Link>
          </Reveal>

          {/* Master Headline with tightened tracking and crisp line height */}
          <Reveal
            as="h1"
            delay={60}
            className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[-0.03em] leading-[1.08]"
            style={{ color: "var(--color-text-primary)" }}
          >
            {t("marketing.heroTitlePrefix") || "The smartest way to find"}{" "}
            <br className="hidden sm:inline" />
            {t("marketing.heroTitleMiddle") || "a job that"}{" "}
            <span className="text-gradient-animated">
              {t("marketing.heroTitleAccent") || "truly fits"}
            </span>
          </Reveal>

          {/* Subheadline with balanced line length and typography */}
          <Reveal
            as="p"
            delay={140}
            className="mt-6 text-base sm:text-lg md:text-xl leading-relaxed text-content-secondary max-w-2xl"
          >
            {t("marketing.heroSubtitle") ||
              "Stop spraying applications into the void. JobFits analyzes your exact skills, seniority, and compensation targets with deep semantic scoring to unlock verified tech opportunities."}
          </Reveal>

          {/* Dual Action CTAs */}
          <Reveal delay={220} className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="relative group overflow-hidden px-7 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 hover:opacity-95 shadow-xl shadow-primary-600/30 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 inline-flex items-center gap-2.5"
            >
              <span>{t("marketing.ctaButton") || "Upload Resume & Match Free"}</span>
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
            </Link>
            <Link
              href="/jobs"
              className="px-6 py-3.5 rounded-2xl text-sm font-bold border border-border bg-surface hover:bg-surface-hover transition-all duration-200 hover:-translate-y-0.5 active:scale-95 inline-flex items-center gap-2 shadow-sm"
              style={{ color: "var(--color-text-primary)" }}
            >
              <Search size={15} className="text-content-tertiary" />
              <span>{t("marketing.exploreJobs") || "Browse 15,000+ Jobs"}</span>
            </Link>
          </Reveal>

          {/* Integrated Quick Search Bar */}
          <Reveal delay={300} className="w-full max-w-3xl mt-9">
            <form
              onSubmit={handleSearchSubmit}
              className="p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border border-border/80 shadow-lg shadow-black/[0.04] flex flex-col sm:flex-row items-center gap-2 backdrop-blur-xl bg-surface/90"
            >
              <div className="flex-1 w-full flex items-center gap-2.5 px-3 py-2">
                <Search size={17} className="text-primary-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, skill, or company (e.g. React 19, Staff Engineer)…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-content placeholder:text-content-tertiary focus:outline-none font-medium"
                />
              </div>

              <div className="h-6 w-px bg-border/80 hidden sm:block" />

              <div className="w-full sm:w-56 flex items-center gap-2 px-3 py-2">
                <MapPin size={16} className="text-content-tertiary shrink-0" />
                <input
                  type="text"
                  placeholder="Remote / Worldwide"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-content placeholder:text-content-tertiary focus:outline-none font-medium"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 shadow-sm hover:-translate-y-0.5 active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
              >
                <span>Find Matches</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Trending tags */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-content-tertiary">
              <span className="font-semibold text-content-secondary mr-1">Trending:</span>
              {POPULAR_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    router.push(`/jobs?q=${encodeURIComponent(tag)}`);
                  }}
                  className="px-2.5 py-0.5 rounded-lg bg-surface hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 border border-border transition-colors font-medium text-[11px]"
                >
                  {tag}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ── HERO PRODUCT SHOWCASE (State-of-the-Art Mockup) ── */}
        <Reveal variant="scale" delay={380} className="mt-14 sm:mt-16 max-w-5xl mx-auto">
          <div className="relative">
            {/* Ambient decorative glow around card */}
            <div
              className="absolute -inset-2 rounded-3xl opacity-25 pointer-events-none bg-gradient-to-r from-primary-600 via-primary-400 to-primary-700 blur-xl"
            />

            {/* Glass App Frame */}
            <div
              className="relative rounded-2xl sm:rounded-3xl border border-border/80 overflow-hidden shadow-2xl backdrop-blur-2xl bg-surface/95"
            >
              {/* Window Title Bar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/70 bg-bg-secondary/60">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400/80 inline-block" />
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-border text-[11px] text-content-tertiary font-mono ml-3">
                    <Lock size={10} className="text-success-600" />
                    <span>jobfit.ai/eval/stripe-sr-frontend-architect</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-success-50 text-success-600 border border-success-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-ping" />
                    Live Evaluation Active
                  </span>
                </div>
              </div>

              {/* Product Card Body: 2 Columns */}
              <div className="p-5 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left Col (7 cols): Role info & breakdown */}
                <div className="md:col-span-7 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-600 mb-1">
                        <Sparkles size={12} /> Top 1% Affinity Match
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-content tracking-tight">
                        Senior Frontend Architect
                      </h3>
                      <p className="text-xs text-content-tertiary mt-0.5">
                        Stripe · Full-time · San Francisco / Remote
                      </p>
                    </div>
                    <span className="text-sm font-black text-content bg-bg-secondary px-3 py-1 rounded-xl border border-border shrink-0">
                      $185K – $220K
                    </span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-100/80 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/40">
                      ✓ React 19
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-100/80 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/40">
                      ✓ TypeScript 5
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-100/80 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-800/40">
                      ✓ Next.js 15
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-content-secondary border border-border">
                      +14 verified skills
                    </span>
                  </div>

                  {/* 4 Factor Breakdown Bars */}
                  <div className="space-y-2.5 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-content-secondary font-medium">Technical Competency</span>
                        <span className="font-bold text-primary-600">98% Match</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full" style={{ width: "98%" }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-content-secondary font-medium">Experience & Seniority</span>
                        <span className="font-bold text-primary-600">94% Match</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full" style={{ width: "94%" }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-content-secondary font-medium">Salary & Compensation Alignment</span>
                        <span className="font-bold text-success-600">100% Match</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <div className="h-full bg-success-500 rounded-full" style={{ width: "100%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col (5 cols): Circular Gauge & Quick Action */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-primary-50/70 to-surface border border-primary-200/60 dark:border-primary-800/40 text-center relative overflow-hidden">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-neutral-200 dark:text-neutral-800"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="48"
                        fill="transparent"
                        stroke="var(--color-primary-600)"
                        strokeWidth="8"
                        strokeDasharray={301.6}
                        strokeDashoffset={301.6 * (1 - 0.96)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-content tracking-tight">96%</span>
                      <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">
                        Match Index
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-success-600 mt-3 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    Top 4% Candidate Profile
                  </p>
                  <p className="text-[11px] text-content-tertiary mt-0.5">
                    High probability of first-round interview
                  </p>
                  <Link
                    href="/signup"
                    className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-600/20 transition-all hover:-translate-y-0.5"
                  >
                    Apply with 1-Click Match
                  </Link>
                </div>
              </div>
            </div>

            {/* Satellite Floating Badge 1 (Top Right) */}
            <div className="hidden lg:flex absolute -top-5 -right-5 items-center gap-3 p-3 rounded-2xl border border-border shadow-xl bg-surface/95 backdrop-blur-xl animate-float">
              <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                <FileText size={16} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-content">Instant ATS Scanner</p>
                <p className="text-[10px] text-success-600 font-bold">98/100 · 24 Skills Parsed</p>
              </div>
            </div>

            {/* Satellite Floating Badge 2 (Bottom Left) */}
            <div className="hidden lg:flex absolute -bottom-5 -left-5 items-center gap-3 p-3 rounded-2xl border border-border shadow-xl bg-surface/95 backdrop-blur-xl animate-float-delayed">
              <div className="w-8 h-8 rounded-xl bg-success-100 text-success-600 flex items-center justify-center shrink-0">
                <Calendar size={16} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-content">Interview Scheduled</p>
                <p className="text-[10px] text-content-secondary font-medium">Stripe · Tomorrow 2:00 PM</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── TRUSTED-BY PLATFORMS FOOTER ── */}
        <div className="mt-14 sm:mt-18 max-w-4xl mx-auto flex flex-col items-center text-center">
          <Reveal delay={440} variant="fade" className="w-full">
            <p className="text-[11px] font-bold uppercase tracking-widest text-content-tertiary mb-3">
              Aggregating and verifying live opportunities from trusted platforms
            </p>
            <div className="[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <LogoMarquee logos={PLATFORM_LOGOS} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
