"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface DashboardShellProps {
  brand: string;
  brandSublabel: string;
  nav: DashboardNavItem[];
  user: { name: string; email: string; initials: string };
  /** Owner of the session ends it — the shell has no auth knowledge of its own. */
  onLogout?: () => void;
  children: React.ReactNode;
}

/**
 * Generic dashboard chrome: persistent left sidebar on desktop, slide-in
 * drawer on mobile. Shared by the admin and employer areas so their shells
 * stay identical (dev rules §2.1, §3.2).
 */
export function DashboardShell({ brand, brandSublabel, nav, user, onLogout, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    router.push("/login");
  };

  const sidebar = (
    <aside className="w-64 h-full flex flex-col border-r border-border bg-background">
      {/* Brand */}
      <div className="p-5 flex items-center gap-3 border-b border-neutral-100">
        <img src="/logo.png" alt="JobFits" className="w-8 h-8 rounded-lg object-contain p-1 border border-border bg-background-secondary" />
        <div>
          <h1 className="text-sm font-extrabold tracking-tight text-primary-900">{brand}</h1>
          <span className="text-xs font-bold uppercase tracking-wider text-content-disabled">{brandSublabel}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {nav.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-l-4",
                active
                  ? "bg-primary-50 text-primary-700 border-primary-500"
                  : "text-content-secondary border-transparent hover:bg-neutral-50",
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={18} className={active ? "text-primary-600" : "text-content-tertiary"} />
                {item.label}
              </span>
              {item.badge ? (
                <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-bold bg-primary-500">{item.badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-neutral-100">
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-primary-100 text-primary-700">
            {user.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-content">{user.name}</p>
            <p className="text-xs truncate text-content-tertiary">{user.email}</p>
          </div>
          <button onClick={handleLogout} aria-label="Log out" className="p-1.5 rounded-md transition-colors text-content-tertiary hover:bg-error-50 hover:text-error-600">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background-secondary">
      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0">{sidebar}</div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 flex z-50">
          <div className="w-64 h-full">{sidebar}</div>
          <div className="flex-1 bg-scrim" onClick={() => setDrawerOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden h-14 shrink-0 flex items-center gap-3 px-4 border-b border-border bg-background">
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-content-secondary">
            <Menu size={20} />
          </button>
          <span className="font-extrabold text-sm text-primary-900">{brand}</span>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
