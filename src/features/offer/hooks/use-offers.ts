"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  fetchOffers, offerApi, yearOneComp,
  ACTIVE_STATUSES, PAST_STATUSES,
  type Offer, type OfferStatus,
} from "../api/offer.api";

export type OffersSortKey = "recent" | "deadline" | "salary";

/* Client state for the Offers dashboard (Path 3C-1): fetching, active/past
   split, sorting, accept/reject decisions with a celebration hook, and notes. */
export function useOffers() {
  const [items, setItems] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState<OffersSortKey>("deadline");
  /** Set right after an offer is accepted, so the page can celebrate. */
  const [justAccepted, setJustAccepted] = useState<{ company: string; startDate: string } | null>(null);
  /** The backend's own words when a decision is refused. */
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchOffers().then((data) => {
      if (!cancelled) {
        setItems(data);
        setIsLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const sortOffers = (list: Offer[]) =>
    [...list].sort((a, b) => {
      switch (sort) {
        case "salary": return yearOneComp(b) - yearOneComp(a);
        case "recent": return a.receivedDaysAgo - b.receivedDaysAgo;
        default: return a.deadlineInDays - b.deadlineInDays; // soonest deadline first
      }
    });

  const active = useMemo(
    () => sortOffers(items.filter((o) => ACTIVE_STATUSES.includes(o.status))),
    [items, sort],
  );

  const past = useMemo(
    () => items
      .filter((o) => PAST_STATUSES.includes(o.status))
      .sort((a, b) => a.receivedDaysAgo - b.receivedDaysAgo),
    [items],
  );

  /* ── Header stats ──────────────────────────────────────────── */
  const stats = useMemo(() => {
    const activeList = items.filter((o) => ACTIVE_STATUSES.includes(o.status));
    const bestComp = activeList.reduce((max, o) => Math.max(max, yearOneComp(o)), 0);
    const soonest = activeList.reduce(
      (min, o) => Math.min(min, o.deadlineInDays),
      Number.POSITIVE_INFINITY,
    );
    return {
      activeCount: activeList.length,
      bestComp,
      soonestDeadline: Number.isFinite(soonest) ? soonest : null,
      acceptedCount: items.filter((o) => o.status === "Accepted").length,
    };
  }, [items]);

  /* ── Decisions ─────────────────────────────────────────────── */
  // Accept/decline hit the live API, then we re-fetch so the server's side effects
  // (accepting one offer auto-withdraws the others) are reflected wholesale.
  const updateStatus = async (id: string, status: OfferStatus) => {
    const offer = items.find((o) => o.id === id);
    setError(null);
    try {
      if (status === "Accepted") await offerApi.accept(id);
      else if (status === "Rejected") await offerApi.decline(id);
      setItems(await fetchOffers());
      if (status === "Accepted" && offer) {
        setJustAccepted({ company: offer.job.company, startDate: offer.startDate });
      }
    } catch (e) {
      await report(e, "Could not record your decision.");
    }
  };

  /**
   * Write to the employer about an offer — as many times as you like.
   *
   * The first message opens the negotiation; the rest are just messages. It used to be
   * one-shot: the second asked the backend for a NEGOTIATING -> NEGOTIATING transition,
   * which does not exist, so it was refused and the employer never saw it.
   */
  const sendMessage = async (id: string, body: string) => {
    setError(null);
    try {
      await offerApi.sendMessage(id, body);
      setItems(await fetchOffers());
    } catch (e) {
      await report(e, "Could not send your message.");
    }
  };

  /** Opening a thread marks the employer's replies read; refresh so the count clears. */
  const markRead = async (id: string) => {
    try {
      await offerApi.get(id);
      setItems(await fetchOffers());
    } catch {
      // Not worth surfacing — the conversation is already on screen.
    }
  };

  /**
   * A failed decision used to be swallowed entirely, so the button looked broken rather
   * than refused. The backend's own message is better than anything generic here — it
   * says things like "This offer is already declined." Re-fetching matters too: a refusal
   * usually means this client is stale.
   */
  async function report(e: unknown, fallback: string) {
    setError(e instanceof ApiError ? e.message : fallback);
    try {
      setItems(await fetchOffers());
    } catch {
      // Leave the list as-is; the message above is the useful part.
    }
  }

  const dismissCelebration = () => setJustAccepted(null);
  const dismissError = () => setError(null);

  return {
    isLoading, active, past, stats,
    sort, setSort,
    updateStatus, sendMessage, markRead,
    justAccepted, dismissCelebration,
    error, dismissError,
    hasAny: items.length > 0,
  };
}
