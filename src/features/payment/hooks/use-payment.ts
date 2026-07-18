"use client";

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import { paymentApi } from "../api/payment.api";

/** Available subscription plans (mock behind interface — see payment.api). */
export function usePlans() {
  return useQuery({
    queryKey: qk.payment.plans(),
    queryFn: () => paymentApi.plans(),
    staleTime: Infinity,
  });
}

/** The current user's billing state. */
export function useBilling() {
  return useQuery({
    queryKey: qk.payment.billing(),
    queryFn: () => paymentApi.billing(),
  });
}
