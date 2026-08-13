"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GitCompareArrows,
  MapPin,
  DollarSign,
  Briefcase,
  Globe,
  GraduationCap,
  Clock,
  Check,
  X,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { useJobCompare, clearCompare, removeJobFromCompare } from "@/stores/job-compare-store";
import { useJobMatch } from "@/features/matching/hooks/use-job-match";
import { useSkillGap } from "@/features/matching/hooks/use-skill-gap";
import { formatSalaryRange, formatPostedDate } from "@/shared/types/shared.types";
import type { Job } from "@/shared/types/shared.types";
import type { JobMatchDto } from "@/features/matching/api/matching.api";
import type { SkillGapDto } from "@/features/matching/api/matching.api";
import { Skeleton } from "@/shared/components/feedback/skeleton";

/* ─── Per-job data loader ─────────────────────────────────────────────────── */

function useJobCompareData(job: Job) {
  const match = useJobMatch(job.id);
  const skillGap = useSkillGap(job.id);
  return { match, skillGap };
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/** Returns indices of cells that share the maximum value (numeric). */
function winnerIndices(values: (number | null)[]): Set<number> {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length === 0) return new Set();
  const max = Math.max(...nums);
  return new Set(values.map((v, i) => (v === max ? i : -1)).filter((i) => i >= 0));
}

/** Returns indices of cells that share the minimum value (numeric). */
function loserIndices(values: (number | null)[]): Set<number> {
  const nums = values.filter((v): v is number => v !== null);
  if (nums.length === 0) return new Set();
  const min = Math.min(...nums);
  return new Set(values.map((v, i) => (v === min ? i : -1)).filter((i) => i >= 0));
}

/* ─── Cell components ────────────────────────────────────────────────────── */

function WinBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: "var(--color-success-100)", color: "var(--color-success-600)" }}
    >
      {children}
    </span>
  );
}

function CellBase({
  winner,
  children,
}: {
  winner?: boolean;
  children: React.ReactNode;
}) {
  return (
    <td
      className="px-4 py-4 text-sm transition-colors"
      style={{
        background: winner ? "var(--color-success-50)" : "transparent",
        borderLeft: "1px solid var(--color-border)",
      }}
    >
      {children}
    </td>
  );
}

/* ─── Row-level sub-components ───────────────────────────────────────────── */

function MatchRow({
  jobs,
  matchData,
  loadingStates,
}: {
  jobs: Job[];
  matchData: (JobMatchDto | null | undefined)[];
  loadingStates: boolean[];
}) {
  const scores = matchData.map((m) => m?.score ?? null);
  const winners = winnerIndices(scores);

  return (
    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
      <RowLabel icon={<GitCompareArrows size={14} />} label="Match score" />
      {jobs.map((_, i) => (
        <CellBase key={i} winner={winners.has(i) && scores[i] !== null}>
          {loadingStates[i] ? (
            <Skeleton className="h-6 w-16 rounded" />
          ) : matchData[i] === null ? (
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              No profile
            </span>
          ) : matchData[i] === undefined ? (
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              —
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold" style={{ color: "var(--color-primary-600)" }}>
                {matchData[i]!.score}
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                / 100
              </span>
              {winners.has(i) && scores[i] !== null && <WinBadge>Best fit</WinBadge>}
            </div>
          )}
        </CellBase>
      ))}
    </tr>
  );
}

function SalaryRow({ jobs }: { jobs: Job[] }) {
  const salaryMids = jobs.map((j) => (j.salaryMin + j.salaryMax) / 2);
  const winners = winnerIndices(salaryMids);

  return (
    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
      <RowLabel icon={<DollarSign size={14} />} label="Salary range" />
      {jobs.map((job, i) => (
        <CellBase key={i} winner={winners.has(i)}>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm" style={{ color: "var(--color-success-600)" }}>
              {formatSalaryRange(job)}
            </span>
            {winners.has(i) && <WinBadge>Highest</WinBadge>}
          </div>
        </CellBase>
      ))}
    </tr>
  );
}

function LocationRow({ jobs }: { jobs: Job[] }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
      <RowLabel icon={<MapPin size={14} />} label="Location" />
      {jobs.map((job, i) => (
        <CellBase key={i}>
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {job.location}
          </span>
        </CellBase>
      ))}
    </tr>
  );
}

function RemoteRow({ jobs }: { jobs: Job[] }) {
  const remoteOrder: Record<string, number> = { Remote: 3, Hybrid: 2, "On-site": 1 };
  const vals = jobs.map((j) => remoteOrder[j.remote] ?? 0);
  const winners = winnerIndices(vals);

  return (
    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
      <RowLabel icon={<Globe size={14} />} label="Remote type" />
      {jobs.map((job, i) => (
        <CellBase key={i} winner={winners.has(i)}>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background:
                job.remote === "Remote"
                  ? "var(--color-success-100)"
                  : job.remote === "Hybrid"
                  ? "var(--color-primary-50)"
                  : "var(--color-neutral-100)",
              color:
                job.remote === "Remote"
                  ? "var(--color-success-600)"
                  : job.remote === "Hybrid"
                  ? "var(--color-primary-700)"
                  : "var(--color-text-secondary)",
            }}
          >
            {job.remote}
          </span>
        </CellBase>
      ))}
    </tr>
  );
}

