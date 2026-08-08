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

export interface OfferMessageDto {
  id: string;
  authorRole: "CANDIDATE" | "EMPLOYER";
  body: string;
  createdAt: string;
  /** Whether the recipient has seen it. */
  read: boolean;
}

/** The offer as the employer sees it, including the conversation. */
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
  /** @deprecated superseded by `messages`; always null on new offers. */
  notes: string | null;
  /** The negotiation, oldest first. */
  messages: OfferMessageDto[];
  /** Messages from the candidate this employer has not read. */
  unreadCount: number;
  createdAt: string;
  decidedAt: string | null;
  candidate: { id: string; name: string; email: string };
}

export const employerOfferApi = {
  /** Read the offer on an application. 404 when none has been extended. */
  get: (applicationId: string) =>
    apiClient.get<EmployerOfferDto>(`/employer/applications/${applicationId}/offer`),
  /** Reply to the candidate. Does not change the offer's status. */
  postMessage: (applicationId: string, body: string) =>
    apiClient.post<EmployerOfferDto>(
      `/employer/applications/${applicationId}/offer/messages`,
      { body },
    ),
  extend: (applicationId: string, input: ExtendOfferInput) =>
    apiClient.post(`/employer/applications/${applicationId}/offer`, input),
  withdraw: (applicationId: string) =>
    apiClient.post(`/employer/applications/${applicationId}/offer/withdraw`),
};
