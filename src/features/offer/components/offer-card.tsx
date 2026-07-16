"use client";

import React, { useState } from "react";
import {
  MapPin, Clock, CalendarClock, ChevronDown, StickyNote,
  Check, X, TrendingUp, Sparkles,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Badge } from "@/shared/components/ui/badge";
import { NotesEditor } from "@/shared/components/ui/notes-editor";
import { formatCurrency, formatCurrencyShort, formatInDays, formatDateInDays } from "@/lib/utils/format";
import {
  OFFER_STATUS_CONFIG, yearOneComp, annualBonusValue, annualEquityValue,
  type Offer, type MarketBenchmark,
} from "../api/offer.api";

interface OfferCardProps {
  offer: Offer;
  /** Past offers render in a muted, read-only style. */
  past?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
}

/** Urgency color for the deadline countdown. */
function deadlineTone(days: number): string {
  if (days <= 2) return "var(--color-error-500)";
  if (days <= 5) return "var(--color-warning-600)";
  return "var(--color-text-tertiary)";
}

/** Where a base salary sits within the market band (0–100 for the bar). */
function marketPosition(base: number, m: MarketBenchmark): { label: string; pct: number } {
  if (base >= m.p90) return { label: "90th percentile — top of market", pct: 96 };
  if (base >= m.p75) return { label: "75th–90th percentile — above market", pct: 80 };
  if (base >= m.p50) return { label: "50th–75th percentile — at/above median", pct: 60 };
  if (base >= m.p25) return { label: "25th–50th percentile — below median", pct: 36 };
  return { label: "Below 25th percentile", pct: 14 };
}

/** One line in the compensation breakdown. */
function CompRow({ label, value, sub, strong }: { label: string; value: string; sub?: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <div>
        <span className={cn("text-sm", strong && "font-bold")} style={{ color: "var(--color-text-primary)" }}>{label}</span>
        {sub && <span className="text-xs ml-1.5" style={{ color: "var(--color-text-tertiary)" }}>{sub}</span>}
      </div>
      <span
        className={cn("text-sm tabular-nums", strong ? "font-extrabold" : "font-semibold")}
        style={{ color: strong ? "var(--color-primary-700)" : "var(--color-text-primary)" }}
      >
        {value}
      </span>
    </div>
  );
}

