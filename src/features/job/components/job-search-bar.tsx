"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, TrendingUp, History, Sparkles, X } from "lucide-react";

const RECENT_SEARCHES = ["Data Scientist", "Senior Engineer"];
const POPULAR_SEARCHES = ["Machine Learning Engineer", "Product Manager"];
const TRENDING_SEARCHES = ["AI Engineer", "DevOps Engineer"];

interface JobSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Prominent full-width search bar with suggestion dropdown
 * (recent / popular / trending, per flows guide 2B-1).
 */
export function JobSearchBar({ value, onChange }: JobSearchBarProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pick = (term: string) => {
    onChange(term);
    setOpen(false);
  };

  const groups = [
    { label: "Recent", icon: <History size={12} />, items: RECENT_SEARCHES },
    { label: "Popular", icon: <Sparkles size={12} />, items: POPULAR_SEARCHES },
    { label: "Trending", icon: <TrendingUp size={12} />, items: TRENDING_SEARCHES },
  ];

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--color-text-tertiary)" }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search job titles, skills, companies..."
          className="w-full pl-11 pr-10 py-3 rounded-lg border text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-card)",
            color: "var(--color-text-primary)",
            boxShadow: "var(--shadow-sm)",
          }}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-100 transition-colors"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {open && !value && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-lg border p-3 space-y-3"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-lg)",
            zIndex: "var(--z-dropdown)" as React.CSSProperties["zIndex"],
          }}
        >
          {groups.map((g) => (
            <div key={g.label}>
              <p
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-1.5"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {g.icon} {g.label}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((term) => (
                  <button
                    key={term}
                    onClick={() => pick(term)}
                    className="px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 hover:bg-primary-50 hover:border-primary-300"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-secondary)",
                      background: "var(--color-bg-secondary)",
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
