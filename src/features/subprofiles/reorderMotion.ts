/** The reorder glide every editor list shares, on the repo's motion tokens
 *  (`--dur-base` / `--ease` in styles/tokens/effects.css). Motion takes the
 *  easing as numbers, so the token's curve is repeated here once. */
export const REORDER_EASE = [0.22, 0.68, 0.16, 1] as const;
export const REORDER_DURATION = 0.25;

/** The `transition.layout` for a gliding row: instant under reduced motion. */
export function reorderLayoutTransition(isReducedMotion: boolean) {
  return isReducedMotion
    ? { duration: 0 }
    : { duration: REORDER_DURATION, ease: REORDER_EASE };
}
