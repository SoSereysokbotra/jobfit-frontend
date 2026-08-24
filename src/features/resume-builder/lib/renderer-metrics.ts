/**
 * Mirror of the backend's PDF renderer.
 *
 * Every number and rule in this file is read off
 * `jobfit-backend/src/modules/resume-builder/application/services/resume-pdf.renderer.ts`.
 * It exists so the preview is a scale model of the exported PDF rather than a
 * second, freehand design that drifts — the drift is what made the preview show
 * dividers, casing and colours the export did not produce.
 *
 * ⚠️ This is a hand-kept mirror, not a shared package. The backend renders with
 * pdfkit drawing primitives and shares no code with this repo, so when that file
 * changes, THIS is the file that has to change with it. Nothing else in the
 * preview hardcodes a size, an ink or a rule width.
 */

/**
 * Page geometry, in PostScript points (72pt = 1in).
 *
 * ⚠️ LETTER because that is what the renderer passes to pdfkit TODAY
 * (`size: 'LETTER'`). The renderer's own comment marks this as undecided rather
 * than chosen, and argues A4 is probably right for a Cambodia-facing product.
 * If the backend flips to A4, change these two numbers to 595 × 842 and the
 * whole preview — ratio, margins, type scale — follows; nothing else moves.
 */
export const PAGE = {
  widthPoints: 612,
  heightPoints: 792,
} as const;

/** `MARGIN_INCHES` × 72. */
export const MARGIN_POINTS = {
  NARROW: 36,
  NORMAL: 54,
  WIDE: 72,
} as const;

/**
 * `LINE_SPACING`. The renderer turns these into a pdfkit `lineGap` of
 * `BODY_SIZE * spacing - BODY_SIZE`, which is the same thing CSS calls a
 * unitless `line-height`.
 */
export const LINE_SPACING = {
  SINGLE: 1.0,
  DEFAULT: 1.15,
  WIDE: 1.5,
} as const;

/**
 * `BODY_SIZE` / `HEADING_SIZE` / `NAME_SIZE`.
 *
 * Note there are only three. The renderer has no "small" size — dates, locations,
 * technology lists and the contact line are all plain `BODY_SIZE`, so the preview
 * must not shrink them either.
 */
export const FONT_POINTS = {
  body: 12,
  heading: 14,
  name: 24,
} as const;

/** `HEADING_RULE_WIDTH` / `DEFAULT_RULE_WIDTH`. */
const ACCENT_BAR_RULE_POINTS = 1.5;
const DEFAULT_RULE_POINTS = 0.75;

/** Body copy is `#111111` everywhere in the PDF — there are no greys. */
export const BODY_INK = "#111111";

/**
 * `PRESET_COLORS` — the renderer's real ink, which is NOT the same as
 * `COLOR_SCHEME_SWATCH` in the api module. Those swatches are picker circles,
 * deliberately approximate and brightened so they stay distinguishable; these are
 * what actually lands in the PDF. Notably `default` is near-black here, not a
 * brand colour.
 */
export const RENDERER_INK: Record<string, string> = {
  default: "#111111",
  navy: "#1B3A5C",
  forest: "#1F4D3A",
  burgundy: "#5C1B2B",
  slate: "#3A4450",
};

export function inkFor(colorScheme: string): string {
  return RENDERER_INK[colorScheme] ?? RENDERER_INK.default;
}

/**
 * Ink for section headings and their rules.
 *
 * `accent: 'none'` (the Classic ATS template) forces near-black; every other
 * value takes the document's colour scheme.
 */
export function headingInk(accentRule: string | undefined, colorScheme: string): string {
  return accentRule === "none" ? BODY_INK : inkFor(colorScheme);
}

/**
 * Casing is the ONLY thing `headingStyle` decides about heading text.
 *
 * `small-caps` deliberately renders as title case, not small caps: the renderer is
 * restricted to base-14 fonts for ATS-safety and none of them carry a small-caps
 * feature, so it leaves the label alone. The preview must do the same rather than
 * promise typography the export cannot produce.
 */
export function headingLabel(headingStyle: string | undefined, label: string): string {
  return headingStyle === "uppercase-rule" ? label.toUpperCase() : label;
}

/**
 * Rule weight under a heading.
 *
 * EVERY heading gets one — this used to be conditional on `headingStyle`, which
 * is why the `small-caps` template exported with no dividers at all while the
 * preview drew them regardless.
 */
export function ruleWidthPoints(headingStyle: string | undefined): number {
  return headingStyle === "accent-bar" ? ACCENT_BAR_RULE_POINTS : DEFAULT_RULE_POINTS;
}

/**
 * A point measurement as a container-query width unit.
 *
 * The preview sheet is a size container whose width stands in for the page width,
 * so `1cqw` is 1% of a page. Expressing every size this way is what makes the
 * preview a true scale model at any panel width — including whether the content
 * actually fits on one page.
 */
export function cqw(points: number): string {
  return `${((points / PAGE.widthPoints) * 100).toFixed(4)}cqw`;
}

/**
 * Same, with a floor, for hairlines.
 *
 * A 0.75pt rule is ~0.74px on a typical panel; without a floor it can round away
 * entirely at narrow widths, which is the exact failure being fixed.
 */
export function cqwRule(points: number): string {
  return `max(0.5px, ${cqw(points)})`;
}
