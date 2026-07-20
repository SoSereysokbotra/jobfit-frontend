"use client";

import React, { useState } from "react";
import Sidebar, { SidebarMenuGroup } from "./sidebar";
import TopNav from "./topnav";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  exact?: boolean;
}

interface DashboardShellProps {
  brand: string;
  brandSublabel: string;
  nav?: DashboardNavItem[];
  menuGroups?: SidebarMenuGroup[];
  user: { name: string; email: string; initials: string };
  onLogout?: () => void;
  children: React.ReactNode;
}

export function DashboardShell({ brandSublabel, nav, menuGroups, user, onLogout, children }: DashboardShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const groups: SidebarMenuGroup[] = menuGroups || (nav ? [{ group: "", items: nav }] : []);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--color-bg-secondary)" }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar
          workspaceName={brandSublabel}
          menuGroups={groups}
          user={user}
          onLogout={onLogout}
          collapsible
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="flex-shrink-0">
            <Sidebar
              workspaceName={brandSublabel}
              menuGroups={groups}
              user={user}
              onLogout={onLogout}
            />
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav onMenuToggle={() => setMobileSidebarOpen((v) => !v)} user={user} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
