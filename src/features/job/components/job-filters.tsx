"use client";

import React, { useMemo } from "react";
import type { EmploymentType, ExperienceLevel, Job, RemoteType } from "@/shared/types/shared.types";
import { filterJobs, type JobSearchFilters } from "../hooks/use-job-search";

const EMPLOYMENT_TYPES: EmploymentType[] = ["Full-time", "Contract", "Part-time", "Freelance"];
const REMOTE_TYPES: RemoteType[] = ["On-site", "Hybrid", "Remote"];
const EXPERIENCE_LEVELS: ExperienceLevel[] = ["Entry-level", "Mid-level", "Senior", "Lead/Manager"];
const POSTED_OPTIONS: { label: string; value: number | null }[] = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
  { label: "Any time", value: null },
];

interface JobFiltersProps {
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

export function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pb-4 border-b last:border-b-0 last:pb-0" style={{ borderColor: "var(--color-neutral-100)" }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: "var(--color-text-tertiary)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

export function CheckOption({
  label, checked, count, onChange,
}: {
  label: string;
  checked: boolean;
  count: number;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2 py-1 cursor-pointer group">
      <span className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-primary)" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-4 h-4 rounded border-neutral-300"
          style={{ accentColor: "var(--color-primary-600)" }}
        />
        <span className="group-hover:text-primary-700 transition-colors">{label}</span>
      </span>
      <span className="text-xs" style={{ color: "var(--color-text-disabled)" }}>{count}</span>
    </label>
  );
}

/**
 * "Refine your search" panel (flows guide 2B-1). Renders inside a sidebar on
 * desktop or a drawer on mobile — the parent owns that container. Per-option
 * counts are faceted: each facet counts against all OTHER active filters.
 */
export function JobFilters({
  jobs, filters, toggleFilter, setFilter, clearFilters, activeFilterCount,
}: JobFiltersProps) {
  const locations = useMemo(() => [...new Set(jobs.map((j) => j.location))].sort(), [jobs]);
  const industries = useMemo(() => [...new Set(jobs.map((j) => j.industry))].sort(), [jobs]);

  // Faceted counts: how many jobs match if this option were the only value in its facet
  const countFor = (key: "types" | "remote" | "levels" | "locations" | "industries", value: string) =>
    filterJobs(jobs, { ...filters, [key]: [value] }, undefined).length;

  return (
    <div
      className="rounded-lg border p-5 space-y-4"
      style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
          Refine your search
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

      <FilterSection title="Employment Type">
        {EMPLOYMENT_TYPES.map((t) => (
          <CheckOption
            key={t}
            label={t}
            checked={filters.types.includes(t)}
            count={countFor("types", t)}
            onChange={() => toggleFilter("types", t)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Remote Flexibility">
        {REMOTE_TYPES.map((r) => (
          <CheckOption
            key={r}
            label={r}
            checked={filters.remote.includes(r)}
            count={countFor("remote", r)}
            onChange={() => toggleFilter("remote", r)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Experience Level">
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

      <FilterSection title="Industry">
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

      <FilterSection title="Minimum Salary">
        <div className="flex justify-between text-xs mb-1.5">
          <span style={{ color: "var(--color-text-tertiary)" }}>Show jobs paying at least</span>
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
        <p className="text-xs mt-1.5" style={{ color: "var(--color-text-disabled)" }}>
          Market median for your profile: $155K
        </p>
      </FilterSection>

      <FilterSection title="Posted Date">
        {POSTED_OPTIONS.map((opt) => (
          <label key={opt.label} className="flex items-center gap-2 py-1 cursor-pointer text-sm" style={{ color: "var(--color-text-primary)" }}>
            <input
              type="radio"
              name="posted-date"
              checked={filters.postedWithin === opt.value}
              onChange={() => setFilter("postedWithin", opt.value)}
              className="w-4 h-4"
              style={{ accentColor: "var(--color-primary-600)" }}
            />
            {opt.label}
          </label>
        ))}
      </FilterSection>
    </div>
  );
}
