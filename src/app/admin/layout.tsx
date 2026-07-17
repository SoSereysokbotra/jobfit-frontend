"use client";

import React from "react";
import { LayoutDashboard, Users, Activity, Mail } from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/shared/components/layout/dashboard-shell";

const ADMIN_NAV: DashboardNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/system", label: "System Health", icon: Activity },
  { href: "/admin/email", label: "Email Tracking", icon: Mail },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      brand="JobFits Admin"
      brandSublabel="Control Panel"
      nav={ADMIN_NAV}
      user={{ name: "Admin User", email: "admin@jobfits.co", initials: "AD" }}
    >
      {children}
    </DashboardShell>
  );
}
