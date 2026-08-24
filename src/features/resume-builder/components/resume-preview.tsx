"use client";

import React from "react";
import type {
  ResumeDocumentDetailDto,
  ResumeTemplateDto,
} from "../api/resume-builder.api";
import { formatDateRange, formatMonthYear } from "../lib/dates";
import {
  BODY_INK,
  FONT_POINTS,
  LINE_SPACING,
  MARGIN_POINTS,
  PAGE,
  cqw,
  cqwRule,
  headingInk,
  headingLabel,
  inkFor,
  ruleWidthPoints,
} from "../lib/renderer-metrics";

/**
 * Live preview — a scale model of the exported PDF.
 *
 * The backend renders with pdfkit and shares no code with this component, so this
 * is still a second implementation of the layout. What it no longer does is
 * invent its own typography: page ratio, margins, type scale, line spacing,
 * heading casing, rule weights and ink all come from `renderer-metrics`, which
 * mirrors the renderer. Anything this preview shows about SIZE, SPACING or COLOUR
 * is what the export produces.
 *
 * What it still approximates is the per-item CONTENT SHAPE — the renderer puts a
 * role's dates on their own line, prefixes technology lists with "Technologies:",
 * lists skills with their proficiency, and renders descriptions as bullets. Those
 * differences are real and outstanding; they are layout, not styling.
 *
 * Section order follows the template's `layoutConfig.sections` when present and
 * falls back to the renderer's own default order when the config is missing or
 * malformed.
 */

const DEFAULT_SECTION_ORDER = [
  "header",
  "summary",
  "experience",
  "education",
  "skills",
  "certifications",
  "projects",
] as const;

interface SectionHeadingProps {
  children: React.ReactNode;
  ink: string;
  /** `headingStyle === "uppercase-rule"` — the only case the renderer re-cases. */
  uppercase: boolean;
  rulePoints: number;
}

/**
 * A section heading and its rule.
 *
 * Both are unconditional, and both take `ink` rather than the document's accent
 * directly: a template with `accent: "none"` renders near-black headings in the
 * PDF even when the document carries a colour scheme.
 */
function SectionHeading({ children, ink, uppercase, rulePoints }: SectionHeadingProps) {
  return (
    <h3
      className="font-bold"
      style={{
        fontSize: cqw(FONT_POINTS.heading),
        color: ink,
        textTransform: uppercase ? "uppercase" : "none",
        borderBottomStyle: "solid",
        borderBottomWidth: cqwRule(rulePoints),
        borderBottomColor: ink,
        paddingBottom: "0.2em",
        marginBottom: "0.4em",
      }}
    >
      {children}
    </h3>
  );
}

interface ResumePreviewProps {
  document: ResumeDocumentDetailDto;
  template?: ResumeTemplateDto;
}

