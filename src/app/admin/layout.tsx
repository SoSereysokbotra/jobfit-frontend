"use client";

import React from "react";
import { LayoutDashboard, Users, Activity, Mail, Loader2 } from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/shared/components/layout/dashboard-shell";
import { useRequireAuth, displayName } from "@/features/auth/hooks/use-session";
import { useAuth } from "@/providers/auth-provider";

const ADMIN_NAV: DashboardNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/system", label: "System Health", icon: Activity },
  { href: "/admin/email", label: "Email Tracking", icon: Mail },
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
      nav={ADMIN_NAV}
      user={{ name: fullName || user.email, email: user.email, initials }}
      onLogout={logout}
    >
      {children}
    </DashboardShell>
  );
}
