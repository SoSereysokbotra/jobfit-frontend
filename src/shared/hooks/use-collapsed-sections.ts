"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Storage keys, one per collapsible surface.
 *
 * Kept separate on purpose: tidying the sidebar and tidying a filter panel are
 * unrelated preferences, and sharing a key would make collapsing "Location" in
 * the job filters also collapse a same-named sidebar section.
 */
export const COLLAPSE_STORAGE_KEYS = {
  sidebar: "jobfit:sidebar-collapsed-sections",
  jobFilters: "jobfit:job-filters-collapsed-sections",
  recommendationFilters: "jobfit:recommendation-filters-collapsed-sections",
} as const;

/**
 * Which sections the user has collapsed, keyed by section id.
 *
 * Absent or `false` means expanded, so a brand-new user — and any section added
 * to a config after they last saved — starts expanded. Collapsing is an opt-in
 * tidying action; nothing is hidden from anyone by default.
 */
export type CollapsedSections = Record<string, boolean>;

function readStored(storageKey: string): CollapsedSections | null {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;

    // Filtered rather than trusted: this value is user-editable, and it outlives
    // any navigation reshuffle, so a stale or hand-mangled entry must not be able
    // to put a non-boolean into the state.
    const clean: CollapsedSections = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "boolean") clean[key] = value;
    }
    return clean;
  } catch {
    // Unparseable JSON, or storage blocked entirely (private mode).
    return null;
  }
}

/**
 * Per-section collapse state for one surface, persisted to localStorage.
 *
 * Follows the same shape as the Resume Builder's view-mode preference: the state
 * starts at its default and is read from storage in an effect AFTER mount, never
 * in a lazy initialiser — localStorage does not exist during the server render,
 * so seeding from it there is a hydration mismatch.
 *
 * `storageKey` defaults to the sidebar's so its original call site reads the same
 * as before; every other surface passes its own key from `COLLAPSE_STORAGE_KEYS`.
 */
export function useCollapsedSections(
  storageKey: string = COLLAPSE_STORAGE_KEYS.sidebar,
) {
  const [collapsed, setCollapsed] = useState<CollapsedSections>({});

  // Gates the write-back below. Without it the first render would persist the
  // empty default over whatever the user had actually saved.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Re-read on a key change too, so two surfaces never inherit each other's state.
    setHydrated(false);
    const stored = readStored(storageKey);
    setCollapsed(stored ?? {});
    setHydrated(true);
  }, [storageKey]);

  // Persisting in an effect rather than inside the updater keeps the updater
  // pure — StrictMode invokes it twice in development.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(collapsed));
    } catch {
      /* ignore write failures (private mode, quota) */
    }
  }, [collapsed, hydrated, storageKey]);

  const toggle = useCallback((sectionId: string) => {
    setCollapsed((previous) => ({ ...previous, [sectionId]: !previous[sectionId] }));
  }, []);

  return { collapsed, toggle };
}
