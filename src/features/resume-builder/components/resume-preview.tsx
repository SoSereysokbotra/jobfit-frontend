"use client";

import React from "react";
import {
  COLOR_SCHEME_SWATCH,
  type ColorScheme,
  type ResumeDocumentDetailDto,
  type ResumeLineSpacing,
  type ResumeMargin,
  type ResumeTemplateDto,
} from "../api/resume-builder.api";
import { formatDateRange, formatMonthYear } from "../lib/dates";

/**
 * Approximate live preview.
 *
 * ⚠️ This is NOT the PDF. The backend renders with pdfkit on export and exposes
 * no preview endpoint, so anything shown here is a second implementation of the
 * layout and *will* drift from the real output. It is here to make settings
 * changes legible (colour, spacing, margins, section order) — not to be
 * authoritative. The banner in the editor says so to the user too.
 *
 * Section order follows the template's `layoutConfig.sections` when present, so
 * switching template visibly reorders the preview, and falls back to the
 * backend's own default order when the config is missing or malformed.
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

const LINE_SPACING_CLASS: Record<ResumeLineSpacing, string> = {
  SINGLE: "leading-snug",
  DEFAULT: "leading-normal",
  WIDE: "leading-relaxed",
};

const MARGIN_CLASS: Record<ResumeMargin, string> = {
  NARROW: "p-6",
  NORMAL: "p-10",
  WIDE: "p-14",
};

function accentFor(colorScheme: string): string {
  return COLOR_SCHEME_SWATCH[colorScheme as ColorScheme] ?? COLOR_SCHEME_SWATCH.default;
}

function SectionHeading({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <h3
      className="text-[12px] font-bold uppercase tracking-widest pb-1 mb-2 border-b"
      style={{ color: accent, borderColor: accent }}
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
  const accent = accentFor(document.colorScheme);
  const bullet = template?.layoutConfig?.rules?.bullet ?? "•";

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

  const blocks: Record<string, React.ReactNode> = {
    header: (
      <header key="header" className="mb-5">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: accent }}>
          {document.fullName?.trim() || "Your name"}
        </h2>
        {contactLine && (
          <p className="text-[13px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {contactLine}
          </p>
        )}
        {linkLine && (
          <p className="text-[13px] mt-0.5 break-all" style={{ color: "var(--color-text-tertiary)" }}>
            {linkLine}
          </p>
        )}
      </header>
    ),

    summary: document.summary?.trim() ? (
      <section key="summary" className="mb-5">
        <SectionHeading accent={accent}>Summary</SectionHeading>
        <p className="text-[13px] whitespace-pre-wrap" style={{ color: "var(--color-text-primary)" }}>
          {document.summary}
        </p>
      </section>
    ) : null,

    experience: document.experiences.length > 0 ? (
      <section key="experience" className="mb-5">
        <SectionHeading accent={accent}>Experience</SectionHeading>
        <div className="space-y-3">
          {document.experiences.map((item) => (
            <div key={item.id}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[13px] font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {item.title || "Role"}
                  {item.company && (
                    <span className="font-normal" style={{ color: "var(--color-text-secondary)" }}>
                      {" "}— {item.company}
                    </span>
                  )}
                </p>
                <p className="text-[12px] shrink-0" style={{ color: "var(--color-text-tertiary)" }}>
                  {formatDateRange(item.startDate, item.endDate, item.isCurrentJob)}
                </p>
              </div>
              {item.location && (
                <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                  {item.location}
                </p>
              )}
              {item.description && (
                <p
                  className="text-[13px] mt-0.5 whitespace-pre-wrap"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {item.description}
                </p>
              )}
              {item.technologies.length > 0 && (
                <p className="text-[12px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                  {item.technologies.join(`  ${bullet}  `)}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,

    education: document.educations.length > 0 ? (
      <section key="education" className="mb-5">
        <SectionHeading accent={accent}>Education</SectionHeading>
        <div className="space-y-2">
          {document.educations.map((item) => (
            <div key={item.id} className="flex items-baseline justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13px] font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {item.institution || "Institution"}
                </p>
                <p className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
                  {[item.fieldOfStudy, item.gpa != null ? `GPA ${item.gpa}` : ""]
                    .filter(Boolean)
                    .join("  ·  ")}
                </p>
              </div>
              <p className="text-[12px] shrink-0" style={{ color: "var(--color-text-tertiary)" }}>
                {formatDateRange(item.startDate, item.endDate)}
              </p>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    skills: document.skills.length > 0 ? (
      <section key="skills" className="mb-5">
        <SectionHeading accent={accent}>Skills</SectionHeading>
        <p className="text-[13px]" style={{ color: "var(--color-text-primary)" }}>
          {document.skills.map((s) => s.name).join(`  ${bullet}  `)}
        </p>
      </section>
    ) : null,

    certifications: document.certifications.length > 0 ? (
      <section key="certifications" className="mb-5">
        <SectionHeading accent={accent}>Certifications</SectionHeading>
        <div className="space-y-1.5">
          {document.certifications.map((item) => (
            <div key={item.id} className="flex items-baseline justify-between gap-3">
              <p className="text-[13px]" style={{ color: "var(--color-text-primary)" }}>
                <span className="font-bold">{item.name || "Certification"}</span>
                {item.issuer && (
                  <span style={{ color: "var(--color-text-secondary)" }}> — {item.issuer}</span>
                )}
              </p>
              <p className="text-[12px] shrink-0" style={{ color: "var(--color-text-tertiary)" }}>
                {formatMonthYear(item.issueDate)}
              </p>
            </div>
          ))}
        </div>
      </section>
    ) : null,

    projects: document.projects.length > 0 ? (
      <section key="projects" className="mb-5">
        <SectionHeading accent={accent}>Projects</SectionHeading>
        <div className="space-y-2">
          {document.projects.map((item) => (
            <div key={item.id}>
              <p className="text-[13px] font-bold" style={{ color: "var(--color-text-primary)" }}>
                {item.name || "Project"}
              </p>
              {item.description && (
                <p className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
                  {item.description}
                </p>
              )}
              {item.technologies.length > 0 && (
                <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
                  {item.technologies.join(`  ${bullet}  `)}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null,
  };

  return (
    <div
      className={`rounded-lg border mx-auto w-full ${MARGIN_CLASS[document.margin]} ${LINE_SPACING_CLASS[document.lineSpacing]}`}
      style={{
        background: "#FFFFFF",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
        // Roughly A4 proportions so margin changes read as they will on the page.
        aspectRatio: "1 / 1.414",
        overflowY: "auto",
      }}
    >
      {order.map((name) => blocks[name] ?? null)}
    </div>
  );
}
