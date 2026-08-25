import { useEffect } from "react";

/**
 * Keeps a bottom-anchored composer above the on-screen keyboard on engines
 * where the keyboard overlays the layout viewport instead of shrinking it —
 * principally iOS Safari, which ignores the `interactive-widget` viewport meta.
 *
 * It publishes the keyboard's visible overlap as the `--keyboard-inset` CSS
 * variable on `<html>`; a layout subtracts that from its height (e.g. the
 * messages `.app`) so the composer and newest messages stay on screen. On
 * engines that already shrink the layout viewport for the keyboard (Chromium
 * with `interactive-widget=resizes-content`), the overlap resolves to ~0px and
 * this hook is inert. It also no-ops where `visualViewport` is unavailable.
 *
 * Only `visualViewport`'s `resize` event schedules a recompute — that's what
 * fires on keyboard open/close, which is the only thing this var needs to
 * track. `scroll` fires continuously during iOS momentum scrolling and
 * address-bar show/hide without the keyboard's overlap actually changing, so
 * listening to it too only bought a style write (and the `.app` reflow it
 * triggers) on every tick for no visual benefit. Every recompute is also
 * coalesced through `requestAnimationFrame` (at most one write per frame) and
 * skipped entirely when the value hasn't changed.
 */
export function useVisualViewportKeyboard(): void {
  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const documentElement = document.documentElement;
    let pendingAnimationFrameId: number | null = null;
    let lastWrittenKeyboardOverlapPx = -1;

    const applyKeyboardInset = () => {
      pendingAnimationFrameId = null;
      const keyboardOverlapPx = Math.max(
        0,
        window.innerHeight - visualViewport.height - visualViewport.offsetTop,
      );
      if (keyboardOverlapPx === lastWrittenKeyboardOverlapPx) return;
      lastWrittenKeyboardOverlapPx = keyboardOverlapPx;
      documentElement.style.setProperty(
        "--keyboard-inset",
        `${keyboardOverlapPx}px`,
      );
    };

    const scheduleKeyboardInsetUpdate = () => {
      if (pendingAnimationFrameId !== null) return;
      pendingAnimationFrameId =
        window.requestAnimationFrame(applyKeyboardInset);
    };

    applyKeyboardInset();
    visualViewport.addEventListener("resize", scheduleKeyboardInsetUpdate);
    return () => {
      visualViewport.removeEventListener("resize", scheduleKeyboardInsetUpdate);
      if (pendingAnimationFrameId !== null) {
        window.cancelAnimationFrame(pendingAnimationFrameId);
      }
      documentElement.style.removeProperty("--keyboard-inset");
    };
  }, []);
}