export function ResumePreview({ document, template }: ResumePreviewProps) {
  const rules = template?.layoutConfig?.rules;

  // The name takes the raw colour-scheme ink, headings take `headingInk` — the
  // renderer passes `accent` straight to its header pass and only applies the
  // `accent: "none"` override to headings, so on Classic ATS the name is coloured
  // while every heading below it is black.
  const nameInk = inkFor(document.colorScheme);
  const ink = headingInk(rules?.accent, document.colorScheme);

  const uppercase = rules?.headingStyle === "uppercase-rule";
  const rulePoints = ruleWidthPoints(rules?.headingStyle);
  const bullet = rules?.bullet ?? "•";

  const configured = template?.layoutConfig?.sections;
  const order =
    Array.isArray(configured) && configured.length > 0
      ? configured
      : [...DEFAULT_SECTION_ORDER];

  const contactLine = [document.email, document.phone, document.location]
    .filter((part) => part && part.trim())
    .join("  ·  ");

  const linkLine = [document.linkedinUrl, document.portfolioUrl]
    .filter((part) => part && part.trim())
    .join("  ·  ");

  const heading = (label: string) => (
    <SectionHeading ink={ink} uppercase={uppercase} rulePoints={rulePoints}>
      {headingLabel(rules?.headingStyle, label)}
    </SectionHeading>
  );

  const blocks: Record<string, React.ReactNode> = {
    header: (
      <header key="header" className="mb-[1em]">
        <h2
          className="font-bold tracking-tight"
          style={{ fontSize: cqw(FONT_POINTS.name), color: nameInk }}
        >
          {document.fullName?.trim() || "Your name"}
        </h2>
        {contactLine && <p className="mt-[0.2em]">{contactLine}</p>}
        {linkLine && <p className="mt-[0.1em] break-all">{linkLine}</p>}
      </header>
    ),

    summary: document.summary?.trim() ? (
      <section key="summary" className="mb-[1em]">
        {heading("Summary")}
        <p className="whitespace-pre-wrap">{document.summary}</p>
      </section>
    ) : null,

    experience: document.experiences.length > 0 ? (
      <section key="experience" className="mb-[1em]">
        {heading("Experience")}
        <div className="space-y-[0.6em]">
          {document.experiences.map((item) => (
            <div key={item.id}>
              <div className="flex items-baseline justify-between gap-[1em]">
                <p className="font-bold">
                  {item.title || "Role"}
                  {item.company && <span className="font-normal"> — {item.company}</span>}
                </p>
                <p className="shrink-0">
                  {formatDateRange(item.startDate, item.endDate, item.isCurrentJob)}
                </p>
              </div>
              {item.location && <p>{item.location}</p>}
              {item.description && (
                <p className="mt-[0.1em] whitespace-pre-wrap">{item.description}</p>
              )}
              {item.technologies.length > 0 && (
                <p className="mt-[0.1em]">{item.technologies.join(`  ${bullet}  `)}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,

    education: document.educations.length > 0 ? (
      <section key="education" className="mb-[1em]">
        {heading("Education")}
        <div className="space-y-[0.4em]">
          {document.educations.map((item) => (
            <div key={item.id} className="flex items-baseline justify-between gap-[1em]">
              <div className="min-w-0">
                <p className="font-bold">{item.institution || "Institution"}</p>
                <p>
                  {[item.fieldOfStudy, item.gpa != null ? `GPA ${item.gpa}` : ""]
                    .filter(Boolean)
                    .join("  ·  ")}
                </p>
              </div>
              <p className="shrink-0">{formatDateRange(item.startDate, item.endDate)}</p>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    skills: document.skills.length > 0 ? (
      <section key="skills" className="mb-[1em]">
        {heading("Skills")}
        <p>{document.skills.map((s) => s.name).join(`  ${bullet}  `)}</p>
      </section>
    ) : null,

    certifications: document.certifications.length > 0 ? (
      <section key="certifications" className="mb-[1em]">
        {heading("Certifications")}
        <div className="space-y-[0.3em]">
          {document.certifications.map((item) => (
            <div key={item.id} className="flex items-baseline justify-between gap-[1em]">
              <p>
                <span className="font-bold">{item.name || "Certification"}</span>
                {item.issuer && <span> — {item.issuer}</span>}
              </p>
              <p className="shrink-0">{formatMonthYear(item.issueDate)}</p>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    projects: document.projects.length > 0 ? (
      <section key="projects" className="mb-[1em]">
        {heading("Projects")}
        <div className="space-y-[0.4em]">
          {document.projects.map((item) => (
            <div key={item.id}>
              <p className="font-bold">{item.name || "Project"}</p>
              {item.description && <p>{item.description}</p>}
              {item.technologies.length > 0 && (
                <p>{item.technologies.join(`  ${bullet}  `)}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,
  };

  return (
    <div
      className="rounded-lg border mx-auto w-full"
      style={{
        background: "#FFFFFF",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
        // Exactly the renderer's page, so a full sheet here is a full page there.
        aspectRatio: `${PAGE.widthPoints} / ${PAGE.heightPoints}`,
        overflowY: "auto",
        // Makes the sheet's own width the reference for every `cqw` below, which
        // is what keeps the type scale correct at any panel size.
        containerType: "inline-size",
      }}
    >
      <div
        style={{
          padding: cqw(MARGIN_POINTS[document.margin]),
          fontSize: cqw(FONT_POINTS.body),
          lineHeight: LINE_SPACING[document.lineSpacing],
          // The renderer inks every non-heading glyph #111111 — it has no greys,
          // and no size below body, so the preview must not invent either.
          color: BODY_INK,
        }}
      >
        {order.map((name) => blocks[name] ?? null)}
      </div>
    </div>
  );
}
