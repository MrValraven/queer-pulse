import { COMPOSE_EASE } from "./composeMotion";

// ── The fade an identity or audience swap uses ──────────────────────────────
// For an `m` element keyed by what it shows, inside `AnimatePresence
// mode="wait"`: the old one fades out where it sits, then the new one fades
// in in the same place. Opacity only, and no layout projection, so the swap
// stays glued to its row even while the whole card is moving.

const SWAP_FADE_OUT_SECONDS = 0.08;
const SWAP_FADE_IN_SECONDS = 0.12;

export function swapFadeProps(reducedMotion: boolean) {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: reducedMotion ? 0 : SWAP_FADE_IN_SECONDS,
        ease: COMPOSE_EASE,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: reducedMotion ? 0 : SWAP_FADE_OUT_SECONDS,
        ease: COMPOSE_EASE,
      },
    },
  };
}

/**
 * The same fade for a swap whose old and new elements share one grid cell
 * (`AnimatePresence` in its default sync mode, both children at
 * `grid-area: 1 / 1`). The outgoing one keeps its box until it leaves, so the
 * row never loses its width mid-swap, and the incoming one waits for it to
 * fade before it fades up, so the two never read as doubled text.
 */
export function swapStackFadeProps(reducedMotion: boolean) {
  const fade = swapFadeProps(reducedMotion);
  return {
    ...fade,
    animate: {
      ...fade.animate,
      transition: {
        ...fade.animate.transition,
        delay: reducedMotion ? 0 : SWAP_FADE_OUT_SECONDS,
      },
    },
  };
}
