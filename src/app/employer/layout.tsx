"use client";

import React from "react";
import { Building2, Briefcase, Inbox, BarChart3 } from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/shared/components/layout/dashboard-shell";

const EMPLOYER_NAV: DashboardNavItem[] = [
  { href: "/employer/dashboard", label: "Analytics", icon: BarChart3 },
  { href: "/employer/jobs", label: "Jobs", icon: Briefcase },
  { href: "/employer/applications", label: "Applications", icon: Inbox },
  { href: "/employer/company", label: "Company Profile", icon: Building2 },
];

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      brand="JobFits Employer"
      brandSublabel="TechCorp Inc"
      nav={EMPLOYER_NAV}
      user={{ name: "Sarah Lin", email: "sarah@techcorp.com", initials: "SL" }}
    >
      {children}
    </DashboardShell>
  );
}
