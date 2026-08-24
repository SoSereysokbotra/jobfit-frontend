"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop, ChevronDown, Check } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import type { ThemeMode } from "@/stores/theme-store";

interface ThemeOption {
  value: ThemeMode;
  label: string;
  icon: React.ReactNode;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    icon: <Sun size={14} />,
  },
  {
    value: "dark",
    label: "Dark",
    icon: <Moon size={14} />,
  },
  {
    value: "system",
    label: "System",
    icon: <Laptop size={14} />,
  },
];

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const currentIcon =
    theme === "system" ? (
      <Laptop size={14} style={{ color: "var(--color-text-tertiary)" }} />
    ) : resolvedTheme === "dark" ? (
      <Moon size={14} style={{ color: "var(--color-primary-400)" }} />
    ) : (
      <Sun size={14} style={{ color: "var(--color-warning-500)" }} />
    );

  const currentLabel =
    theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light";

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select theme"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-semibold transition-all hover:bg-[var(--color-surface-hover)] active:scale-95"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-card)",
          color: "var(--color-text-secondary)",
        }}
      >
        {currentIcon}
        <span className="hidden sm:inline-block text-[11px] font-bold">
          {currentLabel}
        </span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-1.5 w-40 rounded-lg border p-1.5 animate-slide-up z-50 overflow-hidden"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div
            className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider border-b mb-1"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}
          >
            Theme
          </div>

          <div className="space-y-0.5">
            {THEME_OPTIONS.map((opt) => {
              const isSelected = opt.value === theme;
              return (
                <button
                  key={opt.value}
                  role="menuitem"
                  onClick={() => {
                    setTheme(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                    isSelected
                      ? "font-bold"
                      : "hover:bg-[var(--color-surface-hover)]"
                  }`}
                  style={{
                    background: isSelected ? "var(--color-primary-50)" : undefined,
                    color: isSelected ? "var(--color-primary-500)" : "var(--color-text-primary)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        color: isSelected
                          ? "var(--color-primary-500)"
                          : "var(--color-text-tertiary)",
                      }}
                    >
                      {opt.icon}
                    </span>
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && (
                    <Check size={14} style={{ color: "var(--color-primary-500)" }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
