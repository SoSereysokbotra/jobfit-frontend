"use client";

import { useSyncExternalStore } from "react";
import type { Job } from "@/shared/types/shared.types";

/**
 * Job comparison selection store (max 3 jobs).
 *
 * Pattern: useSyncExternalStore + localStorage, copied from ui-store.ts.
 * That pattern already handles SSR hydration correctly via `getServerSnapshot`
 * returning an empty array — the server render stays stable, and the real
 * selection is picked up after mount.
 *
 * Why not a Set: JSON round-trips cleanly as an array; order matters for the
 * compare table columns.
 */

const STORAGE_KEY = "jobfit:compare-jobs";
const MAX_COMPARE = 3;

// Module-level mutable state — one instance, shared across all components.
let selectedJobs: Job[] = [];
let initialized = false;
const listeners = new Set<() => void>();

function readStored(): Job[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(jobs: Job[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {
    /* ignore write failures (private mode, quota, etc.) */
  }
}

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  // Lazily hydrate from localStorage on the first client subscription so the
  // initial snapshot stays [] and matches the server-rendered HTML.
  if (!initialized) {
    initialized = true;
    const stored = readStored();
    if (stored.length > 0) {
      selectedJobs = stored;
      queueMicrotask(() => notify());
    }
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Job[] {
  return selectedJobs;
}

const EMPTY_JOBS: Job[] = [];

// Always empty on the server; real value hydrates after mount.
function getServerSnapshot(): Job[] {
  return EMPTY_JOBS;
}

// ── Mutators ──────────────────────────────────────────────────────────────────

export function addJobToCompare(job: Job): void {
  if (selectedJobs.length >= MAX_COMPARE) return;
  if (selectedJobs.some((j) => j.id === job.id)) return;
  selectedJobs = [...selectedJobs, job];
  persist(selectedJobs);
  notify();
}

export function removeJobFromCompare(jobId: string): void {
  const next = selectedJobs.filter((j) => j.id !== jobId);
  if (next.length === selectedJobs.length) return; // no change
  selectedJobs = next;
  persist(selectedJobs);
  notify();
}

export function toggleJobCompare(job: Job): void {
  if (selectedJobs.some((j) => j.id === job.id)) {
    removeJobFromCompare(job.id);
  } else {
    addJobToCompare(job);
  }
}

export function clearCompare(): void {
  selectedJobs = [];
  persist([]);
  notify();
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/** Returns the current comparison selection as `[jobs, toggle, clear]`. */
export function useJobCompare(): {
  compareJobs: Job[];
  isComparing: (jobId: string) => boolean;
  toggleJobCompare: (job: Job) => void;
  clearCompare: () => void;
  canAdd: boolean;
} {
  const compareJobs = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return {
    compareJobs,
    isComparing: (jobId: string) => compareJobs.some((j) => j.id === jobId),
    toggleJobCompare,
    clearCompare,
    canAdd: compareJobs.length < MAX_COMPARE,
  };
}
