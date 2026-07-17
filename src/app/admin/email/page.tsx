"use client";

import React, { useState } from "react";
import { Send, MailCheck, MailX } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { cn } from "@/shared/utils/cn";
import { Badge } from "@/shared/components/data-display/badge";
import { EMAIL_METRICS, EMAIL_BOUNCES, EMAIL_TREND } from "@/features/admin/api/admin.api";

const PERIODS = ["1d", "7d", "30d"] as const;

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-md text-xs border border-border bg-card shadow-md">
      <p className="font-bold text-content">{label}</p>
      <p className="text-content-secondary">Delivery: <span className="font-bold text-content">{payload[0].value}%</span></p>
    </div>
  );
}

export default function EmailTrackingPage() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("1d");
  const m = EMAIL_METRICS;
  const bouncedRate = ((m.bounced / m.sent) * 100).toFixed(1);

  const tiles = [
    { label: "Sent", value: m.sent.toLocaleString(), hint: "emails", icon: <Send size={18} />, accent: "bg-primary-50 text-primary-600" },
    { label: "Delivered", value: m.delivered.toLocaleString(), hint: `${m.deliveryRate}%`, icon: <MailCheck size={18} />, accent: "bg-success-50 text-success-600" },
    { label: "Bounced", value: `${m.bounced}`, hint: `${bouncedRate}%`, icon: <MailX size={18} />, accent: "bg-warning-50 text-warning-600" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content">Email Delivery Tracking</h1>
          <p className="text-sm mt-1 text-content-secondary">Monitoring transactional email health.</p>
        </div>
        <div className="flex rounded-md border border-border overflow-hidden">
          {PERIODS.map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={cn("px-3 py-1.5 text-xs font-bold transition-colors", period === p ? "bg-primary-50 text-primary-700" : "bg-background text-content-tertiary")}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-lg border border-border bg-card shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-content-tertiary">{t.label}</p>
              <div className={`w-9 h-9 rounded-md flex items-center justify-center ${t.accent}`}>{t.icon}</div>
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-content">{t.value}</p>
            <p className="text-xs mt-1.5 text-content-tertiary">{t.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Type breakdown */}
        <div className="rounded-lg border border-border bg-card shadow-sm p-5">
          <h2 className="text-base font-bold mb-4 text-content">By Email Type</h2>
          <div className="space-y-3">
            {m.byType.map((row) => {
              const rate = ((row.delivered / row.sent) * 100).toFixed(1);
              return (
                <div key={row.type} className="flex items-center justify-between gap-3">
                  <span className="text-sm truncate text-content-secondary">{row.type}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-content-tertiary">{row.sent} sent</span>
                    <Badge tone="success">{rate}%</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trend chart */}
        <div className="rounded-lg border border-border bg-card shadow-sm p-5">
          <h2 className="text-base font-bold mb-4 text-content">Delivery Rate Trend (7 days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={EMAIL_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rateFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-success-500)" stopOpacity={0.14} />
                  <stop offset="95%" stopColor="var(--color-success-500)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-100)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
              <YAxis domain={[98, 100]} tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-neutral-200)" }} />
              <Area type="monotone" dataKey="rate" stroke="var(--color-success-500)" strokeWidth={2} fill="url(#rateFill)" dot={{ r: 3, fill: "var(--color-success-500)", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bounces */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-base font-bold text-content">Recent Bounces</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-content-tertiary">
                <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Email</th>
                <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Type</th>
                <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Reason</th>
                <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {EMAIL_BOUNCES.map((b) => (
                <tr key={b.id} className="border-t border-neutral-100">
                  <td className="px-5 py-3 font-medium text-content">{b.email}</td>
                  <td className="px-5 py-3"><Badge tone={b.kind === "Hard" ? "error" : "warning"}>{b.kind}</Badge></td>
                  <td className="px-5 py-3 text-content-secondary">{b.reason}</td>
                  <td className="px-5 py-3 text-right">
                    <button className={cn("text-xs font-bold px-3 py-1.5 rounded-md border border-border transition-colors hover:bg-neutral-50", b.kind === "Hard" ? "text-error-600" : "text-primary-600")}>
                      {b.kind === "Hard" ? "Suppress" : "Retry"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
