"use client";

import React from "react";
import { Building2, Briefcase, Inbox, BarChart3, DownloadCloud, Loader2 } from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/shared/components/layout/dashboard-shell";
import { useRequireAuth, displayName } from "@/features/auth/hooks/use-session";
import { useAuth } from "@/providers/auth-provider";

const EMPLOYER_NAV: DashboardNavItem[] = [
  { href: "/employer/dashboard", label: "Analytics", icon: BarChart3 },
  { href: "/employer/jobs", label: "Jobs", icon: Briefcase },
  { href: "/employer/imported-jobs", label: "Imported Jobs", icon: DownloadCloud },
  { href: "/employer/applications", label: "Applications", icon: Inbox },
  { href: "/employer/company", label: "Company Profile", icon: Building2 },
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
      nav={EMPLOYER_NAV}
      user={{ name: fullName || user.email, email: user.email, initials }}
      onLogout={logout}
    >
      {children}
    </DashboardShell>
  );
}
