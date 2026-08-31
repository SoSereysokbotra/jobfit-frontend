"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/api/query-keys";
import type { ApplicationStatus } from "@/features/application/api/application.api";
import {
  employerApi,
  type CreateJobInput,
  type UpdateCompanyInput,
} from "../api/employer.api";
import {
  toApplicantView,
  toCompanyView,
  toEmployerJobView,
} from "../api/employer.mappers";

// ── Company ──────────────────────────────────────────────────────────────────
export function useEmployerCompany() {
  return useQuery({
    queryKey: qk.employer.companyMe(),
    queryFn: () => employerApi.companyMe().then(toCompanyView),
    staleTime: 60_000,
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, input }: { companyId: string; input: UpdateCompanyInput }) =>
      employerApi.updateCompany(companyId, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.employer.companyMe() }),
  });
}

export function useVerifyCompanyEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (companyId: string) => employerApi.verifyCompanyEmail(companyId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.employer.companyMe() }),
  });
}

// ── Jobs ─────────────────────────────────────────────────────────────────────
export function useEmployerJobs() {
  return useQuery({
    queryKey: qk.employer.jobs(),
    queryFn: () => employerApi.listJobs().then((jobs) => jobs.map(toEmployerJobView)),
    staleTime: 30_000,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateJobInput) => employerApi.createJob(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.employer.jobs() }),
  });
}

export function usePublishJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => employerApi.publishJob(jobId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.employer.jobs() }),
  });
}

/**
 * A signed link to one candidate's CV, fetched only while the viewer is open.
 *
 * The URL is minted per request and expires, so it is never cached alongside the
 * application list and never persisted: `gcTime: 0` drops it as soon as the viewer
 * closes, so reopening always asks for a fresh one rather than rendering a dead link.
 * Pass null to fetch nothing.
 */
export function useResumeLink(applicationId: string | null) {
  return useQuery({
    queryKey: qk.employer.applicationResume(applicationId ?? ""),
    queryFn: () => employerApi.applicationResume(applicationId as string),
    enabled: Boolean(applicationId),
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}

export function useCloseJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => employerApi.closeJob(jobId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.employer.jobs() }),
  });
}

export function useJobAnalytics(jobId: string | undefined) {
  return useQuery({
    queryKey: qk.employer.jobAnalytics(jobId ?? ""),
    queryFn: () => employerApi.jobAnalytics(jobId as string),
    enabled: Boolean(jobId),
  });
}

// ── Applications (pipeline) ──────────────────────────────────────────────────
export function useEmployerApplications(jobId?: string) {
  return useQuery({
    queryKey: qk.employer.applications({ jobId: jobId ?? null }),
    queryFn: () =>
      employerApi.listApplications(jobId ? { jobId } : {}).then((rows) => rows.map(toApplicantView)),
    staleTime: 15_000,
  });
}

export function useUpdateApplicantStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newStatus, notes }: { id: string; newStatus: ApplicationStatus; notes?: string }) =>
      employerApi.updateApplicationStatus(id, newStatus, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.employer.all }),
    // Refetch on failure too. The backend refuses a move either because the transition is
    // illegal or because the board is stale — someone else already moved this candidate.
    // Resyncing to truth is what makes the next attempt meaningful rather than a re-guess.
    onError: () => qc.invalidateQueries({ queryKey: qk.employer.all }),
  });
}

export function useAddApplicantNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      employerApi.addApplicationNotes(id, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.employer.all }),
  });
}

