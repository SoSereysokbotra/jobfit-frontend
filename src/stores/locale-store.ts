"use client";

import { useSyncExternalStore } from "react";

// English only. The site used to offer es/fr/de/km; a browser that saved one of those
// under STORAGE_KEY is no longer in this list and falls back to DEFAULT_LOCALE.
export type SupportedLocale = "en";

const SUPPORTED: readonly string[] = ["en"];

export const DEFAULT_LOCALE: SupportedLocale = "en";
const STORAGE_KEY = "jobfit:locale";

let currentLocale: SupportedLocale = DEFAULT_LOCALE;
let isInitialized = false;
const listeners = new Set<() => void>();

function readStoredLocale(): SupportedLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && SUPPORTED.includes(raw)) {
      return raw as SupportedLocale;
    }
    // Check navigator language if available
    const navLang = window.navigator.language?.slice(0, 2).toLowerCase();
    if (navLang && SUPPORTED.includes(navLang)) {
      return navLang as SupportedLocale;
    }
    return DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function getStoredLocale(): SupportedLocale {
  if (!isInitialized && typeof window !== "undefined") {
    currentLocale = readStoredLocale();
    isInitialized = true;
  }
  return currentLocale;
}

export function setStoredLocale(locale: SupportedLocale): void {
  if (currentLocale === locale) return;
  currentLocale = locale;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  if (!isInitialized && typeof window !== "undefined") {
    isInitialized = true;
    const stored = readStoredLocale();
    if (stored !== currentLocale) {
      currentLocale = stored;
      queueMicrotask(() => listeners.forEach((l) => l()));
    }
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): SupportedLocale {
  return currentLocale;
}

function getServerSnapshot(): SupportedLocale {
  return DEFAULT_LOCALE;
}

export function useLocaleStore(): [SupportedLocale, (locale: SupportedLocale) => void] {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [locale, setStoredLocale];
}
