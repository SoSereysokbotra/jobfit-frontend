"use client";

import { useSyncExternalStore } from "react";

const RECENT_SEARCHES_KEY = "jobfit:recent-searches";
const MAX_RECENT_SEARCHES = 5;

let commandPaletteOpen = false;
const paletteListeners = new Set<() => void>();

export function getCommandPaletteOpen(): boolean {
  return commandPaletteOpen;
}

export function setCommandPaletteOpen(open: boolean) {
  if (commandPaletteOpen === open) return;
  commandPaletteOpen = open;
  paletteListeners.forEach((l) => l());
}

export function toggleCommandPalette() {
  setCommandPaletteOpen(!commandPaletteOpen);
}

function subscribePalette(listener: () => void) {
  paletteListeners.add(listener);
  return () => {
    paletteListeners.delete(listener);
  };
}

export function useCommandPaletteOpen(): [boolean, (open: boolean) => void] {
  const open = useSyncExternalStore(
    subscribePalette,
    () => commandPaletteOpen,
    () => false
  );
  return [open, setCommandPaletteOpen];
}

// ─────────────────────────────────────────────────────────────
// RECENT SEARCHES STORE (backed by localStorage)
// ─────────────────────────────────────────────────────────────
let recentSearches: string[] = [];
let recentInitialized = false;
const recentListeners = new Set<() => void>();

function readStoredRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function subscribeRecent(listener: () => void) {
  if (!recentInitialized) {
    recentInitialized = true;
    const stored = readStoredRecent();
    if (stored.length > 0) {
      recentSearches = stored;
      queueMicrotask(() => recentListeners.forEach((l) => l()));
    }
  }
  recentListeners.add(listener);
  return () => {
    recentListeners.delete(listener);
  };
}

function getRecentSnapshot() {
  return recentSearches;
}

const SERVER_SNAPSHOT: string[] = [];
function getServerRecentSnapshot() {
  return SERVER_SNAPSHOT;
}

export function addRecentSearch(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;
  const filtered = recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
  recentSearches = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
    } catch {
      /* ignore */
    }
  }
  recentListeners.forEach((l) => l());
}

export function removeRecentSearch(query: string) {
  recentSearches = recentSearches.filter((s) => s !== query);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
    } catch {
      /* ignore */
    }
  }
  recentListeners.forEach((l) => l());
}

export function clearRecentSearches() {
  recentSearches = [];
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      /* ignore */
    }
  }
  recentListeners.forEach((l) => l());
}

export function useRecentSearches(): string[] {
  return useSyncExternalStore(subscribeRecent, getRecentSnapshot, getServerRecentSnapshot);
}
