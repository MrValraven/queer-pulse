import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import { CHROME_GAP_PX, measureStickyChrome } from "./useEditorFieldJump";

/**
 * Scrolls a type-ahead list that just opened into the band between the
 * editor's sticky chrome (on a phone the savebar covers most of the page
 * under the field). "nearest" leaves a list already in view where it is.
 * The top scroll margin also covers the field above the list, so a list
 * taller than the band lands with the input and its first options in view.
 * The chrome reaches `scrollIntoView` through inline scroll margins, as in
 * `scrollIntoBand` (useEditorFieldJump.ts). They are read when the scroll
 * starts, so they are restored right after the call.
 */
export function revealSuggestList(
  listbox: HTMLElement,
  field: HTMLElement | null,
): void {
  const chrome = measureStickyChrome();
  const fieldLift = field
    ? Math.max(
        0,
        listbox.getBoundingClientRect().top - field.getBoundingClientRect().top,
      )
    : 0;
  const { scrollMarginTop, scrollMarginBottom } = listbox.style;
  listbox.style.scrollMarginTop = `${chrome.top + CHROME_GAP_PX + fieldLift}px`;
  listbox.style.scrollMarginBottom = `${chrome.bottom + CHROME_GAP_PX}px`;
  listbox.scrollIntoView({
    behavior: prefersReducedMotionNow() ? "instant" : "smooth",
    block: "nearest",
  });
  listbox.style.scrollMarginTop = scrollMarginTop;
  listbox.style.scrollMarginBottom = scrollMarginBottom;
}
