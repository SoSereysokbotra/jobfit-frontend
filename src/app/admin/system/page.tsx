"use client";

import React, { useState } from "react";
import { RefreshCw, AlertTriangle, Info, CheckCircle2, Users, FileText } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { MetricBar } from "@/shared/components/data-display/metric-bar";
import { Badge } from "@/shared/components/data-display/badge";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import {
  useSystemHealth,
  useSystemMetrics,
  useAlerts,
  useAcknowledgeAlert,
} from "@/features/admin/hooks/use-admin";
import {
  HEALTH_TONE,
  healthLabel,
  uptimeLabel,
  severityTone,
  severityLabel,
  isAcknowledged,
  ago,
} from "@/features/admin/api/admin.mappers";

const PERIODS = ["1h", "24h", "7d"] as const;

function AlertIcon({ severity }: { severity: string }) {
  const tone = severityTone(severity);
  if (tone === "error") return <AlertTriangle size={15} className="text-error-500" />;
  if (tone === "warning") return <AlertTriangle size={15} className="text-warning-500" />;
  return <Info size={15} className="text-info-500" />;
}

export default function SystemHealthPage() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("24h");
  const { data: health, isLoading, refetch, isFetching } = useSystemHealth();
  const { data: metrics } = useSystemMetrics(period);
  const { data: alerts = [] } = useAlerts();
  const acknowledge = useAcknowledgeAlert();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content">System Health</h1>
          <div className="flex items-center gap-2 mt-1.5">
            {health && <Badge tone={HEALTH_TONE[health.status] ?? "neutral"} dot>{healthLabel(health.status)}</Badge>}
            <span className="text-xs text-content-tertiary">Auto-refreshes every 30s</span>
          </div>
        </div>
        <button onClick={() => refetch()} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-border bg-background text-sm font-semibold text-content-secondary transition-colors hover:bg-neutral-50">
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance metrics */}
        <div className="rounded-lg border border-border bg-card shadow-sm p-5 space-y-4">
          <h2 className="text-base font-bold text-content">Performance Metrics</h2>
          {isLoading || !health ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-6 rounded" />)}</div>
          ) : (
            <>
              <MetricBar label="Email Delivery (24h)" display={`${health.emailDeliveryRate}%`} percent={health.emailDeliveryRate} tone={health.emailDeliveryRate >= 95 ? "success" : "warning"} />
              <MetricBar label="DB Latency" display={`${health.databaseLatencyMs}ms`} percent={Math.min(100, (health.databaseLatencyMs / 500) * 100)} tone={health.databaseLatencyMs < 250 ? "success" : "warning"} />
              <Row label="Database" value={health.databaseUp ? "Up" : "Down"} tone={health.databaseUp ? "success" : "error"} />
              <Row label="Active users (15m)" value={`${health.activeUsers}`} />
              <Row label="Resume queue pending" value={`${health.jobQueuePending}`} tone={health.jobQueuePending > 0 ? "warning" : "success"} />
              <Row label="Uptime" value={uptimeLabel(health.uptimeSeconds)} />
            </>
          )}
        </div>

        {/* Activity window */}
        <div className="rounded-lg border border-border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-content">Activity</h2>
            <div className="flex rounded-md border border-border overflow-hidden">
              {PERIODS.map((p) => (
                <button key={p} onClick={() => setPeriod(p)} className={cn("px-3 py-1 text-xs font-bold transition-colors", period === p ? "bg-primary-50 text-primary-700" : "bg-background text-content-tertiary")}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          {!metrics ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded" />)}</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border p-4">
                  <div className="flex items-center gap-2 text-content-tertiary"><Users size={14} /><span className="text-xs font-semibold uppercase tracking-wide">New Users</span></div>
                  <p className="text-2xl font-extrabold mt-1 text-content">{metrics.newUsers}</p>
                </div>
                <div className="rounded-md border border-border p-4">
                  <div className="flex items-center gap-2 text-content-tertiary"><FileText size={14} /><span className="text-xs font-semibold uppercase tracking-wide">New Apps</span></div>
                  <p className="text-2xl font-extrabold mt-1 text-content">{metrics.newApplications}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-2 text-content-tertiary">Events by severity</p>
                {Object.keys(metrics.eventsBySeverity).length === 0 ? (
                  <p className="text-sm text-content-tertiary">No system events in this window.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(metrics.eventsBySeverity).map(([sev, count]) => (
                      <Badge key={sev} tone={severityTone(sev)}>{severityLabel(sev)}: {count}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-neutral-100">
          <CheckCircle2 size={18} className="text-success-500" />
          <h2 className="text-base font-bold text-content">Alerts</h2>
        </div>
        {alerts.length === 0 ? (
          <p className="text-sm text-center py-10 text-content-tertiary">No alerts.</p>
        ) : (
          <div className="divide-y divide-neutral-100">
            {alerts.map((alert) => (
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
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success" | "error" | "warning" }) {
  const color = tone === "success" ? "var(--color-success-600)" : tone === "error" ? "var(--color-error-600)" : tone === "warning" ? "var(--color-warning-600)" : "var(--color-text-primary)";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-content-secondary">{label}</span>
      <span className="font-semibold" style={{ color }}>{value}</span>
    </div>
  );
}
