import { useLayoutEffect, type RefObject } from "react";

/**
 * Grow a textarea to fit its own content, so a long bio never scrolls inside a
 * fixed box.
 *
 * Extracted from `profileEditControls.InlineTextarea` so `MentionTextarea` can
 * offer the same behaviour: the profile bio fields swap one for the other to
 * gain mention typeahead, and losing the growing box in that swap would be a
 * visible regression.
 *
 * A one-shot measure freezes a stale height when the textarea's width or the
 * font changes after mount — e.g. measured mid-entrance in the narrow mobile
 * editor, or before the web font loads — leaving a tall empty box. Recompute on
 * width changes (ResizeObserver) and once fonts are ready (which reflows the
 * text but not the explicitly-set box height, so the observer misses it).
 *
 * Pass `enabled: false` to leave the element's height alone entirely, for call
 * sites that size the box themselves.
 */
export function useAutoGrowTextarea(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
  enabled = true,
): void {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return;
    const fit = () => {
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    let cancelled = false;
    if (typeof document !== "undefined" && document.fonts) {
      void document.fonts.ready.then(() => {
        if (!cancelled) fit();
      });
    }
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [ref, value, enabled]);
}
