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
 */
export function useVisualViewportKeyboard(): void {
  useEffect(() => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;

    const documentElement = document.documentElement;
    const updateKeyboardInset = () => {
      const keyboardOverlap = Math.max(
        0,
        window.innerHeight - visualViewport.height - visualViewport.offsetTop,
      );
      documentElement.style.setProperty(
        "--keyboard-inset",
        `${keyboardOverlap}px`,
      );
    };

    updateKeyboardInset();
    visualViewport.addEventListener("resize", updateKeyboardInset);
    visualViewport.addEventListener("scroll", updateKeyboardInset);
    return () => {
      visualViewport.removeEventListener("resize", updateKeyboardInset);
      visualViewport.removeEventListener("scroll", updateKeyboardInset);
      documentElement.style.removeProperty("--keyboard-inset");
    };
  }, []);
}
