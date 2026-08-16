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
 * Formats relative time from a number of days ago or date.
 * E.g. daysAgo = 0 -> "today", daysAgo = 1 -> "yesterday", daysAgo = 3 -> "3 days ago"
 */
export function formatPostedDate(daysAgo: number, locale?: string): string {
  const currentLocale = locale || getStoredLocale();

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

/**
 * Formats a salary range with locale-aware number formatting.
 * E.g. { salaryMin: 120, salaryMax: 150 } -> "$120K – $150K" or "120K € – 150K €"
 */
export function formatSalaryRange(
  job: { salaryMin: number; salaryMax: number },
  locale?: string,
  currency: string = "USD"
): string {
  const currentLocale = locale || getStoredLocale();

  try {
    // Determine symbol or format
    if (currency === "USD") {
      const min = new Intl.NumberFormat(currentLocale, { maximumFractionDigits: 0 }).format(job.salaryMin);
      const max = new Intl.NumberFormat(currentLocale, { maximumFractionDigits: 0 }).format(job.salaryMax);
      return `$${min}K – $${max}K`;
    }

    const fmt = new Intl.NumberFormat(currentLocale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    return `${fmt.format(job.salaryMin * 1000)} – ${fmt.format(job.salaryMax * 1000)}`;
  } catch {
    return `$${job.salaryMin}K – $${job.salaryMax}K`;
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
  const currentLocale = locale || getStoredLocale();
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
  const currentLocale = locale || getStoredLocale();
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
  const currentLocale = locale || getStoredLocale();
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
  const currentLocale = locale || getStoredLocale();
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
