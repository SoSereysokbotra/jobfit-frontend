"use client";

/**
 * The full-page match report, generated from the browser extension and opened here.
 *
 * WHAT THIS PAGE DELIBERATELY IS NOT: Jobscan's version of this screen shows you a match
 * rate and then blurs the rows that would tell you what to do about it. Nothing here is
 * locked, blurred or upsold — the extension has no premium tier, so every section,
 * including the recruiter suggestions the web app's own résumé screens gate, is rendered
 * in full. If you add a section, it renders for everyone.
 *
 * The report is a SNAPSHOT: the scores were computed when the user scanned and are stored,
 * so this page is a pure read. Nothing is recomputed here, which is what makes revisiting
 * the link show what they were shown.
 */

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileText,
  Lock,
  MapPin,
  Minus,
  ScanSearch,
  Target,
  XCircle,
} from "lucide-react";
import { useMatchReport } from "@/features/matching/hooks/use-match-report";
import type {
  CheckStatus,
  MatchReportPayload,
  ReportExperience,
  ReportSkill,
  SearchabilityCheck,
} from "@/features/matching/api/match-report.api";
import { ApiError } from "@/lib/api/client";
import { SectionCard } from "@/shared/components/layout/section-card";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";

const cta =
  "px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 inline-flex items-center gap-1.5";

/** One colour rule for every score on the page, so 62 never means two things. */
function toneOf(score: number): string {
  if (score >= 75) return "var(--color-success-600)";
  if (score >= 50) return "var(--color-warning-600)";
  return "var(--color-error-600)";
}

// ── Small parts ──────────────────────────────────────────────────────────────

/**
 * The headline number, as a ring so it reads at a glance rather than as a statistic.
 *
 * A null `value` draws an empty ring and a dash. There is no "0%" fallback on purpose:
 * an empty ring says "we didn't measure this", a zero says "you are a terrible fit", and
 * the whole point of the null is that we don't know.
 */
function ScoreRing({ value, label }: { value: number | null; label: string }) {
  if (value === null) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              strokeWidth="10"
              style={{ stroke: "var(--color-neutral-100)" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: "var(--color-text-disabled)" }}>
              —
            </span>
          </div>
        </div>
        <span
          className="text-xs font-semibold uppercase tracking-wide text-center"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {label} not computed
        </span>
      </div>
    );
  }

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const tone = toneOf(value);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            style={{ stroke: "var(--color-neutral-100)" }}
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            // The one computed style on the page: the arc length IS the value.
            strokeDashoffset={circumference * (1 - Math.min(100, Math.max(0, value)) / 100)}
            style={{ stroke: tone }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: tone }}>
            {value}%
          </span>
        </div>
      </div>
      <span
        className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {label}
      </span>
    </div>
  );
}

/**
 * A labelled 0–100 bar.
 *
 * `measured: false` renders the row as "Not computed" with an empty track — a sub-score
 * nobody measured must not be drawn as a bar, because a half-full bar IS a claim.
 */
function Bar({
  label,
  value,
  measured = true,
}: {
  label: string;
  value: number;
  measured?: boolean;
}) {
  if (!measured) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {label}
          </span>
          <span className="text-sm font-medium" style={{ color: "var(--color-text-tertiary)" }}>
            Not computed
          </span>
        </div>
        <div
          className="h-2 rounded-full"
          style={{ background: "var(--color-neutral-100)" }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {label}
        </span>
        <span className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
          {value}%
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: "var(--color-neutral-100)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            background: toneOf(value),
          }}
        />
      </div>
    </div>
  );
}

const CHECK_ICON: Record<CheckStatus, React.ReactNode> = {
  pass: <CheckCircle2 size={16} style={{ color: "var(--color-success-600)" }} />,
  warn: <AlertTriangle size={16} style={{ color: "var(--color-warning-600)" }} />,
  fail: <XCircle size={16} style={{ color: "var(--color-error-600)" }} />,
};

