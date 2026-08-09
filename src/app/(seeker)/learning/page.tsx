"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, FileText, CheckCircle2, AlertTriangle, Circle, Users } from "lucide-react";
import { useSkillGaps } from "@/features/learning/hooks/use-learning";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import type { ApplicationGapsDto, SkillGapDto } from "@/features/learning/api/learning.api";

const cta =
  "px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 inline-flex items-center gap-1.5";

/**
 * One requirement.
 *
 * No course link: gaps are full sentences — "3+ years building production web applications
 * with React and TypeScript" — and there is no course source to look one up in. A search URL
 * built from that sentence returns nothing useful.
 */
function GapRow({ gap }: { gap: SkillGapDto }) {
  const weak = gap.coverage === "PARTIAL";
  return (
    <li
      className="flex gap-3 px-4 py-3 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      {weak ? (
        <AlertTriangle size={15} className="shrink-0 mt-0.5" style={{ color: "var(--color-warning-600)" }} />
      ) : (
        <Circle size={15} className="shrink-0 mt-0.5" style={{ color: "var(--color-text-disabled)" }} />
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug" style={{ color: "var(--color-text-primary)" }}>
          {gap.requirement}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
          {/* A weak match must never read as covered — and naming what it matched on is
              what lets the reader overrule it. "Time Management" against "Classroom
              behaviour management" is obviously wrong once it is said out loud. */}
          {weak && (
            <span className="text-xs" style={{ color: "var(--color-warning-700)" }}>
              Partly covered — your CV shows{" "}
              <span className="font-semibold">{gap.matchedSkills.join(", ")}</span>. Worth checking.
            </span>
          )}

          {/* Grouping by job would otherwise bury the most useful thing on the page. */}
          {gap.requiredBy > 1 && (
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1"
              style={{ background: "var(--color-primary-50)", color: "var(--color-primary-700)" }}
            >
              <Users size={11} /> Also wanted by {gap.requiredBy - 1} other{" "}
              {gap.requiredBy - 1 === 1 ? "application" : "applications"}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

/** One application: the job is the heading, its gaps sit underneath. */
function ApplicationSection({ application }: { application: ApplicationGapsDto }) {
  const { gaps, requirementsTotal, jobTitle } = application;
  const covered = requirementsTotal - gaps.length;

  return (
    <section
      className="rounded-lg border overflow-hidden"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <header
        className="px-4 py-3 flex flex-wrap items-baseline justify-between gap-2"
        style={{ background: "var(--color-bg-secondary)" }}
      >
        <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
          {jobTitle}
        </h2>
        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          {gaps.length === 0
            ? `You cover all ${requirementsTotal} requirements`
            : `${gaps.length} of ${requirementsTotal} requirements not shown on your CV`}
          {application.source === "AI_EXTRACTED" && " · read from the job description"}
        </span>
      </header>

      {gaps.length === 0 ? (
        <p
          className="px-4 py-3 text-sm border-t"
          style={{ color: "var(--color-text-tertiary)", borderColor: "var(--color-border)" }}
        >
          Nothing missing for this one. {covered} of {requirementsTotal} evidenced.
        </p>
      ) : (
        <ul>
          {gaps.map((gap) => (
            <GapRow key={gap.requirement} gap={gap} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default function LearningPage() {
  const { data, isLoading, isError, error } = useSkillGaps();

  const totalGaps = data?.applications.reduce((n, a) => n + a.gaps.length, 0) ?? 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-full" style={{ background: "var(--color-bg-secondary)" }}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Skill Gaps
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          What each job you applied to asks for that your CV doesn&apos;t show yet.
        </p>
      </div>

      {isError && (
        <Alert variant="error">
          {error instanceof Error ? error.message : "Could not load your skill gaps."}
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      ) : !data ? null : !data.hasApplications ? (
        // Three different empty answers, deliberately not one shared screen. Showing them
        // identically is how this page ended up telling a maths teacher to learn Docker.
        <EmptyState
          icon={<Briefcase size={26} />}
          title="Apply to a few jobs first"
          description="Once you've applied, this page shows what each of those jobs asked for that your CV doesn't cover yet — whatever your field."
          action={<Link href="/jobs" className={cta}><Briefcase size={13} /> Browse jobs</Link>}
        />
      ) : !data.hasParsedResume ? (
        <EmptyState
          icon={<FileText size={26} />}
          title="Upload your CV"
          description="We compare the jobs you applied to against the skills on your CV. Without one there's nothing to compare, so everything would look like a gap."
          action={<Link href="/resume" className={cta}><FileText size={13} /> Upload a CV</Link>}
        />
      ) : totalGaps === 0 ? (
        <EmptyState
          icon={<CheckCircle2 size={26} />}
          title="Nothing missing"
          description={`Your CV covers everything the ${data.jobsConsidered} ${
            data.jobsConsidered === 1 ? "job" : "jobs"
          } you applied to asked for.`}
        />
      ) : (
        <>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <span className="font-bold" style={{ color: "var(--color-text-primary)" }}>
              {totalGaps} {totalGaps === 1 ? "gap" : "gaps"}
            </span>{" "}
            across {data.jobsConsidered}{" "}
            {data.jobsConsidered === 1 ? "application" : "applications"}
          </p>

          <div className="space-y-4">
            {data.applications.map((application) => (
              <ApplicationSection key={application.applicationId} application={application} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
