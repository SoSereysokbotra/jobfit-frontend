"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import {
  employerRequestApi,
  type CreateEmployerRequestInput,
  type ListEmployerRequestsParams,
  type ReviewableStatus,
} from "../api/employer-request.api";

/**
 * The admin review queue.
 *
 * `staleTime` is short: this is a shared work queue, and two admins working it at once
 * should not each be looking at a cached copy of who has already been decided.
 */
export function useEmployerRequests(params: ListEmployerRequestsParams = {}) {
  return useQuery({
    queryKey: qk.admin.employerRequests({ ...params }),
    queryFn: () => employerRequestApi.list(params),
    staleTime: 15_000,
  });
}

/** Record a request that arrived by email or Telegram. */
export function useCreateEmployerRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEmployerRequestInput) =>
      employerRequestApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.admin.all }),
  });
}

export function useEmployerRequest(id: string | undefined) {
  return useQuery({
    queryKey: qk.admin.employerRequest(id ?? ""),
    queryFn: () => employerRequestApi.get(id as string),
    enabled: Boolean(id),
  });
}

/** REVIEWING / PENDING_INFO / REJECTED. Approval is a separate mutation. */
export function useReviewEmployerRequest(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { status: ReviewableStatus; adminNotes?: string }) =>
      employerRequestApi.review(id, body),
    onSuccess: () => invalidate(qc, id),
  });
}

/**
 * Approve: creates the EMPLOYER account and emails the activation code.
 *
 * The 409 this can throw is not a failure to handle generically — it is the email-conflict
 * case the approve dialog has a dedicated branch for.
 */
export function useApproveEmployerRequest(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (companyId: string) => employerRequestApi.approve(id, companyId),
    onSuccess: () => invalidate(qc, id),
  });
}

export function useResendActivation(id: string) {
  return useMutation({
    mutationFn: () => employerRequestApi.resendActivation(id),
  });
}

/**
 * Companies to approve against.
 *
 * Gated on a search term: the list exists to find one known company, not to browse every
 * row in the table.
 */
export function useCompanyOptions(search: string) {
  return useQuery({
    queryKey: qk.admin.companyOptions(search),
    queryFn: () => employerRequestApi.searchCompanies(search),
    enabled: search.trim().length >= 2,
    staleTime: 60_000,
  });
}

/**
 * Does this name + website already exist as a company?
 *
 * Gated on a name, and re-run whenever the website changes — the website is what decides
 * whether a same-named row is the same business or a different one.
 */
export function useCompanyMatch(
  name: string,
  website?: string,
  contactEmail?: string,
) {
  return useQuery({
    queryKey: qk.admin.companyMatch(name, website ?? contactEmail ?? ""),
    queryFn: () => employerRequestApi.matchCompany(name, website, contactEmail),
    enabled: name.trim().length >= 2,
    staleTime: 30_000,
  });
}

/** Create a company from the approve dialog, then select it. */
export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      name: string;
      website?: string;
      contactEmail?: string;
    }) => employerRequestApi.createCompany(body),
    // Any cached search could now be missing this row.
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.admin.all }),
  });
}

/** A decision changes both the row and the queue it sits in. */
function invalidate(
  qc: ReturnType<typeof useQueryClient>,
  id: string,
): void {
  qc.invalidateQueries({ queryKey: qk.admin.employerRequest(id) });
  qc.invalidateQueries({ queryKey: qk.admin.all });
}
