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

export const employerOfferApi = {
  extend: (applicationId: string, input: ExtendOfferInput) =>
    apiClient.post(`/employer/applications/${applicationId}/offer`, input),
  withdraw: (applicationId: string) =>
    apiClient.post(`/employer/applications/${applicationId}/offer/withdraw`),
};
