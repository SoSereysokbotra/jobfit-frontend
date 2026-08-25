"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  /** Id for the animated panel, so the header can `aria-controls` it. */
  panelId: string;
  title: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  /**
   * Type scale / padding for the header button. Each surface keeps its own —
   * the sidebar's 10px extrabold nav label and a filter panel's 12px bold label
   * are different typography, not different components.
   */
  headerClassName?: string;
  headerStyle?: React.CSSProperties;
  /** Layout for the content wrapper, e.g. `space-y-1`. */
  contentClassName?: string;
  chevronSize?: number;
  /**
   * Controls rendered BESIDE the header, deliberately outside its button —
   * a "Clear all" link nested inside a button would be invalid HTML and would
   * toggle the section on its way to clearing filters.
   */
  action?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * One collapsible section: a header that toggles, and its content.
 *
 * The animation is a CSS grid row going `1fr` -> `0fr`. No new dependency, and
 * unlike a max-height guess it needs no fixed content height. `Reveal` is
 * deliberately not used: it is a scroll-entrance observer that fires once, so it
 * cannot animate a close.
 *
 * Content stays mounted so the close animates, which is why `inert` matters — it
 * is what actually takes the content out of play. Without it the items would
 * still be tab-reachable and screen-reader-readable while clipped to zero height.
 *
 * This is the single implementation behind both the sidebar's nav sections and
 * the job/recommendation filter panels; the chevron, timing and semantics are
 * shared so the interaction reads the same everywhere.
 */
export function CollapsibleSection({
  panelId,
  title,
  collapsed,
  onToggle,
  headerClassName = "",
  headerStyle,
  contentClassName = "",
  chevronSize = 14,
  action,
  children,
}: CollapsibleSectionProps) {
  return (
    <>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-controls={panelId}
          className={`flex-1 min-w-0 flex items-center justify-between gap-2 transition-colors hover:bg-[var(--color-surface-hover)] ${headerClassName}`}
          style={headerStyle}
        >
          <span className="truncate">{title}</span>
          {/* Rotating single chevron rather than swapping two icons, matching the
              FAQ accordion on the Help page. */}
          <ChevronDown
            size={chevronSize}
            aria-hidden="true"
            className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
              collapsed ? "-rotate-90" : "rotate-0"
            }`}
          />
        </button>
        {action}
      </div>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-200 ease-in-out motion-reduce:transition-none ${
          collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
        }`}
      >
        <div className={`overflow-hidden ${contentClassName}`} inert={collapsed}>
          {children}
        </div>
      </div>
    </>
  );
}
