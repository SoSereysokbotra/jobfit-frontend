/**
 * Offers & Decisions — backed by the live `offers` endpoints (JWT-scoped to the
 * current user). Employers extend offers from the applicant pipeline; this feature
 * lists them and drives accept / decline / negotiate.
 *
 * Note: market-benchmark data has no backend source, so `market` is optional and the
 * card hides that section when it's absent (product decision — dropped for now).
 */

import type { Job } from "@/shared/types/shared.types";
import type { BadgeVariant } from "@/shared/components/ui/badge";
import { apiClient } from "@/lib/api/client";
import { daysSince, initialsFrom, logoBgFor, toSalaryK } from "@/lib/utils/format";

export type OfferStatus = "New" | "Reviewing" | "Negotiating" | "Accepted" | "Rejected";

/** Market salary benchmark (optional — no backend source today). */
export interface MarketBenchmark {
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface Offer {
  id: string;
  job: Job;
  status: OfferStatus;
  receivedDaysAgo: number;
  deadlineInDays: number;
  startDate: string;
  baseSalary: number;
  signingBonus?: number;
  annualBonusPct?: number;
  stockShares?: number;
  stockPrice?: number;
  /** Absent when no benchmark is available. */
  market?: MarketBenchmark;
  notes: string;
}

export const ACTIVE_STATUSES: OfferStatus[] = ["New", "Reviewing", "Negotiating"];
export const PAST_STATUSES: OfferStatus[] = ["Accepted", "Rejected"];

export const OFFER_STATUS_CONFIG: Record<OfferStatus, { label: string; badge: BadgeVariant }> = {
  New: { label: "New offer", badge: "info" },
  Reviewing: { label: "Reviewing", badge: "warning" },
  Negotiating: { label: "Negotiating", badge: "primary" },
  Accepted: { label: "Accepted", badge: "success" },
  Rejected: { label: "Declined", badge: "neutral" },
};

/* ── Compensation math ──────────────────────────────────────── */
export function annualBonusValue(offer: Offer): number {
  return offer.annualBonusPct ? (offer.baseSalary * offer.annualBonusPct) / 100 : 0;
}
export function annualEquityValue(offer: Offer): number {
  if (!offer.stockShares || !offer.stockPrice) return 0;
  return (offer.stockShares * offer.stockPrice) / 4;
}
export function yearOneComp(offer: Offer): number {
  return offer.baseSalary + (offer.signingBonus ?? 0) + annualBonusValue(offer);
}

/* ── Backend contract ───────────────────────────────────────── */
type BackendOfferStatus = "EXTENDED" | "NEGOTIATING" | "ACCEPTED" | "DECLINED" | "WITHDRAWN";

interface OfferDto {
  id: string;
  applicationId: string;
  status: BackendOfferStatus;
  baseSalary: number;
  currency: string;
  signingBonus: number | null;
  annualBonusPct: number | null;
  equityShares: number | null;
  equityPrice: number | null;
  startDate: string | null;
  responseDeadline: string | null;
  notes: string | null;
  createdAt: string;
  decidedAt: string | null;
  job: {
    id: string;
    title: string;
    companyName: string | null;
    location: string | null;
    remoteType: string;
    minSalary: number | null;
    maxSalary: number | null;
  };
}

const STATUS_MAP: Record<BackendOfferStatus, OfferStatus> = {
  EXTENDED: "New",
  NEGOTIATING: "Negotiating",
  ACCEPTED: "Accepted",
  DECLINED: "Rejected",
  WITHDRAWN: "Rejected",
};

const REMOTE_LABEL: Record<string, Job["remote"]> = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ON_SITE: "On-site",
  ONSITE: "On-site",
};

function daysUntil(iso: string | null): number {
  if (!iso) return 14; // no deadline set — soft default for the countdown
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function shortDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Build the offer's Job view from the embedded (minimal) job projection. */
function jobOf(j: OfferDto["job"]): Job {
  return {
    id: j.id,
    title: j.title,
    company: j.companyName?.trim() || "Company",
    logo: initialsFrom(j.companyName ?? j.title),
    logoBg: logoBgFor(j.id),
    location: j.location?.trim() || (REMOTE_LABEL[j.remoteType] === "Remote" ? "Remote" : "—"),
    salaryMin: toSalaryK(j.minSalary ?? undefined),
    salaryMax: toSalaryK(j.maxSalary ?? undefined),
    match: 0,
    type: "Full-time",
    remote: REMOTE_LABEL[(j.remoteType ?? "").toUpperCase()] ?? "On-site",
    level: "Mid-level",
    industry: "Technology",
    postedDaysAgo: 0,
    description: "",
  };
}

export function toOffer(dto: OfferDto): Offer {
  return {
    id: dto.id,
    job: jobOf(dto.job),
    status: STATUS_MAP[dto.status] ?? "New",
    receivedDaysAgo: daysSince(dto.createdAt),
    deadlineInDays: daysUntil(dto.responseDeadline),
    startDate: shortDate(dto.startDate),
    baseSalary: dto.baseSalary,
    signingBonus: dto.signingBonus ?? undefined,
    annualBonusPct: dto.annualBonusPct ?? undefined,
    stockShares: dto.equityShares ?? undefined,
    stockPrice: dto.equityPrice ?? undefined,
    market: undefined, // TODO(backend): no salary-benchmark source
    notes: dto.notes ?? "",
  };
}

export const offerApi = {
  /** GET /offers → the current user's offers. */
  list: () => apiClient.get<OfferDto[]>("/offers"),
  accept: (id: string) => apiClient.post<OfferDto>(`/offers/${id}/accept`),
  decline: (id: string) => apiClient.post<OfferDto>(`/offers/${id}/decline`),
  negotiate: (id: string, notes: string) =>
    apiClient.post<OfferDto>(`/offers/${id}/negotiate`, { notes }),
};

/** The user's offers, mapped to the view model. Keeps the old call-site name. */
export async function fetchOffers(): Promise<Offer[]> {
  const dtos = await offerApi.list();
  return dtos.map(toOffer);
}
