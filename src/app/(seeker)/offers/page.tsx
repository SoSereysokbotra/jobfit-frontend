"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award, DollarSign, Clock, ArrowUpDown, Briefcase, Sparkles, X,
} from "lucide-react";
import { OfferCard } from "@/features/offer/components";
import { useOffers, type OffersSortKey } from "@/features/offer/hooks/use-offers";
import { EmptyState } from "@/shared/components/data-display/empty-state";
import { StatCard } from "@/shared/components/data-display/stat-card";
import { JobCardSkeleton } from "@/shared/components/feedback/skeleton";
import { Alert } from "@/shared/components/feedback/alert";
import { Modal } from "@/shared/components/ui/modal";
import { formatCurrencyShort, formatInDays } from "@/lib/utils/format";

const SORT_OPTIONS: { value: OffersSortKey; label: string }[] = [
  { value: "deadline", label: "Deadline (soonest)" },
  { value: "recent", label: "Most recent" },
  { value: "salary", label: "Total comp (highest)" },
];

export default function OffersPage() {
  const offers = useOffers();
  /** Pending decision awaiting confirmation. */
  const [decision, setDecision] = useState<{ id: string; action: "accept" | "reject" } | null>(null);

  const decisionOffer = decision
    ? [...offers.active].find((o) => o.id === decision.id)
    : null;

  const confirmDecision = () => {
    if (decision) {
      offers.updateStatus(decision.id, decision.action === "accept" ? "Accepted" : "Rejected");
    }
    setDecision(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 min-h-full" style={{ background: "var(--color-bg-secondary)" }}>

      {/* ── PAGE HEADER ───────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          Offers &amp; Decisions
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Compare your offers, analyze compensation, and decide with confidence
        </p>
      </div>

      {/* ── CELEBRATION BANNER (offer accepted) ───────────── */}
      {offers.justAccepted && (
        <Alert variant="success" className="animate-fade-in">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            🎉 Congrats! Your new adventure at{" "}
            <span className="font-bold">{offers.justAccepted.company}</span> starts {offers.justAccepted.startDate}.
            <button onClick={offers.dismissCelebration} className="font-bold hover:underline">
              Dismiss
            </button>
          </span>
        </Alert>
      )}

      {/* ── SUMMARY STATS ─────────────────────────────────── */}
      {!offers.isLoading && offers.stats.activeCount > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Active Offers"
            value={String(offers.stats.activeCount)}
            change={offers.stats.acceptedCount > 0 ? `${offers.stats.acceptedCount} accepted so far` : "Awaiting your decision"}
            icon={<Award size={18} />}
            accentColor="var(--color-primary-600)"
            accentBg="var(--color-primary-50)"
          />
          <StatCard
            label="Best Total Comp"
            value={formatCurrencyShort(offers.stats.bestComp)}
            change="Year-1, across active offers"
            changeUp
            icon={<DollarSign size={18} />}
            accentColor="var(--color-success-600)"
            accentBg="var(--color-success-50)"
          />
          <StatCard
            label="Closest Deadline"
            value={offers.stats.soonestDeadline !== null ? formatInDays(offers.stats.soonestDeadline).replace("in ", "") : "—"}
            change="Respond before it expires"
            icon={<Clock size={18} />}
            accentColor="var(--color-warning-600)"
            accentBg="var(--color-warning-50)"
          />
        </div>
      )}

      {/* ── CONTENT ───────────────────────────────────────── */}
      {offers.isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg border"
              style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
            >
              <JobCardSkeleton />
            </div>
          ))}
        </div>
      ) : !offers.hasAny ? (
        <EmptyState
          icon={<Award size={26} />}
          title="No offers yet"
          description="Keep applying! The average time to a first offer is 20–30 days — you're on the right track."
          action={
            <Link
              href="/applications"
              className="px-4 py-2 rounded-md text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all duration-200 inline-flex items-center gap-1.5"
            >
              <Briefcase size={13} /> View applications
            </Link>
          }
        />
      ) : (
        <>
          {/* ── ACTIVE OFFERS ─────────────────────────────── */}
          {offers.active.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "var(--color-text-secondary)" }}>
                  <Sparkles size={15} style={{ color: "var(--color-primary-500)" }} />
                  Active Offers · {offers.active.length}
                </h2>
                <label className="flex items-center gap-1.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  <ArrowUpDown size={13} />
                  <select
                    value={offers.sort}
                    onChange={(e) => offers.setSort(e.target.value as OffersSortKey)}
                    className="text-xs font-semibold rounded-md border px-2 py-1.5 outline-none cursor-pointer"
                    style={{
                      borderColor: "var(--color-border)",
                      background: "var(--color-bg)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {offers.active.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onAccept={(id) => setDecision({ id, action: "accept" })}
                    onReject={(id) => setDecision({ id, action: "reject" })}
                    onUpdateNotes={offers.updateNotes}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── PAST OFFERS ───────────────────────────────── */}
          {offers.past.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--color-text-tertiary)" }}>
                Past Decisions · {offers.past.length}
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {offers.past.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} past onUpdateNotes={offers.updateNotes} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── DECISION CONFIRMATION MODAL ───────────────────── */}
      <Modal
        open={decision !== null}
        onClose={() => setDecision(null)}
        title={decision?.action === "accept" ? "Accept this offer?" : "Decline this offer?"}
        subtitle={
          decisionOffer
            ? `${decisionOffer.job.title} at ${decisionOffer.job.company}`
            : undefined
        }
        footer={
          <>
            <button
              onClick={() => setDecision(null)}
              className="px-4 py-2 rounded-md text-xs font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmDecision}
              className={
                decision?.action === "accept"
                  ? "px-4 py-2 rounded-md text-xs font-bold text-white bg-success-500 hover:bg-success-600 transition-all duration-200 active:scale-95 inline-flex items-center gap-1.5"
                  : "px-4 py-2 rounded-md text-xs font-bold text-white bg-error-500 hover:bg-error-600 transition-all duration-200 active:scale-95 inline-flex items-center gap-1.5"
              }
            >
              {decision?.action === "accept" ? <><Sparkles size={12} /> Yes, accept</> : <><X size={12} /> Yes, decline</>}
            </button>
          </>
        }
      >
        {decision?.action === "accept" ? (
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Accepting moves this offer to your past decisions and archives your other active offers for this search.
            Make sure you&apos;ve reviewed the compensation and start date — congratulations are in order! 🎉
          </p>
        ) : (
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Declining moves this offer to your past decisions. You can always keep the notes for future reference.
          </p>
        )}
      </Modal>
    </div>
  );
}
