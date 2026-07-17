"use client";

import React from "react";
import { Send, MailCheck, MailX, MailWarning } from "lucide-react";
import { Badge } from "@/shared/components/data-display/badge";
import { Skeleton } from "@/shared/components/feedback/skeleton";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { useEmailMetrics, useEmailBounces, useSuppressEmail } from "@/features/admin/hooks/use-admin";
import { bounceTone, ago } from "@/features/admin/api/admin.mappers";

export default function EmailTrackingPage() {
  const { data: m, isLoading } = useEmailMetrics();
  const { data: bounces = [], isLoading: bouncesLoading } = useEmailBounces();
  const suppress = useSuppressEmail();

  const bouncedRate = m && m.sent ? ((m.bounced / m.sent) * 100).toFixed(1) : "0";

  const tiles = m
    ? [
        { label: "Sent", value: m.sent.toLocaleString(), hint: "last 24h", icon: <Send size={18} />, accent: "bg-primary-50 text-primary-600" },
        { label: "Delivered", value: m.delivered.toLocaleString(), hint: `${m.deliveryRate}%`, icon: <MailCheck size={18} />, accent: "bg-success-50 text-success-600" },
        { label: "Bounced", value: `${m.bounced}`, hint: `${bouncedRate}%`, icon: <MailX size={18} />, accent: "bg-warning-50 text-warning-600" },
        { label: "Complained", value: `${m.complained}`, hint: "spam reports", icon: <MailWarning size={18} />, accent: "bg-error-50 text-error-600" },
      ]
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content">Email Delivery Tracking</h1>
        <p className="text-sm mt-1 text-content-secondary">Transactional email health over the last 24 hours.</p>
      </div>

      {/* Tiles */}
      {isLoading || !m ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-lg" />)}</div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
      )}

      {/* Bounces */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-base font-bold text-content">Recent Bounces &amp; Complaints</h2>
        </div>
        {bouncesLoading ? (
          <div className="p-5 space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded" />)}</div>
        ) : bounces.length === 0 ? (
          <div className="p-8"><EmptyState title="No bounces" description="No bounced or complained emails recorded." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-content-tertiary">
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Email</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Type</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3">Reason</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3 hidden sm:table-cell">When</th>
                  <th className="font-semibold text-xs uppercase tracking-wider px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {bounces.map((b) => (
                  <tr key={b.id} className="border-t border-neutral-100">
                    <td className="px-5 py-3 font-medium text-content">{b.recipientEmail}</td>
                    <td className="px-5 py-3"><Badge tone={bounceTone(b.eventType)}>{b.eventType}</Badge></td>
                    <td className="px-5 py-3 text-content-secondary">{b.reason ?? "—"}</td>
                    <td className="px-5 py-3 hidden sm:table-cell text-content-tertiary">{ago(b.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      {b.suppressed ? (
                        <Badge tone="neutral">Suppressed</Badge>
                      ) : (
                        <button
                          onClick={() => suppress.mutate(b.recipientEmail)}
                          disabled={suppress.isPending}
                          className="text-xs font-bold px-3 py-1.5 rounded-md border border-border text-error-600 transition-colors hover:bg-neutral-50 disabled:opacity-50"
                        >
                          Suppress
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
