"use client";

import React, { useMemo } from "react";
import { Check } from "lucide-react";
import type { EmploymentType, ExperienceLevel, Job, RemoteType } from "@/shared/types/shared.types";
import { CollapsibleSection } from "@/shared/components/ui/collapsible-section";
import { filterJobs, type JobSearchFilters } from "../hooks/use-job-search";
import {
  FilterPanelShell,
  useFilterCollapseContext,
  type FilterPanelCollapse,
} from "./filter-panel-shell";

const EMPLOYMENT_TYPES: EmploymentType[] = [
  "Full-time", "Part-time", "Contract", "Temporary", "Freelance",
];
const REMOTE_TYPES: RemoteType[] = ["On-site", "Hybrid", "Remote"];
const EXPERIENCE_LEVELS: ExperienceLevel[] = [
  "Intern", "Entry-level", "Mid-level", "Senior", "Lead", "Manager", "Director", "C-level",
];
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
  /** Collapse state, owned by the page so it can widen the results column. */
  collapse: FilterPanelCollapse;
  /** Offer the whole-panel collapse. Desktop only — see `FilterPanelShell`. */
  collapsible?: boolean;
}

/**
 * The distinct values a facet actually has, skipping jobs that do not state one.
 *
 * `[...new Set(jobs.map(j => j.industry))]` used to be safe only because the mapper
 * defaulted every job to "Technology". Now that absent is a real value, an undefined
 * would become a blank checkbox that filters to nothing.
 */
export function valuesOf(jobs: Job[], pick: (j: Job) => string | undefined): string[] {
  return [...new Set(jobs.map(pick).filter((v): v is string => Boolean(v)))].sort();
}

/** Turns a section title into an id usable in the DOM and in localStorage. */
function sectionPanelId(title: string): string {
  return `filter-section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

/**
 * One facet of a filter panel — collapsible when rendered inside a
 * `FilterPanelShell`, and a plain labelled block when rendered anywhere else.
 *
 * Collapsing only clips the content; the checkboxes stay mounted and the filter
 * state lives in the page's search hook either way, so tidying a section away
 * never drops the selections inside it.
 */
export function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const collapse = useFilterCollapseContext();

  const body = collapse ? (
    <CollapsibleSection
      panelId={sectionPanelId(title)}
      title={title}
      collapsed={Boolean(collapse.sections[title])}
      onToggle={() => collapse.toggleSection(title)}
      /* Same type scale and casing as the static label it replaces. The negative
         margins cancel the padding, so the hover target grows without moving
         anything — the panel's vertical rhythm is unchanged. */
      headerClassName="text-xs font-bold uppercase tracking-wider rounded px-1.5 -mx-1.5 py-0.5 -my-0.5"
      headerStyle={{ color: "var(--color-text-tertiary)" }}
      /* Reproduces the old label's `mb-2.5`, but inside the collapsing region so
         it folds away too rather than leaving a gap under a closed section. */
      contentClassName="pt-2.5"
      chevronSize={13}
    >
      {children}
    </CollapsibleSection>
  ) : (
    <>
      <p className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: "var(--color-text-tertiary)" }}>
        {title}
      </p>
      {children}
    </>
  );

  return (
    <div className="pb-4 border-b last:border-b-0 last:pb-0" style={{ borderColor: "var(--color-border)" }}>
      {body}
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
    <label className="flex items-center justify-between gap-2 py-1 cursor-pointer group select-none">
      <span className="flex items-center gap-2.5 text-sm" style={{ color: "var(--color-text-primary)" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <span
          className="flex items-center justify-center w-4 h-4 rounded border transition-all duration-150 shrink-0"
          style={{
            background: checked ? "var(--color-primary-600)" : "var(--color-card)",
            borderColor: checked ? "var(--color-primary-600)" : "var(--color-border)",
          }}
        >
          {checked && <Check size={11} style={{ color: "#ffffff" }} />}
        </span>
        <span className="transition-colors group-hover:text-[var(--color-primary-500)]">{label}</span>
      </span>
      <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{count}</span>
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
  collapse, collapsible = false,
}: JobFiltersProps) {
  const locations = useMemo(() => [...new Set(jobs.map((j) => j.location))].sort(), [jobs]);
  const industries = useMemo(() => valuesOf(jobs, (j) => j.industry), [jobs]);

  // A facet whose field NO job in this set states cannot narrow anything — every option
  // would read 0 and the panel would imply the board is empty of part-time work rather
  // than that nobody has said. Hide the section instead of showing dead checkboxes.
  const anyType = useMemo(() => jobs.some((j) => j.type), [jobs]);
  const anyLevel = useMemo(() => jobs.some((j) => j.level), [jobs]);

  // Faceted counts: how many jobs match if this option were the only value in its facet
  const countFor = (key: "types" | "remote" | "levels" | "locations" | "industries", value: string) =>
    filterJobs(jobs, { ...filters, [key]: [value] }, undefined).length;

  return (
    <FilterPanelShell
      title="Refine your search"
      collapse={collapse}
      collapsible={collapsible}
      activeFilterCount={activeFilterCount}
      clearFilters={clearFilters}
    >
      {anyType && (
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
      )}

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

      {anyLevel && (
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
      )}

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

      {industries.length > 0 && (
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
      )}

      <FilterSection title="Minimum Salary">
        <div className="flex justify-between text-xs mb-1.5">
          <span style={{ color: "var(--color-text-tertiary)" }}>Show jobs paying at least</span>
          <span className="font-bold" style={{ color: "var(--color-primary-500)" }}>
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
            accentColor: "var(--color-primary-500)",
            background: `linear-gradient(to right, var(--color-primary-500) ${(filters.salaryMin / 250) * 100}%, var(--color-border) ${(filters.salaryMin / 250) * 100}%)`,
          }}
        />
        <p className="text-xs mt-1.5" style={{ color: "var(--color-text-tertiary)" }}>
          Market median for your profile: $155K
        </p>
      </FilterSection>

      <FilterSection title="Posted Date">
        {POSTED_OPTIONS.map((opt) => {
          const isSelected = filters.postedWithin === opt.value;
          return (
            <label
              key={opt.label}
              className="flex items-center justify-between gap-2 py-1 cursor-pointer text-sm group select-none"
            >
              <span className="flex items-center gap-2.5" style={{ color: "var(--color-text-primary)" }}>
                <input
                  type="radio"
                  name="posted-date"
                  checked={isSelected}
                  onChange={() => setFilter("postedWithin", opt.value)}
                  className="sr-only"
                />
                <span
                  className="flex items-center justify-center w-4 h-4 rounded-full border transition-all duration-150 shrink-0"
                  style={{
                    background: "var(--color-card)",
                    borderColor: isSelected ? "var(--color-primary-600)" : "var(--color-border)",
                  }}
                >
                  {isSelected && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: "var(--color-primary-600)" }}
                    />
                  )}
                </span>
                <span className="transition-colors group-hover:text-[var(--color-primary-500)]">{opt.label}</span>
              </span>
            </label>
          );
        })}
      </FilterSection>
    </FilterPanelShell>
  );
}
