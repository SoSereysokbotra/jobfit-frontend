"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Bookmark, Briefcase, User } from "lucide-react";

export default function BottomTabBar() {
  const pathname = usePathname();

  const tabs = [
    { href: "/dashboard", label: "Home", icon: <Home size={20} /> },
    { href: "/jobs", label: "Search", icon: <Search size={20} /> },
    { href: "/saved-jobs", label: "Saved", icon: <Bookmark size={20} /> },
    { href: "/applications", label: "Apps", icon: <Briefcase size={20} />, badge: 2 },
    { href: "/profile", label: "Profile", icon: <User size={20} /> }
  ];

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around z-50 px-2"
      style={{ borderColor: "var(--color-border)", boxShadow: "0 -2px 10px rgba(0,0,0,0.05)" }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || pathname?.startsWith(tab.href + "/");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center justify-center flex-1 h-full relative"
            style={{
              color: isActive ? "var(--color-primary-600)" : "var(--color-text-tertiary)"
            }}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge && (
                <span
                  className="absolute -top-1.5 -right-2 text-[9px] font-bold text-white w-4.5 h-4.5 rounded-full flex items-center justify-center"
                  style={{ background: "var(--color-primary-500)", minWidth: "16px", height: "16px", padding: "2px" }}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium mt-1">{tab.label}</span>
            {isActive && (
              <span
                className="absolute bottom-1 w-1 h-1 rounded-full"
                style={{ background: "var(--color-primary-500)" }}
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
