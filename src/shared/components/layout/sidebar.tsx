"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useSidebarCollapsed } from "@/stores/ui-store";
import { useSession, displayName } from "@/features/auth/hooks/use-session";
import { NAVIGATION_GROUPS } from "@/shared/config/navigation";

export interface SidebarMenuGroup {
  group: string;
  items: {
    href: string;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    exact?: boolean;
  }[];
}

interface SidebarProps {
  onLogout?: () => void;
  className?: string;
  workspaceName?: string;
  menuGroups?: SidebarMenuGroup[];
  user?: { initials: string; name: string; email: string };
  /**
   * Opt in to the collapsible icon-only rail. Only the desktop sidebar passes
   * this; the mobile overlay instances leave it off and always render expanded.
   */
  collapsible?: boolean;
}

export default function Sidebar({
  onLogout,
  className = "",
  workspaceName = "Seeker Workspace",
  menuGroups,
  user,
  collapsible = false,
}: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [collapsedState, setCollapsed] = useSidebarCollapsed();
  const collapsed = collapsible && collapsedState;

  const groupsToRender = menuGroups || NAVIGATION_GROUPS;
  
  const { user: authUser } = useSession();
  const fallbackUser = authUser 
    ? { name: displayName(authUser).fullName || "User", email: authUser.email, initials: displayName(authUser).initials }
    : { name: "John Doe", email: "john@example.com", initials: "JD" };

  const displayUser = user || fallbackUser;

  // Defaults to the real session logout (revokes the refresh token and clears
  // the in-memory access token); callers can still override it.
  const handleLogout = onLogout ?? logout;

  return (
    <aside
      className={`${collapsed ? "w-[72px]" : "w-64"} border-r flex flex-col h-screen sticky top-0 transition-all duration-200 ease-in-out ${className}`}
      style={{ borderColor: "var(--color-border)", background: "var(--color-card)" }}
    >
      {/* Brand Header */}
      <div
        className={`flex items-center border-b transition-all duration-200 ${collapsed ? "flex-col gap-2.5 p-3" : "gap-3 p-5"}`}
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className={`flex items-center ${collapsed ? "flex-col gap-2.5 w-full" : "justify-between w-full"}`}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="JobFits Logo"
              className="w-8 h-8 rounded-full object-contain flex-shrink-0"
            />
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-base font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                  JobFits
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
                  {workspaceName}
                </span>
              </div>
            )}
          </Link>
          {collapsible && (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg transition-colors flex-shrink-0 hover:bg-[var(--color-surface-hover)]"
              style={{ color: "var(--color-text-tertiary)" }}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className={`flex-1 ${collapsed ? "overflow-visible px-2 py-4 space-y-4" : "overflow-y-auto p-4 space-y-6"}`}>
        {groupsToRender.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {group.group && !collapsed && (
              <p
                className="text-[10px] font-extrabold px-3 py-1.5 uppercase tracking-wider"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center rounded-md text-sm font-medium transition-all duration-200 ${collapsed ? "w-10 h-10 mx-auto justify-center" : "justify-between px-3 py-2"}`}
                  style={{
                    background: isActive ? "var(--color-primary-50)" : "transparent",
                    color: isActive ? "var(--color-primary-500)" : "var(--color-text-secondary)",
                  }}
                >
                  <div className={`flex items-center ${collapsed ? "" : "gap-2.5"}`}>
                    <span
                      className="relative flex items-center justify-center transition-colors"
                      style={{ color: isActive ? "var(--color-primary-500)" : "var(--color-text-tertiary)" }}
                    >
                      {item.icon}
                      {collapsed && item.badge ? (
                        <span
                          className="absolute -top-1 -right-1 w-2 h-2 rounded-full ring-2 ring-[var(--color-card)]"
                          style={{ background: "var(--color-primary-500)" }}
                        />
                      ) : null}
                    </span>
                    {!collapsed && (
                      <span
                        className={isActive ? "font-bold" : ""}
                        style={{ color: isActive ? "var(--color-primary-500)" : "var(--color-text-secondary)" }}
                      >
                        {item.label}
                      </span>
                    )}
                  </div>
                  {!collapsed && item.badge && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold"
                      style={{ background: "var(--color-primary-500)" }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {collapsed && (
                    <span
                      className="pointer-events-none absolute left-full ml-2 z-50 whitespace-nowrap rounded-md px-2 py-1 text-xs font-semibold text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
                      style={{ background: "var(--color-neutral-800)" }}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User profile footer */}
      <div className={`border-t transition-all duration-200 ${collapsed ? "p-2" : "p-4"}`} style={{ borderColor: "var(--color-border)" }}>
        <div
          className={`flex items-center rounded-lg transition-colors hover:bg-[var(--color-surface-hover)] ${collapsed ? "flex-col gap-2 p-2" : "gap-3 p-2"}`}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: "var(--color-primary-100)", color: "var(--color-primary-600)" }}
          >
            {displayUser.initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: "var(--color-text-primary)" }}>{displayUser.name}</p>
              <p className="text-[10px] truncate" style={{ color: "var(--color-text-tertiary)" }}>{displayUser.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded transition-colors flex-shrink-0 hover:bg-[var(--color-error-50)] hover:text-[var(--color-error-600)]"
            style={{ color: "var(--color-text-tertiary)" }}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
