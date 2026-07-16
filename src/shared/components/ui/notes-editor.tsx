"use client";

import React, { useEffect, useRef, useState } from "react";

interface NotesEditorProps {
  value: string;
  onSave: (notes: string) => void;
  placeholder?: string;
  /** Called when the user clicks "Done" (usually collapses the editor). */
  onDone?: () => void;
  rows?: number;
}

/**
 * Auto-saving notes textarea (flows guide: "notes auto-save, silent").
 * Saves ~1s after the user stops typing and shows Saving…/Saved feedback.
 * Reused by saved jobs and application tracking.
 */
export function NotesEditor({ value, onSave, placeholder, onDone, rows = 3 }: NotesEditorProps) {
  const [draft, setDraft] = useState(value);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const skipAutoSave = useRef(true);

  useEffect(() => {
    if (skipAutoSave.current) {
      skipAutoSave.current = false;
      return;
    }
    setSaveState("saving");
    const t = setTimeout(() => {
      onSave(draft);
      setSaveState("saved");
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <div>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={rows}
        autoFocus
        placeholder={placeholder ?? "Add notes…"}
        className="w-full px-3 py-2.5 rounded-md border text-sm outline-none resize-y transition-all focus:border-primary-500"
        style={{ borderColor: "var(--color-border)", background: "var(--color-bg)", color: "var(--color-text-primary)" }}
      />
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {saveState === "saving" ? "Saving…" : saveState === "saved" ? "✓ Saved" : "Notes auto-save as you type"}
        </span>
        {onDone && (
          <button
            onClick={onDone}
            className="text-xs font-bold hover:underline"
            style={{ color: "var(--color-primary-600)" }}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
