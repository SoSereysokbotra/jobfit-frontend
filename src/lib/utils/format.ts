/* Relative-date, currency & date helpers shared across trackers
   (applications, saved jobs, offers). */

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
