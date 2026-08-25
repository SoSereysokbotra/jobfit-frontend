import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

let pathname = "/dashboard";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ logout: vi.fn() }),
}));

vi.mock("@/features/auth/hooks/use-session", () => ({
  useSession: () => ({ user: null }),
  displayName: () => ({ fullName: "Ada Lovelace", initials: "AL" }),
}));

import Sidebar, { type SidebarMenuGroup } from "./sidebar";

const STORAGE_KEY = "jobfit:sidebar-collapsed-sections";

/**
 * Deliberately not the real NAVIGATION_GROUPS: the first group here has an empty
 * label to cover the always-visible case, and fixing the rest keeps these tests
 * from breaking every time the navigation config is reshuffled.
 */
const GROUPS: SidebarMenuGroup[] = [
  {
    group: "",
    items: [{ href: "/dashboard", label: "Dashboard", icon: null }],
  },
  {
    group: "DISCOVERY",
    items: [
      { href: "/jobs", label: "Search Jobs", icon: null },
      { href: "/saved-jobs", label: "Saved Jobs", icon: null },
    ],
  },
  {
    group: "YOUR JOURNEY",
    items: [{ href: "/applications", label: "Applications", icon: null }],
  },
];

function renderSidebar() {
  return render(<Sidebar menuGroups={GROUPS} />);
}

function header(name: string): HTMLElement {
  return screen.getByRole("button", { name: new RegExp(name, "i") });
}

/** The animated panel a header controls. */
function panelFor(name: string): HTMLElement {
  const id = header(name).getAttribute("aria-controls");
  const panel = document.getElementById(id ?? "");
  if (!panel) throw new Error(`no panel for section ${name}`);
  return panel;
}

/**
 * Collapsed items stay mounted so the close can animate, so "hidden" is the panel
 * being clipped to a zero-height grid row with its contents made `inert` — not
 * removal from the DOM. These assert that mechanism.
 */
function expectCollapsed(name: string) {
  expect(header(name)).toHaveAttribute("aria-expanded", "false");
  expect(panelFor(name).className).toContain("grid-rows-[0fr]");
  expect(panelFor(name).firstElementChild).toHaveAttribute("inert");
}

function expectExpanded(name: string) {
  expect(header(name)).toHaveAttribute("aria-expanded", "true");
  expect(panelFor(name).className).toContain("grid-rows-[1fr]");
  expect(panelFor(name).firstElementChild).not.toHaveAttribute("inert");
}

describe("Sidebar collapsible sections", () => {
  beforeEach(() => {
    pathname = "/dashboard";
    window.localStorage.clear();
  });

  it("starts with every section expanded when nothing is saved", () => {
    renderSidebar();
    expectExpanded("DISCOVERY");
    expectExpanded("YOUR JOURNEY");
  });

  it("gives a section with no label no toggle, so it can never be hidden", () => {
    renderSidebar();
    // Two headers for three groups — the unlabelled one renders none.
    expect(screen.getAllByRole("button", { name: /DISCOVERY|YOUR JOURNEY/ })).toHaveLength(2);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("toggles its own items when a section header is clicked", async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(header("DISCOVERY"));
    expectCollapsed("DISCOVERY");
    // Its neighbour is unaffected.
    expectExpanded("YOUR JOURNEY");

    await user.click(header("DISCOVERY"));
    expectExpanded("DISCOVERY");
  });

  it("keeps the section header itself visible while collapsed", async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(header("DISCOVERY"));

    expect(header("DISCOVERY")).toBeVisible();
  });

  it("persists a collapsed section across a remount", async () => {
    const user = userEvent.setup();
    const first = renderSidebar();

    await user.click(header("DISCOVERY"));
    expectCollapsed("DISCOVERY");

    // A real reload: nothing survives but localStorage.
    first.unmount();
    renderSidebar();

    expectCollapsed("DISCOVERY");
    expectExpanded("YOUR JOURNEY");
  });

  it("writes the preference as one object keyed by section id", async () => {
    const user = userEvent.setup();
    renderSidebar();

    await user.click(header("YOUR JOURNEY"));

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}")).toEqual({
      "YOUR JOURNEY": true,
    });
  });

  it("expands the active route's section even when saved as collapsed", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ DISCOVERY: true }));
    pathname = "/jobs";

    renderSidebar();

    expectExpanded("DISCOVERY");
  });

  it("honours a saved collapse for sections that do not hold the active route", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ DISCOVERY: true, "YOUR JOURNEY": true }),
    );
    pathname = "/jobs";

    renderSidebar();

    expectExpanded("DISCOVERY");
    expectCollapsed("YOUR JOURNEY");
  });

  it("expands the section owning a nested active route", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ "YOUR JOURNEY": true }));
    pathname = "/applications/abc-123";

    renderSidebar();

    expectExpanded("YOUR JOURNEY");
  });

  it("ignores a malformed saved value instead of throwing", () => {
    window.localStorage.setItem(STORAGE_KEY, "not json");

    renderSidebar();

    expectExpanded("DISCOVERY");
  });
});
