"use client";

import React, { useState, useMemo } from "react";
import { RefreshCw, LayoutGrid, List, SlidersHorizontal, X, Star } from "lucide-react";
import {
  JobRecommendationCard,
  JobRecommendationFilters,
  JobCard,
} from "@/features/job/components";
import { useJobSearch } from "@/features/job/hooks/use-job-search";
import { useRecommendations } from "@/features/matching/hooks/use-recommendations";
import { useSavedJobIds, useToggleSavedJob } from "@/features/saved-jobs/hooks/use-saved-jobs";

type ViewMode = "list" | "grid";

export default function RecommendationsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [dismissedJobs, setDismissedJobs] = useState<Set<string>>(new Set());

  // Live-shaped recommendations (mock behind interface until the AI service lands).
  const { data: recommendations = [], isFetching, refetch } = useRecommendations();
  const { ids: savedJobs } = useSavedJobIds();
  const toggleSaved = useToggleSavedJob();

  const {
    filters,
    setFilter,
    toggleFilter,
    clearFilters,
    results,
    activeFilterCount,
    pills,
    removePill,
  } = useJobSearch(recommendations, 50);

  const visibleResults = useMemo(
    () => results.filter((job) => !dismissedJobs.has(job.id)),
    [results, dismissedJobs],
  );

  const handleToggleSave = (id: string) => toggleSaved.mutate(id);

  const handleDismiss = (id: string) => {
    setDismissedJobs((prev) => new Set(prev).add(id));
  };

  const handleRefresh = () => {
    refetch();
  };

  const filterPanel = (
    <JobRecommendationFilters
      jobs={recommendations}
      filters={filters}
      toggleFilter={toggleFilter}
      setFilter={setFilter}
      clearFilters={clearFilters}
      activeFilterCount={activeFilterCount}
    />
  );

  return (
    <div className="min-h-screen pb-12" style={{ background: "var(--color-bg-secondary)" }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* PAGE HEADER */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-1">

                <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                  Your Personalized Matches
                </h1>
              </div>
              <p className="text-sm ml-10" style={{ color: "var(--color-text-tertiary)" }}>
                Last updated: Generated 2 hours ago
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all duration-200 hover:bg-neutral-50 disabled:opacity-60"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)", background: "var(--color-card)" }}
            >
              <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
              {isFetching ? "Refreshing…" : "Refresh recommendations"}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* SIDEBAR FILTERS (Desktop) */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24">
              {filterPanel}
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 min-w-0">
            {/* Results summary + controls */}
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  <span className="font-extrabold" style={{ color: "var(--color-primary-600)" }}>
                    {visibleResults.length}
                  </span>{" "}
                  recommendations matched
                  {activeFilterCount > 0 && (
                    <span style={{ color: "var(--color-text-tertiary)" }}>
                      {" "}• {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setFilterDrawerOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-semibold transition-colors hover:bg-neutral-50"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)", background: "var(--color-card)" }}
                >
                  <SlidersHorizontal size={16} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full"
                      style={{ background: "var(--color-primary-600)" }}
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* View mode toggle */}
                <div className="flex items-center rounded-md border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
                  <button
                    onClick={() => setViewMode("list")}
                    className="px-3 py-2 flex items-center justify-center transition-colors"
                    style={{
                      background: viewMode === "list" ? "var(--color-primary-600)" : "var(--color-card)",
                      color: viewMode === "list" ? "white" : "var(--color-text-secondary)",
                    }}
                    title="List view"
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className="px-3 py-2 flex items-center justify-center transition-colors"
                    style={{
                      background: viewMode === "grid" ? "var(--color-primary-600)" : "var(--color-card)",
                      color: viewMode === "grid" ? "white" : "var(--color-text-secondary)",
                    }}
                    title="Grid view"
                  >
                    <LayoutGrid size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Pills */}
            {pills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {pills.map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => removePill(pill.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-colors hover:opacity-80"
                    style={{
                      background: "var(--color-primary-50)",
                      color: "var(--color-primary-700)",
                      borderColor: "var(--color-primary-200)",
                    }}
                  >
                    {pill.label}
                    <X size={12} />
                  </button>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold hover:underline self-center"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results */}
            {visibleResults.length === 0 ? (
              <div
                className="rounded-lg border p-12 text-center"
                style={{ background: "var(--color-card)", borderColor: "var(--color-border)" }}
              >
                <Star size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-lg font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
                  No recommendations match your filters
                </p>
                <p className="text-sm mb-4" style={{ color: "var(--color-text-tertiary)" }}>
                  Try adjusting your filters or refreshing your recommendations.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-md text-sm font-semibold text-white"
                  style={{ background: "var(--color-primary-600)" }}
                >
                  Clear filters
                </button>
              </div>
            ) : viewMode === "grid" ? (
              /* GRID VIEW: Reuse existing JobCard grid variant */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibleResults.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    variant="grid"
                    saved={savedJobs.has(job.id)}
                    onToggleSave={handleToggleSave}
                    onApply={(id) => console.log("Apply:", id)}
                  />
                ))}
              </div>
            ) : (
              /* LIST VIEW: Specialized recommendation cards */
              <div>
                {visibleResults.map((job) => (
                  <JobRecommendationCard
                    key={job.id}
                    job={job}
                    saved={savedJobs.has(job.id)}
                    onToggleSave={handleToggleSave}
                    onApply={(id) => console.log("Apply:", id)}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            )}

            {/* Bottom summary */}
            {visibleResults.length > 0 && (
              <p className="text-center text-sm mt-8" style={{ color: "var(--color-text-tertiary)" }}>
                Top {visibleResults.length} recommendations shown • Updated nightly
              </p>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFilterDrawerOpen(false)}
          />
          {/* Panel */}
          <div
            className="absolute left-0 top-0 bottom-0 w-80 max-w-[90vw] overflow-y-auto p-4 shadow-2xl"
            style={{ background: "var(--color-bg-secondary)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                Filter Matches
              </h2>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="p-2 rounded-md hover:bg-neutral-100"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <X size={20} />
              </button>
            </div>
            {filterPanel}
            <div
              className="mt-4 sticky bottom-0 pb-4 pt-2"
              style={{ background: "var(--color-bg-secondary)" }}
            >
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-full py-3 rounded-md text-sm font-bold text-white"
                style={{ background: "var(--color-primary-600)" }}
              >
                Show {visibleResults.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
