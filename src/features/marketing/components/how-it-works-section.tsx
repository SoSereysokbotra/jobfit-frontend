"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, FileUp, Sparkles, CheckCircle2, TrendingUp, ShieldCheck } from "lucide-react";
import { Reveal } from "@/shared/components/motion/reveal";

const STEPS = [
  {
    step: "01",
    title: "Upload Your Resume",
    subtitle: "Zero manual data entry",
    description:
      "Drop in your PDF or DOCX. Our AI parses work history, technical depth, and achievements in 2.3 seconds with full ATS validation.",
    icon: FileUp,
    badge: "Instant Extraction",
    preview: (
      <div className="p-4 rounded-2xl bg-surface border border-border space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-content">Software_Engineer_CV.pdf</span>
          <span className="text-success-600 font-bold">100% Parsed</span>
        </div>
        <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary-600 rounded-full w-full" />
        </div>
        <div className="flex flex-wrap gap-1 pt-1">
          <span className="px-2 py-0.5 rounded-md bg-primary-50 text-[10px] font-semibold text-primary-700">React 19</span>
          <span className="px-2 py-0.5 rounded-md bg-primary-50 text-[10px] font-semibold text-primary-700">TypeScript</span>
          <span className="px-2 py-0.5 rounded-md bg-primary-50 text-[10px] font-semibold text-primary-700">Next.js</span>
          <span className="px-2 py-0.5 rounded-md bg-neutral-100 text-[10px] font-semibold text-content-secondary">+15 more</span>
        </div>
      </div>
    ),
  },
  {
    step: "02",
    title: "Review Scored Matches",
    subtitle: "Transparent 0–100% ranking",
    description:
      "Every single tech role in our verified feed is scored against your profile across technical skills, seniority, and target salary.",
    icon: Sparkles,
    badge: "Deep Semantic Fit",
    preview: (
      <div className="p-4 rounded-2xl bg-surface border border-border space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-content">Senior Frontend Architect</p>
            <p className="text-[11px] text-content-tertiary">Stripe · $185K – $220K</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-primary-50 text-primary-600 border border-primary-200">
            96% Fit
          </span>
        </div>
        <div className="p-2 rounded-xl bg-success-50 text-success-700 text-[11px] font-bold flex items-center gap-1.5">
          <CheckCircle2 size={13} /> Top 4% candidate for this hiring manager
        </div>
      </div>
    ),
  },
  {
    step: "03",
    title: "Apply & Land the Offer",
    subtitle: "1-click pipeline tracking",
    description:
      "Apply with tailored talking points, prepare for the interview round with role-specific AI coaching, and track offers in one dashboard.",
    icon: TrendingUp,
    badge: "Offer Secured",
    preview: (
      <div className="p-4 rounded-2xl bg-surface border border-border space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-content">Interview Stage 3/3</span>
          <span className="text-success-600 font-bold">Offer Extended</span>
        </div>
        <div className="p-2.5 rounded-xl bg-primary-50/70 border border-primary-200 text-xs">
          <p className="font-bold text-primary-700">Offer: $195K Base + Equity</p>
          <p className="text-[11px] text-content-secondary mt-0.5">AI salary script saved +$20K during round</p>
        </div>
      </div>
    ),
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 relative overflow-hidden" style={{ background: "var(--color-bg)" }}>
      {/* Background ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-96 rounded-full opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--color-primary-400) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <Reveal variant="up">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/40 mb-3">
              <ShieldCheck size={13} />
              Simple 3-Step Process
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              From resume to offer in{" "}
              <span className="text-gradient-animated">three clear steps</span>
            </h2>
            <p
              className="mt-4 text-base sm:text-lg leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              No opaque recruiter screens. No black-hole submissions. JobFits gives you clarity and control over your tech career.
            </p>
          </Reveal>
        </div>

        {/* 3-Step Horizontal Timeline Grid with connecting line on desktop */}
        <div className="relative">
          {/* Subtle desktop connector line behind step cards */}
          <div
            className="hidden md:block absolute top-20 left-[16%] right-[16%] h-0.5 pointer-events-none z-0"
            style={{
              background: "linear-gradient(90deg, var(--color-primary-300) 0%, var(--color-primary-500) 50%, var(--color-primary-300) 100%)",
              opacity: 0.35,
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.step} delay={i * 140} variant="up">
                  <div
                    className="h-full flex flex-col justify-between p-6 sm:p-8 rounded-3xl border border-border/80 transition-all duration-300 hover:border-primary-500/40 hover:-translate-y-1 hover:shadow-xl group bg-surface relative"
                  >
                    <div>
                      {/* Step badge & numbering */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center border border-primary-200 dark:border-primary-800/40 font-bold group-hover:scale-110 transition-transform shadow-sm">
                          <Icon size={22} />
                        </div>
                        <span className="text-3xl font-black text-neutral-300 dark:text-neutral-700 tracking-tighter font-mono">
                          {s.step}
                        </span>
                      </div>

                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600">
                        {s.subtitle}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black text-content tracking-tight mt-1 mb-3">
                        {s.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-content-secondary leading-relaxed mb-6">
                        {s.description}
                      </p>
                    </div>

                    {/* Interactive mock preview */}
                    <div className="pt-2">{s.preview}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* Bottom Fast Action */}
        <Reveal variant="scale" delay={300} className="mt-12 sm:mt-16 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-600/20 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <span>Start Free Candidate Match in 60 Seconds</span>
            <ArrowRight size={15} />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
