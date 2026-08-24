"use client";

import React from "react";
import { Columns2, Eye, PenLine } from "lucide-react";

export type EditorViewMode = "edit" | "split" | "preview";

/**
 * Ordered as a continuum — all editor, both, all preview — so the middle option
 * reads as the middle state rather than as a third unrelated choice.
 */
const MODES = [
  { id: "edit", label: "Edit", icon: PenLine },
  { id: "split", label: "Split", icon: Columns2 },
  { id: "preview", label: "Preview", icon: Eye },
] as const;

interface ViewModeToggleProps {
  value: EditorViewMode;
  onChange: (mode: EditorViewMode) => void;
}

/**
 * Three-way editor layout toggle.
 *
 * Same segmented control the jobs page uses for its list/grid switch — one
 * bordered, overflow-hidden row of buttons, active segment on `--color-primary-50`
 * — so this is that existing pattern reused rather than a new one. It carries
 * labels beside the icons because "Edit / Split / Preview" is not a set anyone
 * recognises from glyphs alone, unlike list/grid.
 */
export function ViewModeToggle({ value, onChange }: ViewModeToggleProps) {
  return (
    <div
      className="flex rounded-md border overflow-hidden"
      style={{ borderColor: "var(--color-border)" }}
      role="radiogroup"
      aria-label="Editor layout"
    >
      {MODES.map(({ id, label, icon: Icon }) => {
        const selected = value === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors"
            style={{
              background: selected ? "var(--color-primary-50)" : "var(--color-bg)",
              color: selected ? "var(--color-primary-600)" : "var(--color-text-tertiary)",
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
