"use client";

import React, { createContext, useCallback, useContext } from "react";
import { SlidersHorizontal } from "lucide-react";
import { CollapsibleSection } from "@/shared/components/ui/collapsible-section";
import {
  useCollapsedSections,
  type CollapsedSections,
} from "@/shared/hooks/use-collapsed-sections";

/**
 * Section id the WHOLE panel's collapsed flag is stored under.
 *
 * It shares the one storage entry with the sub-sections rather than taking a key
 * of its own, so a panel's tidy-up is a single object. The sentinel spelling
 * cannot collide with a real section title.
 */
export const FILTER_PANEL_ID = "__panel__";

/**
 * Collapse state for one filter panel.
 *
 * Owned by the PAGE, not the panel, for one reason: when the panel collapses the
 * page has to widen its results column, so the page needs to see the same flag.
 * Passing it down also means the desktop panel and the mobile drawer — two React
 * instances of the same component — stay in step instead of holding separate copies.
 */
export function useFilterPanelCollapse(storageKey: string) {
  const { collapsed, toggle } = useCollapsedSections(storageKey);

  const togglePanel = useCallback(() => toggle(FILTER_PANEL_ID), [toggle]);

  return {
    sections: collapsed,
    toggleSection: toggle,
    panelCollapsed: Boolean(collapsed[FILTER_PANEL_ID]),
    togglePanel,
  };
}

export type FilterPanelCollapse = ReturnType<typeof useFilterPanelCollapse>;

interface FilterCollapseContextValue {
  sections: CollapsedSections;
  toggleSection: (id: string) => void;
}

/**
 * Lets `FilterSection` collapse itself without every panel threading props
 * through its conditionally-rendered sections.
 */
const FilterCollapseContext = createContext<FilterCollapseContextValue | null>(null);

export function useFilterCollapseContext() {
  return useContext(FilterCollapseContext);
}

interface FilterPanelShellProps {
  title: string;
  collapse: FilterPanelCollapse;
  /**
   * Offer the whole-panel collapse. Desktop passes this; the mobile drawer does
   * not — someone who just opened a filter drawer wants filters, and a collapse
   * carried over from desktop would hand them an empty sheet. Mirrors how the
   * sidebar only gives its icon-rail toggle to the desktop instance.
   */
  collapsible?: boolean;
  activeFilterCount: number;
  clearFilters: () => void;
  children: React.ReactNode;
}

const CARD_STYLE: React.CSSProperties = {
  background: "var(--color-card)",
  borderColor: "var(--color-border)",
  boxShadow: "var(--shadow-sm)",
};

/**
 * The card, title row and whole-panel collapse shared by both filter panels.
 *
 * "Refine your search" and "Filter Matches" are separate components with
 * different facets, but their chrome was identical — this is that chrome, once,
 * so the collapse behaves the same on both pages.
 */
export function FilterPanelShell({
  title,
  collapse,
  collapsible = false,
  activeFilterCount,
  clearFilters,
  children,
}: FilterPanelShellProps) {
  const { sections, toggleSection, panelCollapsed, togglePanel } = collapse;

  const isPanelCollapsed = collapsible && panelCollapsed;

  // ── Collapsed: the slim rail ──
  // Same idiom as the sidebar's icon-only rail — a narrow card, one icon, the
  // label small underneath — so the two collapses read as the same gesture.
  if (isPanelCollapsed) {
    return (
      <div className="rounded-lg border p-2 flex flex-col items-center gap-1" style={CARD_STYLE}>
        <button
          type="button"
          onClick={togglePanel}
          aria-expanded={false}
          title={`Show ${title.toLowerCase()}`}
          aria-label={`Show ${title.toLowerCase()}`}
          className="relative w-10 h-10 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--color-surface-hover)]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <SlidersHorizontal size={18} />
          {activeFilterCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[var(--color-card)]"
              style={{ background: "var(--color-primary-500)" }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Filters
        </span>
      </div>
    );
  }

  // ── Expanded ──
  const clearAll = activeFilterCount > 0 && (
    <button
      onClick={clearFilters}
      className="text-xs font-bold hover:underline shrink-0"
      style={{ color: "var(--color-primary-600)" }}
    >
      Clear all ({activeFilterCount})
    </button>
  );

  return (
    <FilterCollapseContext.Provider value={{ sections, toggleSection }}>
      <div className="rounded-lg border p-5 space-y-4" style={CARD_STYLE}>
        {collapsible ? (
          <CollapsibleSection
            panelId="filter-panel-body"
            title={title}
            collapsed={false}
            onToggle={togglePanel}
            headerClassName="text-base font-bold rounded px-1.5 -mx-1.5 py-0.5 -my-0.5"
            headerStyle={{ color: "var(--color-text-primary)" }}
            contentClassName="space-y-4 pt-4"
            chevronSize={16}
            action={clearAll}
          >
            {children}
          </CollapsibleSection>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                {title}
              </h2>
              {clearAll}
            </div>
            {children}
          </>
        )}
      </div>
    </FilterCollapseContext.Provider>
  );
}
