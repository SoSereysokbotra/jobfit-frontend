"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { NotificationBell } from "@/features/notification/components/notification-bell";

interface TopNavProps {
  onMenuToggle?: () => void;
  className?: string;
}

export default function TopNav({ onMenuToggle, className = "" }: TopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-40 h-14 bg-white border-b flex items-center px-4 gap-3 ${className}`}
      style={{ borderColor: "var(--color-border)" }}
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
          className="w-7 h-7 rounded-md object-contain bg-neutral-50 p-0.5 border"
          style={{ borderColor: "var(--color-border)" }}
        />
        <span className="font-extrabold text-sm" style={{ color: "var(--color-primary-900)" }}>JobFits</span>
      </Link>

      {/* Search Bar (desktop) */}
      <div className="hidden md:flex flex-1 max-w-md relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
        <input
          type="text"
          placeholder="Search jobs, companies, skills..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none transition-all"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-bg-secondary)",
            color: "var(--color-text-primary)"
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--color-primary-500)";
            e.currentTarget.style.background = "var(--color-bg)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.background = "var(--color-bg-secondary)";
          }}
        />
      </div>

      {/* Mobile search toggle */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors ml-auto"
        onClick={() => setSearchOpen(!searchOpen)}
        style={{ color: "var(--color-text-secondary)" }}
      >
        {searchOpen ? <X size={20} /> : <Search size={20} />}
      </button>

      {/* Spacer for desktop */}
      <div className="hidden md:block flex-1" />

      {/* Notifications */}
      <NotificationBell />

      {/* User Avatar */}
      <Link href="/profile">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))" }}
        >
          JD
        </div>
      </Link>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div
          className="md:hidden absolute top-14 left-0 right-0 bg-white border-b p-3 z-50"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
            <input
              autoFocus
              type="text"
              placeholder="Search jobs, companies, skills..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: "var(--color-primary-500)", background: "var(--color-bg)" }}
            />
          </div>
        </div>
      )}
    </header>
  );
}
