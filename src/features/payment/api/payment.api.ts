/**
 * Plans & billing.
 *
 * TODO(backend): there is no billing/payments backend (the Stripe webhook route is a
 * stub). Plan definitions live here behind a real async interface; when checkout +
 * subscription endpoints land, swap these functions and the pricing/billing UI keeps
 * working (INTEGRATION_PLAN.md Phase 10).
 */

export interface Plan {
  id: "free" | "pro" | "enterprise";
  name: string;
  priceMonthly: number;
  tagline: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    tagline: "Everything to start your search.",
    features: ["Browse & apply to jobs", "Track up to 10 applications", "1 resume", "Basic match scores"],
    cta: "Get started",
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 19,
    tagline: "For a serious, active search.",
    features: ["Unlimited applications", "Unlimited resumes + ATS scoring", "Personalized recommendations", "Skill-gap learning paths", "Priority support"],
    highlighted: true,
    cta: "Upgrade to Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: 49,
    tagline: "For teams and power users.",
    features: ["Everything in Pro", "Salary insights & benchmarking", "Interview preparation", "Dedicated success manager"],
    cta: "Contact sales",
  },
];

export interface Billing {
  planId: Plan["id"];
  renewsAt: string | null;
}

export const paymentApi = {
  /** Available subscription plans. */
  plans: async (): Promise<Plan[]> => [...PLANS],

  /** The current user's billing state (mock: everyone is on Free). */
  billing: async (): Promise<Billing> => ({ planId: "free", renewsAt: null }),
};
