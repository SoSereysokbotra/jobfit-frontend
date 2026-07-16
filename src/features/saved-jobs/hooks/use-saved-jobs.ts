"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchSavedJobs, type SavedJob } from "../api/saved-jobs.api";

export type SavedJobsSortKey = "recent" | "match" | "salary" | "company";

/* Client state for the Saved Jobs page (Path 2C-1): fetching, search within
   saved jobs, tag filter, sorting, bulk selection, and per-item edits. */
export function useSavedJobs() {
  const [items, setItems] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<SavedJobsSortKey>("recent");
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    fetchSavedJobs().then((data) => {
      if (!cancelled) {
        setItems(data);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  /* ── Derived list: search → tag filter → sort ─────────────── */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items;

    if (q) {
      // Spec: search matches title, company, tags, and notes.
      list = list.filter(({ job, tags, notes }) =>
        [job.title, job.company, notes, ...tags].some((s) => s.toLowerCase().includes(q)),
      );
    }
    if (tagFilter) list = list.filter((s) => s.tags.includes(tagFilter));

    return [...list].sort((a, b) => {
      switch (sort) {
        case "match": return b.job.match - a.job.match;
        case "salary": return b.job.salaryMax - a.job.salaryMax;
        case "company": return a.job.company.localeCompare(b.job.company);
        default: return a.savedDaysAgo - b.savedDaysAgo; // newest saved first
      }
    });
  }, [items, query, tagFilter, sort]);

  /** Every tag currently in use (drives the filter pill row). */
  const allTags = useMemo(
    () => Array.from(new Set(items.flatMap((s) => s.tags))),
    [items],
  );

  /* ── Quick stats for the page header ──────────────────────── */
  const stats = useMemo(() => ({
    total: items.length,
    applied: items.filter((s) => s.status !== undefined).length,
    interviews: items.filter((s) => s.status === "Interview").length,
    addedThisWeek: items.filter((s) => s.savedDaysAgo <= 7).length,
  }), [items]);

  /* ── Per-item edits ────────────────────────────────────────── */
  const patchItem = (id: string, patch: Partial<Omit<SavedJob, "job">>) => {
    setItems((prev) => prev.map((s) => (s.job.id === id ? { ...s, ...patch } : s)));
  };

  const updateNotes = (id: string, notes: string) => patchItem(id, { notes });

  const toggleTag = (id: string, tag: string) => {
    setItems((prev) => prev.map((s) => {
      if (s.job.id !== id) return s;
      const tags = s.tags.includes(tag) ? s.tags.filter((t) => t !== tag) : [...s.tags, tag];
      return { ...s, tags };
    }));
  };

  const removeJobs = (ids: string[]) => {
    const drop = new Set(ids);
    setItems((prev) => prev.filter((s) => !drop.has(s.job.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  };

  /** Bulk "Apply to selected" — mock marks the items as Applied. */
  const applyToJobs = (ids: string[]) => {
    const target = new Set(ids);
    setItems((prev) => prev.map((s) =>
      target.has(s.job.id) && s.status === undefined ? { ...s, status: "Applied" } : s,
    ));
  };

  /* ── Bulk selection ────────────────────────────────────────── */
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectMode = () => {
    setSelectMode((on) => {
      if (on) setSelectedIds(new Set());
      return !on;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  return {
    isLoading, results, stats, allTags,
    query, setQuery,
    tagFilter, setTagFilter,
    sort, setSort,
    selectMode, toggleSelectMode, selectedIds, toggleSelect, clearSelection,
    updateNotes, toggleTag, removeJobs, applyToJobs,
  };
}
