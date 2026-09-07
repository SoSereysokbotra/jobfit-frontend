"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useScroll, useSpring, type MotionValue } from "framer-motion";
import { Reveal } from "@/shared/components/motion/reveal";
import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { cn } from "@/shared/utils/cn";

const STEPS = [
  {
    title: "Upload your resume",
    description: "Drag in a PDF or DOCX. Our AI reads it in seconds and builds your skill profile — no forms to fill out.",
  },
  {
    title: "Get scored matches",
    description: "Every open role is scored against your profile: skills, experience, salary, and location.",
  },
  {
    title: "Apply & track to offer",
    description: "Apply with one click, prep for interviews with AI guidance, and track every application to the offer.",
  },
];

/* Column stagger (top padding) — must stay in sync with the curve's node
   y-positions in the SVG path below so the dots sit on the line. */
const STEP_OFFSETS = ["lg:pt-64", "lg:pt-32", "lg:pt-0"];

/* Vertical position of the giant ghost number behind each step. Steps 1 & 2
   sit higher; step 3 stays lower to hug its text. */
const GHOST_TOPS = ["lg:-top-40", "lg:-top-40", "lg:-top-24"];

function StepNode({ index }: { index: number }) {
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border border-primary-500/30 dark:border-primary-400/30 shadow-md"
      style={{ background: "var(--color-card)" }}
    >
      <span className="text-xs font-black text-primary-600 dark:text-primary-400">
        0{index + 1}
      </span>
    </div>
  );
}

/**
 * Subtle surface treatments for the background 3D plane tiles.
 */
const MARQUEE_TILE_SURFACES = [
  {
    background: "bg-white/85 dark:bg-primary-950/25",
    accent: "bg-primary-500",
    line: "bg-primary-100 dark:bg-primary-800/40",
    border: "border-primary-200/90 dark:border-primary-500/20",
  },
  {
    background: "bg-primary-50/80 dark:bg-neutral-900/40",
    accent: "bg-primary-600",
    line: "bg-primary-200/80 dark:bg-neutral-800",
    border: "border-primary-300/70 dark:border-white/10",
  },
  {
    background: "bg-white/90 dark:bg-primary-900/15",
    accent: "bg-primary-500",
    line: "bg-neutral-200/80 dark:bg-primary-800/30",
    border: "border-neutral-300/80 dark:border-primary-500/15",
  },
  {
    background: "bg-primary-100/50 dark:bg-neutral-900/30",
    accent: "bg-primary-400",
    line: "bg-primary-200/70 dark:bg-neutral-800",
    border: "border-primary-200/80 dark:border-white/10",
  },
] as const;

const MARQUEE_TILE_COUNT = 24;

/** One abstract dashboard tile on the backdrop plane. Decorative only. */
function MarqueeTile({ index }: { index: number }) {
  const surface = MARQUEE_TILE_SURFACES[index % MARQUEE_TILE_SURFACES.length];

  return (
    <div
      className={cn(
        "aspect-[3/2] w-full rounded-2xl border p-4 shadow-sm backdrop-blur-[1px]",
        surface.background,
        surface.border
      )}
    >
      <div className={cn("mb-4 h-2 w-1/3 rounded-full", surface.accent)} />
      <div className={cn("mb-2 h-2 w-full rounded-full", surface.line)} />
      <div className={cn("h-2 w-2/3 rounded-full", surface.line)} />
    </div>
  );
}

/**
 * The section backdrop: a tilted plane of token-styled tiles behind the scroll stage.
 */
function HowItWorksBackdrop({ progress }: { progress: MotionValue<number> }) {
  const tiles = Array.from({ length: MARQUEE_TILE_COUNT }, (_, index) => (
    <MarqueeTile key={index} index={index} />
  ));

  const smoothProgress = useSpring(progress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {/* 3D Marquee Grid */}
      <div className="w-full h-full opacity-40 dark:opacity-20">
        <ThreeDMarquee tiles={tiles} progress={smoothProgress} />
      </div>

      {/* Radial scrim */}
      <div className="marquee-3d-scrim absolute inset-0" />

      {/* Top and bottom subtle gradient fades */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-bg-secondary) 0%, transparent 15%, transparent 85%, var(--color-bg-secondary) 100%)",
        }}
      />
    </div>
  );
}

/**
 * "How it works" — journey-curve layout: left-aligned intro, a flowing line
 * across the panel with node markers, staggered step blocks, and giant
 * ghost step numbers behind each column.
 */
export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-12 lg:pt-14 lg:pb-24"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      {/* 3D Marquee Section Backdrop */}
      <HowItWorksBackdrop progress={scrollYProgress} />

      {/* Soft circle blob behind step 3 (top right) */}
      <div
        className="absolute -top-16 -right-16 w-96 h-96 rounded-full pointer-events-none opacity-40"
        style={{ background: "var(--color-primary-50)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">

          {/* ── Left-aligned intro ─────────────────────────── */}
          <Reveal variant="left" className="relative z-10 max-w-md">
            <p
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--color-primary-600)" }}
            >
              How JobFits works
            </p>
            <h2
              className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              From resume to offer in three steps
            </h2>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
              No endless scrolling, no guessing. JobFits does the matching so you
              can focus on winning the role.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex px-6 py-2.5 rounded-full text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 active:scale-[0.98]"
            >
              Get Started
            </Link>
          </Reveal>

          {/* ── Journey curve + steps ──────────────────────── */}
          <div className="relative mt-12 lg:mt-0 lg:-mx-8">

            {/* Flowing line (desktop only) — passes through the three nodes */}
            <svg
              aria-hidden="true"
              viewBox="0 0 1200 460"
              preserveAspectRatio="none"
              className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none"
            >
              <path
                d="M 30 230
                   C 90 300, 140 322, 200 296
                   C 340 250, 460 130, 600 168
                   C 720 200, 780 120, 860 80
                   C 920 48, 960 36, 1000 40
                   C 1060 46, 1110 52, 1170 30"
                fill="none"
                stroke="var(--color-primary-500)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>

            <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8">
              {STEPS.map((step, i) => (
                <Reveal key={step.title} delay={i * 160} className={`relative ${STEP_OFFSETS[i]}`}>
                  <div className="relative z-10">
                    {/* Ghost number behind the step — sits with the content
                        so it follows each column's staggered offset. */}
                    <span
                      aria-hidden="true"
                      className={`absolute -top-24 ${GHOST_TOPS[i]} left-10 sm:left-14 -z-10 text-9xl font-black leading-none select-none pointer-events-none text-primary-500/30 dark:text-primary-400/40`}
                    >
                      {i + 1}
                    </span>
                    <StepNode index={i} />
                    <h3 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                      {step.title}
                    </h3>
                    <p
                      className="mt-2 text-sm leading-relaxed max-w-xs"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
    </section>
  );
}
