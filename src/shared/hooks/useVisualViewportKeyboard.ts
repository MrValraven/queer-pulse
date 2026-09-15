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
 * BOTH `visualViewport` events have to schedule a recompute, `resize` AND
 * `scroll`. `resize` alone is the obvious reading — that's what fires on
 * keyboard open/close — and it is wrong, because the overlap is measured off
 * `offsetTop` as well as `height`, and iOS moves `offsetTop` with a `scroll`
 * event and no `resize`. What that costs, concretely, on iOS with a
 * bottom-anchored composer: focusing the field fires `resize` while the visual
 * viewport is still flush with the layout viewport (`offsetTop` 0), so the
 * overlap reads as the FULL keyboard height and `.app` shrinks by it, lifting
 * the composer clear. iOS then does its own "scroll the focused field into
 * view" pass — decided from where the field was BEFORE that shrink, i.e. under
 * the keyboard — and shifts the visual viewport down by roughly the keyboard's
 * height. That arrives as `scroll`, not `resize`. With no `scroll` listener
 * `--keyboard-inset` stays at the stale full-keyboard value, so the keyboard is
 * subtracted twice: once by the shrunken `.app`, once by the shifted viewport,
 * and the composer ends up a whole keyboard-height ABOVE the keyboard with a
 * dead band between them (reported on an installed iPhone PWA, in a chat
 * thread, on the first tap into the composer).
 *
 * The cost of listening to `scroll` is close to nothing, despite it firing on
 * every momentum tick: `window.innerHeight - height - offsetTop` is a CONSTANT
 * 0 whenever no keyboard is up (the visual viewport is flush with the layout
 * viewport, so the terms cancel), and the unchanged-value check below then
 * returns before touching a style. Writes only happen when the overlap really
 * moves. Every recompute is also coalesced through `requestAnimationFrame`, so
 * at most one write lands per frame either way.
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
    visualViewport.addEventListener("scroll", scheduleKeyboardInsetUpdate);
    return () => {
      visualViewport.removeEventListener("resize", scheduleKeyboardInsetUpdate);
      visualViewport.removeEventListener("scroll", scheduleKeyboardInsetUpdate);
      if (pendingAnimationFrameId !== null) {
        window.cancelAnimationFrame(pendingAnimationFrameId);
      }
      documentElement.style.removeProperty("--keyboard-inset");
    };
  }, []);
}
