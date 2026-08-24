import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ResumePreview } from "./resume-preview";
import type {
  ResumeDocumentDetailDto,
  ResumeTemplateDto,
} from "../api/resume-builder.api";

/**
 * These lock the preview to the backend renderer's rules. Each expectation below
 * mirrors a specific branch in `resume-pdf.renderer.ts`; if that renderer changes,
 * these should fail rather than the preview quietly drifting back into showing
 * styling the export does not produce.
 */

const DOCUMENT: ResumeDocumentDetailDto = {
  id: "doc-1",
  userId: "u1",
  title: "My résumé",
  templateId: "tpl-1",
  // navy, so a template that forces black headings is distinguishable from one
  // that takes the colour scheme.
  colorScheme: "navy",
  lineSpacing: "DEFAULT",
  margin: "NORMAL",
  status: "DRAFT",
  fullName: "Ada Lovelace",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  summary: "Builds things.",
  experiences: [],
  educations: [],
  skills: [],
  certifications: [],
  projects: [],
};

function template(rules: Record<string, unknown>): ResumeTemplateDto {
  return {
    id: "tpl-1",
    name: "T",
    category: "c",
    thumbnailUrl: "/t.svg",
    isAtsFriendly: true,
    layoutConfig: { sections: ["header", "summary"], rules },
  };
}

/** The renderer's real `PRESET_COLORS` navy — not the picker's brighter swatch. */
const NAVY_INK = "rgb(27, 58, 92)";
const BLACK_INK = "rgb(17, 17, 17)";

function summaryHeading(): HTMLElement {
  return screen.getByRole("heading", { level: 3 });
}

describe("ResumePreview", () => {
  describe("Classic ATS — headingStyle 'uppercase-rule', accent 'none'", () => {
    const tpl = template({ headingStyle: "uppercase-rule", accent: "none" });

    it("uppercases the heading label", () => {
      render(<ResumePreview document={DOCUMENT} template={tpl} />);
      expect(summaryHeading()).toHaveTextContent("SUMMARY");
    });

    it("inks headings near-black despite the navy colour scheme", () => {
      render(<ResumePreview document={DOCUMENT} template={tpl} />);
      expect(summaryHeading()).toHaveStyle({ color: BLACK_INK });
    });

    it("still colours the name, which the renderer inks from the scheme", () => {
      render(<ResumePreview document={DOCUMENT} template={tpl} />);
      expect(screen.getByRole("heading", { level: 2 })).toHaveStyle({ color: NAVY_INK });
    });
  });

  describe("Modern Accent — headingStyle 'accent-bar', accent 'colorScheme'", () => {
    const tpl = template({ headingStyle: "accent-bar", accent: "colorScheme" });

    it("leaves the heading in title case", () => {
      render(<ResumePreview document={DOCUMENT} template={tpl} />);
      expect(summaryHeading()).toHaveTextContent("Summary");
      expect(summaryHeading()).toHaveStyle({ textTransform: "none" });
    });

    it("inks the heading from the colour scheme", () => {
      render(<ResumePreview document={DOCUMENT} template={tpl} />);
      expect(summaryHeading()).toHaveStyle({ color: NAVY_INK });
    });

    it("draws the heavier 1.5pt rule", () => {
      render(<ResumePreview document={DOCUMENT} template={tpl} />);
      // 1.5 / 612 * 100
      expect(summaryHeading()).toHaveStyle({
        borderBottomWidth: "max(0.5px, 0.2451cqw)",
      });
    });
  });

  describe("Compact Professional — headingStyle 'small-caps'", () => {
    const tpl = template({ headingStyle: "small-caps", accent: "heading-only" });

    /**
     * The regression. The renderer used to draw a rule only for 'uppercase-rule'
     * and 'accent-bar', so this template exported with no dividers while the
     * preview drew them anyway. The rule is unconditional on both sides now.
     */
    it("draws a divider rule", () => {
      render(<ResumePreview document={DOCUMENT} template={tpl} />);
      expect(summaryHeading()).toHaveStyle({
        borderBottomStyle: "solid",
        // 0.75 / 612 * 100
        borderBottomWidth: "max(0.5px, 0.1225cqw)",
      });
    });

    /** 'small-caps' is title case in the PDF — the base-14 fonts have no such feature. */
    it("does not fake small caps by uppercasing", () => {
      render(<ResumePreview document={DOCUMENT} template={tpl} />);
      expect(summaryHeading()).toHaveTextContent("Summary");
      expect(summaryHeading()).toHaveStyle({ textTransform: "none" });
    });
  });

  it("falls back to a plain rule and title case when the template has no rules", () => {
    render(<ResumePreview document={DOCUMENT} />);
    expect(summaryHeading()).toHaveTextContent("Summary");
    expect(summaryHeading()).toHaveStyle({
      borderBottomWidth: "max(0.5px, 0.1225cqw)",
      color: NAVY_INK,
    });
  });

  it("sizes the sheet to the renderer's page, not A4", () => {
    const { container } = render(<ResumePreview document={DOCUMENT} />);
    // LETTER, 612 x 792pt. Flip this when the backend flips `size:`.
    expect(container.firstChild).toHaveStyle({ aspectRatio: "612 / 792" });
  });
});
