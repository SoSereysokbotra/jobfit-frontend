"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Briefcase, FileText, CheckCircle2 } from "lucide-react";
import { useSkillGaps } from "@/features/learning/hooks/use-learning";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import type { SkillGapDto } from "@/features/learning/api/learning.api";

const cta =
  "px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 inline-flex items-center gap-1.5";

/**
 * One gap: the requirement in the employer's own words, and how many of the user's
 * applications ask for it.
 *
 * No course link. The requirement is a full sentence — "3+ years building production web
 * applications with React and TypeScript" — and there is no course source to look it up in.
 * A search URL built from that sentence returns nothing useful, and dressing it up as a
 * recommendation would be the same lie as the page it replaces.
 */
function GapCard({ gap, totalJobs }: { gap: SkillGapDto; totalJobs: number }) {
  const emphasis = gap.requiredBy > 1;
  return (
    <div
      className="rounded-lg border p-4 flex flex-col gap-2.5"
      style={{
        background: "var(--color-card)",
        borderColor: emphasis ? "var(--color-primary-200)" : "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <p className="text-sm font-semibold leading-snug" style={{ color: "var(--color-text-primary)" }}>
        {gap.requirement}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            background: emphasis ? "var(--color-primary-100)" : "var(--color-bg-secondary)",
            color: emphasis ? "var(--color-primary-700)" : "var(--color-text-secondary)",
          }}
        >
          Asked for by {gap.requiredBy} of your {totalJobs}{" "}
          {totalJobs === 1 ? "application" : "applications"}
        </span>

        {/* The user is entitled to know whether this is the employer's wording or the
            model's reading of a free-text posting. */}
        {gap.source === "AI_EXTRACTED" && (
          <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            read from the job description
          </span>
        )}
      </div>

      {/* Naming the jobs is what makes the count checkable rather than merely stated. */}
      {gap.jobTitles && gap.jobTitles.length > 0 && (
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {gap.jobTitles.join(" · ")}
        </p>
      )}
    </div>
  );
}

export default function LearningPage() {
  const { data, isLoading, isError, error } = useSkillGaps();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-full" style={{ background: "var(--color-bg-secondary)" }}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Skill Gaps
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          What the jobs you applied to ask for that your CV doesn&apos;t show yet.
        </p>
      </div>

      {isError && (
        <Alert variant="error">
          {error instanceof Error ? error.message : "Could not load your skill gaps."}
        </Alert>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      ) : !data ? null : !data.hasApplications ? (
        // Three different empty answers, deliberately not one shared screen. Showing them
        // identically is how this page ended up telling a maths teacher to learn Docker.
        <EmptyState
          icon={<Briefcase size={26} />}
          title="Apply to a few jobs first"
          description="Once you've applied, this page shows what those jobs asked for that your CV doesn't cover yet — whatever your field."
          action={<Link href="/jobs" className={cta}><Briefcase size={13} /> Browse jobs</Link>}
        />
      ) : !data.hasParsedResume ? (
        <EmptyState
          icon={<FileText size={26} />}
          title="Upload your CV"
          description="We compare the jobs you applied to against the skills on your CV. Without one there's nothing to compare, so everything would look like a gap."
          action={<Link href="/resume" className={cta}><FileText size={13} /> Upload a CV</Link>}
        />
      ) : data.gaps.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={26} />}
          title="Nothing missing"
          description={`Your CV covers everything the ${data.jobsConsidered} ${
            data.jobsConsidered === 1 ? "job" : "jobs"
          } you applied to asked for.`}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} style={{ color: "var(--color-primary-600)" }} />
            <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
              {data.gaps.length} {data.gaps.length === 1 ? "gap" : "gaps"} across{" "}
              {data.jobsConsidered} {data.jobsConsidered === 1 ? "application" : "applications"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.gaps.map((gap) => (
              <GapCard key={gap.requirement} gap={gap} totalJobs={data.jobsConsidered} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
