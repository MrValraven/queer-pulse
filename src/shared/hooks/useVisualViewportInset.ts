import { useEffect, useState } from "react";

/**
 * The pixel overlap between the layout viewport's bottom edge and the visual
 * viewport's bottom edge — i.e. how much of the layout viewport is currently
 * hidden behind the on-screen keyboard (or another interactive UA widget) on
 * engines that OVERLAY the keyboard rather than shrinking the layout viewport,
 * principally iOS Safari. Resolves to `0` when there's no overlap, on engines
 * that shrink the layout viewport instead (Chromium with
 * `interactive-widget=resizes-content`), during SSR, and where `visualViewport`
 * is unavailable.
 *
 * Companion to {@link useVisualViewportKeyboard}: that one publishes the same
 * overlap as an app-wide `--keyboard-inset` CSS variable for stylesheets to
 * consume; this one RETURNS the value to React so a component can drive an
 * inline `transform`/`padding` on an element it owns — used where editing the
 * relevant CSS module isn't an option and a JS-driven inset is the only lever.
 *
 * Listens to both `resize` (keyboard open/close) and `scroll` (iOS shifts the
 * visual viewport's `offsetTop` as the page scrolls under a raised keyboard),
 * each coalesced through `requestAnimationFrame` so there's at most one state
 * write per frame, and skips the write when the value is unchanged. SSR-safe
 * (the measuring effect only runs on the client) and cleans up on unmount.
 */
export function useVisualViewportInset(): number {
  const [insetPx, setInsetPx] = useState(0);

  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    let pendingAnimationFrameId: number | null = null;

    const measureOverlap = () => {
      pendingAnimationFrameId = null;
      const overlapPx = Math.max(
        0,
        window.innerHeight - visualViewport.height - visualViewport.offsetTop,
      );
      setInsetPx((previous) => (previous === overlapPx ? previous : overlapPx));
    };

    const scheduleMeasure = () => {
      if (pendingAnimationFrameId !== null) return;
      pendingAnimationFrameId = window.requestAnimationFrame(measureOverlap);
    };

    measureOverlap();
    visualViewport.addEventListener("resize", scheduleMeasure);
    visualViewport.addEventListener("scroll", scheduleMeasure);
    return () => {
      visualViewport.removeEventListener("resize", scheduleMeasure);
      visualViewport.removeEventListener("scroll", scheduleMeasure);
      if (pendingAnimationFrameId !== null) {
        window.cancelAnimationFrame(pendingAnimationFrameId);
      }
    };
  }, []);

  return insetPx;
}
