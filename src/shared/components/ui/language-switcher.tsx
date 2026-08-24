"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLocale } from "@/providers/locale-provider";
import { SUPPORTED_LOCALES, type LocaleInfo } from "@/shared/i18n/locales";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocaleInfo =
    SUPPORTED_LOCALES.find((l) => l.code === locale) || SUPPORTED_LOCALES[0];

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

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Select language"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-semibold transition-all hover:bg-[var(--color-surface-hover)] active:scale-95"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-card)",
          color: "var(--color-text-secondary)",
        }}
      >
        <Globe size={14} style={{ color: "var(--color-text-tertiary)" }} />
        <span className="hidden sm:inline-block">{currentLocaleInfo.flag}</span>
        <span className="uppercase font-bold tracking-wider text-[11px]">
          {currentLocaleInfo.code}
        </span>
        <ChevronDown size={12} className={`transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-1.5 w-44 rounded-lg border p-1.5 animate-slide-up z-50 overflow-hidden"
          style={{
            background: "var(--color-card)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider border-b mb-1" style={{ borderColor: "var(--color-border)", color: "var(--color-text-tertiary)" }}>
            Select Language
          </div>

          <div className="space-y-0.5">
            {SUPPORTED_LOCALES.map((item: LocaleInfo) => {
              const isSelected = item.code === locale;
              return (
                <button
                  key={item.code}
                  role="menuitem"
                  onClick={() => {
                    setLocale(item.code);
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
                    <span className="text-sm">{item.flag}</span>
                    <div className="text-left">
                      <p className="leading-none">{item.nativeName}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{item.name}</p>
                    </div>
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
