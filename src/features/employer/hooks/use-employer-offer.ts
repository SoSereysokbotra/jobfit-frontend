"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { employerOfferApi, type ExtendOfferInput } from "../api/employer-offer.api";

/**
 * The offer on an application, with its note thread.
 *
 * This is how a candidate's negotiation message reaches the employer at all — before it
 * existed there was no read path, so the message sat in the database unreachable from
 * this side. Only enabled when an application is actually selected.
 */
export function useEmployerOffer(applicationId: string | null) {
  return useQuery({
    queryKey: [...qk.employer.all, "offer", applicationId],
    queryFn: () => employerOfferApi.get(applicationId as string),
    enabled: applicationId !== null,
    // A 404 is a real answer — this application has no offer — not a fault worth retrying.
    retry: false,
  });
}

/** Reply to the candidate; refreshes the thread and the board's unread badge. */
export function usePostOfferMessage(applicationId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => employerOfferApi.postMessage(applicationId as string, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.employer.all }),
  });
}

/** Extend an offer on an application; refreshes the pipeline (status → Offer). */
export function useExtendOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, input }: { applicationId: string; input: ExtendOfferInput }) =>
      employerOfferApi.extend(applicationId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.employer.all }),
  });
}