/** Market comparison bar — offer position within the salary band. */
function MarketBar({ offer }: { offer: Offer }) {
  const pos = marketPosition(offer.baseSalary, offer.market);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-text-secondary)" }}>
          Market comparison
        </h4>
        <span className="text-xs font-semibold" style={{ color: "var(--color-primary-600)" }}>{pos.label}</span>
      </div>
      <div className="relative h-2 rounded-full" style={{ background: "var(--color-neutral-100)" }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pos.pct}%`, background: "linear-gradient(90deg, var(--color-primary-500), var(--color-primary-700))" }}
        />
        <div
          className="absolute -top-1 w-4 h-4 rounded-full border-2 -translate-x-1/2"
          style={{ left: `${pos.pct}%`, background: "var(--color-card)", borderColor: "var(--color-primary-600)" }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
        <span>{formatCurrencyShort(offer.market.p25)}</span>
        <span>{formatCurrencyShort(offer.market.p50)} median</span>
        <span>{formatCurrencyShort(offer.market.p90)}</span>
      </div>
    </div>
  );
}

/**
 * Offer card (Path 3C-1) with an expandable quick-analysis summary (3C-2 essence):
 * compensation breakdown, year-one total, market position, and decision notes.
 */
export function OfferCard({ offer, past = false, onAccept, onReject, onUpdateNotes }: OfferCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const { job } = offer;
  const status = OFFER_STATUS_CONFIG[offer.status];
  const total = yearOneComp(offer);
  const bonus = annualBonusValue(offer);
  const equity = annualEquityValue(offer);

  const smallBtn =
    "px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 active:scale-95 inline-flex items-center justify-center gap-1";

  return (
    <div
      className={cn("rounded-lg border p-5 transition-all duration-200", !past && "hover:shadow-md")}
      style={{
        background: "var(--color-card)",
        borderColor: past ? "var(--color-neutral-100)" : "var(--color-border)",
        boxShadow: past ? "var(--shadow-none)" : "var(--shadow-sm)",
        opacity: past ? 0.9 : 1,
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-extrabold text-base shrink-0"
          style={{ background: job.logoBg, boxShadow: "var(--shadow-sm)" }}
        >
          {job.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>{job.title}</h3>
            <Badge variant={status.badge}>{status.label}</Badge>
          </div>
          <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
            {job.company}
            <span className="inline-flex items-center gap-1">
              · <MapPin size={11} /> {job.location}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <span className="flex items-center gap-1 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              <CalendarClock size={11} /> Starts {offer.startDate}
            </span>
            {!past && (
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: deadlineTone(offer.deadlineInDays) }}>
                <Clock size={11} /> Respond by {formatDateInDays(offer.deadlineInDays)} ({formatInDays(offer.deadlineInDays)})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Headline figures ───────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="rounded-md border p-3" style={{ borderColor: "var(--color-neutral-100)", background: "var(--color-bg-secondary)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>Base salary</p>
          <p className="text-lg font-extrabold mt-0.5 tabular-nums" style={{ color: "var(--color-text-primary)" }}>
            {formatCurrency(offer.baseSalary)}
          </p>
        </div>
        <div className="rounded-md border p-3" style={{ borderColor: "var(--color-primary-100)", background: "var(--color-primary-50)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-primary-500)" }}>Year-1 total comp</p>
          <p className="text-lg font-extrabold mt-0.5 tabular-nums" style={{ color: "var(--color-primary-700)" }}>
            {formatCurrency(total)}
          </p>
        </div>
      </div>

      {/* ── Expand toggle ──────────────────────────────────── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 mt-3 text-xs font-bold transition-colors hover:opacity-80"
        style={{ color: "var(--color-primary-600)" }}
        aria-expanded={expanded}
      >
        <ChevronDown size={14} className={cn("transition-transform duration-200", expanded && "rotate-180")} />
        {expanded ? "Hide analysis" : "View & analyze offer"}
      </button>

      {/* ── Expanded analysis ──────────────────────────────── */}
      {expanded && (
        <div
          className="mt-3 pt-4 border-t space-y-4 animate-fade-in"
          style={{ borderColor: "var(--color-neutral-100)" }}
        >
          {/* Compensation breakdown */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-secondary)" }}>
              Compensation breakdown
            </h4>
            <div className="divide-y" style={{ borderColor: "var(--color-neutral-100)" }}>
              <CompRow label="Base salary" value={formatCurrency(offer.baseSalary)} />
              {offer.signingBonus ? <CompRow label="Signing bonus" value={formatCurrency(offer.signingBonus)} sub="one-time" /> : null}
              {bonus > 0 && <CompRow label="Annual bonus" value={formatCurrency(bonus)} sub={`${offer.annualBonusPct}% target`} />}
              {equity > 0 && (
                <CompRow
                  label="Equity (per yr)"
                  value={formatCurrency(equity)}
                  sub={`${offer.stockShares?.toLocaleString()} shares · 4-yr vest`}
                />
              )}
              <CompRow label="Year-1 total" value={formatCurrency(total)} sub="excl. equity cliff" strong />
            </div>
          </div>

          {/* Market comparison */}
          <MarketBar offer={offer} />

          {/* Notes */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-secondary)" }}>
              Your decision notes
            </h4>
            {notesOpen || offer.notes ? (
              notesOpen ? (
                <NotesEditor
                  value={offer.notes}
                  onSave={(n) => onUpdateNotes?.(offer.id, n)}
                  onDone={() => setNotesOpen(false)}
                  placeholder="Add decision notes… (negotiation, culture, comparisons)"
                />
              ) : (
                <button
                  onClick={() => setNotesOpen(true)}
                  className="w-full text-left px-3 py-2 rounded-md text-xs flex items-start gap-2 transition-colors hover:bg-primary-50"
                  style={{ background: "var(--color-bg-secondary)", color: "var(--color-text-secondary)" }}
                >
                  <StickyNote size={13} className="shrink-0 mt-0.5" style={{ color: "var(--color-primary-400)" }} />
                  <span>{offer.notes}</span>
                </button>
              )
            ) : (
              !past && (
                <button
                  onClick={() => setNotesOpen(true)}
                  className={cn(smallBtn, "border border-neutral-200 text-neutral-600 hover:bg-neutral-50")}
                >
                  <StickyNote size={12} /> Add notes
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* ── Decision actions ───────────────────────────────── */}
      {past ? (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t" style={{ borderColor: "var(--color-neutral-100)" }}>
          {offer.status === "Accepted" ? (
            <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "var(--color-success-600)" }}>
              <Check size={13} /> Accepted · started {offer.startDate}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: "var(--color-text-tertiary)" }}>
              <X size={13} /> Declined
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t" style={{ borderColor: "var(--color-neutral-100)" }}>
          <button
            onClick={() => onAccept?.(offer.id)}
            className={cn(smallBtn, "text-white bg-success-500 hover:bg-success-600")}
          >
            <Sparkles size={12} /> Accept offer
          </button>
          <button
            onClick={() => onReject?.(offer.id)}
            className={cn(smallBtn, "border border-error-100 text-error-500 hover:bg-error-50")}
          >
            <X size={12} /> Decline
          </button>
          {offer.status !== "Negotiating" && (
            <span className="flex items-center gap-1 text-xs ml-auto" style={{ color: "var(--color-text-disabled)" }}>
              <TrendingUp size={11} /> Room to negotiate
            </span>
          )}
        </div>
      )}
    </div>
  );
}
