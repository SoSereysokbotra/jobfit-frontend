"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Search, Menu, X, Sparkles } from "lucide-react";
import { LanguageSwitcher } from "@/shared/components/ui/language-switcher";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";
import { useTranslation } from "@/providers/locale-provider";
import { useCommandPaletteOpen } from "@/stores/command-palette-store";
import { CommandPalette } from "@/shared/components/ui/command-palette";

export function MarketingNavbar() {
  const { t } = useTranslation();
  const [, setCommandPaletteOpen] = useCommandPaletteOpen();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: t("marketing.features") || "Features", href: "#features" },
    { label: "Simulator", href: "#simulator" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Stories", href: "#testimonials" },
    { label: "FAQ", href: "#faq" },
    { label: t("marketing.findJobs") || "Jobs", href: "/jobs" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "backdrop-blur-xl bg-background/85 border-b border-border/70 shadow-sm"
            : "backdrop-blur-md bg-background/60 border-b border-border/30"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Brand Logo & AI Badge */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative flex items-center justify-center">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 opacity-40 group-hover:opacity-75 blur-sm transition duration-300" />
                  <Image
                    src="/logo.png"
                    alt="JobFits Logo"
                    width={36}
                    height={36}
                    className="relative w-9 h-9 rounded-full object-contain shrink-0 ring-1 ring-white/20"
                  />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="text-xl font-black tracking-tight"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    JobFits
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 tracking-wide uppercase">
                    <Sparkles size={10} />
                    AI 2.0
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:text-primary-600 hover:bg-surface-hover"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right: Quick Search + Controls + Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Quick search shortcut trigger */}
              <button
                type="button"
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:border-primary-400/80 hover:bg-surface-hover"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text-tertiary)",
                }}
                title="Search roles, skills, and companies"
              >
                <Search size={14} />
                <span className="hidden xl:inline">Search roles…</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/40">
                  ⌘K
                </kbd>
              </button>

              <div className="h-4 w-px bg-border/60 mx-0.5 hidden sm:block" />

              <LanguageSwitcher />
              <ThemeToggle />

              <div className="hidden sm:flex items-center gap-2 ml-1">
                <Link
                  href="/login"
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors hover:bg-surface-hover"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {t("marketing.login") || "Log In"}
                </Link>
                <Link
                  href="/signup"
                  className="relative group overflow-hidden px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 hover:opacity-95 shadow-md shadow-primary-600/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 inline-flex items-center gap-1.5"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    {t("marketing.getStarted") || "Get Started"}
                    <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                </Link>
              </div>

              {/* Mobile menu hamburger toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-content-secondary hover:bg-surface-hover transition-colors"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden border-b border-border/80 px-4 pt-3 pb-6 space-y-3 animate-slide-up"
            style={{ background: "var(--color-bg)" }}
          >
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-surface-hover"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-border/60 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCommandPaletteOpen(true);
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border text-sm"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <span className="flex items-center gap-2">
                  <Search size={15} /> Quick Search
                </span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-primary-50 text-primary-600 border border-primary-200">
                  ⌘K
                </kbd>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-semibold border"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {t("marketing.login") || "Log In"}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-bold text-white bg-primary-600 hover:bg-primary-700"
                >
                  {t("marketing.getStarted") || "Get Started"}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Command Palette */}
      <CommandPalette />
    </>
  );
}
