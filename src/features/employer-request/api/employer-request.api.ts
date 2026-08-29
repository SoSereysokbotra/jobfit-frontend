/**
 * Employer onboarding — the admin review queue.
 *
 * Backed by the endpoints added in EMPLOYER_ONBOARDING_PLAN.md Phases 2-3. Employers
 * cannot self-register, so this queue is the only path to an EMPLOYER account: every
 * approval here creates one.
 */

import { apiClient } from "@/lib/api/client";

export type EmployerRequestStatus =
  | "SUBMITTED"
  | "REVIEWING"
  | "PENDING_INFO"
  | "APPROVED"
  | "REJECTED";

/** What the automated email-domain check found at first-login claim. Advisory only. */
export type DomainCheckResult = "MATCH" | "MISMATCH" | "NO_WEBSITE";

export interface EmployerRequest {
  id: string;
  companyName: string;
  companyEmail: string;
  contactName: string;
  contactRole: string;
  description: string;
  companyWebsite?: string;
  supportingDocsUrl?: string;
  status: EmployerRequestStatus;
  adminNotes?: string;
  reviewedByAdminId?: string;
  reviewedAt?: string;
  approvedUserId?: string;
  approvedCompanyId?: string;
  createdAt: string;
  /** Free consumer domain (gmail etc.) — lean on the documents, not the address. */
  isPublicDomain: boolean;
  /** Null once decided. */
  hoursAwaitingDecision: number | null;
  breachesSla: boolean;
  domainCheck?: DomainCheckResult;
}

export interface EmployerRequestList {
  items: EmployerRequest[];
  total: number;
}

export interface ListEmployerRequestsParams {
  status?: EmployerRequestStatus;
  search?: string;
  skip?: number;
  take?: number;
}

/** The transitions the admin drives directly. Approval has its own endpoint. */
export type ReviewableStatus = "REVIEWING" | "PENDING_INFO" | "REJECTED";

export interface AdminCompanyOption {
  id: string;
  name: string;
  website: string | null;
  logoUrl: string | null;
  isVerified: boolean;
  /** Already managed by an employer — one employer per company is the MVP rule. */
  isClaimed: boolean;
}

/** The six fields employer_logic.md v2.1 §4.1 requires. */
export interface CreateEmployerRequestInput {
  companyName: string;
  companyEmail: string;
  contactName: string;
  contactRole: string;
  description: string;
  companyWebsite?: string;
  supportingDocsUrl?: string;
}

export const employerRequestApi = {
  /**
   * Record a request the admin received by email or Telegram.
   *
   * ADMIN ONLY — §3.1 forbids employers registering through the website, so there is no
   * public intake path. The admin transcribes what the employer sent.
   */
  create: (input: CreateEmployerRequestInput) =>
    apiClient.post<{ id: string; message: string }>("/employer-requests", input),

  list: (params: ListEmployerRequestsParams = {}) =>
    apiClient.get<EmployerRequestList>("/admin/employer-requests", {
      query: { ...params },
    }),

  get: (id: string) =>
    apiClient.get<EmployerRequest>(`/admin/employer-requests/${id}`),

  /** REVIEWING / PENDING_INFO / REJECTED. A rejection requires `adminNotes`. */
  review: (id: string, body: { status: ReviewableStatus; adminNotes?: string }) =>
    apiClient.patch<EmployerRequest>(
      `/admin/employer-requests/${id}/review`,
      body,
    ),

  /**
   * Creates the account and emails a 6-digit activation code.
   *
   * Answers 409 when the address already belongs to a user — that is the conflict the
   * dialog resolves, and it is decided by the unique index inside the approval
   * transaction rather than by a prior read.
   */
  approve: (id: string, companyId: string) =>
    apiClient.post<EmployerRequest>(
      `/admin/employer-requests/${id}/approve`,
      { companyId },
    ),

  resendActivation: (id: string) =>
    apiClient.post<{ message: string }>(
      `/admin/employer-requests/${id}/resend-activation`,
    ),

  /** Company picker for the approve dialog. */
  searchCompanies: (search: string) =>
    apiClient.get<AdminCompanyOption[]>("/admin/companies", {
      query: { search, take: 20 },
    }),

  /**
   * Create a company so a brand-new employer can be approved onto one.
   *
   * The common case for a real employer: nothing has ingested a job for them, so no row
   * exists and the picker has nothing to offer. 409 when the name is already taken.
   */
  createCompany: (body: { name: string; website?: string }) =>
    apiClient.post<AdminCompanyOption>("/admin/companies", body),
};
