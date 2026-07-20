"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Search, Star, Bookmark, Briefcase, Calendar,
  Award, User, FileText, BarChart3, Bell, HelpCircle,
  Settings, LogOut
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

interface SidebarProps {
  onLogout?: () => void;
  className?: string;
}

export default function Sidebar({ onLogout, className = "" }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const menuGroups = [
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

  // Defaults to the real session logout (revokes the refresh token and clears
  // the in-memory access token); callers can still override it.
  const handleLogout = onLogout ?? logout;

  return (
    <aside
      className={`w-64 border-r flex flex-col h-screen sticky top-0 bg-white ${className}`}
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b" style={{ borderColor: "var(--color-neutral-100)" }}>
        <img
          src="/logo.png"
          alt="JobFits Logo"
          className="w-8 h-8 rounded-lg object-contain bg-neutral-50 p-1 border"
          style={{ borderColor: "var(--color-border)" }}
        />
        <div>
          <h1 className="text-base font-extrabold tracking-tight" style={{ color: "var(--color-primary-900)" }}>
            JobFits
          </h1>
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Seeker Workspace</span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {group.group && (
              <p
                className="text-[10px] font-extrabold px-3 py-1.5 uppercase tracking-wider"
                style={{ color: "var(--color-neutral-400)" }}
              >
                {group.group}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    background: isActive ? "var(--color-primary-50)" : "transparent",
                    color: isActive ? "var(--color-primary-700)" : "var(--color-text-secondary)",
                    // borderLeft: isActive ? "3px solid var(--color-primary-500)" : "3px solid transparent",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? "text-primary-600" : "text-neutral-400"}>
                      {item.icon}
                    </span>
                    <span className={isActive ? "font-bold text-primary-900" : ""}>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold"
                      style={{ background: "var(--color-primary-500)" }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t" style={{ borderColor: "var(--color-neutral-100)" }}>
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 text-sm">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-neutral-800">John Doe</p>
            <p className="text-[10px] text-neutral-400 truncate">john@example.com</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
