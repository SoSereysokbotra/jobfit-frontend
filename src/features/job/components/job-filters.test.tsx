import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { JobFilters } from "./job-filters";
import { JobRecommendationFilters } from "./job-recommendation-filters";
import { useFilterPanelCollapse } from "./filter-panel-shell";
import { COLLAPSE_STORAGE_KEYS } from "@/shared/hooks/use-collapsed-sections";
import type { Job } from "@/shared/types/shared.types";

const STORAGE_KEY = COLLAPSE_STORAGE_KEYS.jobFilters;

const JOBS = [
  {
    id: "j1",
    title: "Engineer",
    company: "Acme",
    location: "Phnom Penh",
    type: "Full-time",
    level: "Senior",
    industry: "Technology",
    remote: "Remote",
    postedAt: new Date().toISOString(),
    salaryMin: 100,
    salaryMax: 150,
  },
  {
    id: "j2",
    title: "Designer",
    company: "Globex",
    location: "Siem Reap",
    type: "Part-time",
    level: "Mid-level",
    industry: "Design",
    remote: "On-site",
    postedAt: new Date().toISOString(),
    salaryMin: 60,
    salaryMax: 90,
  },
] as unknown as Job[];

/**
 * A host that owns the filter state the way the real page does, so a collapse can
 * be shown not to disturb it.
 */
function Host({ collapsible = true }: { collapsible?: boolean }) {
  const collapse = useFilterPanelCollapse(STORAGE_KEY);
  const [types, setTypes] = React.useState<string[]>([]);

  const filters = {
    query: "",
    types,
    remote: [],
    levels: [],
    locations: [],
    industries: [],
    salaryMin: 0,
    matchMin: 0,
    postedWithin: null,
  } as never;

  return (
    <JobFilters
      jobs={JOBS}
      filters={filters}
      toggleFilter={(key, value) => {
        if (key !== "types") return;
        setTypes((prev) =>
          prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
        );
      }}
      setFilter={() => {}}
      clearFilters={() => setTypes([])}
      activeFilterCount={types.length}
      collapse={collapse}
      collapsible={collapsible}
    />
  );
}

function header(name: string | RegExp): HTMLElement {
  return screen.getByRole("button", { name });
}

function panelFor(name: string | RegExp): HTMLElement {
  const id = header(name).getAttribute("aria-controls");
  const panel = document.getElementById(id ?? "");
  if (!panel) throw new Error(`no panel for ${name}`);
  return panel;
}

/**
 * Collapsed content stays mounted so the close can animate — "hidden" is a
 * zero-height grid row whose contents are `inert`, not removal from the DOM.
 */
function expectCollapsed(name: string | RegExp) {
  expect(header(name)).toHaveAttribute("aria-expanded", "false");
  expect(panelFor(name).className).toContain("grid-rows-[0fr]");
  expect(panelFor(name).firstElementChild).toHaveAttribute("inert");
}

function expectExpanded(name: string | RegExp) {
  expect(header(name)).toHaveAttribute("aria-expanded", "true");
  expect(panelFor(name).className).toContain("grid-rows-[1fr]");
  expect(panelFor(name).firstElementChild).not.toHaveAttribute("inert");
}

/** The rail shown in place of the panel once it is fully collapsed. */
function rail(): HTMLElement | null {
  return screen.queryByRole("button", { name: /show refine your search/i });
}

