"use client";

import React from "react";
import Link from "next/link";
import { Check, AlertCircle, Sparkles, FileText } from "lucide-react";
import { useSkillGap } from "../hooks/use-skill-gap";
import type { SkillGapDto } from "../api/matching.api";

/**
 * "What does this job ask for that my résumé doesn't show?"
 *
 * NO MATCH PERCENTAGE, on purpose. The LLM fitScore was measured against 150 hand-graded
 * pairs and came out uncorrelated with real fit — BAD jobs scored higher than GREAT ones.
 * Showing a number here would be confident and wrong. The requirement lists are what the
 * same measurement found reliable, so the lists are all this renders.
 */
export function SkillGapPanel({ jobId }: { jobId: string }) {
  const { data, isLoading, isError } = useSkillGap(jobId);

  if (isLoading) return <Shell><p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>Checking requirements…</p></Shell>;
  // A failure here is not worth alarming the user about — the rest of the page is fine.
  if (isError || !data) return null;

  if (data.status === "JOB_HAS_NO_REQUIREMENTS") {
    return (
      <Shell>
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          This posting doesn&apos;t list specific requirements, so there&apos;s nothing to
          compare against.
        </p>
      </Shell>
    );
  }

  if (data.status === "NO_PARSED_RESUME") {
    return (
      <Shell>
        <p className="text-xs mb-2" style={{ color: "var(--color-text-tertiary)" }}>
          Upload a résumé and we&apos;ll show which of this job&apos;s {data.requirements.length}{" "}
          requirements it already covers.
        </p>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
          style={{ color: "var(--color-primary-600)" }}
        >
          <FileText size={13} /> Add your résumé
        </Link>
      </Shell>
    );
  }

  const total = data.requirements.length;

  return (
    <Shell>
      <p className="text-xs mb-3" style={{ color: "var(--color-text-tertiary)" }}>
        Your résumé covers <strong>{data.matchedCount} of {total}</strong> stated requirements.
      </p>

      {data.missing.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-tertiary)" }}>
            Not found in your résumé
          </p>
          <ul className="space-y-1.5">
            {data.missing.map((text, i) => (
              <li key={i} className="flex gap-1.5 text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                <AlertCircle size={13} className="shrink-0 mt-0.5" style={{ color: "var(--color-warning-600)" }} />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.matchedCount > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--color-text-tertiary)" }}>
            Covered
          </p>
          <ul className="space-y-1.5">
            {data.requirements
              .filter((r) => r.matchedSkills.length > 0)
              .map((r, i) => (
                <li key={i} className="flex gap-1.5 text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                  <Check size={13} className="shrink-0 mt-0.5" style={{ color: "var(--color-success-600)" }} />
                  <span>
                    {r.text}
                    <span style={{ color: "var(--color-text-tertiary)" }}>
                      {" "}— {r.matchedSkills.join(", ")}
                      {/* A partial hit found only part of a multi-word skill. Saying so
                          is the difference between evidence and an overstatement. */}
                      {r.matchQuality === "PARTIAL" && " (related)"}
                    </span>
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}

      {/* Which skills were actually compared. Without this, two different résumés that
          both happen to score 0 look identical, and there is no way to tell a real gap
          from a bad résumé parse. */}
      {data.skillsConsidered.length > 0 && (
        <p
          className="text-[11px] mt-3 pt-2.5 border-t"
          style={{ color: "var(--color-text-tertiary)", borderColor: "var(--color-border)" }}
        >
          Compared against your résumé skills: {data.skillsConsidered.join(", ")}.
        </p>
      )}

      <Provenance source={data.requirementsSource} />
    </Shell>
  );
}

/**
 * Says where the requirements came from.
 *
 * Not optional polish: an AI reading of a posting is useful but NOT the employer's words,
 * and presenting the two identically overstates what we actually know. On measurement, the
 * extractor invented 12 requirements across 39 postings before filtering — it is good, not
 * authoritative.
 */
function Provenance({ source }: { source: SkillGapDto["requirementsSource"] }) {
  if (source !== "AI_EXTRACTED") return null;
  return (
    <p
      className="flex items-start gap-1.5 text-[11px] mt-3 pt-2.5 border-t"
      style={{ color: "var(--color-text-tertiary)", borderColor: "var(--color-border)" }}
    >
      <Sparkles size={12} className="shrink-0 mt-0.5" />
      <span>
        This posting had no requirements list, so these were read from its description by AI.
        Check the full description before relying on them.
      </span>
    </p>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-4 rounded-lg border"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <h3 className="text-sm font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
        How you match
      </h3>
      {children}
    </div>
  );
}
