"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchOffers, yearOneComp,
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

  /* ── Decisions & edits ─────────────────────────────────────── */
  const updateStatus = (id: string, status: OfferStatus) => {
    setItems((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (status === "Accepted") {
      const offer = items.find((o) => o.id === id);
      if (offer) setJustAccepted({ company: offer.job.company, startDate: offer.startDate });
    }
  };

  const dismissCelebration = () => setJustAccepted(null);

  const updateNotes = (id: string, notes: string) => {
    setItems((prev) => prev.map((o) => (o.id === id ? { ...o, notes } : o)));
  };

  return {
    isLoading, active, past, stats,
    sort, setSort,
    updateStatus, updateNotes,
    justAccepted, dismissCelebration,
    hasAny: items.length > 0,
  };
}
