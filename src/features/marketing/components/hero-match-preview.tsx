"use client";

import React from "react";
import { MapPin, Sparkles } from "lucide-react";
import MatchScoreBadge from "@/shared/components/data-display/match-score-badge";

/* The four dimensions the real match engine scores against, so the preview
   mirrors the product instead of inventing a different model. */
const FACTORS = [
  { label: "Technical skills", score: 96, weight: "40%" },
  { label: "Experience level", score: 90, weight: "25%" },
  { label: "Location & work mode", score: 100, weight: "20%" },
  { label: "Salary alignment", score: 92, weight: "15%" },
];

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
        <MatchScoreBadge score={94} size="md" className="shrink-0" />
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

      {/* Score composition. Labels and bars share a row from `sm` up; below
          that they stack, because a fixed label column wide enough for
          "Location & work mode (20%)" leaves no room for the bar on a phone. */}
      <div className="p-5 space-y-3.5 sm:space-y-3">
        {FACTORS.map((factor) => (
          <div key={factor.label} className="sm:flex sm:items-center sm:gap-3">
            <div className="flex items-baseline justify-between gap-2 sm:w-56 sm:shrink-0">
              <p
                className="text-xs sm:text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {factor.label}
                <span style={{ color: "var(--color-text-tertiary)" }}>
                  {" "}
                  ({factor.weight})
                </span>
              </p>
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
