"use client";

import React from "react";
import Link from "next/link";
import {
  Search, Heart, ArrowUpDown, List, LayoutGrid, X,
  CheckSquare, Briefcase, Calendar, Sparkles, Trash2, Send,
} from "lucide-react";
import { SavedJobCard } from "@/features/saved-jobs/components";
import { useSavedJobs, type SavedJobsSortKey } from "@/features/saved-jobs/hooks/use-saved-jobs";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { JobCardSkeleton } from "@/shared/components/feedback/skeleton";

const SORT_OPTIONS: { value: SavedJobsSortKey; label: string }[] = [
  { value: "recent", label: "Saved date (newest)" },
  { value: "match", label: "Match score" },
  { value: "salary", label: "Salary (high → low)" },
  { value: "company", label: "Company (A–Z)" },
];

/** Header stat chip ("Applied to 3", "2 with upcoming interviews", …). */
function StatChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        color: "var(--color-text-secondary)",
      }}
    >
      <span style={{ color: "var(--color-primary-500)" }}>{icon}</span>
      {label}
    </span>
  );
}

export default function SavedJobsPage() {
  const saved = useSavedJobs();
  const [view, setView] = React.useState<"list" | "grid">("list");

  const selectedCount = saved.selectedIds.size;
  const hasAnySaved = saved.stats.total > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 min-h-full" style={{ background: "var(--color-bg-secondary)" }}>

      {/* ── PAGE HEADER ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Your Saved Jobs
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {saved.isLoading
              ? "Loading your collection…"
              : `${saved.stats.total} job${saved.stats.total === 1 ? "" : "s"} saved — your personal shortlist`}
          </p>
        </div>
        {!saved.isLoading && hasAnySaved && (
          <div className="flex flex-wrap gap-2">
            <StatChip icon={<Briefcase size={12} />} label={`Applied to ${saved.stats.applied}`} />
            <StatChip icon={<Calendar size={12} />} label={`${saved.stats.interviews} with upcoming interviews`} />
            <StatChip icon={<Sparkles size={12} />} label={`${saved.stats.addedThisWeek} added this week`} />
          </div>
        )}
      </div>

      {/* ── TOOLBAR: search / sort / view / select ────────── */}
      {hasAnySaved && (
        <div
          className="rounded-lg border px-4 py-3 flex flex-wrap items-center gap-3"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          {/* Search within saved jobs (title, company, tags, notes) */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--color-text-tertiary)" }}
            />
            <input
              type="text"
              value={saved.query}
              onChange={(e) => saved.setQuery(e.target.value)}
              placeholder="Search your saved jobs…"
              className="w-full pl-9 pr-4 py-2 rounded-md border text-sm outline-none transition-all focus:border-primary-500"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-bg)",
                color: "var(--color-text-primary)",
              }}
            />
          </div>

          {/* Sort */}
          <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            <ArrowUpDown size={13} />
            <select
              value={saved.sort}
              onChange={(e) => saved.setSort(e.target.value as SavedJobsSortKey)}
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

          {/* View toggle */}
          <div className="flex rounded-md border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
            {([["list", List], ["grid", LayoutGrid]] as const).map(([mode, Icon]) => (
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

          {/* Bulk-select toggle */}
          <button
            onClick={saved.toggleSelectMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-bold transition-colors"
            style={
              saved.selectMode
                ? { background: "var(--color-primary-50)", borderColor: "var(--color-primary-300)", color: "var(--color-primary-700)" }
                : { background: "var(--color-bg)", borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }
            }
          >
            <CheckSquare size={13} />
            {saved.selectMode ? "Done selecting" : "Select multiple"}
          </button>
        </div>
      )}

      {/* ── TAG FILTER PILLS ──────────────────────────────── */}
      {hasAnySaved && saved.allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>
            Filter by tag:
          </span>
          {saved.allTags.map((tag) => {
            const active = saved.tagFilter === tag;
            return (
              <button
                key={tag}
                onClick={() => saved.setTagFilter(active ? null : tag)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors"
                style={
                  active
                    ? { background: "var(--color-primary-600)", borderColor: "var(--color-primary-600)", color: "var(--color-text-on-primary)" }
                    : { background: "var(--color-primary-50)", borderColor: "var(--color-primary-100)", color: "var(--color-primary-700)" }
                }
              >
                {tag}
                {active && <X size={11} />}
              </button>
            );
          })}
        </div>
      )}

      {/* ── BULK ACTIONS BAR ──────────────────────────────── */}
      {saved.selectMode && selectedCount > 0 && (
        <div
          className="rounded-lg border px-4 py-3 flex flex-wrap items-center gap-3 animate-fade-in"
          style={{ background: "var(--color-primary-50)", borderColor: "var(--color-primary-200)" }}
        >
          <p className="text-sm font-bold mr-auto" style={{ color: "var(--color-primary-700)" }}>
            {selectedCount} selected
          </p>
          <button
            onClick={() => saved.applyToJobs(Array.from(saved.selectedIds))}
            className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 active:scale-95 inline-flex items-center gap-1.5"
          >
            <Send size={12} /> Apply to selected ({selectedCount})
          </button>
          <button
            onClick={() => saved.removeJobs(Array.from(saved.selectedIds))}
            className="px-4 py-2 rounded-md text-xs font-bold text-white bg-error-500 hover:bg-error-600 transition-all duration-200 active:scale-95 inline-flex items-center gap-1.5"
          >
            <Trash2 size={12} /> Remove ({selectedCount})
          </button>
          <button
            onClick={saved.clearSelection}
            className="text-xs font-bold hover:underline"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ── CONTENT ───────────────────────────────────────── */}
      {saved.isLoading ? (
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
      ) : !hasAnySaved ? (
        <EmptyState
          icon={<Heart size={26} />}
          title="No saved jobs yet"
          description="Tap the heart icon on any job to save it for later — build your personal shortlist of opportunities."
          action={
            <Link
              href="/jobs"
              className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 inline-flex items-center gap-1.5"
            >
              <Search size={13} /> Start searching
            </Link>
          }
        />
      ) : saved.results.length === 0 ? (
        <EmptyState
          icon={<Search size={26} />}
          title="No saved jobs match"
          description="Try a different search term, or clear the tag filter to see your full collection."
          action={
            <button
              onClick={() => { saved.setQuery(""); saved.setTagFilter(null); }}
              className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200"
            >
              Clear search & filters
            </button>
          }
        />
      ) : (
        <div className={view === "grid" ? "grid grid-cols-1 xl:grid-cols-2 gap-4 items-start" : "grid grid-cols-1 gap-4"}>
          {saved.results.map((item) => (
            <SavedJobCard
              key={item.job.id}
              item={item}
              selectMode={saved.selectMode}
              selected={saved.selectedIds.has(item.job.id)}
              onToggleSelect={saved.toggleSelect}
              onApply={(id) => saved.applyToJobs([id])}
              onRemove={(id) => saved.removeJobs([id])}
              onUpdateNotes={saved.updateNotes}
              onToggleTag={saved.toggleTag}
            />
          ))}
        </div>
      )}

      {/* Result count footer */}
      {!saved.isLoading && hasAnySaved && saved.results.length > 0 && (
        <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          Showing {saved.results.length} of {saved.stats.total} saved job{saved.stats.total === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
