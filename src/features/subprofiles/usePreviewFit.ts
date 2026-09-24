import { useEffect, useLayoutEffect, useRef } from "react";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";

/** The two widths the editor's docked preview can lay the persona page out at. */
export type PreviewDevice = "mobile" | "desktop";

/** A phone's layout width, in CSS pixels. */
export const MOBILE_LAYOUT_WIDTH = 390;
/** A laptop's layout width, in CSS pixels. Every persona container breakpoint
 *  sits at or below 1080px (the therapist layout's `@container (max-width:
 *  1080px)` is the widest), so 1100 still renders the full desktop tier while
 *  keeping the zoom as high as possible. */
export const DESKTOP_LAYOUT_WIDTH = 1100;

export const PREVIEW_LAYOUT_WIDTH: Record<PreviewDevice, number> = {
  mobile: MOBILE_LAYOUT_WIDTH,
  desktop: DESKTOP_LAYOUT_WIDTH,
};

/** The phone frame stops growing here so a wide dock keeps some margin around
 *  it; the laptop frame may reach its true size. */
const MAX_ZOOM: Record<PreviewDevice, number> = {
  mobile: 0.85,
  desktop: 1,
};

/** The frame's 1px border on each side. The frame is `content-box`, so the page
 *  inside keeps the full layout width and the border adds to its outer width.
 *  Chrome keeps a zoomed border at 1px or more, so the border is taken off the
 *  available width before the fit instead of being scaled with the page. */
const FRAME_BORDER_TOTAL = 2;

function fitZoom(device: PreviewDevice, availableWidth: number): number {
  const zoom = Math.min(
    MAX_ZOOM[device],
    (availableWidth - FRAME_BORDER_TOTAL) / PREVIEW_LAYOUT_WIDTH[device],
  );
  // Rounded down, so the zoomed frame can only come out narrower than the
  // dock and a sub-pixel overflow never adds a horizontal scrollbar.
  return Math.floor(zoom * 1000) / 1000;
}

function applyZoom(
  frameElement: HTMLDivElement | null,
  device: PreviewDevice,
  availableWidth: number,
) {
  if (!frameElement || availableWidth <= 0) return;
  frameElement.style.zoom = String(fitZoom(device, availableWidth));
}

function applyLayoutWidth(
  frameElement: HTMLDivElement | null,
  device: PreviewDevice,
) {
  if (!frameElement) return;
  frameElement.style.width = `${PREVIEW_LAYOUT_WIDTH[device]}px`;
}

/* The swap's timings mirror the motion tokens `persona-editor.css` animates
   with, so each phase hands over when the CSS it waits on has finished. */
/** The frame's fade out, `--dur-fast`. */
const FADE_OUT_MS = 150;
/** The editor grid's `grid-template-columns` glide on `.ed`, `--dur-slow`. */
const GRID_GLIDE_MS = 400;
/** The frame's fade and rise in, `--dur-base`. */
const FADE_IN_MS = 250;
/** Added to every wait. A CSS transition starts on the style recalc after the
 *  attribute changes, a frame or two after its timer starts, and a phase that
 *  handed over early would cut the last frames of the one before it. */
const TIMER_SLACK_MS = 50;

/**
 * Where a device swap stands, stamped on the scroller as `data-device-swap`
 * (absent while idle) for `persona-editor.css` to animate:
 * - `leaving`: the old layout fades out, still at its old width and zoom.
 * - `settling`: the frame is hidden, carries the new layout width, and waits
 *   for the grid to finish gliding the dock to its new width.
 * - `entering`: the new layout, zoomed to the settled dock, fades and rises in.
 */
type SwapPhase = "idle" | "leaving" | "settling" | "entering";

function writeSwapPhase(
  scrollElement: HTMLDivElement | null,
  phase: SwapPhase,
) {
  if (!scrollElement) return;
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
 * Scales the docked preview's page frame to fit the dock. The persona page
 * lays itself out at the device's real width (its `@container` queries read
 * the unzoomed box), and CSS `zoom` shrinks the result to the dock's content
 * width.
 *
 * The layout width and the zoom are both written straight onto the frame
 * element, so neither a resize nor a device swap re-renders the heavy page
 * tree. The last measured width is kept for the swap to zoom from.
 *
 * A device change runs a choreographed swap (see `SwapPhase`): the old layout
 * fades out, the frame waits hidden while the grid glides the dock to its new
 * width, and the new layout fades in already at its final zoom. Swapping the
 * width in plain view showed the laptop layout tiny and growing (or the phone
 * layout snapping in), and zooming on every frame of the glide made it stutter.
 * The latest device always wins: a change mid-swap cancels the pending waits
 * and restarts from where the frame stands. The first mount shows its device
 * straight away, and under reduced motion every swap is instant.
 *
 * A width of 0 is skipped: the dock collapses to nothing while the preview is
 * hidden, and the last real zoom is what it should reopen at.
 */
export function usePreviewFit(device: PreviewDevice) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef(0);
  // The device whose layout width the frame carries. It lags `device` through
  // a swap, and the observer zooms for it.
  const shownDeviceRef = useRef(device);
  const phaseRef = useRef<SwapPhase>("idle");

  useLayoutEffect(() => {
    const scrollElement = scrollRef.current;
    const frameElement = frameRef.current;
    const setPhase = (phase: SwapPhase) => {
      phaseRef.current = phase;
      writeSwapPhase(scrollElement, phase);
    };

    // The first mount, where the frame already shows this device. The check
    // reads the frame's own state, which Strict Mode's second mount pass
    // leaves as it was, so that pass shows the device at once too. Before
    // the first measurement no width is known, so the zoom stays unset until
    // the observer's initial callback, which fires as soon as it observes.
    if (device === shownDeviceRef.current && phaseRef.current === "idle") {
      applyLayoutWidth(frameElement, device);
      applyZoom(frameElement, device, lastWidthRef.current);
      return;
    }

    // Swapping to the other layout. Its scroll position would point at
    // unrelated content in this one, so the scroller starts again at the top.
    const showDevice = () => {
      shownDeviceRef.current = device;
      applyLayoutWidth(frameElement, device);
      if (scrollElement) {
        scrollElement.scrollTop = 0;
        scrollElement.scrollLeft = 0;
      }
    };

    // Reduced motion: the grid and the frame have no transition, so the new
    // layout goes up at once, zoomed from the last width. The observer catches
    // the dock's new width in this same frame.
    if (prefersReducedMotionNow()) {
      showDevice();
      applyZoom(frameElement, device, lastWidthRef.current);
      setPhase("idle");
      return;
    }

    const timers: number[] = [];
    const gridElement = scrollElement?.closest<HTMLElement>(".ed") ?? null;
    let hasFadedOut = false;
    let hasGridSettled = false;

    const enterWhenReady = () => {
      if (!hasFadedOut || !hasGridSettled) return;
      applyZoom(frameElement, device, lastWidthRef.current);
      setPhase("entering");
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

    // A frame already hidden from an interrupted swap skips the fade out.
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
      gridElement?.removeEventListener("transitionend", handleGridTransition);
    };
  }, [device]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      // `contentRect` is the content box, so the scroller's padding is
      // already left out of the width the frame has to fit in.
      const availableWidth = entries[0]?.contentRect.width ?? 0;
      if (availableWidth <= 0) return;
      lastWidthRef.current = availableWidth;
      if (isZoomHeld(phaseRef.current)) return;
      applyZoom(frameRef.current, shownDeviceRef.current, availableWidth);
    });
    observer.observe(scrollElement);
    return () => observer.disconnect();
  }, []);

  return { scrollRef, frameRef };
}
