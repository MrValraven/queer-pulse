/**
 * Canonical responsive breakpoint scale — the single source of truth for every
 * JavaScript `matchMedia` check in the app (consume via `useMediaQuery`).
 *
 * Why this file exists: breakpoints used to be hand-typed literal strings
 * (`"(max-width: 860px)"`) scattered across ~14 call sites, with three
 * conflicting "phone" cutoffs (860 / 880 / 900 / 768). Naming them here removes
 * the magic numbers and makes the mobile cutover a single edit.
 *
 * The values below intentionally MATCH the pixel literals already used in the
 * corresponding CSS `@media` rules — do not "clean them up" in isolation. CSS
 * media conditions cannot reference `var()`, so the ~386 `*.module.css` files
 * still carry literal px. Aligning those to this ladder is a tracked mechanical
 * follow-up (tracker X-8) that also needs `postcss-custom-media`; until then,
 * changing a value here without changing the matching CSS would desync the two.
 *
 * The paired CSS documentation of this ladder lives in
 * `src/styles/tokens/breakpoints.css`.
 */
export const breakpoint = {
  /** Small phones. */
  xs: 480,
  /** Large phones. */
  sm: 560,
  /** Phone / small-tablet portrait (Instagram-style single-column profile). */
  md: 640,
  /** Tablet portrait; complements `min-width: 760px` desktop rules. */
  lg: 760,
  /** Primary app "mobile" cutover — bottom tab bar, mobile nav, route swipe. */
  mobile: 860,
  /** Admin shell: sidebar collapses off-canvas. */
  wide: 900,
} as const;

export type BreakpointName = keyof typeof breakpoint;

/** Resolve a named breakpoint or a raw pixel value to a number. */
function toPixels(value: BreakpointName | number): number {
  return typeof value === "number" ? value : breakpoint[value];
}

/**
 * Build a `max-width` media query string (mobile-first "down" queries).
 * Pass a named breakpoint (`mediaMax("mobile")`) or a raw px value for the
 * handful of intentional feature-specific cutoffs that are off the ladder.
 */
export function mediaMax(value: BreakpointName | number): string {
  return `(max-width: ${toPixels(value)}px)`;
}

/** Build a `min-width` media query string (desktop-up queries). */
export function mediaMin(value: BreakpointName | number): string {
  return `(min-width: ${toPixels(value)}px)`;
}
