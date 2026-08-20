// MENTOR_REVIEW_2026-08-18 §12 — the salary formatter invented a currency and a magnitude.
//
// The cases below are the real corpus, not hypotheticals: 348 of 367 jobs state no
// salary, the ones that do are US-style annual figures, and the product's target market
// quotes monthly pay in the hundreds. Each of those used to render wrongly.

import { describe, it, expect } from "vitest";
import { formatSalaryRange } from "./formatters";

const band = (over: Partial<Parameters<typeof formatSalaryRange>[0]> = {}) => ({
  salaryMin: 140000,
  salaryMax: 185000,
  salaryCurrency: "USD",
  salaryPeriod: "ANNUAL" as const,
  ...over,
});

describe("formatSalaryRange — nothing stated", () => {
  it("returns null when the posting has no salary", () => {
    // The dominant case: 348 of 367 jobs. This used to render "$0K – $0K".
    expect(formatSalaryRange({ salaryMin: null, salaryMax: null }, "en-US")).toBeNull();
  });

  it("returns null when only one bound is known", () => {
    expect(formatSalaryRange({ salaryMin: 1000, salaryMax: null }, "en-US")).toBeNull();
    expect(formatSalaryRange({ salaryMin: null, salaryMax: 1000 }, "en-US")).toBeNull();
  });

  it("returns null for a 0–0 band", () => {
    // What the old null-to-zero mapper produced. Zero pay is not a pay band.
    expect(formatSalaryRange({ salaryMin: 0, salaryMax: 0 }, "en-US")).toBeNull();
  });

  it("returns null rather than a placeholder string", () => {
    // A caller must be able to drop the whole element, icon included. "—" or "N/A"
    // would force every call site to string-compare to find out.
    const out = formatSalaryRange({ salaryMin: null, salaryMax: null }, "en-US");
    expect(out).not.toBe("");
    expect(out).toBeNull();
  });
});

describe("formatSalaryRange — magnitude", () => {
  it("does not append K to an absolute amount", () => {
    // The bug: 140000 rendered as "$140,000K".
    const out = formatSalaryRange(band(), "en-US")!;
    expect(out).not.toContain("140,000K");
    expect(out).toContain("140K");
  });

  it("keeps a low monthly salary readable instead of rounding it away", () => {
    // A $300/month Phnom Penh salary. The old pipeline rounded it to 0 thousands, so it
    // was indistinguishable from "no salary stated" — the corpus is 83% Cambodian.
    const out = formatSalaryRange(
      band({ salaryMin: 300, salaryMax: 500, salaryPeriod: "MONTHLY" }),
      "en-US",
    )!;
    expect(out).toContain("300");
    expect(out).toContain("500");
    expect(out).not.toContain("0K");
  });

  it("does not lose precision when compacting millions", () => {
    // 1,200,000 riel must not read as "1M" — that is a 20% error.
    const out = formatSalaryRange(
      band({ salaryMin: 1200000, salaryMax: 2000000, salaryCurrency: "KHR", salaryPeriod: "MONTHLY" }),
      "en-US",
    )!;
    expect(out).toContain("1.2M");
  });

  it("collapses a single-point band to one figure", () => {
    const out = formatSalaryRange(band({ salaryMin: 120000, salaryMax: 120000 }), "en-US")!;
    expect(out).not.toContain("–");
    expect(out).toContain("120K");
  });
});

describe("formatSalaryRange — currency", () => {
  it("uses the currency the job states, not a hardcoded dollar sign", () => {
    const out = formatSalaryRange(
      band({ salaryMin: 1200000, salaryMax: 2000000, salaryCurrency: "KHR", salaryPeriod: "MONTHLY" }),
      "en-US",
    )!;
    expect(out).toMatch(/KHR|៛/);
    expect(out).not.toContain("$");
  });

  it("falls back to USD only when the job states nothing", () => {
    const out = formatSalaryRange(
      { salaryMin: 140000, salaryMax: 185000 },
      "en-US",
    )!;
    expect(out).toContain("$");
  });

  it("shows the real numbers when the currency code is unusable", () => {
    // Never invent a symbol for a code Intl rejected.
    const out = formatSalaryRange(
      band({ salaryMin: 400, salaryMax: 800, salaryCurrency: "XYZ", salaryPeriod: "MONTHLY" }),
      "en-US",
    )!;
    expect(out).toContain("400");
    expect(out).toContain("800");
  });
});

describe("formatSalaryRange — period", () => {
  it("says /yr for an annual band", () => {
    expect(formatSalaryRange(band(), "en-US")).toContain("/yr");
  });

  it("says /mo for a monthly band", () => {
    const out = formatSalaryRange(
      band({ salaryMin: 300, salaryMax: 500, salaryPeriod: "MONTHLY" }),
      "en-US",
    )!;
    expect(out).toContain("/mo");
  });

  it("claims NO period when the posting did not state one", () => {
    // The core of §12: an unknown period must not silently become "per year".
    const out = formatSalaryRange(
      { salaryMin: 24000, salaryMax: 42000, salaryCurrency: "USD" },
      "en-US",
    )!;
    expect(out).not.toContain("/yr");
    expect(out).not.toContain("/mo");
    expect(out).toContain("24K");
  });

  it("renders 500/month and 500/year differently", () => {
    // They are the same integer. Without the period, they were the same string too.
    const monthly = formatSalaryRange(
      { salaryMin: 500, salaryMax: 500, salaryPeriod: "MONTHLY" },
      "en-US",
    );
    const annual = formatSalaryRange(
      { salaryMin: 500, salaryMax: 500, salaryPeriod: "ANNUAL" },
      "en-US",
    );
    expect(monthly).not.toBe(annual);
  });
});
