"use client";

import React from "react";
import Link from "next/link";
import { Activity, Gauge, Users, AlertTriangle, Info, ArrowRight, Mail } from "lucide-react";
import { StatCard } from "@/shared/components/data-display/stat-card";
import { Badge } from "@/shared/components/data-display/badge";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { useSystemHealth, useAlerts, useAcknowledgeAlert } from "@/features/admin/hooks/use-admin";
import {
  HEALTH_TONE,
  healthLabel,
  uptimeLabel,
  severityTone,
  isAcknowledged,
  ago,
} from "@/features/admin/api/admin.mappers";

function AlertIcon({ severity }: { severity: string }) {
  const tone = severityTone(severity);
  if (tone === "error") return <AlertTriangle size={15} className="text-error-500" />;
  if (tone === "warning") return <AlertTriangle size={15} className="text-warning-500" />;
  return <Info size={15} className="text-info-500" />;
}

export default function AdminDashboardPage() {
  const { data: health, isLoading } = useSystemHealth();
  const { data: alerts = [] } = useAlerts();
  const acknowledge = useAcknowledgeAlert();

  const recentAlerts = alerts.slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content">Dashboard</h1>
          <p className="text-sm mt-1 text-content-secondary">Welcome back — here&apos;s how the platform is doing.</p>
        </div>
        {health && <Badge tone={HEALTH_TONE[health.status] ?? "neutral"} dot>{healthLabel(health.status)}</Badge>}
      </div>

      {/* Stat tiles */}
      {isLoading || !health ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Uptime" value={uptimeLabel(health.uptimeSeconds)} icon={<Activity size={18} />} accentColor="var(--color-success-600)" accentBg="var(--color-success-50)" href="/admin/system" />
          <StatCard label="DB Latency" value={`${health.databaseLatencyMs}ms`} icon={<Gauge size={18} />} accentColor="var(--color-info-600)" accentBg="var(--color-info-50)" href="/admin/system" />
          <StatCard label="Active Users" value={`${health.activeUsers}`} icon={<Users size={18} />} accentColor="var(--color-primary-600)" accentBg="var(--color-primary-50)" href="/admin/users" />
        </div>
      )}

      {/* System alerts */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className={health && health.openAlerts.critical > 0 ? "text-error-500" : "text-success-500"} />
            <div>
              <h2 className="text-base font-bold text-content">System Alerts</h2>
              <p className="text-xs text-content-tertiary">
                {health ? `${health.openAlerts.critical} critical · ${health.openAlerts.warning} warning · ${health.openAlerts.info} info` : "Loading…"}
              </p>
            </div>
          </div>
          <Link href="/admin/system" className="text-xs font-bold flex items-center gap-1 text-primary-600 hover:opacity-80">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        {recentAlerts.length === 0 ? (
          <p className="text-sm text-center py-10 text-content-tertiary">No alerts. All systems healthy.</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center gap-3 px-5 py-3.5">
                <AlertIcon severity={alert.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-content">{alert.message}</p>
                  <p className="text-xs text-content-tertiary">{ago(alert.createdAt)}</p>
                </div>
                {isAcknowledged(alert) ? (
                  <Badge tone="neutral">Acknowledged</Badge>
                ) : (
                  <button
                    onClick={() => acknowledge.mutate(alert.id)}
                    disabled={acknowledge.isPending}
                    className="text-xs font-bold px-3 py-1.5 rounded-md border border-border text-content-secondary transition-colors hover:bg-neutral-50 disabled:opacity-50"
                  >
                    Acknowledge
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-content-tertiary">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: "/admin/users", label: "Manage Users", icon: <Users size={18} />, accent: "bg-primary-50 text-primary-600" },
            { href: "/admin/system", label: "System Health", icon: <Activity size={18} />, accent: "bg-success-50 text-success-600" },
            { href: "/admin/email", label: "Email Tracking", icon: <Mail size={18} />, accent: "bg-info-50 text-info-600" },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group">
              <div className={`w-10 h-10 rounded-md flex items-center justify-center transition-transform group-hover:scale-110 ${a.accent}`}>{a.icon}</div>
              <span className="text-sm font-semibold text-content">{a.label}</span>
              <ArrowRight size={15} className="ml-auto text-content-tertiary" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
