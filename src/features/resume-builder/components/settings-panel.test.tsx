import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsPanel } from "./settings-panel";
import type {
  ResumeDocumentDetailDto,
  ResumeTemplateDto,
} from "../api/resume-builder.api";

/**
 * Each control maps to exactly one PATCH field. These assert the payload shape,
 * because the backend rejects anything off the preset lists — a swatch that sent
 * a hex value would be a 400 the user could not act on.
 */

const TEMPLATES: ResumeTemplateDto[] = [
  {
    id: "tpl-classic",
    name: "Classic ATS",
    category: "ats-friendly",
    thumbnailUrl: "/templates/classic-ats.svg",
    isAtsFriendly: true,
  },
  {
    id: "tpl-modern",
    name: "Modern Accent",
    category: "modern",
    thumbnailUrl: "/templates/modern-accent.svg",
    isAtsFriendly: true,
  },
];

const DOCUMENT: ResumeDocumentDetailDto = {
  id: "doc-1",
  userId: "u1",
  title: "Frontend Engineer",
  templateId: "tpl-classic",
  colorScheme: "default",
  lineSpacing: "DEFAULT",
  margin: "NORMAL",
  status: "DRAFT",
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  summary: "",
  experiences: [],
  educations: [],
  skills: [],
  certifications: [],
  projects: [],
};

function renderPanel(overrides: Partial<ResumeDocumentDetailDto> = {}) {
  const onUpdate = vi.fn();
  render(
    <SettingsPanel
      document={{ ...DOCUMENT, ...overrides }}
      templates={TEMPLATES}
      templatesLoading={false}
      onUpdate={onUpdate}
    />,
  );
  return { onUpdate };
}

describe("SettingsPanel", () => {
  it("sends the preset KEY when a colour swatch is picked, never a hex value", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderPanel();

    await user.click(screen.getByRole("radio", { name: "Navy" }));

    expect(onUpdate).toHaveBeenCalledWith({ colorScheme: "navy" });
  });

  it("marks the active colour as checked", () => {
    renderPanel({ colorScheme: "forest" });

    expect(screen.getByRole("radio", { name: "Forest" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Navy" })).not.toBeChecked();
  });

  // "Wide" is an option in BOTH groups, so every spacing/margin query is scoped
  // to its own radiogroup rather than searching the whole panel.
  const spacingGroup = () => within(screen.getByRole("radiogroup", { name: "Line spacing" }));
  const marginGroup = () => within(screen.getByRole("radiogroup", { name: "Margins" }));

  it("updates line spacing", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderPanel();

    await user.click(spacingGroup().getByRole("radio", { name: "Wide" }));

    expect(onUpdate).toHaveBeenCalledWith({ lineSpacing: "WIDE" });
  });

  it("updates margins", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderPanel();

    await user.click(marginGroup().getByRole("radio", { name: "Narrow" }));

    expect(onUpdate).toHaveBeenCalledWith({ margin: "NARROW" });
  });

  it("reflects the document's current spacing and margin as checked", () => {
    renderPanel({ lineSpacing: "SINGLE", margin: "WIDE" });

    expect(spacingGroup().getByRole("radio", { name: "Single" })).toBeChecked();
    expect(spacingGroup().getByRole("radio", { name: "Wide" })).not.toBeChecked();
    expect(marginGroup().getByRole("radio", { name: "Wide" })).toBeChecked();
  });

  it("switches template from the dialog and closes it", async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderPanel();

    expect(screen.getByText("Classic ATS")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /change/i }));
    await user.click(screen.getByRole("radio", { name: /Modern Accent template preview/i }));

    expect(onUpdate).toHaveBeenCalledWith({ templateId: "tpl-modern" });
    expect(screen.queryByText("Change template")).not.toBeInTheDocument();
  });
});
