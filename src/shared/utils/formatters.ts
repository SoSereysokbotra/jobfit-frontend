/**
 * Locale-correct formatters using native standard `Intl` APIs.
 *
 * Requirements per UI_ENHANCEMENT_PLAN.md § Phase 5a:
 * - formatPostedDate: uses Intl.RelativeTimeFormat to return "today", "yesterday", "X days ago"
 * - formatSalaryRange / formatCurrency / formatNumber: uses Intl.NumberFormat
 * - formatDate: uses Intl.DateTimeFormat
 */

import { getStoredLocale } from "@/stores/locale-store";

/**
 * `getStoredLocale` lives in a "use client" module, and Next.js throws if a
 * Server Component invokes one of its exports — these formatters are called
 * from both sides. Resolve the stored locale only in the browser and fall back
 * to the default during SSR; the client re-renders with the real one after
 * hydration. (`readStoredLocale` already returned the default on the server, so
 * this preserves the previous output.)
 */
const SSR_FALLBACK_LOCALE = "en";

function resolveLocale(explicit?: string): string {
  if (explicit) return explicit;
  if (typeof window === "undefined") return SSR_FALLBACK_LOCALE;
  return getStoredLocale();
}

/**
 * Formats relative time from a number of days ago or date.
 * E.g. daysAgo = 0 -> "today", daysAgo = 1 -> "yesterday", daysAgo = 3 -> "3 days ago"
 */
export function formatPostedDate(daysAgo: number, locale?: string): string {
  const currentLocale = resolveLocale(locale);

  try {
    const rtf = new Intl.RelativeTimeFormat(currentLocale, { numeric: "auto" });

    if (daysAgo <= 0) {
      // 0 days ago -> "today" / "hoy" / "aujourd'hui"
      const formatted = rtf.format(0, "day");
      // Capitalize first letter for display title if desired
      return capitalizeFirst(formatted);
    }

    const formatted = rtf.format(-Math.round(daysAgo), "day");
    return capitalizeFirst(formatted);
  } catch {
    // Fallback if locale is unsupported
    if (daysAgo <= 0) return "Today";
    if (daysAgo === 1) return "Yesterday";
    return `${daysAgo} days ago`;
  }
}

/** How often a pay band is paid, when the posting said. */
export type SalaryPeriod = "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" | "ANNUAL";

/** The shape formatSalaryRange needs. Amounts are ABSOLUTE; null means "not stated". */
export interface SalaryBand {
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency?: string;
  salaryPeriod?: SalaryPeriod;
}

const PERIOD_SUFFIX: Record<SalaryPeriod, string> = {
  HOURLY: "/hr",
  DAILY: "/day",
  WEEKLY: "/wk",
  MONTHLY: "/mo",
  ANNUAL: "/yr",
};

/**
 * Abbreviate only where abbreviating cannot lose information.
 *
 * 140000 -> "140K" is safe. 1500 -> "1.5K" is noise, and 300 -> "0.3K" is worse than
 * useless. The old code appended "K" to every figure unconditionally, which is why a
 * Cambodian monthly salary could not be displayed at all.
 */
function abbreviate(amount: number, locale: string): string {
  if (amount >= 10000 && amount % 1000 === 0) {
    return `${amount / 1000}K`;
  }
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(amount);
}

/**
 * A pay band, or `null` when there is nothing truthful to show.
 *
 * RETURNS NULL RATHER THAN A PLACEHOLDER, and callers must render nothing for null.
 * 348 of 367 jobs have no salary; this used to render "$0K – $0K" for every one of them,
 * because the mapper turned a missing value into 0 and this function then formatted the
 * 0. A fact we do not have must not look like a fact we do.
 *
 * The currency and the period come from the JOB, not from this function's assumptions.
 * Both used to be hardcoded — "$" and "K" (meaning per-year) — on a corpus that is 83%
 * Cambodian. See MENTOR_REVIEW_2026-08-18 §12.
 *
 * An unknown period is rendered as no suffix at all. Writing "/yr" because most postings
 * we have seen are annual is precisely the guess this exists to remove.
 */
export function formatSalaryRange(
  job: SalaryBand,
  locale?: string,
  currencyOverride?: string
): string | null {
  const { salaryMin: min, salaryMax: max } = job;

  // Nothing stated, or a band that is only zeroes: not a salary.
  if (min == null || max == null) return null;
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  if (max <= 0) return null;

  const currentLocale = resolveLocale(locale);
  const currency = currencyOverride ?? job.salaryCurrency ?? "USD";
  const suffix = job.salaryPeriod ? PERIOD_SUFFIX[job.salaryPeriod] : "";

  try {
    // Intl puts the symbol where the locale expects it and knows KHR from USD, which is
    // the entire reason not to concatenate a "$" ourselves.
    const fmt = new Intl.NumberFormat(currentLocale, {
      style: "currency",
      currency,
      // ONE fraction digit, not zero. Compact notation with 0 digits rounds 1,200,000 to
      // "1M" — a 20% error, and precisely the kind of confident-but-wrong number this
      // function exists to stop producing. With 1 digit it reads "1.2M", while 140,000
      // still reads "140K" because there is no fraction to show.
      maximumFractionDigits: 1,
      notation: "compact",
      compactDisplay: "short",
    });
    const range = min === max ? fmt.format(min) : `${fmt.format(min)} – ${fmt.format(max)}`;
    return `${range}${suffix}`;
  } catch {
    // Unknown currency code or an Intl-less runtime. Show the real numbers with the code
    // spelled out rather than inventing a symbol for a currency we failed to parse.
    const range =
      min === max
        ? abbreviate(min, "en-US")
        : `${abbreviate(min, "en-US")} – ${abbreviate(max, "en-US")}`;
    return `${currency} ${range}${suffix}`;
  }
}

/**
 * Formats currency amount using Intl.NumberFormat.
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale?: string
): string {
  const currentLocale = resolveLocale(locale);
  try {
    return new Intl.NumberFormat(currentLocale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
}

/**
 * Formats date using Intl.DateTimeFormat.
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
  locale?: string
): string {
  const currentLocale = resolveLocale(locale);
  const d = date instanceof Date ? date : new Date(date);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  try {
    return new Intl.DateTimeFormat(currentLocale, options || defaultOptions).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}

/**
 * Formats a number with locale grouping.
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string {
  const currentLocale = resolveLocale(locale);
  try {
    return new Intl.NumberFormat(currentLocale, options).format(value);
  } catch {
    return value.toLocaleString();
  }
}

/**
 * Formats a date range, e.g. "Mar 2022 — Present" or "Jan 2020 — Dec 2021"
 */
export function formatDateRange(
  startDate: string | Date,
  endDate?: string | Date,
  isCurrent?: boolean,
  locale?: string
): string {
  const currentLocale = resolveLocale(locale);
  const fmt = (iso: string | Date) => {
    const d = iso instanceof Date ? iso : new Date(iso);
    return Number.isNaN(d.getTime())
      ? ""
      : formatDate(d, { month: "short", year: "numeric" }, currentLocale);
  };
  const start = fmt(startDate);
  const end = isCurrent || !endDate ? "Present" : fmt(endDate);
  return start ? `${start} — ${end}` : end;
}

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
