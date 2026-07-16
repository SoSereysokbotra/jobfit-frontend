"use client";

import { useMemo, useState } from "react";
import { useDebounce } from "@/shared/hooks/use-debounce";
import type { EmploymentType, ExperienceLevel, Job, RemoteType } from "@/shared/types/shared.types";

export interface JobSearchFilters {
  query: string;
  types: EmploymentType[];
  remote: RemoteType[];
  levels: ExperienceLevel[];
  locations: string[];
  industries: string[];
  /** Minimum acceptable salary floor in $K (0 = no minimum). */
  salaryMin: number;
  /** Minimum acceptable match score (0 = no minimum). */
  matchMin: number;
  /** Posted within the last N days; null = any time. */
  postedWithin: number | null;
}

export type JobSortKey = "match" | "newest" | "salary";

export const DEFAULT_FILTERS: JobSearchFilters = {
  query: "",
  types: [],
  remote: [],
  levels: [],
  locations: [],
  industries: [],
  salaryMin: 0,
  matchMin: 0,
  postedWithin: null,
};

const SORTERS: Record<JobSortKey, (a: Job, b: Job) => number> = {
  match: (a, b) => b.match - a.match,
  newest: (a, b) => a.postedDaysAgo - b.postedDaysAgo,
  salary: (a, b) => b.salaryMax - a.salaryMax,
};

/**
 * Apply filters to a job list. `ignore` skips one facet — used by the filter
 * panel to compute per-option counts ("234 jobs match") without the facet
 * excluding itself.
 */
export function filterJobs(
  jobs: Job[],
  filters: JobSearchFilters,
  ignore?: keyof JobSearchFilters,
): Job[] {
  const q = filters.query.trim().toLowerCase();
  return jobs.filter((job) => {
    if (ignore !== "query" && q) {
      const haystack = `${job.title} ${job.company} ${job.industry} ${job.description}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (ignore !== "types" && filters.types.length && !filters.types.includes(job.type)) return false;
    if (ignore !== "remote" && filters.remote.length && !filters.remote.includes(job.remote)) return false;
    if (ignore !== "levels" && filters.levels.length && !filters.levels.includes(job.level)) return false;
    if (ignore !== "locations" && filters.locations.length && !filters.locations.includes(job.location)) return false;
    if (ignore !== "industries" && filters.industries.length && !filters.industries.includes(job.industry)) return false;
    if (ignore !== "salaryMin" && filters.salaryMin > 0 && job.salaryMax < filters.salaryMin) return false;
    if (ignore !== "matchMin" && filters.matchMin > 0 && job.match < filters.matchMin) return false;
    if (ignore !== "postedWithin" && filters.postedWithin !== null && job.postedDaysAgo > filters.postedWithin) return false;
    return true;
  });
}

export interface FilterPill {
  id: string;
  label: string;
}

/** Client-side search over the mock job list: filter → sort → paginate. */
export function useJobSearch(jobs: Job[], pageSize = 5) {
  const [filters, setFilters] = useState<JobSearchFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<JobSortKey>("match");
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebounce(filters.query, 250);
  const effectiveFilters = useMemo(
    () => ({ ...filters, query: debouncedQuery }),
    [filters, debouncedQuery],
  );

  const results = useMemo(() => {
    const filtered = filterJobs(jobs, effectiveFilters);
    return [...filtered].sort(SORTERS[sort]);
  }, [jobs, effectiveFilters, sort]);

  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = results.slice((safePage - 1) * pageSize, safePage * pageSize);

  /** Update one filter field and reset pagination. */
  const setFilter = <K extends keyof JobSearchFilters>(key: K, value: JobSearchFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  /** Toggle a value inside a multi-select filter array. */
  const toggleFilter = <K extends "types" | "remote" | "levels" | "locations" | "industries">(
    key: K,
    value: JobSearchFilters[K][number],
  ) => {
    setFilters((prev) => {
      const list = prev[key] as string[];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...prev, [key]: next };
    });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters((prev) => ({ ...DEFAULT_FILTERS, query: prev.query }));
    setPage(1);
  };

  const activeFilterCount =
    filters.types.length +
    filters.remote.length +
    filters.levels.length +
    filters.locations.length +
    filters.industries.length +
    (filters.salaryMin > 0 ? 1 : 0) +
    (filters.matchMin > 0 ? 1 : 0) +
    (filters.postedWithin !== null ? 1 : 0);

  /** Removable pills describing active filters (flows guide 2B-1). */
  const pills: FilterPill[] = [
    ...filters.types.map((v) => ({ id: `types:${v}`, label: v })),
    ...filters.remote.map((v) => ({ id: `remote:${v}`, label: v })),
    ...filters.levels.map((v) => ({ id: `levels:${v}`, label: v })),
    ...filters.locations.map((v) => ({ id: `locations:${v}`, label: v })),
    ...filters.industries.map((v) => ({ id: `industries:${v}`, label: v })),
    ...(filters.salaryMin > 0 ? [{ id: "salaryMin", label: `Salary ≥ $${filters.salaryMin}K` }] : []),
    ...(filters.matchMin > 0 ? [{ id: "matchMin", label: `Match ≥ ${filters.matchMin}%` }] : []),
    ...(filters.postedWithin !== null ? [{ id: "postedWithin", label: `Last ${filters.postedWithin} days` }] : []),
  ];

  const removePill = (id: string) => {
    if (id === "salaryMin") return setFilter("salaryMin", 0);
    if (id === "matchMin") return setFilter("matchMin", 0);
    if (id === "postedWithin") return setFilter("postedWithin", null);
    const [key, value] = id.split(":") as ["types" | "remote" | "levels" | "locations" | "industries", string];
    toggleFilter(key, value as never);
  };

  return {
    filters,
    setFilter,
    toggleFilter,
    clearFilters,
    sort,
    setSort,
    results,
    paged,
    page: safePage,
    setPage,
    totalPages,
    activeFilterCount,
    pills,
    removePill,
  };
}
