"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useThemeStore, type ThemeMode } from "@/stores/theme-store";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeMode] = useThemeStore();
  const [systemIsDark, setSystemIsDark] = useState<boolean>(false);

  // Monitor system color scheme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const resolvedTheme: "light" | "dark" = useMemo(() => {
    if (theme === "system") {
      return systemIsDark ? "dark" : "light";
    }
    return theme;
  }, [theme, systemIsDark]);

  // Sync data-theme attribute on document root
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    if (theme === "system") {
      if (systemIsDark) {
        root.setAttribute("data-theme", "dark");
      } else {
        root.removeAttribute("data-theme");
      }
    } else if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
    }
  }, [theme, systemIsDark]);

  const setTheme = useCallback(
    (mode: ThemeMode) => {
      setThemeMode(mode);
    },
    [setThemeMode]
  );

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "system" as ThemeMode,
      resolvedTheme: "light" as const,
      setTheme: () => {},
    };
  }
  return context;
}
