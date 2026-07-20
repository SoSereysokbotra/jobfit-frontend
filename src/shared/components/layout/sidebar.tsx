"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Search, Star, Bookmark, Briefcase, Calendar,
  Award, User, FileText, BarChart3, Bell, HelpCircle,
  Settings, LogOut, PanelLeftClose
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useSidebarCollapsed } from "@/stores/ui-store";

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

  const defaultMenuGroups: SidebarMenuGroup[] = [
    {
      group: "",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: <Home size={18} /> }
      ]
    },
    {
      group: "DISCOVERY",
      items: [
        { href: "/jobs", label: "Search Jobs", icon: <Search size={18} /> },
        { href: "/recommendations", label: "Recommendations", icon: <Star size={18} /> },
        { href: "/saved-jobs", label: "Saved Jobs", icon: <Bookmark size={18} /> }
      ]
    },
    {
      group: "YOUR JOURNEY",
      items: [
        { href: "/applications", label: "Applications", icon: <Briefcase size={18} />, badge: 2 },
        { href: "/learning", label: "Interview Prep", icon: <Calendar size={18} /> },
        { href: "/offers", label: "Offers & Decisions", icon: <Award size={18} /> }
      ]
    },
    {
      group: "PROFILE & RESOURCES",
      items: [
        { href: "/profile", label: "My Profile", icon: <User size={18} /> },
        { href: "/resumes", label: "Resumes", icon: <FileText size={18} /> },
        { href: "/insights", label: "Career Insights", icon: <BarChart3 size={18} /> }
      ]
    },
    {
      group: "HELP & PREFERENCES",
      items: [
        { href: "/notifications", label: "Notifications", icon: <Bell size={18} />, badge: 3 },
        { href: "/help", label: "Help & Feedback", icon: <HelpCircle size={18} /> },
        { href: "/settings", label: "Settings", icon: <Settings size={18} /> }
      ]
    }
  ];

  const groupsToRender = menuGroups || defaultMenuGroups;
  const displayUser = user || { name: "John Doe", email: "john@example.com", initials: "JD" };

  // Defaults to the real session logout (revokes the refresh token and clears
  // the in-memory access token); callers can still override it.
  const handleLogout = onLogout ?? logout;

  return (
    <aside
      className={`${collapsed ? "w-[72px]" : "w-64"} border-r flex flex-col h-screen sticky top-0 bg-white transition-all duration-200 ease-in-out ${className}`}
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Brand Header */}
      <div
        className={`flex items-center border-b transition-all duration-200 ${collapsed ? "flex-col gap-2 p-4" : "gap-3 p-6"}`}
        style={{ borderColor: "var(--color-neutral-100)" }}
      >
        {collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="rounded-lg p-1 flex-shrink-0 cursor-pointer transition-all duration-150 hover:bg-neutral-100 hover:scale-105"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <img
              src="/logo.png"
              alt="JobFits Logo"
              className="w-8 h-8 rounded-lg object-contain bg-neutral-50 p-1 border"
              style={{ borderColor: "var(--color-border)" }}
            />
          </button>
        ) : (
          <img
            src="/logo.png"
            alt="JobFits Logo"
            className="w-8 h-8 rounded-lg object-contain bg-neutral-50 p-1 border flex-shrink-0"
            style={{ borderColor: "var(--color-border)" }}
          />
        )}
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-base font-extrabold tracking-tight" style={{ color: "var(--color-primary-900)" }}>
              JobFits
            </h1>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{workspaceName}</span>
          </div>
        )}
        {collapsible && !collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors flex-shrink-0 ml-auto"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className={`flex-1 ${collapsed ? "overflow-visible px-2 py-4 space-y-4" : "overflow-y-auto p-4 space-y-6"}`}>
        {groupsToRender.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {group.group && !collapsed && (
              <p
                className="text-[10px] font-extrabold px-3 py-1.5 uppercase tracking-wider"
                style={{ color: "var(--color-neutral-400)" }}
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
                  className={`group relative flex items-center rounded-lg text-sm font-medium transition-all duration-200 ${collapsed ? "justify-center px-0 py-2" : "justify-between px-3 py-2"}`}
                  style={{
                    background: isActive ? "var(--color-primary-50)" : "transparent",
                    color: isActive ? "var(--color-primary-700)" : "var(--color-text-secondary)",
                    // borderLeft: isActive ? "3px solid var(--color-primary-500)" : "3px solid transparent",
                  }}
                >
                  <div className={`flex items-center ${collapsed ? "" : "gap-2.5"}`}>
                    <span className={`relative ${isActive ? "text-primary-600" : "text-neutral-400"}`}>
                      {item.icon}
                      {collapsed && item.badge ? (
                        <span
                          className="absolute -top-1 -right-1 w-2 h-2 rounded-full ring-2 ring-white"
                          style={{ background: "var(--color-primary-500)" }}
                        />
                      ) : null}
                    </span>
                    {!collapsed && <span className={isActive ? "font-bold text-primary-900" : ""}>{item.label}</span>}
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
      <div className={`border-t transition-all duration-200 ${collapsed ? "p-2" : "p-4"}`} style={{ borderColor: "var(--color-neutral-100)" }}>
        <div className={`flex items-center rounded-lg hover:bg-neutral-50 transition-colors ${collapsed ? "flex-col gap-2 p-2" : "gap-3 p-2"}`}>
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-sm flex-shrink-0">
            {displayUser.initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-neutral-800">{displayUser.name}</p>
              <p className="text-[10px] text-neutral-400 truncate">{displayUser.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors flex-shrink-0"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
