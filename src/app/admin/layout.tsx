"use client";

import React from "react";
import { LayoutDashboard, Users, Activity, Mail, Loader2 } from "lucide-react";
import { DashboardShell } from "@/shared/components/layout/dashboard-shell";
import { SidebarMenuGroup } from "@/shared/components/layout/sidebar";
import { useRequireAuth, displayName } from "@/features/auth/hooks/use-session";
import { useAuth } from "@/providers/auth-provider";

const ADMIN_MENU_GROUPS: SidebarMenuGroup[] = [
  {
    group: "",
    items: [
      { href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} />, exact: true },
    ]
  },
  {
    group: "ADMINISTRATION",
    items: [
      { href: "/admin/users", label: "Users", icon: <Users size={18} /> },
      { href: "/admin/system", label: "System Health", icon: <Activity size={18} /> },
      { href: "/admin/email", label: "Email Tracking", icon: <Mail size={18} /> },
    ]
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // This area was previously unguarded — anyone who knew the URL could open it.
  // TODO(phase-8): admin sign-in is a separate endpoint (POST /admin/login), so
  // an admin with no session is sent to /login until that page exists.
  const { user, isAllowed } = useRequireAuth({ roles: ["ADMIN"] });
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
      brand="JobFits Admin"
      brandSublabel="Control Panel"
      menuGroups={ADMIN_MENU_GROUPS}
      user={{ name: fullName || user.email, email: user.email, initials }}
      onLogout={logout}
    >
      {children}
    </DashboardShell>
  );
}
