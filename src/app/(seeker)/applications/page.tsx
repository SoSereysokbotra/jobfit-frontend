"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search, ArrowUpDown, List, LayoutGrid, Briefcase, Calendar,
  Award, Send, CheckSquare, XCircle, Star, TrendingUp, ClipboardList,
} from "lucide-react";
import { ApplicationCard, ApplicationKanban } from "@/features/application/components";
import { useApplications, type ApplicationsSortKey, type ApplicationsTab } from "@/features/application/hooks/use-applications";
import { WITHDRAWAL_REASONS, STATUS_CONFIG } from "@/features/application/api/application.api";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { StatCard } from "@/shared/components/data-display/stat-card";
import { JobCardSkeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import { Modal } from "@/shared/components/ui/modal";

const SORT_OPTIONS: { value: ApplicationsSortKey; label: string }[] = [
  { value: "recent", label: "Most recent" },
  { value: "interview", label: "Interview date (soonest)" },
  { value: "match", label: "Match score" },
  { value: "company", label: "Company (A–Z)" },
];

const TABS: ApplicationsTab[] = ["All", "Submitted", "Viewed", "Interview", "Offer", "Rejected", "Withdrawn"];

export default function ApplicationsPage() {
  const tracker = useApplications();
  const [view, setView] = useState<"list" | "kanban">("list");
  /** Application ids pending withdrawal confirmation (single or bulk). */
  const [withdrawTarget, setWithdrawTarget] = useState<string[] | null>(null);
  const [withdrawReason, setWithdrawReason] = useState("");

  const selectedCount = tracker.selectedIds.size;
  const hasAnyApplications = tracker.counts.All > 0 || tracker.counts.Withdrawn > 0;

  const confirmWithdrawal = () => {
    if (withdrawTarget) tracker.withdraw(withdrawTarget);
    setWithdrawTarget(null);
    setWithdrawReason("");
  };

  const withdrawCompanies = withdrawTarget
    ? tracker.results.filter((a) => withdrawTarget.includes(a.id)).map((a) => a.job.company)
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 min-h-full" style={{ background: "var(--color-bg-secondary)" }}>

      {/* ── PAGE HEADER ───────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Applications
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Track every application through your hiring pipeline
        </p>
      </div>

      {/* ── SUMMARY STATS ─────────────────────────────────── */}
      {!tracker.isLoading && hasAnyApplications && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Applications"
            value={String(tracker.stats.total)}
            change={`${tracker.stats.thisMonth} this month`}
            changeUp
            icon={<Briefcase size={18} />}
            accentColor="var(--color-primary-600)"
            accentBg="var(--color-primary-50)"
          />
          <StatCard
            label="Interviews"
            value={String(tracker.stats.interviews)}
            change={`${tracker.stats.interviewRate}% interview rate`}
            icon={<Calendar size={18} />}
            accentColor="var(--color-success-600)"
            accentBg="var(--color-success-50)"
          />
          <StatCard
            label="Offers"
            value={String(tracker.stats.offers)}
            change={tracker.stats.offers > 0 ? "Respond by Jun 30" : "Keep going!"}
            icon={<Award size={18} />}
            accentColor="var(--color-warning-600)"
            accentBg="var(--color-warning-50)"
          />
          <StatCard
            label="This Month"
            value={String(tracker.stats.thisMonth)}
            change="Top 25% of applicants"
            changeUp
            icon={<TrendingUp size={18} />}
            accentColor="var(--color-info-600)"
            accentBg="var(--color-info-50)"
          />
        </div>
      )}

      {/* ── UNDO WITHDRAWAL BANNER (soft-delete pattern) ──── */}
      {tracker.lastWithdrawal && (
        <Alert variant="success" className="animate-fade-in">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            ✓ Withdrawn from {tracker.lastWithdrawal.companies.join(", ")}. You can reapply in the future.
            <button onClick={tracker.undoWithdrawal} className="font-bold underline hover:no-underline">
              Undo
            </button>
            <button onClick={tracker.dismissUndo} className="font-bold hover:underline">
              Dismiss
            </button>
          </span>
        </Alert>
      )}

      {hasAnyApplications && (
        <>
          {/* ── STATUS TABS ───────────────────────────────── */}
          <div
            className="flex items-center gap-1 overflow-x-auto rounded-lg border p-1.5"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            {TABS.map((t) => {
              if (t === "Withdrawn" && tracker.counts.Withdrawn === 0) return null;
              const active = tracker.tab === t;
              const count = tracker.counts[t];
              return (
                <button
                  key={t}
                  onClick={() => tracker.setTab(t)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all duration-200"
                  style={
                    active
                      ? { background: "var(--color-primary-600)", color: "var(--color-text-on-primary)" }
                      : { background: "transparent", color: "var(--color-text-secondary)" }
                  }
                >
                  {t !== "All" && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_CONFIG[t].dot }} />
                  )}
                  {t}
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                    style={
                      active
                        ? { background: "var(--color-surface-on-primary)", color: "var(--color-text-on-primary)" }
                        : { background: "var(--color-neutral-100)", color: "var(--color-text-tertiary)" }
                    }
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── TOOLBAR: search / sort / view / select ────── */}
          <div
            className="rounded-lg border px-4 py-3 flex flex-wrap items-center gap-3"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--color-text-tertiary)" }}
              />
              <input
                type="text"
                value={tracker.query}
                onChange={(e) => tracker.setQuery(e.target.value)}
                placeholder="Search by company or role…"
                className="w-full pl-9 pr-4 py-2 rounded-md border text-sm outline-none transition-all focus:border-primary-500"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>

            <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              <ArrowUpDown size={13} />
              <select
                value={tracker.sort}
                onChange={(e) => tracker.setSort(e.target.value as ApplicationsSortKey)}
                className="text-xs font-semibold rounded-md border px-2 py-1.5 outline-none cursor-pointer"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-bg)",
                  color: "var(--color-text-primary)",
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>

            {/* List / Kanban toggle */}
            <div className="flex rounded-md border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
              {([["list", List], ["kanban", LayoutGrid]] as const).map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setView(mode)}
                  aria-label={`${mode} view`}
                  className="p-1.5 transition-colors"
                  style={{
                    background: view === mode ? "var(--color-primary-50)" : "var(--color-bg)",
                    color: view === mode ? "var(--color-primary-600)" : "var(--color-text-tertiary)",
                  }}
                >
                  <Icon size={15} />
                </button>
              ))}
            </div>

            {view === "list" && (
              <button
                onClick={tracker.toggleSelectMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-bold transition-colors"
                style={
                  tracker.selectMode
                    ? { background: "var(--color-primary-50)", borderColor: "var(--color-primary-300)", color: "var(--color-primary-700)" }
                    : { background: "var(--color-bg)", borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }
                }
              >
                <CheckSquare size={13} />
                {tracker.selectMode ? "Done selecting" : "Select multiple"}
              </button>
            )}
          </div>

          {/* ── BULK ACTIONS BAR ──────────────────────────── */}
          {tracker.selectMode && selectedCount > 0 && view === "list" && (
            <div
              className="rounded-lg border px-4 py-3 flex flex-wrap items-center gap-3 animate-fade-in"
              style={{ background: "var(--color-primary-50)", borderColor: "var(--color-primary-200)" }}
            >
              <p className="text-sm font-bold mr-auto" style={{ color: "var(--color-primary-700)" }}>
                {selectedCount} application{selectedCount === 1 ? "" : "s"} selected
              </p>
              <button
                onClick={() => setWithdrawTarget(Array.from(tracker.selectedIds))}
                className="px-4 py-2 rounded-md text-xs font-bold text-white bg-error-500 hover:bg-error-600 transition-all duration-200 active:scale-95 inline-flex items-center gap-1.5"
              >
                <XCircle size={12} /> Withdraw all ({selectedCount})
              </button>
              <button
                onClick={tracker.clearSelection}
                className="text-xs font-bold hover:underline"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Clear selection
              </button>
            </div>
          )}
        </>
      )}

      {/* ── CONTENT ───────────────────────────────────────── */}
      {tracker.isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-lg border"
              style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
            >
              <JobCardSkeleton />
            </div>
          ))}
        </div>
      ) : !hasAnyApplications ? (
        <EmptyState
          icon={<ClipboardList size={26} />}
          title="No applications yet"
          description="Start applying to jobs to see them here — your applications will appear once submitted."
          action={
            <>
              <Link
                href="/jobs"
                className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 inline-flex items-center gap-1.5"
              >
                <Search size={13} /> Search for jobs
              </Link>
              <Link
                href="/recommendations"
                className="px-4 py-2 rounded-md text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all duration-200 inline-flex items-center gap-1.5"
              >
                <Star size={13} /> View recommendations
              </Link>
            </>
          }
        />
      ) : view === "kanban" ? (
        <ApplicationKanban
          apps={tracker.results.filter((a) => a.status !== "Withdrawn")}
          onUpdateStatus={tracker.updateStatus}
        />
      ) : tracker.results.length === 0 ? (
        <EmptyState
          icon={<Search size={26} />}
          title="No applications match"
          description="Try a different search term or switch to another status tab."
          action={
            <button
              onClick={() => { tracker.setQuery(""); tracker.setTab("All"); }}
              className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200"
            >
              Clear search & filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tracker.results.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              selectMode={tracker.selectMode}
              selected={tracker.selectedIds.has(app.id)}
              onToggleSelect={tracker.toggleSelect}
              onUpdateStatus={tracker.updateStatus}
              onUpdateNotes={tracker.updateNotes}
              onWithdraw={(id) => setWithdrawTarget([id])}
            />
          ))}
        </div>
      )}

      {/* Result count footer */}
      {!tracker.isLoading && hasAnyApplications && view === "list" && tracker.results.length > 0 && (
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          Showing {tracker.results.length} application{tracker.results.length === 1 ? "" : "s"}
          {tracker.tab !== "All" ? ` in ${tracker.tab}` : ""}
        </p>
      )}

      {/* ── WITHDRAW CONFIRMATION MODAL (Flow 3A-3) ───────── */}
      <Modal
        open={withdrawTarget !== null}
        onClose={() => setWithdrawTarget(null)}
        title={
          withdrawTarget && withdrawTarget.length > 1
            ? `Withdraw ${withdrawTarget.length} applications?`
            : "Withdraw your application?"
        }
        subtitle="Are you sure? You can undo this right after, but not later."
        footer={
          <>
            <button
              onClick={() => setWithdrawTarget(null)}
              className="px-4 py-2 rounded-md text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmWithdrawal}
              className="px-4 py-2 rounded-md text-xs font-bold text-white bg-error-500 hover:bg-error-600 transition-all duration-200 active:scale-95 inline-flex items-center gap-1.5"
            >
              <Send size={12} /> Yes, withdraw
            </button>
          </>
        }
      >
        {withdrawCompanies.length > 0 && (
          <p className="text-sm mb-3" style={{ color: "var(--color-text-secondary)" }}>
            You&apos;re about to withdraw from:{" "}
            <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {withdrawCompanies.join(", ")}
            </span>
          </p>
        )}
        <label
          className="text-xs font-semibold uppercase tracking-wider mb-1 block"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Why are you withdrawing? (optional)
        </label>
        <select
          value={withdrawReason}
          onChange={(e) => setWithdrawReason(e.target.value)}
          className="w-full px-3 py-2.5 rounded-md border text-sm outline-none cursor-pointer transition-all focus:border-primary-500"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-bg)",
            color: "var(--color-text-primary)",
          }}
        >
          <option value="">Select a reason…</option>
          {WITHDRAWAL_REASONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <p className="text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>
          Feedback helps us improve your matches (optional).
        </p>
      </Modal>
    </div>
  );
}
