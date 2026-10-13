import { type RefObject, useEffect } from "react";
import { cancelFrame, frame } from "motion/react";

/** How long a pressed control is held in place, in milliseconds: the
 *  longest fold it can ride on (`Collapse`, 280ms) with room to spare for
 *  the chip glides that land after it. */
const FOLLOW_DURATION_MS = 600;
/** Drift below this many pixels is left alone, so subpixel layout noise
 *  never nudges the page. */
const DRIFT_TOLERANCE_PX = 0.5;
/** Anything the member does to scroll or press again. Each one hands the
 *  page back to them at once, so the hold never fights their own scroll. */
const MEMBER_INPUT_EVENTS = [
  "wheel",
  "touchstart",
  "pointerdown",
  "keydown",
] as const;

/** The nearest ancestor that scrolls vertically, else the page. A `Collapse`
 *  mid-fold clips with `overflow: hidden`, which never counts. */
function scrollContainerOf(element: HTMLElement): Element {
  for (
    let ancestor = element.parentElement;
    ancestor;
    ancestor = ancestor.parentElement
  ) {
    const { overflowY } = getComputedStyle(ancestor);
    const isScrollable = overflowY === "auto" || overflowY === "scroll";
    if (isScrollable && ancestor.scrollHeight > ancestor.clientHeight)
      return ancestor;
  }
  return document.scrollingElement ?? document.documentElement;
}

/**
 * Hold `anchor` at its current height on screen while the layout around it
 * settles, by scrolling its scroll container by however far it drifted.
 * Each check runs in motion's `postRender` step, after every fold and glide
 * has written its frame and before the browser paints it, so the anchor
 * never shows anywhere else, the first frame after the change included.
 * Under reduced motion the change lands in one frame and the first check
 * settles it. Returns a function that stops the hold early.
 */
export function keepElementInPlace(anchor: HTMLElement): () => void {
  const anchorTop = anchor.getBoundingClientRect().top;
  const scrollContainer = scrollContainerOf(anchor);
  const startedAt = performance.now();
  let isStopped = false;

  const stop = () => {
    if (isStopped) return;
    isStopped = true;
    cancelFrame(follow);
    for (const eventName of MEMBER_INPUT_EVENTS)
      window.removeEventListener(eventName, stop, true);
  };
  function follow() {
    if (isStopped) return;
    if (!anchor.isConnected) {
      stop();
      return;
    }
    const drift = anchor.getBoundingClientRect().top - anchorTop;
    if (Math.abs(drift) > DRIFT_TOLERANCE_PX)
      scrollContainer.scrollBy({ top: drift, behavior: "instant" });
    if (performance.now() - startedAt < FOLLOW_DURATION_MS)
      frame.postRender(follow);
    else stop();
  }

  for (const eventName of MEMBER_INPUT_EVENTS)
    window.addEventListener(eventName, stop, { capture: true, passive: true });
  frame.postRender(follow);
  return stop;
}

/**
 * Keeps a pressed button where the member's finger is while the picker
 * reflows around it: a group opening as the one above it closes, the picks
 * row gaining a line above a chip. Only buttons inside an element marked
 * `data-keep-in-place` within `rootRef` are held.
 *
 * It listens to clicks in the capture phase on the root, which runs before
 * React handles the click, so the button's place is read before the change
 * it causes. A keyboard press holds the focused button the same way.
 */
export function useKeepInPlace(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let stopHolding: (() => void) | undefined;
    const holdPressedButton = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const pressedButton = event.target.closest("button");
      if (!pressedButton?.closest("[data-keep-in-place]")) return;
      stopHolding?.();
      stopHolding = keepElementInPlace(pressedButton);
    };
    root.addEventListener("click", holdPressedButton, { capture: true });
    return () => {
      root.removeEventListener("click", holdPressedButton, { capture: true });
      stopHolding?.();
    };
  }, [rootRef]);
}
