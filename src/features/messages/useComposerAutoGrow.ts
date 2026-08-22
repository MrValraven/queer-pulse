// src/features/messages/useComposerAutoGrow.ts
import { useLayoutEffect, type RefObject } from "react";

/**
 * Sync the composer's textarea height to its content up to the CSS
 * max-height (120px), then let it scroll internally — split out of
 * `Composer` to keep it under the line cap.
 */
export function useComposerAutoGrow(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  draft: string,
): void {
  useLayoutEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    // With `box-sizing: border-box`, `scrollHeight` excludes the borders, so
    // adding the top+bottom border back keeps the box from under-sizing by
    // ~3px and showing a spurious scrollbar on a single line.
    const borderY = node.offsetHeight - node.clientHeight;
    node.style.height = `${node.scrollHeight + borderY}px`;
    // Only let the box scroll internally once CSS `max-height` has actually
    // clamped it (scrollHeight > clientHeight at that point) — otherwise
    // overflow stays hidden, so a short/empty single-line draft never shows a
    // stray scrollbar (or, on iOS Safari, a momentary touch-scroll indicator
    // on a box that isn't really scrollable).
    node.style.overflowY = node.scrollHeight > node.clientHeight ? "auto" : "hidden";
  }, [textareaRef, draft]);
}
