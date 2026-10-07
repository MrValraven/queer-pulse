import { useLayoutEffect, type RefObject } from "react";

/**
 * Grows a textarea with its text. Height goes to `auto` first so it can also
 * shrink, then takes the content height plus the borders; the textarea's own
 * CSS `min-height` and `max-height` clamp it, and past the max it scrolls
 * inside itself.
 *
 * Shared by the one-field description editor and the description field of the
 * full edit-details modal, so the two read the same way. Runs before paint, so
 * a keystroke that adds a line never shows one frame of the old height.
 */
export function useAutoGrowTextarea(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
): void {
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const borderHeight = textarea.offsetHeight - textarea.clientHeight;
    textarea.style.height = `${textarea.scrollHeight + borderHeight}px`;
  }, [textareaRef, value]);
}
