import React from "react";
import Link from "next/link";

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

function StepNode() {
  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
      style={{ background: "var(--color-card)", boxShadow: "var(--shadow-lg)" }}
    >
      <span className="w-3 h-3 rounded-full" style={{ background: "var(--color-primary-500)" }} />
    </div>
  );
}

/**
 * "How it works" — journey-curve layout: left-aligned intro, a flowing line
 * across the panel with node markers, staggered step blocks, and giant
 * ghost step numbers behind each column.
 */
export function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28" style={{ background: "var(--color-card)" }}>
      {/* Soft circle blob behind step 3 (top right) */}
      <div
        className="absolute -top-16 -right-16 w-96 h-96 rounded-full pointer-events-none opacity-60"
        style={{ background: "var(--color-primary-50)" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

          {/* ── Left-aligned intro ─────────────────────────── */}
          <div className="relative z-10 max-w-md">
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
          </div>

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
                <div key={step.title} className={`relative ${STEP_OFFSETS[i]}`}>
                  {/* Ghost number behind the step */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-14 left-24 text-9xl font-extrabold leading-none select-none pointer-events-none"
                    style={{ color: "var(--color-neutral-100)" }}
                  >
                    {i + 1}
                  </span>

                  <div className="relative z-10">
                    <StepNode />
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
                </div>
              ))}
            </div>
          </div>
        </div>
    </section>
  );
}

