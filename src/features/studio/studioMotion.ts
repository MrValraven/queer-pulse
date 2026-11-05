/* Studio motion vocabulary. Every JS animation in Studio imports from here so
   springs, fades and staggers feel the same across the surface. */

export const STUDIO_SPRING = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.9,
} as const;

export const STUDIO_SPRING_SOFT = {
  type: "spring",
  stiffness: 260,
  damping: 30,
} as const;

export const STUDIO_FADE = {
  duration: 0.2,
  ease: [0.16, 1, 0.3, 1],
} as const;

export const STUDIO_EXIT = {
  duration: 0.14,
  ease: [0.4, 0, 1, 1],
} as const;

/** Disclosure rows opening to their height: longer than a fade and on the
 *  app's standard ease, so the open reads across its whole run. */
export const STUDIO_DISCLOSURE = {
  duration: 0.34,
  ease: [0.22, 0.68, 0.16, 1],
} as const;

/** Disclosure rows folding away, on a gentle ease-in-out. */
export const STUDIO_DISCLOSURE_EXIT = {
  duration: 0.24,
  ease: [0.4, 0, 0.2, 1],
} as const;

/** A tall panel opening, like a Library folder's cards: it ramps in and out
 *  so the content below never leaps. */
export const STUDIO_PANEL_OPEN = {
  duration: 0.32,
  ease: [0.25, 0.1, 0.25, 1],
} as const;

/** A release's track rows in the numbers table opening and folding as one
 *  block. Every row grows on this one curve at the same moment, so the rows
 *  move together like a single panel. The curve ramps in and lands softly in
 *  both directions, so the content below glides and never leaps. */
export const STUDIO_ROW_BLOCK_EASE = [0.4, 0, 0.2, 1] as const;

/** Seconds for a release's track rows to open or fold: a lone track takes
 *  about a third of a second, and each further track adds a little, up to
 *  ten tracks. */
export function studioRowBlockDuration(rowCount: number): number {
  return 0.3 + 0.015 * Math.min(Math.max(rowCount, 1), 10);
}

/** Seconds between neighbouring rows fading in inside a growing block. Only
 *  the fade is staggered, so the text arrives top to bottom while the rows'
 *  heights stay on the block's single clock. */
export const STUDIO_ROW_BLOCK_FADE_STAGGER = 0.015;

/** Seconds between neighbouring items in a staggered first reveal. */
export const STUDIO_STAGGER = 0.03;

/** Only the first 8 items stagger. */
const STUDIO_STAGGER_ITEM_LIMIT = 8;

/** Stagger delay in seconds for the item at `index`, 0 from index 8 up. */
export function studioStaggerDelay(index: number): number {
  return index < STUDIO_STAGGER_ITEM_LIMIT ? index * STUDIO_STAGGER : 0;
}
