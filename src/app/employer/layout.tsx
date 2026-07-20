"use client";

import React from "react";
import { Briefcase, Inbox, BarChart3, DownloadCloud, Loader2 } from "lucide-react";
import { DashboardShell } from "@/shared/components/layout/dashboard-shell";
import { SidebarMenuGroup } from "@/shared/components/layout/sidebar";
import { useRequireAuth, displayName } from "@/features/auth/hooks/use-session";
import { useAuth } from "@/providers/auth-provider";

const EMPLOYER_MENU_GROUPS: SidebarMenuGroup[] = [
  {
    group: "",
    items: [
      { href: "/employer/dashboard", label: "Analytics", icon: <BarChart3 size={18} />, exact: true },
    ]
  },
  {
    group: "RECRUITING",
    items: [
      { href: "/employer/jobs", label: "Jobs", icon: <Briefcase size={18} /> },
      { href: "/employer/imported-jobs", label: "Imported Jobs", icon: <DownloadCloud size={18} /> },
      { href: "/employer/applications", label: "Applications", icon: <Inbox size={18} /> },
    ]
  }
];

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  // This area was previously unguarded — anyone who knew the URL could open it.
  const { user, isAllowed } = useRequireAuth({ roles: ["EMPLOYER"] });
  const { logout } = useAuth();

  if (!isAllowed || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-secondary">
        <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
      </div>
    );
  }

  const { fullName, initials } = displayName(user);

  return (
    <DashboardShell
      brand="JobFits Employer"
      // TODO(phase-7): the company name comes from GET /employer/companies/{id}.
      brandSublabel="Employer Portal"
      menuGroups={EMPLOYER_MENU_GROUPS}
      user={{ name: fullName || user.email, email: user.email, initials }}
      onLogout={logout}
    >
      {children}
    </DashboardShell>
  );
}
