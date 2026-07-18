"use client";

import React, { useMemo, useState } from "react";
import {
  Search, Inbox, Users, CheckCircle2, Clock,
  LayoutList, TableProperties, ChevronDown, ChevronRight, Filter,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Badge } from "@/shared/components/data-display/badge";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import MatchScoreBadge from "@/shared/components/data-display/match-score-badge";
import { ApplicantCard } from "@/features/employer/components/ApplicantCard";
import { ApplicationDetailPanel } from "@/features/employer/components/ApplicationDetailPanel";
import { StageMovePicker } from "@/features/employer/components/StageMovePicker";
import {
  EMPLOYER_JOBS,
  APPLICANTS,
  type Applicant,
  type ApplicationStage,
} from "@/features/employer/api/employer.api";

/* ── Types & constants ───────────────────────────────────── */

type ViewMode = "pipeline" | "table";

const PIPELINE_STAGES: ApplicationStage[] = ["Applied", "Interview", "Offer", "Hired"];

const STAGE_META: Record<
  ApplicationStage,
  { tone: "info" | "primary" | "warning" | "success" | "error"; label: string; bg: string; border: string }
> = {
  Applied:   { tone: "info",    label: "Applied",   bg: "var(--color-info-50)",    border: "var(--color-info-100)" },
  Interview: { tone: "primary", label: "Interview", bg: "var(--color-primary-50)", border: "var(--color-primary-100)" },
  Offer:     { tone: "warning", label: "Offer",     bg: "var(--color-warning-50)", border: "var(--color-warning-100)" },
  Hired:     { tone: "success", label: "Hired",     bg: "var(--color-success-50)", border: "var(--color-success-100)" },
  Rejected:  { tone: "error",   label: "Rejected",  bg: "var(--color-error-50)",   border: "var(--color-error-100)" },
};

/* ── Summary stat card ───────────────────────────────────── */
function SummaryCard({
  icon, label, value, accent,
}: {
  icon: React.ReactNode; label: string; value: string | number; accent: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg border"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", accent)}>
        {icon}
      </div>
      <div>
        <p className="text-lg font-extrabold text-content leading-tight">{value}</p>
        <p className="text-xs text-content-tertiary">{label}</p>
      </div>
    </div>
  );
}

