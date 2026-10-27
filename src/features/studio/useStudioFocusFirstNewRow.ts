import { useEffect, useRef } from "react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { STUDIO_FADE } from "./studioMotion";

/** How long a new row takes to fade in, in milliseconds. */
const ROW_REVEAL_MS = STUDIO_FADE.duration * 1000;

/** "Show more" folds away once the last page lands, which would drop focus
 *  to the page body. When it does, focus moves to the first row that page
 *  added (the last row when the page came back empty). With
 *  `shouldFocusEveryPage`, every page that adds rows takes the focus there,
 *  so the button it sat on never ends up pushed off screen, and the row is
 *  scrolled into view once its enter animation has run (at once under
 *  reduced motion). */
export function useStudioFocusFirstNewRow({
  rowCount,
  hasMore,
  isSettled,
  focusSelector = "a",
  shouldFocusEveryPage = false,
}: {
  rowCount: number;
  hasMore: boolean;
  /** No page in flight and no failed page: a failure keeps the button. */
  isSettled: boolean;
  /** What to focus inside the first new row. Default "a". */
  focusSelector?: string;
  /** Move focus after every page that adds rows. Default: the last page only. */
  shouldFocusEveryPage?: boolean;
}) {
  const { reducedMotion } = useMotionPrefs();
  const listRef = useRef<HTMLUListElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const firstNewRowIndexRef = useRef<number | null>(null);
  const scrollTimerRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (scrollTimerRef.current !== null)
        window.clearTimeout(scrollTimerRef.current);
    },
    [],
  );
  useEffect(() => {
    const firstNewRowIndex = firstNewRowIndexRef.current;
    if (firstNewRowIndex === null || !isSettled) return;
    const hasNewRows = rowCount > firstNewRowIndex;
    if (!hasNewRows && hasMore) return;
    firstNewRowIndexRef.current = null;
    if (hasMore && !shouldFocusEveryPage) return;
    const activeElement = document.activeElement;
    const isFocusLost =
      activeElement === null ||
      activeElement === document.body ||
      (footerRef.current?.contains(activeElement) ?? false);
    if (!isFocusLost) return;
    const rows = listRef.current?.children;
    if (!rows || rows.length === 0) return;
    const targetRow = rows.item(Math.min(firstNewRowIndex, rows.length - 1));
    const focusTarget = targetRow?.querySelector<HTMLElement>(focusSelector);
    if (!targetRow || !focusTarget) return;
    if (!shouldFocusEveryPage) {
      focusTarget.focus();
      return;
    }
    // The row is still fading in, so the scroll waits for it to settle.
    focusTarget.focus({ preventScroll: true });
    if (scrollTimerRef.current !== null)
      window.clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = null;
    if (reducedMotion) {
      targetRow.scrollIntoView({ block: "nearest" });
      return;
    }
    scrollTimerRef.current = window.setTimeout(() => {
      scrollTimerRef.current = null;
      targetRow.scrollIntoView({ block: "nearest" });
    }, ROW_REVEAL_MS);
  }, [
    rowCount,
    hasMore,
    isSettled,
    focusSelector,
    shouldFocusEveryPage,
    reducedMotion,
  ]);
  return {
    listRef,
    footerRef,
    markPageRequested: () => {
      firstNewRowIndexRef.current = rowCount;
    },
  };
}
