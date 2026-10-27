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

/** Seconds between neighbouring items in a staggered first reveal. */
export const STUDIO_STAGGER = 0.03;

/** Only the first 8 items stagger. */
const STUDIO_STAGGER_ITEM_LIMIT = 8;

/** Stagger delay in seconds for the item at `index`, 0 from index 8 up. */
export function studioStaggerDelay(index: number): number {
  return index < STUDIO_STAGGER_ITEM_LIMIT ? index * STUDIO_STAGGER : 0;
}
