"use client";

import React from "react";
import { MapPin, Sparkles } from "lucide-react";
import MatchScoreBadge from "@/shared/components/data-display/match-score-badge";

/* The two checks the real match engine scores, with its real weights
   (jobfit-backend weighted-match.calculator.ts: ROLE_WEIGHTS, PREFERENCE_WEIGHTS),
   so the preview mirrors the product instead of inventing a different model.
   The numbers are consistent with the engine's formula:
     can-do = 96×0.6 + 90×0.4                   = 93.6
     want   = 100×0.35 + 100×0.25 + 100×0.2 + 90×0.2 = 98
     final  = round(93.6 × (0.30 + 0.70 × 0.98)) = 92 */
const FACTORS = [
  { label: "Can you do it?", score: 94, detail: "Skills 60% · Experience 40%" },
  {
    label: "Do you want it?",
    score: 98,
    detail: "Work type & location 35% · Job type 25% · Level 20% · Salary 20%",
  },
];
const FINAL_SCORE = 92;

/**
 * Illustrative match card shown under the hero copy.
 *
 * The hero was previously text-only inside a 100dvh section, which left a
 * few hundred pixels of dead space above the fold and showed nothing of the
 * product. This puts the transparent score — the thing JobFits actually
 * sells — in front of the visitor immediately.
 *
 * Decorative sample data; not fetched.
 */
export function HeroMatchPreview() {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-2xl rounded-2xl border overflow-hidden text-left"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-xl)",
      }}
    >
      {/* Role header */}
      <div
        className="flex items-center gap-4 p-5 border-b"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <MatchScoreBadge score={FINAL_SCORE} size="md" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p
            className="text-sm sm:text-base font-bold truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            Senior Frontend Engineer
          </p>
          <p
            className="mt-0.5 text-xs sm:text-sm truncate"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Stripe · $165K – $210K
          </p>
        </div>
        <span
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 bg-primary-50 text-primary-700 dark:text-primary-300"
        >
          <MapPin size={12} /> Remote
        </span>
      </div>

      {/* Score composition: the two checks, each with what it is made of.
          Labels and bars share a row from `sm` up; below that they stack. */}
      <div className="p-5 space-y-4">
        {FACTORS.map((factor) => (
          <div key={factor.label} className="sm:flex sm:items-center sm:gap-3">
            <div className="flex items-baseline justify-between gap-2 sm:w-64 sm:shrink-0">
              <div className="min-w-0">
                <p
                  className="text-xs sm:text-sm font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {factor.label}
                </p>
                <p
                  className="mt-0.5 text-[11px] sm:text-xs leading-snug"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {factor.detail}
                </p>
              </div>
              <p
                className="text-xs font-bold sm:hidden"
                style={{ color: "var(--color-text-primary)" }}
              >
                {factor.score}
              </p>
            </div>

            <div className="mt-1.5 flex items-center gap-3 sm:mt-0 sm:flex-1">
              <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ background: "var(--color-neutral-100)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${factor.score}%`,
                    background: "var(--color-primary-500)",
                  }}
                />
              </div>
              <p
                className="hidden sm:block text-sm font-bold w-9 text-right shrink-0"
                style={{ color: "var(--color-text-primary)" }}
              >
                {factor.score}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Rationale */}
      <div
        className="flex items-start gap-2 px-5 py-3.5 border-t"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <Sparkles
          size={14}
          className="mt-0.5 shrink-0"
          style={{ color: "var(--color-primary-600)" }}
        />
        <p
          className="text-xs sm:text-sm leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Your React and TypeScript depth covers every core requirement — only{" "}
          <span
            className="font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            GraphQL federation
          </span>{" "}
          is missing, and it is listed as optional.
        </p>
      </div>
    </div>
  );
}
