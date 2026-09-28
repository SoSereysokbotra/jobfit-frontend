// The company-profile form built its PATCH body with `value || undefined`, which dropped
// every emptied field from the request. The server kept the old value, the refetch typed
// it back into the box, and clearing a field looked like a save that did nothing.

import { describe, it, expect } from "vitest";
import { buildCompanyUpdate, type CompanyProfileForm, type CompanyView } from "./employer.mappers";

const COMPANY: CompanyView = {
  id: "c-1",
  name: "Celonis",
  description: "Process mining.",
  website: "https://celonis.com",
  industry: "Software",
  size: "201-1,000 employees",
  foundedYear: 2011,
  isVerified: true,
  city: "Munich",
  state: "BY",
  country: "Germany",
  logoUrl: null,
};

const form = (over: Partial<CompanyProfileForm> = {}): CompanyProfileForm => ({
  name: "Celonis",
  description: "Process mining.",
  website: "https://celonis.com",
  industry: "Software",
  size: "201-1,000 employees",
  foundedYear: "2011",
  city: "Munich",
  state: "BY",
  country: "Germany",
  ...over,
});

describe("buildCompanyUpdate", () => {
  it("sends nothing when nothing changed", () => {
    expect(buildCompanyUpdate(COMPANY, form())).toEqual({});
  });

  it("sends only the field that changed", () => {
    expect(buildCompanyUpdate(COMPANY, form({ city: "Berlin" }))).toEqual({ city: "Berlin" });
  });

  it("sends an emptied field as \"\" instead of omitting it", () => {
    // The regression this file exists for: omitting the key left the old value standing.
    expect(buildCompanyUpdate(COMPANY, form({ description: "" }))).toEqual({ description: "" });
  });

  it("treats a whitespace-only field as cleared", () => {
    expect(buildCompanyUpdate(COMPANY, form({ industry: "   " }))).toEqual({ industry: "" });
  });

  it("does not report a change for surrounding whitespace alone", () => {
    expect(buildCompanyUpdate(COMPANY, form({ name: "  Celonis  " }))).toEqual({});
  });

  it("sends a changed founded year as a number", () => {
    expect(buildCompanyUpdate(COMPANY, form({ foundedYear: "2012" }))).toEqual({ foundedYear: 2012 });
  });

  it("skips a cleared founded year, which the DTO cannot express", () => {
    // `foundedYear?: number` has no value meaning "unset", so "" would be a 400.
    expect(buildCompanyUpdate(COMPANY, form({ foundedYear: "" }))).toEqual({});
  });

  it("fills a field that was empty on the server", () => {
    const blank = { ...COMPANY, website: "", foundedYear: null };
    expect(buildCompanyUpdate(blank, form({ website: "https://celonis.com" }))).toEqual({
      website: "https://celonis.com",
      foundedYear: 2011,
    });
  });

  it("collects several edits into one body", () => {
    const input = buildCompanyUpdate(COMPANY, form({ city: "Berlin", state: "", size: "1,000+ employees" }));
    expect(input).toEqual({ city: "Berlin", state: "", size: "1,000+ employees" });
  });
});
