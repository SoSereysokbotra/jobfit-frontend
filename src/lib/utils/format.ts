/**
 * Primitives used by the per-feature backend→frontend mappers
 * (src/features/<f>/api/<f>.mappers.ts).
 *
 * Display-side helpers (`formatSalaryRange`, `formatPostedDate`) already live in
 * `@/shared/types/shared.types` — these are the derivation helpers that feed them.
 */

/** Logo background tokens, mirroring the palette the mock job data used. */
const LOGO_BG_TOKENS = [
  "var(--color-primary-700)",
  "var(--color-info-600)",
  "var(--color-neutral-800)",
  "var(--color-primary-500)",
  "var(--color-info-500)",
  "var(--color-success-600)",
  "var(--color-warning-600)",
  "var(--color-primary-600)",
  "var(--color-primary-800)",
  "var(--color-neutral-700)",
  "var(--color-error-500)",
  "var(--color-success-500)",
] as const;

/**
 * Backend salaries are absolute yearly amounts; the frontend `Job` type carries
 * $K bounds. Returns a whole number of thousands.
 */
export function toSalaryK(amount: number | null | undefined): number {
  if (amount == null || !Number.isFinite(amount)) return 0;
  return Math.round(amount / 1000);
}

/**
 * Whole days between an ISO timestamp and now, floored at 0 so a
 * clock-skewed future date never renders as negative.
 */
export function daysSince(iso: string | Date | null | undefined): number {
  if (!iso) return 0;
  const then = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(then.getTime())) return 0;
  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000);
  return Math.max(0, days);
}

/**
 * 1–2 letter mark for a logo block. Uses the first letter of the first two
 * words ("Acme Corp" → "AC"), falling back to the first two letters of a
 * single word ("Stripe" → "ST").
 */
export function initialsFrom(name: string | null | undefined): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/**
 * Deterministic logo background token for a company, so the same company keeps
 * the same colour across renders and pages.
 */
export function logoBgFor(key: string | null | undefined): string {
  const source = key ?? "";
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) | 0;
  }
  return LOGO_BG_TOKENS[Math.abs(hash) % LOGO_BG_TOKENS.length];
}

/* ── Relative-date, currency & date helpers shared across trackers
   (applications, saved jobs, offers). ── */

/** "today" / "yesterday" / "5 days ago" / "2 weeks ago" */
export function formatDaysAgo(daysAgo: number): string {
  if (daysAgo <= 0) return "today";
  if (daysAgo === 1) return "yesterday";
  if (daysAgo < 14) return `${daysAgo} days ago`;
  return `${Math.round(daysAgo / 7)} weeks ago`;
}

/** "today" / "tomorrow" / "in 3 days" */
export function formatInDays(inDays: number): string {
  if (inDays <= 0) return "today";
  if (inDays === 1) return "tomorrow";
  return `in ${inDays} days`;
}

/** A future calendar date N days from today, e.g. "Jul 21". */
export function formatDateInDays(inDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + inDays);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Whole-dollar currency, e.g. 155000 → "$155,000". */
export function formatCurrency(amount: number): string {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

/** Compact currency for tight spaces, e.g. 201000 → "$201K". */
export function formatCurrencyShort(amount: number): string {
  if (amount >= 1000) return `$${Math.round(amount / 1000)}K`;
  return `$${Math.round(amount)}`;
}
