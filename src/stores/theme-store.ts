"use client";

import { useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "jobfit:theme";

let currentTheme: ThemeMode = "system";
let initialized = false;
const listeners = new Set<() => void>();

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") {
      return raw;
    }
  } catch {
    /* ignore localStorage errors */
  }
  return "system";
}

function applyThemeToDocument(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  if (mode === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      root.setAttribute("data-theme", "dark");
    } else {
      root.removeAttribute("data-theme");
    }
  } else if (mode === "dark") {
    root.setAttribute("data-theme", "dark");
  } else {
    root.setAttribute("data-theme", "light");
  }
}

function notify() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  if (!initialized) {
    initialized = true;
    const stored = getStoredTheme();
    if (stored !== currentTheme) {
      currentTheme = stored;
      applyThemeToDocument(currentTheme);
      queueMicrotask(() => notify());
    }
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ThemeMode {
  return currentTheme;
}

function getServerSnapshot(): ThemeMode {
  return "system";
}

export function setThemeMode(mode: ThemeMode) {
  if (mode === currentTheme) return;
  currentTheme = mode;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      /* ignore storage errors */
    }
    applyThemeToDocument(mode);
  }
  notify();
}

/** Hook returning `[theme, setTheme]` tuple. */
export function useThemeStore(): [ThemeMode, (mode: ThemeMode) => void] {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [theme, setThemeMode];
}