describe("JobFilters collapsible panel", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts fully expanded — panel and every sub-section", () => {
    render(<Host />);

    expect(rail()).toBeNull();
    expectExpanded("Employment Type");
    expectExpanded("Remote Flexibility");
    expectExpanded("Location");
  });

  // ── whole panel ──

  it("collapses the whole panel to a rail, and re-expands from it", async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.click(header(/^Refine your search$/));

    // The sections are gone with it, but a way back remains.
    expect(screen.queryByText("Employment Type")).toBeNull();
    expect(rail()).toBeInTheDocument();

    await user.click(rail()!);

    expect(rail()).toBeNull();
    expectExpanded("Employment Type");
  });

  it("does not offer the whole-panel collapse where it is not enabled", () => {
    // The mobile drawer's case: sub-sections still collapse, the panel does not.
    render(<Host collapsible={false} />);

    expect(screen.queryByRole("button", { name: /^Refine your search$/ })).toBeNull();
    expect(screen.getByRole("heading", { name: "Refine your search" })).toBeInTheDocument();
    expectExpanded("Employment Type");
  });

  it("keeps a saved panel collapse from emptying the drawer", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ __panel__: true }));

    render(<Host collapsible={false} />);

    expect(rail()).toBeNull();
    expect(screen.getByText("Employment Type")).toBeInTheDocument();
  });

  // ── sub-sections ──

  it("collapses one sub-section without touching its neighbours or the panel", async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.click(header("Employment Type"));

    expectCollapsed("Employment Type");
    expectExpanded("Remote Flexibility");
    // The panel itself is untouched — no rail.
    expect(rail()).toBeNull();
  });

  it("keeps the sub-section header visible while collapsed", async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.click(header("Employment Type"));

    expect(header("Employment Type")).toBeVisible();
  });

  it("re-expands sub-sections independently of the whole-panel toggle", async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.click(header("Employment Type"));
    await user.click(header(/^Refine your search$/)); // collapse whole panel
    await user.click(rail()!); // and back

    // The sub-section's own state survived the panel round-trip.
    expectCollapsed("Employment Type");
    expectExpanded("Remote Flexibility");
  });

  // ── selections survive collapsing ──

  it("keeps an active selection when its section is collapsed", async () => {
    const user = userEvent.setup();
    render(<Host />);

    const section = panelFor("Employment Type");
    await user.click(within(section).getByText("Full-time"));

    expect(screen.getByRole("button", { name: /clear all \(1\)/i })).toBeInTheDocument();

    await user.click(header("Employment Type"));
    expectCollapsed("Employment Type");

    // Still applied, and still checked underneath.
    expect(screen.getByRole("button", { name: /clear all \(1\)/i })).toBeInTheDocument();
    expect(within(panelFor("Employment Type")).getByRole("checkbox", { name: /full-time/i }))
      .toBeChecked();
  });

  it("keeps an active selection when the whole panel is collapsed", async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.click(within(panelFor("Employment Type")).getByText("Full-time"));
    await user.click(header(/^Refine your search$/));

    // The rail reports the count rather than losing it.
    expect(within(rail()!).getByText("1")).toBeInTheDocument();

    await user.click(rail()!);
    expect(screen.getByRole("button", { name: /clear all \(1\)/i })).toBeInTheDocument();
  });

  it("does not toggle the panel when Clear all is pressed", async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.click(within(panelFor("Employment Type")).getByText("Full-time"));
    await user.click(screen.getByRole("button", { name: /clear all \(1\)/i }));

    // Cleared, and the panel is still open.
    expect(screen.queryByRole("button", { name: /clear all/i })).toBeNull();
    expect(rail()).toBeNull();
  });

  // ── persistence ──

  it("persists a collapsed sub-section across a remount", async () => {
    const user = userEvent.setup();
    const first = render(<Host />);

    await user.click(header("Employment Type"));
    expectCollapsed("Employment Type");

    first.unmount();
    render(<Host />);

    expectCollapsed("Employment Type");
    expectExpanded("Remote Flexibility");
  });

  it("persists a collapsed panel across a remount", async () => {
    const user = userEvent.setup();
    const first = render(<Host />);

    await user.click(header(/^Refine your search$/));

    first.unmount();
    render(<Host />);

    expect(rail()).toBeInTheDocument();
  });

  it("writes one object holding both the panel and its sections", async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.click(header("Location"));
    await user.click(header(/^Refine your search$/));

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}")).toEqual({
      Location: true,
      __panel__: true,
    });
  });

  it("stays out of the sidebar's storage key", async () => {
    const user = userEvent.setup();
    render(<Host />);

    await user.click(header("Location"));

    expect(window.localStorage.getItem(COLLAPSE_STORAGE_KEYS.sidebar)).toBeNull();
  });

  it("ignores a malformed saved value instead of throwing", () => {
    window.localStorage.setItem(STORAGE_KEY, "not json");

    render(<Host />);

    expectExpanded("Employment Type");
  });
});

/**
 * Recommendations is a SEPARATE component from Search Jobs — it only shares
 * `FilterSection` and the panel shell. These confirm the shared pieces actually
 * reached it, rather than assuming the second page came along for free.
 */
describe("JobRecommendationFilters collapsible panel", () => {
  function RecommendationHost({ collapsible = true }: { collapsible?: boolean }) {
    const collapse = useFilterPanelCollapse(COLLAPSE_STORAGE_KEYS.recommendationFilters);
    const filters = {
      query: "", types: [], remote: [], levels: [], locations: [], industries: [],
      salaryMin: 0, matchMin: 70, postedWithin: null,
    } as never;

    return (
      <JobRecommendationFilters
        jobs={JOBS}
        filters={filters}
        toggleFilter={() => {}}
        setFilter={() => {}}
        clearFilters={() => {}}
        activeFilterCount={0}
        collapse={collapse}
        collapsible={collapsible}
      />
    );
  }

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts fully expanded", () => {
    render(<RecommendationHost />);
    expectExpanded("Match Score");
    expectExpanded("Company Industry");
  });

  it("collapses its own sub-sections", async () => {
    const user = userEvent.setup();
    render(<RecommendationHost />);

    await user.click(header("Match Score"));

    expectCollapsed("Match Score");
    expectExpanded("Location");
  });

  it("collapses the whole panel to a rail", async () => {
    const user = userEvent.setup();
    render(<RecommendationHost />);

    await user.click(header(/^Filter Matches$/));

    const railButton = screen.getByRole("button", { name: /show filter matches/i });
    expect(railButton).toBeInTheDocument();

    await user.click(railButton);
    expectExpanded("Match Score");
  });

  it("keeps its preference separate from the Search Jobs panel", async () => {
    const user = userEvent.setup();
    render(<RecommendationHost />);

    await user.click(header("Location"));

    expect(
      JSON.parse(window.localStorage.getItem(COLLAPSE_STORAGE_KEYS.recommendationFilters) ?? "{}"),
    ).toEqual({ Location: true });
    expect(window.localStorage.getItem(COLLAPSE_STORAGE_KEYS.jobFilters)).toBeNull();
  });
});
