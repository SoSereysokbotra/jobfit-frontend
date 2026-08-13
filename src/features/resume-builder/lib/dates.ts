/**
 * Date plumbing for the builder.
 *
 * The backend takes and returns full ISO date-times, but a résumé only ever
 * shows month + year, and `<input type="date">` only speaks `YYYY-MM-DD`. These
 * three conversions are the whole of it, kept together so a round-trip through
 * the editor cannot quietly shift a date by a day.
 *
 * Everything is done in UTC on purpose. Parsing `2020-01-01T00:00:00.000Z` with
 * local getters east of UTC yields 2019-12-31, which is how a start date drifts
 * backwards every time a user opens and saves a section.
 */

/** ISO date-time → `YYYY-MM-DD` for a date input. Empty string when absent. */
export function toDateInputValue(iso: string | undefined | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

/** `YYYY-MM-DD` → ISO date-time at UTC midnight. `undefined` when cleared. */
export function fromDateInputValue(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** ISO date-time → `Jan 2020`. Empty string when absent or unparseable. */
export function formatMonthYear(iso: string | undefined | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

/**
 * `Jan 2020 — Present` / `Jan 2020 — Jun 2022` / `Jan 2020`.
 *
 * `isCurrent` wins over `end`: a row flagged as the current job should read
 * "Present" even if a stale end date is still on it.
 */
export function formatDateRange(
  start: string | undefined | null,
  end: string | undefined | null,
  isCurrent = false,
): string {
  const from = formatMonthYear(start);
  const to = isCurrent ? "Present" : formatMonthYear(end);
  if (!from && !to) return "";
  if (!to) return from;
  if (!from) return to;
  return `${from} — ${to}`;
}

/** Today as `YYYY-MM-DD`, for seeding the required date on a new row. */
export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}
