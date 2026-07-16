"use client";

import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal, X, List, LayoutGrid, ChevronLeft, ChevronRight,
  SearchX, ArrowUpDown,
} from "lucide-react";
import { JobCard, JobSearchBar, JobFilters } from "@/features/job/components";
import { fetchJobs } from "@/features/job/api/job.api";
import { useJobSearch, type JobSortKey } from "@/features/job/hooks/use-job-search";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { JobCardSkeleton } from "@/shared/components/feedback/skeleton";
import type { Job } from "@/shared/types/shared.types";

const SORT_OPTIONS: { value: JobSortKey; label: string }[] = [
  { value: "match", label: "Match score" },
  { value: "newest", label: "Newest first" },
  { value: "salary", label: "Salary (high → low)" },
];

export default function JobSearchPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<"list" | "grid">("list");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const search = useJobSearch(jobs, 5);

  // Simulated fetch (backend: Elasticsearch, FR-JOBS-003)
  useEffect(() => {
    let cancelled = false;
    fetchJobs().then((data) => {
      if (!cancelled) {
        setJobs(data);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtersPanel = (
    <JobFilters
      jobs={jobs}
      filters={search.filters}
      toggleFilter={search.toggleFilter}
      setFilter={search.setFilter}
      clearFilters={search.clearFilters}
      activeFilterCount={search.activeFilterCount}
    />
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 min-h-full" style={{ background: "var(--color-bg-secondary)" }}>

      {/* ── PAGE HEADER ───────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Search Jobs
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Explore {jobs.length > 0 ? `${jobs.length} open roles` : "open roles"} matched to your profile
        </p>
      </div>

      {/* ── SEARCH BAR ────────────────────────────────────── */}
      <JobSearchBar value={search.filters.query} onChange={(v) => search.setFilter("query", v)} />

      {/* ── MAIN LAYOUT: FILTERS + RESULTS ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">

        {/* Filters — desktop sidebar */}
        <aside className="hidden lg:block sticky top-4">{filtersPanel}</aside>

        {/* Filters — mobile drawer */}
        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 flex" style={{ zIndex: "var(--z-modal)" as React.CSSProperties["zIndex"] }}>
            <div className="w-80 max-w-[85vw] h-full overflow-y-auto p-3 animate-slide-up" style={{ background: "var(--color-bg-secondary)" }}>
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close filters"
                  className="p-2 rounded-md hover:bg-neutral-100 transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <X size={18} />
                </button>
              </div>
              {filtersPanel}
            </div>
            <div className="flex-1 bg-scrim" onClick={() => setDrawerOpen(false)} />
          </div>
        )}

        {/* Results column */}
        <div className="lg:col-span-3 space-y-4">

          {/* Results toolbar */}
          <div
            className="rounded-lg border px-4 py-3 flex flex-wrap items-center gap-3"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <p className="text-sm font-bold mr-auto" style={{ color: "var(--color-text-primary)" }}>
              {isLoading ? "Searching…" : `${search.results.length} job${search.results.length === 1 ? "" : "s"} found`}
            </p>

            {/* Mobile filter trigger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-bold transition-colors hover:bg-neutral-50"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
            >
              <SlidersHorizontal size={13} />
              Filters
              {search.activeFilterCount > 0 && (
                <span
                  className="w-4 h-4 rounded-full text-white text-xs font-bold flex items-center justify-center"
                  style={{ background: "var(--color-primary-500)" }}
                >
                  {search.activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort */}
            <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              <ArrowUpDown size={13} />
              <select
                value={search.sort}
                onChange={(e) => search.setSort(e.target.value as JobSortKey)}
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
          </div>

          {/* Active filter pills */}
          {search.pills.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {search.pills.map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => search.removePill(pill.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors hover:bg-primary-100"
                  style={{
                    background: "var(--color-primary-50)",
                    borderColor: "var(--color-primary-100)",
                    color: "var(--color-primary-700)",
                  }}
                >
                  {pill.label}
                  <X size={11} />
                </button>
              ))}
              <button
                onClick={search.clearFilters}
                className="text-xs font-bold hover:underline"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Reset filters
              </button>
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div
              className="rounded-lg border divide-y"
              style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
            >
              {[1, 2, 3, 4, 5].map((i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : search.results.length === 0 ? (
            <EmptyState
              icon={<SearchX size={26} />}
              title="No jobs found matching your search"
              description="Try broader search terms, or relax your filters to see more results."
              action={
                <>
                  <button
                    onClick={search.clearFilters}
                    className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200"
                  >
                    Clear all filters
                  </button>
                  <button
                    onClick={() => search.setFilter("query", "")}
                    className="px-4 py-2 rounded-md text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all duration-200"
                  >
                    Reset search
                  </button>
                </>
              }
            />
          ) : view === "list" ? (
            <div
              className="rounded-lg border divide-y overflow-hidden"
              style={{ background: "var(--color-card)", borderColor: "var(--color-neutral-100)", boxShadow: "var(--shadow-sm)" }}
            >
              {search.paged.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="list"
                  saved={savedIds.has(job.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {search.paged.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  variant="grid"
                  saved={savedIds.has(job.id)}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && search.results.length > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                Page {search.page} of {search.totalPages} · Showing{" "}
                {search.paged.length} of {search.results.length} jobs
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => search.setPage(search.page - 1)}
                  disabled={search.page <= 1}
                  aria-label="Previous page"
                  className="p-2 rounded-md border transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)", background: "var(--color-bg)" }}
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: search.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => search.setPage(p)}
                    className="w-8 h-8 rounded-md text-xs font-bold transition-colors"
                    style={
                      p === search.page
                        ? { background: "var(--color-primary-600)", color: "var(--color-text-on-primary)" }
                        : { background: "var(--color-bg)", color: "var(--color-text-secondary)", border: "1px solid var(--color-border)" }
                    }
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => search.setPage(search.page + 1)}
                  disabled={search.page >= search.totalPages}
                  aria-label="Next page"
                  className="p-2 rounded-md border transition-colors hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)", background: "var(--color-bg)" }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