/* ── Stage section header (pipeline view) ────────────────── */
function StageSection({
  stage, count, isOpen, onToggle, children,
}: {
  stage: ApplicationStage; count: number; isOpen: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  const meta = STAGE_META[stage];
  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: meta.border }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 transition-colors duration-200"
        style={{ background: meta.bg }}
      >
        <div className="flex items-center gap-3">
          <Badge tone={meta.tone} dot>{meta.label}</Badge>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(0,0,0,0.07)", color: "var(--color-text-secondary)" }}
          >
            {count}
          </span>
        </div>
        <div className="transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
          <ChevronDown size={16} style={{ color: "var(--color-text-tertiary)" }} />
        </div>
      </button>

      {isOpen && (
        <div
          className="px-4 py-3 space-y-2"
          style={{ background: "var(--color-bg-secondary)" }}
        >
          {count === 0
            ? (
              <p className="text-xs text-center py-6 text-content-disabled italic">
                No applicants in this stage
              </p>
            )
            : children
          }
        </div>
      )}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */

export default function ApplicationsPage() {
  const [jobFilter, setJobFilter]       = useState<string>("all");
  const [stageFilter, setStageFilter]   = useState<ApplicationStage | "all">("all");
  const [search, setSearch]             = useState("");
  const [view, setView]                 = useState<ViewMode>("pipeline");
  const [selected, setSelected]         = useState<Applicant | null>(null);
  const [openStages, setOpenStages]     = useState<Set<ApplicationStage>>(new Set(PIPELINE_STAGES));
  const [board, setBoard]               = useState<Applicant[]>(APPLICANTS);
  const [sortCol, setSortCol]           = useState<"name" | "match" | "stage" | "appliedAt">("match");
  const [sortDir, setSortDir]           = useState<"asc" | "desc">("desc");

  /* ── Derived data ────────────────────────────────────── */
  const filtered = useMemo(() => {
    let list = board;
    if (jobFilter !== "all")   list = list.filter((a) => a.jobId === jobFilter);
    if (stageFilter !== "all") list = list.filter((a) => a.stage === stageFilter);
    if (search.trim())         list = list.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [board, jobFilter, stageFilter, search]);

  const sortedForTable = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortCol === "name")      cmp = a.name.localeCompare(b.name);
      else if (sortCol === "match") cmp = a.match - b.match;
      else if (sortCol === "stage") cmp = a.stage.localeCompare(b.stage);
      else                          cmp = a.appliedAt.localeCompare(b.appliedAt);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const byStage = (stage: ApplicationStage) => filtered.filter((a) => a.stage === stage);

  const totalApplicants  = board.length;
  const pendingReview    = board.filter((a) => a.stage === "Applied").length;
  const inInterview      = board.filter((a) => a.stage === "Interview").length;
  const hired            = board.filter((a) => a.stage === "Hired").length;

  /* ── Handlers ────────────────────────────────────────── */
  const handleStageMove = (id: string, stage: ApplicationStage) => {
    setBoard((prev) => prev.map((a) => (a.id === id ? { ...a, stage } : a)));
    /* Also update selected if open */
    setSelected((prev) => (prev?.id === id ? { ...prev, stage } : prev));
  };

  const handleReject = (id: string) => {
    setBoard((prev) => prev.map((a) => (a.id === id ? { ...a, stage: "Rejected" as ApplicationStage } : a)));
  };

  const toggleStage = (stage: ApplicationStage) =>
    setOpenStages((prev) => {
      const next = new Set(prev);
      next.has(stage) ? next.delete(stage) : next.add(stage);
      return next;
    });

  const toggleSort = (col: typeof sortCol) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("desc"); }
  };

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in">

      {/* ── Page header ──────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">Applications</h1>
        <p className="text-sm mt-1 text-content-secondary">
          Review and manage candidates across all your job postings.
        </p>
      </div>

      {/* ── Summary stats ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard icon={<Users size={18} />}       label="Total Applicants" value={totalApplicants} accent="bg-primary-50 text-primary-600" />
        <SummaryCard icon={<Clock size={18} />}        label="Pending Review"   value={pendingReview}   accent="bg-info-50 text-info-600" />
        <SummaryCard icon={<ChevronRight size={18} />} label="In Interview"     value={inInterview}     accent="bg-warning-50 text-warning-600" />
        <SummaryCard icon={<CheckCircle2 size={18} />} label="Hired"            value={hired}           accent="bg-success-50 text-success-600" />
      </div>

      {/* ── Filters + View toggle ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-text-tertiary)" }}
          />
          <input
            id="applicant-search"
            type="text"
            placeholder="Search candidates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-md border text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
          />
        </div>

        {/* Job filter */}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-text-tertiary)" }} />
          <select
            id="job-filter"
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="pl-8 pr-3 py-2.5 rounded-md border text-sm font-medium outline-none cursor-pointer transition-all duration-200 appearance-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
            style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text-primary)" }}
          >
            <option value="all">All Jobs</option>
            {EMPLOYER_JOBS.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
        </div>

        {/* View toggle */}
        <div
          className="flex items-center rounded-md border p-1 shrink-0"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
          role="group"
          aria-label="View mode"
        >
          {(["pipeline", "table"] as ViewMode[]).map((v) => (
            <button
              key={v}
              id={`view-toggle-${v}`}
              onClick={() => setView(v)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all duration-200",
                view === v
                  ? "text-white"
                  : "text-content-secondary hover:text-content",
              )}
              style={view === v ? { background: "var(--color-primary-600)" } : {}}
            >
              {v === "pipeline" ? <LayoutList size={14} /> : <TableProperties size={14} />}
              {v === "pipeline" ? "Pipeline" : "Table"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stage filter pills ────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-content-tertiary uppercase tracking-wider mr-1">Stage:</span>
        {(["all", ...PIPELINE_STAGES, "Rejected"] as (ApplicationStage | "all")[]).map((s) => {
          const count = s === "all" ? filtered.length : board.filter((a) => a.stage === s).length;
          const active = stageFilter === s;
          return (
            <button
              key={s}
              id={`stage-filter-${s}`}
              onClick={() => setStageFilter(s)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200",
                active
                  ? "text-white border-transparent"
                  : "border-border text-content-secondary hover:border-primary-300 hover:text-primary-700",
              )}
              style={active ? { background: "var(--color-primary-600)" } : { background: "var(--color-card)" }}
            >
              {s === "all" ? "All" : s}
              <span
                className={cn(
                  "text-xs font-bold px-1.5 py-0.5 rounded-full",
                  active ? "bg-white/20 text-white" : "bg-neutral-100 text-content-tertiary",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Content area ─────────────────────────────────── */}

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Inbox size={28} />}
          title="No applicants found"
          description="Try adjusting your filters or search query to see more results."
        />
      ) : view === "pipeline" ? (

        /* ── Pipeline view ──────────────────────────── */
        <div className="space-y-3">
          {PIPELINE_STAGES.map((stage) => {
            const cards = byStage(stage);
            return (
              <StageSection
                key={stage}
                stage={stage}
                count={cards.length}
                isOpen={openStages.has(stage)}
                onToggle={() => toggleStage(stage)}
              >
                {cards.map((a) => (
                  <ApplicantCard
                    key={a.id}
                    applicant={a}
                    onSelect={setSelected}
                    onStageMove={handleStageMove}
                    isSelected={selected?.id === a.id}
                  />
                ))}
              </StageSection>
            );
          })}

          {/* Rejected — always at the bottom */}
          {stageFilter === "all" || stageFilter === "Rejected" ? (
            <StageSection
              stage="Rejected"
              count={byStage("Rejected").length}
              isOpen={openStages.has("Rejected")}
              onToggle={() => toggleStage("Rejected")}
            >
              {byStage("Rejected").map((a) => (
                <ApplicantCard
                  key={a.id}
                  applicant={a}
                  onSelect={setSelected}
                  onStageMove={handleStageMove}
                  isSelected={selected?.id === a.id}
                />
              ))}
            </StageSection>
          ) : null}
        </div>

      ) : (

        /* ── Table view ─────────────────────────────── */
        <div
          className="rounded-lg border overflow-hidden"
          style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Applicants table">
              <thead>
                <tr
                  className="text-left border-b"
                  style={{ background: "var(--color-neutral-50)", borderColor: "var(--color-border)" }}
                >
                  {[
                    { col: "name" as const, label: "Candidate" },
                    { col: "match" as const, label: "Match" },
                    { col: "stage" as const, label: "Stage" },
                    { col: "appliedAt" as const, label: "Applied" },
                  ].map(({ col, label }) => (
                    <th
                      key={col}
                      className="px-5 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer select-none text-content-tertiary hover:text-content transition-colors"
                      onClick={() => toggleSort(col)}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {sortCol === col && (
                          <span className="text-primary-500">{sortDir === "asc" ? "↑" : "↓"}</span>
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-content-tertiary">Job</th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-content-tertiary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedForTable.map((a) => {
                  const jobTitle = EMPLOYER_JOBS.find((j) => j.id === a.jobId)?.title ?? "—";
                  const meta = STAGE_META[a.stage];
                  return (
                    <tr
                      key={a.id}
                      className="border-t transition-colors duration-150 cursor-pointer hover:bg-primary-50"
                      style={{ borderColor: "var(--color-neutral-100)" }}
                      onClick={() => setSelected(a)}
                    >
                      {/* Candidate */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: "var(--color-primary-100)", color: "var(--color-primary-700)" }}
                          >
                            {a.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-content">{a.name}</p>
                            <p className="text-xs text-content-tertiary">{a.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Match */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <MatchScoreBadge score={a.match} size="sm" />
                        </div>
                      </td>

                      {/* Stage */}
                      <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                        <StageMovePicker
                          current={a.stage}
                          onMove={(stage) => handleStageMove(a.id, stage)}
                        />
                      </td>

                      {/* Applied at */}
                      <td className="px-5 py-3 text-content-secondary text-xs">{a.appliedAt}</td>

                      {/* Job */}
                      <td className="px-5 py-3 text-content-secondary text-xs max-w-xs truncate hidden md:table-cell">
                        {jobTitle}
                      </td>

                      {/* View detail */}
                      <td className="px-5 py-3 text-right">
                        <button
                          aria-label={`View ${a.name}'s application`}
                          onClick={(e) => { e.stopPropagation(); setSelected(a); }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all duration-200 hover:border-primary-300 hover:text-primary-700"
                          style={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          View <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer count */}
          <div
            className="px-5 py-3 border-t text-xs text-content-tertiary"
            style={{ borderColor: "var(--color-border)", background: "var(--color-neutral-50)" }}
          >
            Showing {sortedForTable.length} of {board.length} applicants
          </div>
        </div>
      )}

      {/* ── Detail panel ─────────────────────────────────── */}
      <ApplicationDetailPanel
        applicant={selected}
        onClose={() => setSelected(null)}
        onStageMove={handleStageMove}
        onReject={handleReject}
      />
    </div>
  );
}
