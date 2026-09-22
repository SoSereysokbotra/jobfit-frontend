// The employer dashboard chart used to be a hardcoded seven-month curve labelled
// "Sample". It now derives from the employer's own applications, so the bucketing has to
// be right: a miscounted month is a number an employer would act on.

import { describe, it, expect } from "vitest";
import { buildApplicationTrend } from "./employer.mappers";

// A fixed "now" so the trailing-window maths never depends on the day the suite runs.
const NOW = new Date(2026, 8, 23); // 23 Sep 2026

const applied = (iso: string) => ({ appliedAtISO: iso });

describe("buildApplicationTrend", () => {
  it("returns the trailing window ending at the current month", () => {
    const trend = buildApplicationTrend([], 6, NOW);
    expect(trend.map((p) => p.month)).toEqual(["Apr", "May", "Jun", "Jul", "Aug", "Sep"]);
  });

  it("keeps empty months as zeroes rather than dropping them", () => {
    // A new employer's chart is mostly zeroes; skipping them would compress the x-axis
    // and imply steady activity that never happened.
    const trend = buildApplicationTrend([applied("2026-09-02T10:00:00Z")], 6, NOW);
    expect(trend.map((p) => p.applications)).toEqual([0, 0, 0, 0, 0, 1]);
  });

  it("counts several applications into their own months", () => {
    const trend = buildApplicationTrend(
      [
        applied("2026-07-04T09:00:00Z"),
        applied("2026-07-19T09:00:00Z"),
        applied("2026-08-01T09:00:00Z"),
        applied("2026-09-23T09:00:00Z"),
      ],
      6,
      NOW,
    );
    expect(trend.find((p) => p.month === "Jul")?.applications).toBe(2);
    expect(trend.find((p) => p.month === "Aug")?.applications).toBe(1);
    expect(trend.find((p) => p.month === "Sep")?.applications).toBe(1);
  });

  it("ignores applications outside the window", () => {
    // Older than six months, and a same-month-name application from a year earlier —
    // the bucket key carries the year, so this must not land in "Sep".
    const trend = buildApplicationTrend(
      [applied("2025-09-23T09:00:00Z"), applied("2026-01-15T09:00:00Z")],
      6,
      NOW,
    );
    expect(trend.every((p) => p.applications === 0)).toBe(true);
  });

  it("skips malformed timestamps instead of inventing a point", () => {
    const trend = buildApplicationTrend([applied("not-a-date"), applied("")], 6, NOW);
    expect(trend.every((p) => p.applications === 0)).toBe(true);
  });
});
