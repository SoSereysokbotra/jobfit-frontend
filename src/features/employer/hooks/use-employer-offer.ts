"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { employerOfferApi, type ExtendOfferInput } from "../api/employer-offer.api";

/** Extend an offer on an application; refreshes the pipeline (status → Offer). */
export function useExtendOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, input }: { applicationId: string; input: ExtendOfferInput }) =>
      employerOfferApi.extend(applicationId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.employer.all }),
  });
}