function EmploymentRow({ jobs }: { jobs: Job[] }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
      <RowLabel icon={<Briefcase size={14} />} label="Employment type" />
      {jobs.map((job, i) => (
        <CellBase key={i}>
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {job.type ?? "—"}
          </span>
        </CellBase>
      ))}
    </tr>
  );
}

function LevelRow({ jobs }: { jobs: Job[] }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
      <RowLabel icon={<GraduationCap size={14} />} label="Experience level" />
      {jobs.map((job, i) => (
        <CellBase key={i}>
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {job.level ?? "—"}
          </span>
        </CellBase>
      ))}
    </tr>
  );
}

function SkillsMatchedRow({
  jobs,
  gapData,
  loadingStates,
}: {
  jobs: Job[];
  gapData: (SkillGapDto | null | undefined)[];
  loadingStates: boolean[];
}) {
  const counts = gapData.map((g) =>
    g && g.status === "OK" ? g.matchedCount : null
  );
  const winners = winnerIndices(counts);

  return (
    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
      <RowLabel icon={<Check size={14} />} label="Skills matched" />
      {jobs.map((_, i) => (
        <CellBase key={i} winner={winners.has(i) && counts[i] !== null}>
          {loadingStates[i] ? (
            <Skeleton className="h-5 w-12 rounded" />
          ) : gapData[i]?.status === "NO_PARSED_RESUME" ? (
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Upload résumé
            </span>
          ) : gapData[i]?.status === "OK" ? (
            <div className="flex items-center gap-2">
              <span className="font-bold" style={{ color: "var(--color-success-600)" }}>
                {gapData[i]!.matchedCount}
              </span>
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                / {gapData[i]!.requirements.length}
              </span>
              {winners.has(i) && counts[i] !== null && <WinBadge>Most covered</WinBadge>}
            </div>
          ) : (
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>—</span>
          )}
        </CellBase>
      ))}
    </tr>
  );
}

function SkillsMissingRow({
  jobs,
  gapData,
  loadingStates,
}: {
  jobs: Job[];
  gapData: (SkillGapDto | null | undefined)[];
  loadingStates: boolean[];
}) {
  const counts = gapData.map((g) =>
    g && g.status === "OK" ? g.missing.length : null
  );
  const fewest = loserIndices(counts);

  return (
    <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
      <RowLabel icon={<AlertCircle size={14} />} label="Skills missing" />
      {jobs.map((_, i) => (
        <CellBase key={i} winner={fewest.has(i) && counts[i] !== null}>
          {loadingStates[i] ? (
            <Skeleton className="h-5 w-16 rounded" />
          ) : gapData[i]?.status === "OK" ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="font-bold text-sm"
                  style={{
                    color: counts[i] === 0
                      ? "var(--color-success-600)"
                      : "var(--color-warning-600)",
                  }}
                >
                  {counts[i]}
                </span>
                {fewest.has(i) && counts[i] !== null && <WinBadge>Fewest gaps</WinBadge>}
              </div>
              {gapData[i]!.missing.slice(0, 3).map((m, mi) => (
                <div key={mi} className="flex items-start gap-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  <X size={10} className="mt-0.5 shrink-0" style={{ color: "var(--color-warning-500)" }} />
                  <span className="line-clamp-1">{m}</span>
                </div>
              ))}
              {gapData[i]!.missing.length > 3 && (
                <span className="text-[11px]" style={{ color: "var(--color-text-disabled)" }}>
                  +{gapData[i]!.missing.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>—</span>
          )}
        </CellBase>
      ))}
    </tr>
  );
}

function PostedRow({ jobs }: { jobs: Job[] }) {
  const vals = jobs.map((j) => -j.postedDaysAgo); // most recent = highest
  const winners = winnerIndices(vals);

  return (
    <tr>
      <RowLabel icon={<Clock size={14} />} label="Posted" />
      {jobs.map((job, i) => (
        <CellBase key={i} winner={winners.has(i)}>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {formatPostedDate(job.postedDaysAgo)}
            </span>
            {winners.has(i) && <WinBadge>Most recent</WinBadge>}
          </div>
        </CellBase>
      ))}
    </tr>
  );
}

function RowLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <td
      className="px-4 py-4 text-xs font-semibold whitespace-nowrap"
      style={{ color: "var(--color-text-secondary)", minWidth: 140 }}
    >
      <div className="flex items-center gap-1.5">
        <span style={{ color: "var(--color-text-tertiary)" }}>{icon}</span>
        {label}
      </div>
    </td>
  );
}

/* ─── Per-job column header ───────────────────────────────────────────────── */

