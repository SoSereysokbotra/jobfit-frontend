"use client";

import React, { useMemo } from "react";
import type { ExperienceLevel, Job } from "@/shared/types/shared.types";
import { filterJobs, type JobSearchFilters } from "../hooks/use-job-search";
import { FilterSection, CheckOption } from "./job-filters";

const EXPERIENCE_LEVELS: ExperienceLevel[] = ["Entry-level", "Mid-level", "Senior", "Lead/Manager"];

interface JobRecommendationFiltersProps {
  jobs: Job[];
  filters: JobSearchFilters;
  toggleFilter: (
    key: "types" | "remote" | "levels" | "locations" | "industries",
    value: string,
  ) => void;
  setFilter: <K extends keyof JobSearchFilters>(key: K, value: JobSearchFilters[K]) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

/**
 * Filter panel specifically tailored for Recommendations (2A-1).
 * Reuses FilterSection and CheckOption from job-filters.tsx.
 */
export function JobRecommendationFilters({
  jobs, filters, toggleFilter, setFilter, clearFilters, activeFilterCount,
}: JobRecommendationFiltersProps) {
  const locations = useMemo(() => [...new Set(jobs.map((j) => j.location))].sort(), [jobs]);
  const industries = useMemo(() => [...new Set(jobs.map((j) => j.industry))].sort(), [jobs]);

  const countFor = (key: "types" | "remote" | "levels" | "locations" | "industries", value: string) =>
    filterJobs(jobs, { ...filters, [key]: [value] }, undefined).length;

  return (
    <div
      className="rounded-lg border p-5 space-y-4"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
          Filter Matches
        </h2>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs font-bold hover:underline"
            style={{ color: "var(--color-primary-600)" }}
          >
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      <FilterSection title="Match Score">
        <div className="flex justify-between text-xs mb-1.5">
          <span style={{ color: "var(--color-text-tertiary)" }}>Minimum Match</span>
          <span className="font-bold" style={{ color: "var(--color-primary-600)" }}>
            {filters.matchMin}%
          </span>
        </div>
        <input
          type="range"
          min={60}
          max={100}
          step={5}
          value={filters.matchMin > 0 ? filters.matchMin : 60}
          onChange={(e) => setFilter("matchMin", Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            accentColor: "var(--color-primary-600)",
            background: `linear-gradient(to right, var(--color-primary-500) ${((Math.max(60, filters.matchMin) - 60) / 40) * 100}%, var(--color-neutral-200) ${((Math.max(60, filters.matchMin) - 60) / 40) * 100}%)`,
          }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: "var(--color-text-disabled)" }}>
          <span>60%</span>
          <span>100%</span>
        </div>
      </FilterSection>

      <FilterSection title="Location">
        <div className="max-h-44 overflow-y-auto pr-1">
          {locations.map((loc) => (
            <CheckOption
              key={loc}
              label={loc}
              checked={filters.locations.includes(loc)}
              count={countFor("locations", loc)}
              onChange={() => toggleFilter("locations", loc)}
            />
          ))}
        </div>
      </FilterSection>
      
      <FilterSection title="Minimum Salary">
        <div className="flex justify-between text-xs mb-1.5">
          <span style={{ color: "var(--color-text-tertiary)" }}>Base salary</span>
          <span className="font-bold" style={{ color: "var(--color-primary-600)" }}>
            {filters.salaryMin > 0 ? `$${filters.salaryMin}K` : "Any"}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={250}
          step={10}
          value={filters.salaryMin}
          onChange={(e) => setFilter("salaryMin", Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            accentColor: "var(--color-primary-600)",
            background: `linear-gradient(to right, var(--color-primary-500) ${(filters.salaryMin / 250) * 100}%, var(--color-neutral-200) ${(filters.salaryMin / 250) * 100}%)`,
          }}
        />
      </FilterSection>

      <FilterSection title="Company Industry">
        {industries.map((ind) => (
          <CheckOption
            key={ind}
            label={ind}
            checked={filters.industries.includes(ind)}
            count={countFor("industries", ind)}
            onChange={() => toggleFilter("industries", ind)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Role Level">
        {EXPERIENCE_LEVELS.map((l) => (
          <CheckOption
            key={l}
            label={l}
            checked={filters.levels.includes(l)}
            count={countFor("levels", l)}
            onChange={() => toggleFilter("levels", l)}
          />
        ))}
      </FilterSection>
    </div>
  );
}
