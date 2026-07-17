"use client";

import React, { useState } from "react";
import { RefreshCw, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "@/shared/utils/cn";
import { MetricBar } from "@/shared/components/data-display/metric-bar";
import { Badge } from "@/shared/components/data-display/badge";
import { SYSTEM_HEALTH, SYSTEM_ALERTS, METRICS_SERIES, type SystemAlert } from "@/features/admin/api/admin.api";

const PERIODS = ["1h", "24h", "7d"] as const;

const ALERT_TONE: Record<SystemAlert["severity"], "info" | "warning" | "error"> = {
  info: "info", warning: "warning", error: "error",
};
const ALERT_ICON: Record<SystemAlert["severity"], React.ReactNode> = {
  info: <Info size={15} className="text-info-500" />,
  warning: <AlertTriangle size={15} className="text-warning-500" />,
  error: <AlertTriangle size={15} className="text-error-500" />,
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-md text-xs border border-border bg-card shadow-md">
      <p className="font-bold text-content">{label}</p>
      <p className="text-content-secondary">Latency: <span className="font-bold text-content">{payload[0].value}ms</span></p>
    </div>
  );
}

export default function SystemHealthPage() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("24h");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content">System Health</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge tone="success" dot>Healthy</Badge>
            <span className="text-xs text-content-tertiary">Updated just now</span>
          </div>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-border bg-background text-sm font-semibold text-content-secondary transition-colors hover:bg-neutral-50">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metrics */}
        <div className="rounded-lg border border-border bg-card shadow-sm p-5 space-y-4">
          <h2 className="text-base font-bold text-content">Performance Metrics</h2>
          <MetricBar label="Uptime (month)" display={`${SYSTEM_HEALTH.uptimePercent}%`} percent={SYSTEM_HEALTH.uptimePercent} tone="success" />
          <MetricBar label="API Latency (p99)" display={`${SYSTEM_HEALTH.apiLatencyMs}ms`} percent={(SYSTEM_HEALTH.apiLatencyMs / 500) * 100} tone="success" />
          <MetricBar label="Database CPU" display={`${SYSTEM_HEALTH.databaseCpuPercent}%`} percent={SYSTEM_HEALTH.databaseCpuPercent} tone="success" />
          <MetricBar label="Memory Usage" display={`${SYSTEM_HEALTH.memoryPercent}%`} percent={SYSTEM_HEALTH.memoryPercent} tone="warning" />
          <MetricBar label="Email Delivery" display={`${SYSTEM_HEALTH.emailDeliveryRate}%`} percent={SYSTEM_HEALTH.emailDeliveryRate} tone="success" />
        </div>

        {/* Chart */}
        <div className="rounded-lg border border-border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-content">API Latency Trend</h2>
            <div className="flex rounded-md border border-border overflow-hidden">
              {PERIODS.map((p) => (
                <button key={p} onClick={() => setPeriod(p)} className={cn("px-3 py-1 text-xs font-bold transition-colors", period === p ? "bg-primary-50 text-primary-700" : "bg-background text-content-tertiary")}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={METRICS_SERIES} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary-500)" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="var(--color-primary-500)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-100)" />
              <XAxis dataKey="t" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-neutral-200)" }} />
              <Area type="monotone" dataKey="latency" stroke="var(--color-primary-500)" strokeWidth={2} fill="url(#latencyFill)" dot={{ r: 3, fill: "var(--color-primary-500)", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-neutral-100">
          <CheckCircle2 size={18} className="text-success-500" />
          <h2 className="text-base font-bold text-content">Alerts (last 24h)</h2>
        </div>
        <div className="divide-y divide-neutral-100">
          {SYSTEM_ALERTS.map((alert) => (
            <div key={alert.id} className="flex items-center gap-3 px-5 py-3.5">
              {ALERT_ICON[alert.severity]}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-content">{alert.message}</p>
                <p className="text-xs text-content-tertiary">{alert.createdAt}</p>
              </div>
              <Badge tone={ALERT_TONE[alert.severity]}>{alert.severity}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
