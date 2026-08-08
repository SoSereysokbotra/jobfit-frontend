/**
 * Employer offer actions — live `employer/applications/:id/offer` endpoints.
 * Extending an offer moves the application to the OFFER stage server-side.
 */

import { apiClient } from "@/lib/api/client";

export interface ExtendOfferInput {
  baseSalary: number;
  currency?: string;
  signingBonus?: number;
  annualBonusPct?: number;
  equityShares?: number;
  equityPrice?: number;
  startDate?: string;
  responseDeadline?: string;
  notes?: string;
}

/** The offer as the employer sees it, including the note thread. */
export interface EmployerOfferDto {
  id: string;
  applicationId: string;
  status: "EXTENDED" | "NEGOTIATING" | "ACCEPTED" | "DECLINED" | "WITHDRAWN";
  baseSalary: number;
  currency: string;
  signingBonus: number | null;
  annualBonusPct: number | null;
  equityShares: number | null;
  equityPrice: number | null;
  startDate: string | null;
  responseDeadline: string | null;
  /**
   * The thread on this offer, newline-separated: the employer's own note from when they
   * extended it, then each candidate message prefixed `[Candidate]`.
   */
  notes: string | null;
  createdAt: string;
  decidedAt: string | null;
  candidate: { id: string; name: string; email: string };
}

export const employerOfferApi = {
  /** Read the offer on an application. 404 when none has been extended. */
  get: (applicationId: string) =>
    apiClient.get<EmployerOfferDto>(`/employer/applications/${applicationId}/offer`),
  extend: (applicationId: string, input: ExtendOfferInput) =>
    apiClient.post(`/employer/applications/${applicationId}/offer`, input),
  withdraw: (applicationId: string) =>
    apiClient.post(`/employer/applications/${applicationId}/offer/withdraw`),
};
