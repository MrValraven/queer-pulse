import { useEffect, useLayoutEffect, useRef } from "react";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import {
  applyLayoutWidth,
  applyZoom,
  FADE_IN_MS,
  FADE_OUT_MS,
  GRID_GLIDE_MS,
  releaseCardSize,
  startCardMorph,
  TIMER_SLACK_MS,
  type PreviewDevice,
} from "./previewCardMorph";

export type { PreviewDevice } from "./previewCardMorph";

/**
 * Where a device swap stands, stamped on the scroller as `data-device-swap`
 * (absent while idle) for `persona-editor.css` to animate. The card morphs
 * its width through all of `leaving` and `settling` (see `startCardMorph`):
 * - `leaving`: the old page fades out inside the card, still at its old
 *   width and zoom.
 * - `settling`: the page is hidden, skips layout, and carries the new layout
 *   width while the card finishes following the dock to its new width.
 * - `entering`: the new page, zoomed to the settled dock, fades and rises in,
 *   and the card hugs it again.
 */
type SwapPhase = "idle" | "leaving" | "settling" | "entering";

function writeSwapPhase(scrollElement: HTMLDivElement, phase: SwapPhase) {
  if (phase === "idle") delete scrollElement.dataset.deviceSwap;
  else scrollElement.dataset.deviceSwap = phase;
}

/** While the dock glides, a zoom written on every resize would relayout the
 *  whole persona page tree on every frame. These phases only record the width,
 *  and `entering` applies the zoom once from the last one. */
function isZoomHeld(phase: SwapPhase): boolean {
  return phase === "leaving" || phase === "settling";
}

/**
 * Scales the docked preview's page to fit the dock. The persona page lays
 * itself out at the device's real width (its `@container` queries read the
 * unzoomed box), and CSS `zoom` shrinks the result to the dock's content
 * width. The page sits in a card (the frame: border, radius, shadow) that
 * hugs it at rest.
 *
 * The layout width and the zoom are both written straight onto the page
 * element, so neither a resize nor a device swap re-renders the heavy page
 * tree. The last measured width is kept for the swap to zoom from.
 *
 * A device change morphs the card (see `SwapPhase`): the card never leaves,
 * its outline stretches or shrinks in step with the grid gliding the dock to
 * its new width while the old page fades out inside it, and the new page
 * fades in already at its final zoom once the card has arrived. The zoom
 * itself is held through the glide: zooming on every frame relayouted the
 * whole page and stuttered. The latest device always wins: a change mid-swap
 * cancels the pending waits and morphs on from where the card stands. The
 * first mount shows its device straight away, and under reduced motion every
 * swap is instant.
 *
 * A width of 0 is skipped: the dock collapses to nothing while the preview is
 * hidden, and the last real zoom is what it should reopen at.
 */
export function usePreviewFit(device: PreviewDevice) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef(0);
  // The device whose layout width the page carries. It lags `device` through
  // a swap, and the observer zooms for it.
  const shownDeviceRef = useRef(device);
  const phaseRef = useRef<SwapPhase>("idle");

  useLayoutEffect(() => {
    const scrollElement = scrollRef.current;
    const frameElement = frameRef.current;
    const pageElement = pageRef.current;
    if (!scrollElement || !frameElement || !pageElement) return;
    const setPhase = (phase: SwapPhase) => {
      phaseRef.current = phase;
      writeSwapPhase(scrollElement, phase);
    };

    // The first mount, where the page already shows this device. The check
    // reads the hook's own state, which Strict Mode's second mount pass
    // leaves as it was, so that pass shows the device at once too. Before
    // the first measurement no width is known, so the zoom stays unset until
    // the observer's initial callback, which fires as soon as it observes.
    if (device === shownDeviceRef.current && phaseRef.current === "idle") {
      applyLayoutWidth(pageElement, device);
      applyZoom(pageElement, device, lastWidthRef.current);
      return;
    }

    // Swapping to the other layout. Its scroll position would point at
    // unrelated content in this one, so the scroller starts again at the top.
    const showDevice = () => {
      shownDeviceRef.current = device;
      applyLayoutWidth(pageElement, device);
      scrollElement.scrollTop = 0;
      scrollElement.scrollLeft = 0;
    };

    // Reduced motion: the grid and the page have no transition, so the new
    // layout goes up at once, zoomed from the last width, in a card that hugs
    // it straight away. The observer catches the dock's new width in this
    // same frame.
    if (prefersReducedMotionNow()) {
      showDevice();
      applyZoom(pageElement, device, lastWidthRef.current);
      releaseCardSize(frameElement);
      setPhase("idle");
      return;
    }

    const timers: number[] = [];
    const gridElement = scrollElement.closest<HTMLElement>(".ed");
    const morph = startCardMorph(frameElement, device, lastWidthRef);
    let hasFadedOut = false;
    let hasGridSettled = false;

    const enterWhenReady = () => {
      if (!hasFadedOut || !hasGridSettled) return;
      applyZoom(pageElement, device, lastWidthRef.current);
      // `entering` lifts the page's `content-visibility`, so the release
      // below measures the new page at its final zoom.
      setPhase("entering");
      releaseCardSize(frameElement, morph.pinnedHeight);
      timers.push(
        window.setTimeout(() => setPhase("idle"), FADE_IN_MS + TIMER_SLACK_MS),
      );
    };
    const settle = () => {
      setPhase("settling");
      showDevice();
      hasFadedOut = true;
      enterWhenReady();
    };
    const markGridSettled = () => {
      if (hasGridSettled) return;
      hasGridSettled = true;
      morph.settle();
      gridElement?.removeEventListener("transitionend", handleGridTransition);
      enterWhenReady();
    };
    // `transitionend` bubbles, so the rail's and the pane's own transitions
    // reach the grid too. Only the grid's column glide counts.
    function handleGridTransition(event: TransitionEvent) {
      if (event.target !== gridElement) return;
      if (event.propertyName !== "grid-template-columns") return;
      markGridSettled();
    }

    // A page already hidden from an interrupted swap skips the fade out.
    if (phaseRef.current === "settling") {
      settle();
    } else {
      setPhase("leaving");
      timers.push(window.setTimeout(settle, FADE_OUT_MS + TIMER_SLACK_MS));
    }
    // The grid glides from the same commit that changed `device`. Where the
    // dock keeps its width no transition runs and no `transitionend` fires,
    // so the timer is the fallback that always ends the wait.
    gridElement?.addEventListener("transitionend", handleGridTransition);
    timers.push(
      window.setTimeout(markGridSettled, GRID_GLIDE_MS + TIMER_SLACK_MS),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      morph.cancel();
      gridElement?.removeEventListener("transitionend", handleGridTransition);
    };
  }, [device]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      // `contentRect` is the content box, so the scroller's padding is
      // already left out of the width the card has to fit in.
      const availableWidth = entries[0]?.contentRect.width ?? 0;
      if (availableWidth <= 0) return;
      lastWidthRef.current = availableWidth;
      if (isZoomHeld(phaseRef.current)) return;
      applyZoom(pageRef.current, shownDeviceRef.current, availableWidth);
    });
    observer.observe(scrollElement);
    return () => observer.disconnect();
  }, []);

  return { scrollRef, frameRef, pageRef };
}