function JobHeader({ job }: { job: Job }) {
  return (
    <th
      className="px-4 py-5 text-left"
      style={{ borderLeft: "1px solid var(--color-border)", minWidth: 200, maxWidth: 280 }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-extrabold text-base shrink-0"
          style={{ background: job.logoBg }}
        >
          {job.logo}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            href={`/jobs/${job.id}`}
            className="block text-sm font-bold hover:underline truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {job.title}
          </Link>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-secondary)" }}>
            {job.company}
          </p>
        </div>
        <button
          onClick={() => removeJobFromCompare(job.id)}
          aria-label={`Remove ${job.title}`}
          className="p-1 rounded hover:bg-neutral-100 transition-colors shrink-0"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </th>
  );
}

/* ─── Per-job data wrapper (calls hooks per job) ─────────────────────────── */

function JobCompareDataRow({
  jobs,
}: {
  jobs: Job[];
}) {
  // Hooks must be called unconditionally. We support max 3 jobs.
  // Slot 0
  const m0 = useJobMatch(jobs[0]?.id);
  const g0 = useSkillGap(jobs[0]?.id);
  // Slot 1
  const m1 = useJobMatch(jobs[1]?.id);
  const g1 = useSkillGap(jobs[1]?.id);
  // Slot 2
  const m2 = useJobMatch(jobs[2]?.id);
  const g2 = useSkillGap(jobs[2]?.id);

  const matchData = [m0.data, m1.data, m2.data].slice(0, jobs.length) as (JobMatchDto | null | undefined)[];
  const gapData = [g0.data, g1.data, g2.data].slice(0, jobs.length) as (SkillGapDto | null | undefined)[];
  const matchLoading = [m0.isLoading, m1.isLoading, m2.isLoading].slice(0, jobs.length);
  const gapLoading = [g0.isLoading, g1.isLoading, g2.isLoading].slice(0, jobs.length);

  return (
    <>
      <MatchRow jobs={jobs} matchData={matchData} loadingStates={matchLoading} />
      <SalaryRow jobs={jobs} />
      <LocationRow jobs={jobs} />
      <RemoteRow jobs={jobs} />
      <EmploymentRow jobs={jobs} />
      <LevelRow jobs={jobs} />
      <SkillsMatchedRow jobs={jobs} gapData={gapData} loadingStates={gapLoading} />
      <SkillsMissingRow jobs={jobs} gapData={gapData} loadingStates={gapLoading} />
      <PostedRow jobs={jobs} />
    </>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function JobComparePage() {
  const { compareJobs } = useJobCompare();

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 min-h-full"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/jobs"
          className="flex items-center gap-1.5 text-sm font-semibold hover:underline transition-all"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <ArrowLeft size={15} />
          Back to jobs
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Compare Jobs
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            {compareJobs.length === 0
              ? "No jobs selected yet."
              : `Comparing ${compareJobs.length} job${compareJobs.length === 1 ? "" : "s"} side-by-side`}
          </p>
        </div>
      </div>

      {compareJobs.length === 0 ? (
        <div
          className="rounded-lg border p-12 flex flex-col items-center text-center gap-4"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: "var(--color-primary-50)" }}
          >
            <GitCompareArrows size={28} style={{ color: "var(--color-primary-400)" }} />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
              No jobs selected for comparison
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Go to job search and check the compare box on up to 3 jobs.
            </p>
          </div>
          <Link
            href="/jobs"
            className="px-5 py-2 rounded-md text-sm font-bold text-white transition-all duration-200 active:scale-95"
            style={{ background: "var(--color-primary-600)" }}
          >
            Browse jobs
          </Link>
        </div>
      ) : compareJobs.length === 1 ? (
        <div
          className="rounded-lg border p-8 text-center"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Select at least 1 more job from{" "}
            <Link href="/jobs" className="underline font-semibold" style={{ color: "var(--color-primary-600)" }}>
              job search
            </Link>{" "}
            to compare.
          </p>
        </div>
      ) : (
        <div
          className="rounded-lg border overflow-hidden"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-md)" }}
        >
          {/* Clear all link */}
          <div
            className="px-4 py-2 flex justify-end border-b"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
          >
            <button
              onClick={clearCompare}
              className="text-xs font-semibold hover:underline"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Clear all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                  {/* Empty corner cell */}
                  <th
                    className="px-4 py-5 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-text-tertiary)", minWidth: 140 }}
                  >
                    Criteria
                  </th>
                  {compareJobs.map((job) => (
                    <JobHeader key={job.id} job={job} />
                  ))}
                </tr>
              </thead>
              <tbody>
                <JobCompareDataRow jobs={compareJobs} />
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Apply CTA row */}
      {compareJobs.length >= 2 && (
        <div
          className="mt-4 rounded-lg border p-4 flex flex-wrap gap-3"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <span className="text-sm font-semibold my-auto" style={{ color: "var(--color-text-secondary)" }}>
            Ready to apply?
          </span>
          {compareJobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="px-4 py-2 rounded-md text-xs font-bold border transition-all duration-200 active:scale-95"
              style={{
                borderColor: "var(--color-primary-300)",
                color: "var(--color-primary-700)",
                background: "var(--color-primary-50)",
              }}
            >
              View {job.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
