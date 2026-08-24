"use client";

import React from "react";
import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { NotificationBell } from "@/features/notification/components/notification-bell";
import { LanguageSwitcher } from "@/shared/components/ui/language-switcher";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";
import { OfflineIndicator } from "./offline-indicator";
import { useCommandPaletteOpen } from "@/stores/command-palette-store";
import { CommandPalette } from "@/shared/components/ui/command-palette";

interface TopNavProps {
  onMenuToggle?: () => void;
  className?: string;
  user?: { initials: string; name?: string; email?: string };
}

export default function TopNav({ onMenuToggle, className = "", user }: TopNavProps) {
  const [, setCommandPaletteOpen] = useCommandPaletteOpen();

  return (
    <>
      <header
        className={`sticky top-0 z-40 h-14 border-b flex items-center px-4 gap-3 ${className}`}
        style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }}
      >
        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <Menu size={20} />
        </button>

        {/* Brand (mobile only) */}
        <Link href="/dashboard" className="md:hidden flex items-center gap-2">
          <img
            src="/logo.png"
            alt="JobFits Logo"
            className="w-7 h-7 rounded-full object-contain flex-shrink-0"
          />
          <span className="font-extrabold text-sm" style={{ color: "var(--color-text-primary)" }}>JobFits</span>
        </Link>

        {/* Search Bar Button Trigger (desktop) */}
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden md:flex flex-1 max-w-md items-center justify-between px-3 py-1.5 rounded-lg border text-sm transition-all hover:border-primary-400 group cursor-pointer"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-bg-secondary)",
            color: "var(--color-text-secondary)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <Search size={16} style={{ color: "var(--color-text-tertiary)" }} />
            <span className="text-sm font-normal" style={{ color: "var(--color-text-tertiary)" }}>
              Search jobs, companies, skills…
            </span>
          </div>
          <kbd
            className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded border"
            style={{
              background: "var(--color-primary-50)",
              color: "var(--color-primary-500)",
              borderColor: "var(--color-primary-100)",
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Mobile search trigger button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors ml-auto"
          onClick={() => setCommandPaletteOpen(true)}
          style={{ color: "var(--color-text-secondary)" }}
          title="Search"
        >
          <Search size={20} />
        </button>

        {/* Spacer for desktop */}
        <div className="hidden md:block flex-1" />

        {/* Renders nothing while online and synced. */}
        <OfflineIndicator />

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <NotificationBell />

        {/* User Avatar */}
        <Link href="/profile">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))" }}
          >
            {user?.initials || "JD"}
          </div>
        </Link>
      </header>

      {/* Global Command Palette Dialog */}
      <CommandPalette />
    </>
  );
}
