import { useEffect } from "react";

const PINCH_ZOOM_SCALE_TOLERANCE = 0.01;

/**
 * Keeps the document scrolled to the top while a phone conversation is open.
 *
 * When the composer takes focus, iOS scrolls the document to reveal it, even
 * though this route's document has nothing to scroll (`AppShell` `fullHeight`:
 * `.app` is the only scroll surface). The result is a page shifted upward with
 * the conversation header off the top of the screen.
 *
 * Snapping back to 0 is safe here because `.app` already shrinks by
 * `--keyboard-inset`, so the composer sits above the keyboard with the header in
 * place; the reveal-scroll has nothing left to reveal. A pinch-zoomed reader is
 * exempt (visual viewport scale other than 1), since their pan position is a
 * deliberate document offset.
 *
 * The hook is scoped to the phone thread. Other routes are real scrolling
 * documents, where iOS's reveal-scroll is wanted.
 *
 * Every trigger coalesces through one `requestAnimationFrame`, and the snap is
 * always instant (see the comment at the `scrollTo` call).
 */
export function useKeepThreadDocumentAtTop(isActive: boolean): void {
  useEffect(() => {
    if (!isActive) return;

    const visualViewport = window.visualViewport;
    let pendingAnimationFrameId: number | null = null;

    const snapDocumentToTop = () => {
      pendingAnimationFrameId = null;
      if (window.scrollY === 0) return;
      const isPinchZoomed =
        visualViewport !== null &&
        Math.abs(visualViewport.scale - 1) > PINCH_ZOOM_SCALE_TOLERANCE;
      if (isPinchZoomed) return;
      // `behavior: "instant"`: a bare `scrollTo(0, 0)` defers to the global
      // `html { scroll-behavior: smooth }` (base.css) and animates. Every frame
      // of that animation fires `scroll`, which lands back here and restarts
      // it from the current offset, so the thread crept down over ~5 seconds
      // after the keyboard opened (reported on iPhone, 2026-10-06).
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    };

    const scheduleSnap = () => {
      if (pendingAnimationFrameId !== null) return;
      pendingAnimationFrameId = window.requestAnimationFrame(snapDocumentToTop);
    };

    scheduleSnap();
    window.addEventListener("scroll", scheduleSnap);
    visualViewport?.addEventListener("resize", scheduleSnap);
    visualViewport?.addEventListener("scroll", scheduleSnap);
    return () => {
      window.removeEventListener("scroll", scheduleSnap);
      visualViewport?.removeEventListener("resize", scheduleSnap);
      visualViewport?.removeEventListener("scroll", scheduleSnap);
      if (pendingAnimationFrameId !== null) {
        window.cancelAnimationFrame(pendingAnimationFrameId);
      }
    };
  }, [isActive]);
}
