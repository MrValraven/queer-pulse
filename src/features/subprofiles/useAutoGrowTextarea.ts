import { useLayoutEffect, type RefObject } from "react";

/** Browsers with `field-sizing: content` grow a textarea in CSS alone. */
export const IS_FIELD_SIZING_SUPPORTED: boolean =
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("field-sizing", "content");

/** For browsers without `field-sizing`: match the textarea's height to its
 *  content after every change. The caller's CSS min-height sets the resting
 *  size. Does nothing where `field-sizing` already does the work. */
export function useAutoGrowFallback(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
): void {
  useLayoutEffect(() => {
    const textarea = ref.current;
    if (!textarea || IS_FIELD_SIZING_SUPPORTED) return;
    textarea.style.height = "auto";
    const borderHeight = textarea.offsetHeight - textarea.clientHeight;
    textarea.style.height = `${textarea.scrollHeight + borderHeight}px`;
  }, [ref, value]);
}
