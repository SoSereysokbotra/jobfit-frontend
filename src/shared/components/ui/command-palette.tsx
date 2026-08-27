"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Briefcase,
  Clock,
  LogOut,
  FileText,
  ChevronRight,
  Loader2,
  Trash2,
  Sparkles,
} from "lucide-react";
import {
  useCommandPaletteOpen,
  useRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from "@/stores/command-palette-store";
import { ALL_NAVIGATION_ITEMS, type NavigationItem } from "@/shared/config/navigation";
import { useJobs } from "@/features/job/hooks/use-job";
import { useDebounce } from "@/shared/hooks/use-debounce";
import { useAuth } from "@/providers/auth-provider";
import type { Job } from "@/shared/types/shared.types";

interface PaletteItem {
  id: string;
  group: "jobs" | "routes" | "actions" | "recent";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: string;
  onSelect: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useCommandPaletteOpen();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const { logout } = useAuth();
  const recentSearches = useRecentSearches();

  // Fetch live jobs when debounced query is active
  const { data: jobs, isLoading: isJobsLoading } = useJobs(
    debouncedQuery.trim() ? { q: debouncedQuery.trim() } : {}
  );

  // Global Ctrl+K / ⌘K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Reset query and selected index on open/close
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  // Build filtered items
  const items = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [];
    const q = debouncedQuery.trim().toLowerCase();

    if (!q) {
      // Show Recent Searches when query is empty
      recentSearches.forEach((rs) => {
        list.push({
          id: `recent-${rs}`,
          group: "recent",
          title: rs,
          subtitle: "Recent search",
          icon: <Clock size={16} className="text-neutral-400" />,
          onSelect: () => {
            setQuery(rs);
          },
        });
      });

      // Quick Actions when query is empty
      list.push(
        {
          id: "action-jobs-all",
          group: "actions",
          title: "Browse all jobs",
          subtitle: "View full job postings board",
          icon: <Briefcase size={16} className="text-primary-600" />,
          onSelect: () => {
            handleClose();
            router.push("/jobs");
          },
        },
        {
          id: "action-upload-resume",
          group: "actions",
          title: "Upload résumé",
          subtitle: "Manage your resumes and documents",
          icon: <FileText size={16} className="text-primary-600" />,
          onSelect: () => {
            handleClose();
            router.push("/resumes");
          },
        },
        {
          id: "action-logout",
          group: "actions",
          title: "Sign out",
          subtitle: "Log out of your JobFits session",
          icon: <LogOut size={16} className="text-red-500" />,
          onSelect: () => {
            handleClose();
            logout();
          },
        }
      );

      return list;
    }

    // 1. Live Job results
    if (jobs && jobs.length > 0) {
      jobs.slice(0, 4).forEach((job: Job) => {
        list.push({
          id: `job-${job.id}`,
          group: "jobs",
          title: job.title,
          subtitle: `${job.company} • ${job.location}`,
          icon: <Briefcase size={16} className="text-primary-600" />,
          badge: job.remote || undefined,
          onSelect: () => {
            addRecentSearch(q);
            handleClose();
            router.push(`/jobs/${job.id}`);
          },
        });
      });
    }

    // 2. Navigation routes
    const matchingRoutes = ALL_NAVIGATION_ITEMS.filter((item: NavigationItem) =>
      item.label.toLowerCase().includes(q) || item.href.toLowerCase().includes(q)
    );

    matchingRoutes.forEach((item: NavigationItem) => {
      list.push({
        id: `route-${item.href}`,
        group: "routes",
        title: item.label,
        subtitle: `Go to ${item.href}`,
        icon: item.icon,
        onSelect: () => {
          addRecentSearch(q);
          handleClose();
          router.push(item.href);
        },
      });
    });

    // 3. Actions
    list.push({
      id: `action-search-all-${q}`,
      group: "actions",
      title: `Search all jobs for "${q}"`,
      subtitle: "Filter entire job board",
      icon: <Search size={16} className="text-primary-600" />,
      onSelect: () => {
        addRecentSearch(q);
        handleClose();
        router.push(`/jobs?q=${encodeURIComponent(q)}`);
      },
    });

    return list;
  }, [debouncedQuery, jobs, recentSearches, router, logout, handleClose]);

  // Keep selectedIndex in bounds when items change
  useEffect(() => {
    setSelectedIndex(0);
  }, [items.length]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (items.length > 0 ? (prev + 1) % items.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (items.length > 0 ? (prev - 1 + items.length) % items.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].onSelect();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-start justify-center pt-8 sm:pt-20 px-3 sm:px-4"
      style={{ zIndex: "var(--z-modal)" as React.CSSProperties["zIndex"] }}
      onKeyDown={handleKeyDown}
    >
      {/* Scrim */}
      <div className="absolute inset-0 bg-scrim animate-fade-in" onClick={handleClose} />

      {/* Dialog Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
        className="relative w-full max-w-xl rounded-xl border animate-slide-up flex flex-col max-h-[85vh] sm:max-h-[75vh] overflow-hidden"
        style={{
          background: "var(--color-card)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Search Bar Input Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Search size={18} className="shrink-0" style={{ color: "var(--color-text-tertiary)" }} />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search jobs, companies, routes, or actions..."
            className="flex-1 bg-transparent text-sm font-medium outline-none"
            style={{ color: "var(--color-text-primary)" }}
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded hover:bg-neutral-100 transition-colors"
              title="Clear text"
            >
              <X size={16} style={{ color: "var(--color-text-tertiary)" }} />
            </button>
          ) : (
            <kbd
              className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded border font-semibold"
              style={{
                background: "var(--color-primary-50)",
                color: "var(--color-primary-700)",
                borderColor: "var(--color-primary-100)",
              }}
            >
              ESC
            </kbd>
          )}
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {debouncedQuery.trim() && isJobsLoading && (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-neutral-400">
              <Loader2 size={16} className="animate-spin" />
              Searching jobs...
            </div>
          )}

          {items.length === 0 && !isJobsLoading ? (
            <div className="text-center py-10 px-4">
              <Sparkles size={24} className="mx-auto mb-2 text-primary-400" />
              <p className="text-sm font-semibold text-neutral-700">No results found for &quot;{query}&quot;</p>
              <p className="text-xs text-neutral-400 mt-1">
                Try searching for job titles like &quot;Engineer&quot;, or routes like &quot;Applications&quot;.
              </p>
            </div>
          ) : (
            <>
              {/* Grouping header helper */}
              {query.trim() === "" && recentSearches.length > 0 && (
                <div className="flex items-center justify-between px-3 pt-2 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">
                  <span>Recent Searches</span>
                  <button
                    onClick={() => clearRecentSearches()}
                    className="hover:text-red-600 transition-colors flex items-center gap-1 font-semibold normal-case text-[11px]"
                  >
                    <Trash2 size={11} /> Clear all
                  </button>
                </div>
              )}

              <div className="space-y-1">
                {items.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={item.onSelect}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-150 ${
                        isSelected ? "bg-primary-50 text-primary-900 font-semibold" : "hover:bg-neutral-50 text-neutral-700"
                      }`}
                      style={{
                        background: isSelected ? "var(--color-primary-50)" : undefined,
                        color: isSelected ? "var(--color-primary-900)" : "var(--color-text-primary)",
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-primary-100 text-primary-700" : "bg-neutral-100 text-neutral-500"
                          }`}
                        >
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.title}</p>
                          {item.subtitle && (
                            <p className="truncate text-xs text-neutral-400 font-normal">{item.subtitle}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {item.group === "recent" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSearch(item.title);
                            }}
                            className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
                            title="Remove recent search"
                          >
                            <X size={14} />
                          </button>
                        )}
                        {item.badge && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                            style={{
                              background: "var(--color-primary-50)",
                              borderColor: "var(--color-primary-200)",
                              color: "var(--color-primary-700)",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight
                          size={16}
                          className={`transition-transform ${isSelected ? "translate-x-0.5 text-primary-600" : "text-neutral-300"}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div
          className="flex items-center justify-between px-4 py-2.5 border-t text-[11px]"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg-secondary)", color: "var(--color-text-tertiary)" }}
        >
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 bg-neutral-200 rounded text-[10px] font-mono">↑</kbd>{" "}
              <kbd className="px-1 py-0.5 bg-neutral-200 rounded text-[10px] font-mono">↓</kbd> navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-neutral-200 rounded text-[10px] font-mono">↵</kbd> select
            </span>
          </div>
          <div>
            <kbd className="px-1.5 py-0.5 bg-neutral-200 rounded text-[10px] font-mono">ESC</kbd> close
          </div>
        </div>
      </div>
    </div>
  );
}