function CheckRow({ check }: { check: SearchabilityCheck }) {
  return (
    <li className="flex gap-3 py-2.5">
      <span className="shrink-0 mt-0.5">{CHECK_ICON[check.status]}</span>
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
          {check.label}
        </p>
        {/* The hint is the actionable half — a check that only says "fail" is a scold. */}
        {check.hint && (
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
            {check.hint}
          </p>
        )}
      </div>
    </li>
  );
}

/**
 * One skill row.
 *
 * A PARTIAL match names what it matched ON, because that is what lets the reader overrule
 * it: "Time Management" covering "classroom behaviour management" is obviously wrong once
 * it is said out loud, and invisible if the row just says ✓.
 */
function SkillRow({ skill }: { skill: ReportSkill }) {
  const partial = skill.inResume && skill.matchQuality === "PARTIAL";
  return (
    <li
      className="flex items-start gap-3 px-5 py-3 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      <span className="shrink-0 mt-0.5">
        {skill.inResume ? (
          partial ? (
            <AlertTriangle size={15} style={{ color: "var(--color-warning-600)" }} />
          ) : (
            <CheckCircle2 size={15} style={{ color: "var(--color-success-600)" }} />
          )
        ) : (
          <Minus size={15} style={{ color: "var(--color-text-disabled)" }} />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug" style={{ color: "var(--color-text-primary)" }}>
          {skill.skill}
        </p>
        {partial && skill.matchedSkills?.length ? (
          <p className="text-xs mt-0.5" style={{ color: "var(--color-warning-700)" }}>
            Partly covered — your CV shows{" "}
            <span className="font-semibold">{skill.matchedSkills.join(", ")}</span>. Worth
            checking.
          </p>
        ) : null}
      </div>

      <span
        className="shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-full"
        style={{ background: "var(--color-bg-secondary)", color: "var(--color-text-tertiary)" }}
        title="How often the posting mentions this"
      >
        ×{skill.count}
      </span>
    </li>
  );
}

/** Missing rows first: the list exists to be acted on, not admired. */
function SkillTable({ title, skills }: { title: string; skills: ReportSkill[] }) {
  if (skills.length === 0) return null;
  const ordered = [...skills].sort(
    (a, b) => Number(a.inResume) - Number(b.inResume) || b.count - a.count,
  );
  const missing = skills.filter((s) => !s.inResume).length;

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
    >
      <header
        className="px-5 py-3 flex flex-wrap items-baseline justify-between gap-2"
        style={{ background: "var(--color-bg-secondary)" }}
      >
        <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
          {title}
        </h3>
        <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
          {missing === 0
            ? `Your CV shows all ${skills.length}`
            : `${missing} of ${skills.length} not shown on your CV`}
        </span>
      </header>
      <ul>
        {ordered.map((skill) => (
          <SkillRow key={skill.skill} skill={skill} />
        ))}
      </ul>
    </div>
  );
}

// ── Sections ─────────────────────────────────────────────────────────────────

/**
 * What the experience row is actually claiming.
 *
 * The stated bar and the CV's years are both facts the reader can check, so they are
 * printed rather than compressed into a percentage. The unmet case is a warning, not a
 * rejection: postings routinely hire under their stated bar, and "you show 3 years where
 * they asked for 4" is something to decide about, not to be told you failed.
 */
function ExperienceNote({ experience }: { experience: ReportExperience }) {
  const { basis, requiredYears, candidateYears, met } = experience;

  if (basis === "CV_DEPTH") {
    return (
      <p className="text-xs mt-4" style={{ color: "var(--color-text-tertiary)" }}>
        This posting doesn&apos;t state a years-of-experience bar
        {candidateYears === null ? ", and your CV's dates couldn't be read" : ""}, so the
        CV-depth row counts entries on your résumé — it isn&apos;t specific to this job.
      </p>
    );
  }

  const years = `${candidateYears} ${candidateYears === 1 ? "year" : "years"}`;
  return (
    <Alert variant={met ? "success" : "warning"} className="mt-4">
      {met ? (
        <>
          This role asks for {requiredYears}+ years; your résumé shows about {years}.
        </>
      ) : (
        <>
          This role asks for {requiredYears}+ years of experience and your résumé shows
          about {years}. Worth a look before you apply — and note this counts all
          employment on your CV, not time in this field specifically.
        </>
      )}
    </Alert>
  );
}

function MatchRateSection({ report }: { report: MatchReportPayload }) {
  const rate = report.matchRate;
  if (!rate) {
    return (
      <SectionCard title="Match Rate" headerIcon={<Target size={18} />}>
        <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          No profile to match against yet. Fill in your profile and this job gets a score.
        </p>
        <Link href="/profile" className={`${cta} mt-3`}>
          Complete your profile
        </Link>
      </SectionCard>
    );
  }

  const s = rate.subScores;
  return (
    <SectionCard
      title="Match Rate"
      subtitle="How this job lines up with your profile"
      headerIcon={<Target size={18} />}
    >
      <div className="flex flex-col sm:flex-row gap-6 items-center">
        <ScoreRing value={rate.overall} label="Match rate" />
        <div className="flex-1 w-full space-y-3">
          {/* `semantic: false` means the skills comparison never ran. It is excluded from
              the overall score by the scorer, so it must not be drawn as one here. */}
          <Bar label="Skills" value={s.skills} measured={rate.semantic} />
          {/* CV_DEPTH is the same number for every job this user opens (it counts CV
              entries), so it is labelled for what it is rather than as fit to this role. */}
          <Bar
            label={rate.experience.basis === "REQUIREMENT" ? "Experience" : "CV depth"}
            value={s.experience}
          />
          <Bar label="Location" value={s.location} />
          <Bar label="Salary" value={s.salary} />
          <Bar label="Industry" value={s.other} />
        </div>
      </div>
      <ExperienceNote experience={rate.experience} />

      {/* No number at all beats a number nobody measured. */}
      {!rate.semantic && (
        <Alert variant="warning" className="mt-4">
          We couldn&apos;t compare your résumé against this role, so there is no match
          rate for it. Skills fit is the only part that measures this particular job —
          experience and location alone would score any job in your city highly, whatever
          the field. Check your JobFit profile has a parsed résumé, then run the report
          again.
        </Alert>
      )}
    </SectionCard>
  );
}

function SearchabilitySection({ report }: { report: MatchReportPayload }) {
  const search = report.searchability;
  if (!search) return null;

  return (
    <SectionCard
      title="Searchability"
      subtitle="How well an applicant tracking system can read your résumé"
      headerIcon={<ScanSearch size={18} />}
    >
      <div className="flex flex-col sm:flex-row gap-6">
        <ScoreRing value={search.atsScore} label="ATS score" />
        <ul className="flex-1 divide-y" style={{ borderColor: "var(--color-border)" }}>
          {search.checks.map((check) => (
            <CheckRow key={check.label} check={check} />
          ))}
        </ul>
      </div>
    </SectionCard>
  );
}

function SkillsSection({ report }: { report: MatchReportPayload }) {
  const { skills } = report;

  if (!skills.available) {
    return (
      <SectionCard title="Skills" headerIcon={<FileText size={18} />}>
        {/* "We couldn't look" and "this posting asks for nothing" are different answers. */}
        <Alert variant="info">
          We couldn&apos;t read this posting&apos;s requirements when the report was
          generated. Everything else on this page is unaffected — run the report again from
          the extension to fill this in.
        </Alert>
      </SectionCard>
    );
  }

  if (skills.hard.length === 0 && skills.soft.length === 0) {
    return (
      <SectionCard title="Skills" headerIcon={<FileText size={18} />}>
        <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>
          This posting states no checkable requirements — there is nothing to compare your
          résumé against.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Skills"
      subtitle={`${skills.matchedCount} shown on your CV · ${skills.missingCount} not`}
      headerIcon={<FileText size={18} />}
    >
      <div className="space-y-4">
        <SkillTable title="Hard skills" skills={skills.hard} />
        <SkillTable title="Soft skills" skills={skills.soft} />
      </div>
    </SectionCard>
  );
}

/**
 * Formatting, pulled out of the ATS breakdown.
 *
 * The scorer names its sub-scores differently on the AI and heuristic paths, so the key is
 * found by meaning rather than assumed — an absent one hides the section instead of
 * rendering a confident 0.
 */
function formattingScore(breakdown: Record<string, number> | undefined): number | null {
  if (!breakdown) return null;
  const entry = Object.entries(breakdown).find(([key]) => /format/i.test(key));
  return entry ? entry[1] : null;
}

function FormattingSection({ report }: { report: MatchReportPayload }) {
  const score = formattingScore(report.searchability?.breakdown);
  if (score === null) return null;

  const breakdown = report.searchability?.breakdown ?? {};
  return (
    <SectionCard
      title="Formatting"
      subtitle="Structure, headings and spacing as a parser sees them"
      headerIcon={<FileText size={18} />}
    >
      <div className="space-y-3">
        <Bar label="Formatting" value={Math.round(score)} />
        {/* The rest of the ATS breakdown, so the headline score is explained rather than
            asserted. Names come from whichever scorer ran. */}
        {Object.entries(breakdown)
          .filter(([key]) => !/format/i.test(key))
          .map(([key, value]) => (
            <Bar key={key} label={humanise(key)} value={Math.round(value)} />
          ))}
      </div>
    </SectionCard>
  );
}

/** "keywordQuality" → "Keyword quality". */
function humanise(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MatchReportPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { data, isLoading, isError, error } = useMatchReport(id);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6" style={{ background: "var(--color-bg-secondary)" }}>
        <Skeleton className="h-20 rounded-lg" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-56 rounded-lg" />
        ))}
      </div>
    );
  }

  // A report is a picture of someone's résumé, so someone else's is a wall, not a 404.
  if (isError && error instanceof ApiError && error.statusCode === 403) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <EmptyState
          icon={<Lock size={26} />}
          title="This report isn't yours"
          description="Match reports are private to the account that generated them."
          action={
            <Link href="/dashboard" className={cta}>
              Back to dashboard
            </Link>
          }
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Alert variant="error">
          {error instanceof Error ? error.message : "Could not load this report."}
        </Alert>
      </div>
    );
  }

  // `null` is the backend's "no such report" — see the api module.
  if (!data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <EmptyState
          icon={<ScanSearch size={26} />}
          title="Report not found"
          description="This report no longer exists. Generate a new one from the JobFit extension on any job posting."
          action={
            <Link href="/dashboard" className={cta}>
              Back to dashboard
            </Link>
          }
        />
      </div>
    );
  }

  const { job } = data;
  const generated = new Date(data.generatedAt);

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 space-y-6 min-h-full"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      <header>
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--color-primary-600)" }}
        >
          Match report
        </p>
        <h1
          className="text-2xl font-bold tracking-tight mt-1"
          style={{ color: "var(--color-text-primary)" }}
        >
          {job.title}
        </h1>
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {job.company && (
            <span className="inline-flex items-center gap-1.5">
              <Building2 size={14} /> {job.company}
            </span>
          )}
          {job.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} /> {job.location}
            </span>
          )}
          <span style={{ color: "var(--color-text-tertiary)" }}>
            Scanned {generated.toLocaleDateString()} from {job.source}
          </span>
        </div>
      </header>

      {/* Everything résumé-derived is missing at once when there is no parse, so the
          prompt is said once at the top instead of repeated in four empty cards. */}
      {data.needsResume && (
        <div
          className="rounded-lg border p-4 flex flex-wrap items-center justify-between gap-3"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
        >
          <div>
            <p className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
              Upload a résumé to complete this report
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
              Searchability, recruiter tips and the skills you already cover all come from
              your résumé.
            </p>
          </div>
          <Link href="/resumes" className={cta}>
            <FileText size={13} /> Upload a résumé
          </Link>
        </div>
      )}

      <MatchRateSection report={data} />
      <SearchabilitySection report={data} />
      <SkillsSection report={data} />
      <FormattingSection report={data} />

      {data.resume && (
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          Scored against <span className="font-semibold">{data.resume.fileName}</span>.
        </p>
      )}
    </div>
  );
}
