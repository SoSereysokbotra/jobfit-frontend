"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/shared/components/ui/language-switcher";
import { ThemeToggle } from "@/shared/components/ui/theme-toggle";
import { useTranslation } from "@/providers/locale-provider";

/**
 * Shared marketing top bar.
 *
 * It used to live inside the hero, which left /about and /pricing with no
 * navigation at all and gave mobile no way to reach the links (they were
 * hidden below `md` with no menu behind them). Rendering it from the
 * marketing layout instead gives every public page the same bar.
 *
 * Transparent over the top of the page, then frosted once scrolled so it
 * stays readable over hero art and section backgrounds alike.
 */
export function MarketingNavbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: t("marketing.findJobs"), href: "/jobs" },
    { label: t("marketing.features"), href: "/#features" },
    { label: t("marketing.pricing"), href: "/pricing" },
    { label: t("marketing.about"), href: "/about" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Route change closes the sheet — the panel would otherwise stay open
  // over the new page.
  useEffect(() => setMenuOpen(false), [pathname]);

  // Escape closes it, and the body must not scroll behind the open panel.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href.startsWith("/#") ? false : pathname === href;

  return (
    <header
      className="sticky top-0 z-50 transition-colors duration-200"
      style={
        scrolled || menuOpen
          ? {
              background: "var(--color-bg-translucent)",
              borderBottom: "1px solid var(--color-border)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }
          : { borderBottom: "1px solid transparent" }
      }
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0"
            aria-label="JobFits home"
          >
            <img
              src="/logo.png"
              alt=""
              className="w-9 h-9 rounded-full object-contain shrink-0"
            />
            <span
              className="text-lg font-extrabold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              JobFits
            </span>
          </Link>

          {/* Center links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className="px-3.5 py-2 rounded-md text-sm font-medium transition-colors hover:bg-surface-hover"
                style={{
                  color: isActive(link.href)
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2.5">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <Link
              href="/login"
              className="hidden md:inline-flex px-4 py-2 rounded-md text-sm font-semibold transition-colors hover:bg-surface-hover"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("marketing.login")}
            </Link>
            <Link
              href="/signup"
              className="hidden sm:inline-flex px-4 py-2 rounded-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 active:scale-[0.98] whitespace-nowrap"
            >
              {t("marketing.getStarted")}
            </Link>

            {/* Mobile trigger */}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="marketing-mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border transition-colors hover:bg-surface-hover"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-primary)",
              }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile sheet */}
      {menuOpen && (
        <div
          id="marketing-mobile-menu"
          className="md:hidden border-t"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-bg)",
          }}
        >
          <div className="px-6 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className="px-3 py-3 rounded-md text-base font-semibold transition-colors hover:bg-surface-hover"
                style={{
                  color: isActive(link.href)
                    ? "var(--color-primary-600)"
                    : "var(--color-text-primary)",
                }}
              >
                {link.label}
              </Link>
            ))}

            <div
              className="mt-3 pt-4 flex flex-col gap-2.5 border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              <Link
                href="/signup"
                className="w-full px-4 py-3 rounded-md text-sm font-bold text-white text-center bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                {t("marketing.getStarted")}
              </Link>
              <Link
                href="/login"
                className="w-full px-4 py-3 rounded-md text-sm font-bold text-center border transition-colors hover:bg-surface-hover"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-primary)",
                }}
              >
                {t("marketing.login")}
              </Link>

              {/* Locale + theme are icon-only in the bar on small screens, so
                  the labelled controls belong here. */}
              <div className="flex items-center gap-2.5 pt-1 sm:hidden">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
