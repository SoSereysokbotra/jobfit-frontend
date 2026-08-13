"use client";

import React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/data-display/empty-state";

/**
 * Cap enforced by the backend (`MAX_SECTION_ITEMS`). Disabling Add here turns a
 * 400 into a control the user can see.
 */
export const MAX_SECTION_ITEMS = 100;

interface RepeatableListProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  /** Factory for a new row — must satisfy the section's required fields. */
  makeEmpty: () => T;
  addLabel: string;
  empty: { icon: React.ReactNode; title: string; description: string };
  /** Heading shown on the row's chrome, e.g. the job title. */
  rowLabel: (item: T, index: number) => string;
  renderRow: (item: T, index: number, update: (patch: Partial<T>) => void) => React.ReactNode;
}

/**
 * Add / remove / reorder for a bulk-replace section.
 *
 * Reordering is up/down buttons rather than drag-and-drop: no DnD library is
 * installed, and adding one for this is a bigger decision than the feature
 * warrants. The backend takes `order` from the array index, so a reorder is just
 * a reordered array either way — swapping in real drag later touches only this
 * file.
 *
 * Rows are keyed by index deliberately. These items have no stable client id
 * before their first save (the server assigns one), and reordering rewrites the
 * whole array anyway, so an index key is the honest choice here rather than a
 * fabricated key that would churn on every edit.
 */
export function RepeatableList<T>({
  items,
  onChange,
  makeEmpty,
  addLabel,
  empty,
  rowLabel,
  renderRow,
}: RepeatableListProps<T>) {
  const update = (index: number, patch: Partial<T>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const remove = (index: number) => {
    onChange(items.filter((_item, i) => i !== index));
  };

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const add = () => {
    if (items.length >= MAX_SECTION_ITEMS) return;
    onChange([...items, makeEmpty()]);
  };

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <EmptyState
          icon={empty.icon}
          title={empty.title}
          description={empty.description}
          action={
            <Button variant="outline" onClick={add}>
              <Plus className="w-4 h-4" />
              {addLabel}
            </Button>
          }
        />
      ) : (
        <>
          <ul className="space-y-4">
            {items.map((item, index) => (
              <li
                key={index}
                className="rounded-lg border"
                style={{ borderColor: "var(--color-border)", background: "var(--color-bg-secondary)" }}
              >
                <div
                  className="flex items-center justify-between gap-2 px-4 py-2.5 border-b"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <p className="text-xs font-bold truncate" style={{ color: "var(--color-text-secondary)" }}>
                    {rowLabel(item, index)}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${rowLabel(item, index)} up`}
                      className="p-1.5 rounded-md transition-colors hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === items.length - 1}
                      aria-label={`Move ${rowLabel(item, index)} down`}
                      className="p-1.5 rounded-md transition-colors hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Remove ${rowLabel(item, index)}`}
                      className="p-1.5 rounded-md transition-colors hover:bg-error-50"
                      style={{ color: "var(--color-error-600)" }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {renderRow(item, index, (patch) => update(index, patch))}
                </div>
              </li>
            ))}
          </ul>

          <Button variant="outline" onClick={add} disabled={items.length >= MAX_SECTION_ITEMS}>
            <Plus className="w-4 h-4" />
            {addLabel}
          </Button>
          {items.length >= MAX_SECTION_ITEMS && (
            <p className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              This section is capped at {MAX_SECTION_ITEMS} entries.
            </p>
          )}
        </>
      )}
    </div>
  );
}
