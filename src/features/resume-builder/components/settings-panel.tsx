"use client";

import React, { useState } from "react";
import { Check, LayoutTemplate, Palette } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Modal } from "@/shared/components/ui/modal";
import { PillSelect } from "@/shared/components/ui/form-controls";
import { cn } from "@/shared/utils/cn";
import {
  COLOR_SCHEMES,
  COLOR_SCHEME_LABEL,
  COLOR_SCHEME_SWATCH,
  LINE_SPACING_LABEL,
  MARGIN_LABEL,
  type ColorScheme,
  type ResumeDocumentDetailDto,
  type ResumeLineSpacing,
  type ResumeMargin,
  type ResumeTemplateDto,
  type UpdateResumeDocumentInput,
} from "../api/resume-builder.api";
import { TemplatePicker } from "./template-picker";

const LINE_SPACING_OPTIONS = (Object.keys(LINE_SPACING_LABEL) as ResumeLineSpacing[]).map(
  (value) => ({ value, label: LINE_SPACING_LABEL[value] }),
);

const MARGIN_OPTIONS = (Object.keys(MARGIN_LABEL) as ResumeMargin[]).map((value) => ({
  value,
  label: MARGIN_LABEL[value],
}));

interface SettingsPanelProps {
  document: ResumeDocumentDetailDto;
  templates: ResumeTemplateDto[];
  templatesLoading: boolean;
  templatesError?: unknown;
  onUpdate: (input: UpdateResumeDocumentInput) => void;
}

/**
 * Presentation settings — every control maps to one PATCH field.
 *
 * Each change fires its own PATCH immediately rather than debouncing: these are
 * discrete clicks, not typing, and the mutation patches the detail cache so the
 * preview updates without a refetch.
 */
export function SettingsPanel({
  document,
  templates,
  templatesLoading,
  templatesError,
  onUpdate,
}: SettingsPanelProps) {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const activeTemplate = templates.find((t) => t.id === document.templateId);

  return (
    <div
      className="rounded-xl border"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        className="flex items-center gap-2.5 px-5 py-3.5 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--color-primary-50)" }}
        >
          <Palette className="w-4 h-4" style={{ color: "var(--color-primary-600)" }} />
        </div>
        <h2 className="text-sm font-bold" style={{ color: "var(--color-text-primary)" }}>
          Design
        </h2>
      </div>

      <div className="p-5 space-y-5">
        {/* ── Template ── */}
        <div>
          <p className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Template
          </p>
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                {activeTemplate?.name ?? "—"}
              </p>
              {activeTemplate && (
                <p className="text-xs truncate" style={{ color: "var(--color-text-tertiary)" }}>
                  {activeTemplate.category}
                </p>
              )}
            </div>
            <Button variant="outline" onClick={() => setTemplateDialogOpen(true)}>
              <LayoutTemplate className="w-4 h-4" />
              Change
            </Button>
          </div>
        </div>

        {/* ── Colour ── */}
        <div>
          <p className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Colour
          </p>
          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Colour scheme">
            {COLOR_SCHEMES.map((scheme) => {
              const selected = document.colorScheme === scheme;
              return (
                <button
                  key={scheme}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={COLOR_SCHEME_LABEL[scheme]}
                  title={COLOR_SCHEME_LABEL[scheme]}
                  onClick={() => onUpdate({ colorScheme: scheme as ColorScheme })}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
                    selected ? "ring-2 ring-offset-2" : "hover:scale-105",
                  )}
                  style={{
                    background: COLOR_SCHEME_SWATCH[scheme],
                    // @ts-expect-error — CSS custom property for the Tailwind ring colour.
                    "--tw-ring-color": "var(--color-primary-500)",
                  }}
                >
                  {selected && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}
          </div>
          {/* Preset keys, not hex — the backend rejects anything off this list. */}
          <p className="mt-1.5 text-xs text-neutral-400">
            {COLOR_SCHEME_LABEL[(document.colorScheme as ColorScheme) ?? "default"] ??
              document.colorScheme}
          </p>
        </div>

        {/* ── Line spacing ── */}
        <PillSelect<ResumeLineSpacing>
          label="Line spacing"
          options={LINE_SPACING_OPTIONS}
          value={document.lineSpacing}
          onChange={(value) => onUpdate({ lineSpacing: value })}
          fullWidth
        />

        {/* ── Margins ── */}
        <PillSelect<ResumeMargin>
          label="Margins"
          options={MARGIN_OPTIONS}
          value={document.margin}
          onChange={(value) => onUpdate({ margin: value })}
          fullWidth
        />
      </div>

      <Modal
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        title="Change template"
        subtitle="Your content is kept — only the layout changes."
      >
        <TemplatePicker
          templates={templates}
          selectedId={document.templateId}
          isLoading={templatesLoading}
          error={templatesError}
          compact
          onSelect={(templateId) => {
            onUpdate({ templateId });
            setTemplateDialogOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}
