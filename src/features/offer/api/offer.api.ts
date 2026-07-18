import type { Job } from "@/shared/types/shared.types";
import { MOCK_JOBS } from "@/features/job/api/job.api";
import type { BadgeVariant } from "@/shared/components/ui/badge";

/* Offers & Decisions (FR-SALARY-001/002) — Path 3C of the User Flows Guide.
   An offer wraps a Job with the full compensation package plus the user's
   decision state (status, deadline, notes). */

export type OfferStatus = "New" | "Reviewing" | "Negotiating" | "Accepted" | "Rejected";

/** Market salary benchmark for the role/location (percentile breakpoints). */
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
  /** Days until the offer deadline (drives the countdown). */
  deadlineInDays: number;
  /** Human start date, e.g. "Aug 4". */
  startDate: string;
  /** Base salary in whole dollars/year. */
  baseSalary: number;
  signingBonus?: number;
  /** Target annual bonus as a percentage of base. */
  annualBonusPct?: number;
  /** Equity grant. */
  stockShares?: number;
  stockPrice?: number;
  market: MarketBenchmark;
  notes: string;
}

/** Active = still being decided; Past = archived history. */
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

/** Estimated target annual bonus in dollars. */
export function annualBonusValue(offer: Offer): number {
  return offer.annualBonusPct ? (offer.baseSalary * offer.annualBonusPct) / 100 : 0;
}

/** Estimated equity value per year (grant spread across a 4-year vest). */
export function annualEquityValue(offer: Offer): number {
  if (!offer.stockShares || !offer.stockPrice) return 0;
  return (offer.stockShares * offer.stockPrice) / 4;
}

/**
 * Year-one total compensation: base + signing bonus + target annual bonus.
 * Equity is excluded from year 1 (standard 1-year cliff), matching the guide.
 */
export function yearOneComp(offer: Offer): number {
  return offer.baseSalary + (offer.signingBonus ?? 0) + annualBonusValue(offer);
}

const byId = (id: string): Job => {
  const job = MOCK_JOBS.find((j) => j.id === id);
  if (!job) throw new Error(`Unknown mock job id: ${id}`);
  return job;
};

/* Mock offers — reuse the shared job dataset so the dashboard, /applications
   and /offers stay consistent (HealthHub offer matches the Applications one). */
export const MOCK_OFFERS: Offer[] = [
  {
    id: "o1",
    job: byId("j6"), // HealthHub — Product Designer
    status: "New",
    receivedDaysAgo: 2,
    deadlineInDays: 5,
    startDate: "Aug 18",
    baseSalary: 135000,
    signingBonus: 10000,
    annualBonusPct: 12,
    stockShares: 400,
    stockPrice: 60,
    market: { p25: 120000, p50: 135000, p75: 150000, p90: 165000 },
    notes: "Base is at market median — ask about equity refresh before responding.",
  },
  {
    id: "o2",
    job: byId("j5"), // CloudBase — DevOps Lead
    status: "Negotiating",
    receivedDaysAgo: 6,
    deadlineInDays: 2,
    startDate: "Aug 4",
    baseSalary: 175000,
    signingBonus: 15000,
    annualBonusPct: 20,
    stockShares: 1000,
    stockPrice: 100,
    market: { p25: 150000, p50: 165000, p75: 185000, p90: 205000 },
    notes: "Countered at $185K citing 75th-percentile market data. Waiting to hear back.",
  },
  {
    id: "o3",
    job: byId("j12"), // GreenGrid — Full-Stack Engineer
    status: "Reviewing",
    receivedDaysAgo: 4,
    deadlineInDays: 9,
    startDate: "Sep 1",
    baseSalary: 140000,
    annualBonusPct: 15,
    stockShares: 600,
    stockPrice: 45,
    market: { p25: 125000, p50: 140000, p75: 158000, p90: 175000 },
    notes: "",
  },
  {
    id: "o4",
    job: byId("j9"), // Nexus AI — Machine Learning Engineer
    status: "Accepted",
    receivedDaysAgo: 40,
    deadlineInDays: -12,
    startDate: "Jul 7",
    baseSalary: 190000,
    signingBonus: 20000,
    annualBonusPct: 18,
    stockShares: 1200,
    stockPrice: 110,
    market: { p25: 165000, p50: 185000, p75: 210000, p90: 235000 },
    notes: "Negotiated base from $180K to $190K. Team culture was the deciding factor.",
  },
  {
    id: "o5",
    job: byId("j7"), // FinEdge — Frontend Developer (Contract)
    status: "Rejected",
    receivedDaysAgo: 30,
    deadlineInDays: -20,
    startDate: "—",
    baseSalary: 105000,
    annualBonusPct: 0,
    market: { p25: 100000, p50: 115000, p75: 130000, p90: 145000 },
    notes: "Below market and contract-only. Declined in favour of full-time roles.",
  },
];

/** Simulated network fetch for the user's offers. */
export async function fetchOffers(): Promise<Offer[]> {
  await new Promise((r) => setTimeout(r, 600));
  return MOCK_OFFERS;
}
