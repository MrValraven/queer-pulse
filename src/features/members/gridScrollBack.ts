import { animate } from "motion/react";

/** The scroll-back's length: a tween about as long as the shuffle spring
 *  (plus the chip row's settle), so the page settles with the cards. A
 *  tween, because a spring on progress would overshoot the scroll past the
 *  grid top and pull it back. */
const SCROLL_BACK_SECONDS = 0.45;

/** Reader input that ends a running scroll-back, so a reader who scrolls is
 *  never fought. */
const READER_INPUT_EVENTS = [
  "wheel",
  "touchstart",
  "keydown",
  // A scrollbar drag fires none of the above.
  "pointerdown",
] as const;

/** The grid's CSS `scroll-margin-top` in px: the usable viewport top. */
function readScrollMarginTop(container: HTMLElement) {
  return parseFloat(getComputedStyle(container).scrollMarginTop) || 0;
}

/** The window scroll that parks the grid top on its CSS `scroll-margin-top`
 *  line, read from the grid's live position. */
function gridTopScrollTarget(container: HTMLElement) {
  const scrollMarginTop = readScrollMarginTop(container);
  const pageTop = container.getBoundingClientRect().top + window.scrollY;
  return Math.max(0, pageTop - scrollMarginTop);
}

/**
 * Runs after a swap that shrank the results. It scrolls only when the change
 * left the reader looking at mostly empty space: the grid top is above the
 * usable viewport top (the container's CSS `scroll-margin-top`) AND the new
 * bottom edge sits above the viewport's vertical middle. Every other change,
 * a same-length reorder or refetch included, keeps the reader's scroll
 * position.
 *
 * The target keeps moving after this starts (the applied-chips row above the
 * grid can still be springing its height), so each frame recomputes it from
 * the grid's live position and writes the scroll with `behavior: "instant"`
 * (base.css sets `html { scroll-behavior: smooth }`, which would otherwise
 * smooth every per-frame write). Reduced motion jumps straight to the target.
 * Returns a stop function for a scroll-back still running, which also ends
 * on the first wheel, touch, key or pointer input.
 */
export function bringShrunkGridIntoView(
  container: HTMLElement,
  shouldReduceMotion: boolean,
): (() => void) | undefined {
  const usableTop = readScrollMarginTop(container);
  const rect = container.getBoundingClientRect();
  const isTopAboveView = rect.top < usableTop;
  const isBottomAboveMiddle = rect.bottom < window.innerHeight / 2;
  if (!isTopAboveView || !isBottomAboveMiddle) return undefined;

  if (shouldReduceMotion) {
    window.scrollTo({
      top: gridTopScrollTarget(container),
      behavior: "instant",
    });
    return undefined;
  }

  const startTop = window.scrollY;
  const controls = animate(0, 1, {
    duration: SCROLL_BACK_SECONDS,
    ease: [0.22, 1, 0.36, 1],
    onUpdate: (progress) => {
      const targetTop = gridTopScrollTarget(container);
      window.scrollTo({
        top: startTop + (targetTop - startTop) * progress,
        behavior: "instant",
      });
    },
    onComplete: () => stopScrollBack(),
  });
  function stopScrollBack() {
    controls.stop();
    for (const eventName of READER_INPUT_EVENTS) {
      window.removeEventListener(eventName, stopScrollBack);
    }
  }
  for (const eventName of READER_INPUT_EVENTS) {
    window.addEventListener(eventName, stopScrollBack, { passive: true });
  }
  return stopScrollBack;
}
