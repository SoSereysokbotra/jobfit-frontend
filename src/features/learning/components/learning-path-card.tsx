"use client";

import React from "react";
import { ExternalLink, BookOpen } from "lucide-react";
import type { SkillGapRecommendation } from "../api/learning.api";

/** One skill-gap recommendation: the missing skill plus curated resources. */
export function LearningPathCard({ recommendation }: { recommendation: SkillGapRecommendation }) {
  const { skill, resources } = recommendation;
  return (
    <div
      className="rounded-lg border p-5"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
          style={{ background: "var(--color-primary-50)", color: "var(--color-primary-600)" }}
        >
          <BookOpen size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{skill}</h3>
          <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            {resources.length} resource{resources.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <ul className="space-y-1.5">
        {resources.map((r) => (
          <li key={r.url}>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border transition-colors hover:bg-primary-50 group"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span className="min-w-0">
                <span className="text-sm font-semibold block truncate" style={{ color: "var(--color-text-primary)" }}>{r.title}</span>
                <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{r.provider}</span>
              </span>
              <ExternalLink size={14} className="shrink-0" style={{ color: "var(--color-primary-500)" }} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
