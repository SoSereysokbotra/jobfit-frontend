"use client";

import { useSyncExternalStore } from "react";

/**
 * Lightweight shared UI state (no zustand). Currently holds the desktop
 * sidebar's collapsed flag so the seeker/admin/employer areas share a single
 * source of truth instead of each duplicating the state. Backed by an external
 * store + localStorage so the choice survives reloads and every consumer stays
 * in sync.
 */

const SIDEBAR_STORAGE_KEY = "jobfit:sidebar-collapsed";

let collapsed = false;
let initialized = false;
const listeners = new Set<() => void>();

function readStored(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  // Lazily hydrate from localStorage on the first client subscription so the
  // initial snapshot stays `false` and matches the server-rendered HTML.
  if (!initialized) {
    initialized = true;
    const stored = readStored();
    if (stored !== collapsed) {
      collapsed = stored;
      // Notify any listeners registered in the same tick.
      queueMicrotask(() => listeners.forEach((l) => l()));
    }
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return collapsed;
}

// Always expanded on the server; the real value is picked up after mount.
function getServerSnapshot() {
  return false;
}

export function setSidebarCollapsed(value: boolean) {
  if (value === collapsed) return;
  collapsed = value;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
    } catch {
      /* ignore write failures (private mode, quota, etc.) */
    }
  }
  listeners.forEach((l) => l());
}

/** Returns `[collapsed, setCollapsed]`, tuple-style like useState. */
export function useSidebarCollapsed(): [boolean, (value: boolean) => void] {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [value, setSidebarCollapsed];
}
