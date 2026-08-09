"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/client";
import { qk } from "@/lib/api/query-keys";
import {
  fetchOffers, offerApi, yearOneComp,
  isActiveOffer, isPastOffer,
  type Offer, type OfferStatus,
} from "../api/offer.api";

export type OffersSortKey = "recent" | "deadline" | "salary";

/**
 * Client state for the Offers dashboard: fetching, active/past split, sorting,
 * accept/decline decisions with a celebration hook, and the employer conversation.
 *
 * WHY REACT QUERY: this was the last hook in the app fetching by hand — a `useEffect`
 * with a raw promise. That is exactly how it shipped without a `.catch`, so a lapsed
 * session became an unhandled rejection and the dev overlay replaced the page with a
 * crash screen. Retries, caching, error capture and the loading flag are all things the
 * query client already does correctly; keeping a second hand-rolled copy of them here
 * meant this file was the only place that class of bug could still appear.
 *
 * The public shape is unchanged, so the page did not have to move.
 */
export function useOffers() {
  const qc = useQueryClient();
  const [sort, setSort] = useState<OffersSortKey>("deadline");
  /** Set right after an offer is accepted, so the page can celebrate. */
  const [justAccepted, setJustAccepted] = useState<{ company: string; startDate: string } | null>(null);
  /** Cleared by the user; separate from the query/mutation errors below. */
  const [dismissed, setDismissed] = useState(false);

  const query = useQuery({
    queryKey: qk.offers.list(),
    queryFn: fetchOffers,
    // A 401 is not a fault to retry: the access token lives in memory, so a hard refresh
    // always starts without one. The api client already retries behind a cookie refresh,
    // and when that fails the auth provider is navigating to /login.
    retry: (failureCount, e) =>
      !(e instanceof ApiError && e.statusCode >= 400 && e.statusCode < 500) && failureCount < 2,
  });

  const items = useMemo(() => query.data ?? [], [query.data]);

  /** Every mutation refetches: the server's side effects are wider than the row we touched. */
  const refresh = () => qc.invalidateQueries({ queryKey: qk.offers.all });

  const decide = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OfferStatus }) =>
      status === "Accepted" ? offerApi.accept(id) : offerApi.decline(id),
    onSuccess: (_data, { id, status }) => {
      if (status === "Accepted") {
        const offer = items.find((o) => o.id === id);
        if (offer) setJustAccepted({ company: offer.job.company, startDate: offer.startDate });
      }
    },
    // Both paths refetch. A REFUSAL usually means this client is stale, so the failure
    // case needs the fresh data at least as much as the success case does.
    onSettled: refresh,
  });

  const message = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => offerApi.sendMessage(id, body),
    onSettled: refresh,
  });

  const read = useMutation({
    mutationFn: (id: string) => offerApi.get(id),
    onSettled: refresh,
  });

  // useCallback so the memo below can depend on the function itself rather than on the
  // `sort` it closes over. Depending on `sort` was correct but only by coincidence: any
  // future value read in here would silently not invalidate the memo.
  const sortOffers = useCallback(
    (list: Offer[]) =>
      [...list].sort((a, b) => {
        switch (sort) {
          case "salary": return yearOneComp(b) - yearOneComp(a);
          case "recent": return a.receivedDaysAgo - b.receivedDaysAgo;
          default: return a.deadlineInDays - b.deadlineInDays; // soonest deadline first
        }
      }),
    [sort],
  );

  // Both lists go through isActiveOffer/isPastOffer rather than testing the status here,
  // because an offer's status alone does not decide it — see the note in offer.api.ts.
  const active = useMemo(
    () => sortOffers(items.filter(isActiveOffer)),
    [items, sortOffers],
  );

  const past = useMemo(
    () => items.filter(isPastOffer).sort((a, b) => a.receivedDaysAgo - b.receivedDaysAgo),
    [items],
  );

  /* ── Header stats ──────────────────────────────────────────── */
  const stats = useMemo(() => {
    const activeList = items.filter(isActiveOffer);
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

  /* ── Errors ────────────────────────────────────────────────
     The backend's own message is better than anything generic — it says things like
     "This offer is already declined." A failed decision used to be swallowed entirely,
     so the button looked broken rather than refused. */
  const error = dismissed
    ? null
    : messageOf(decide.error, "Could not record your decision.")
      ?? messageOf(message.error, "Could not send your message.")
      // A 401 on the initial load is deliberately silent: it would flash under a page
      // that is already on its way to /login.
      ?? messageOf(query.error, "Could not load your offers.", { silent401: true });

  return {
    isLoading: query.isPending,
    active, past, stats,
    sort, setSort,
    updateStatus: (id: string, status: OfferStatus) => {
      setDismissed(false);
      decide.mutate({ id, status });
    },
    sendMessage: (id: string, body: string) => {
      setDismissed(false);
      message.mutate({ id, body });
    },
    // Opening a thread marks the employer's replies read. Not worth surfacing a failure —
    // the conversation is already on screen.
    markRead: (id: string) => read.mutate(id),
    justAccepted,
    dismissCelebration: () => setJustAccepted(null),
    error,
    dismissError: () => setDismissed(true),
    hasAny: items.length > 0,
  };
}

function messageOf(
  e: unknown,
  fallback: string,
  opts: { silent401?: boolean } = {},
): string | null {
  if (!e) return null;
  if (e instanceof ApiError) {
    if (opts.silent401 && e.statusCode === 401) return null;
    return e.message;
  }
  return fallback;
}
