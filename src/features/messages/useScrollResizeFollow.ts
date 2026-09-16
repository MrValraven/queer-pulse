// src/features/messages/useScrollResizeFollow.ts
import { useLayoutEffect, type RefObject } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { isNearBottom } from "./useStickToBottom";
import type { PendingScrollAnchor, ScrollAnchor } from "./scrollAnchor";
// TEMPORARY — see scrollTrace.ts's revert instructions.
import { traceScrollEvent } from "./scrollTrace";

/**
 * Stick-to-bottom across a RESIZE, on either side of the scroll viewport:
 *
 *  - The content grows or shrinks (a late-loading image, an added reaction
 *    chip, an expanding inline edit, a row's estimate corrected to its measured
 *    height, the typing row). None of these change the message count, so the
 *    content effect in `useMessageScroll` never fires for them.
 *  - The scroll CONTAINER shrinks or grows (the on-screen keyboard changing
 *    `--keyboard-inset`, the composer auto-growing a line, a banner mounting
 *    above the log). `.area` loses height while the browser keeps `scrollTop`,
 *    so the newest lines slide under the composer with no scroll event at all.
 *    Watching only the content wrapper never saw this.
 *
 * A reader who WAS pinned (read off `atBottomRef`, which the scroll handler
 * keeps on the shared near-bottom threshold, never a post-resize re-measure) is
 * re-pinned INSTANTLY: a pinned viewport should snap as the layout changes, and
 * a smooth scroll would be interrupted by the very next resize. A reader
 * scrolled up is left exactly where they are. ResizeObserver callbacks run after
 * layout and before paint, so the re-pin lands in the same frame as the resize.
 *
 * An anchor that is RESTORING (a just-landed older page, or the unread landing)
 * wins over the bottom-stick for its settle window. An anchor that is only
 * armed (its page still in flight) moves nothing: re-snapping to it would pull
 * the reader back to a position they may have scrolled away from.
 */
export function useScrollResizeFollow(
  activeId: string,
  areaRef: RefObject<HTMLDivElement | null>,
  contentRef: RefObject<HTMLDivElement | null>,
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>,
  atBottomRef: RefObject<boolean>,
  pendingAnchorRef: RefObject<PendingScrollAnchor | null>,
  restoreAnchor: (anchor: ScrollAnchor) => void,
  scrollToBottom: (animate: boolean) => void,
): void {
  useLayoutEffect(() => {
    const area = areaRef.current;
    const content = contentRef.current;
    if (!area || !content || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const pendingAnchor = pendingAnchorRef.current;
      if (pendingAnchor?.isRestoring) {
        traceScrollEvent(
          "contentResize:restoreAnchorBranch",
          area,
          rowVirtualizer,
          atBottomRef,
        );
        restoreAnchor(pendingAnchor.anchor);
        return;
      }
      if (!atBottomRef.current) {
        traceScrollEvent(
          "contentResize:earlyReturn:notAtBottom",
          area,
          rowVirtualizer,
          atBottomRef,
        );
        return;
      }
      if (isNearBottom(area, 1)) {
        traceScrollEvent(
          "contentResize:earlyReturn:alreadyFlush",
          area,
          rowVirtualizer,
          atBottomRef,
        );
        return; // already flush to the bottom
      }
      traceScrollEvent(
        "contentResize:rePin",
        area,
        rowVirtualizer,
        atBottomRef,
      );
      scrollToBottom(false);
    });
    // Two stable nodes for the panel's lifetime: the in-flow content wrapper
    // (its box grows with any descendant) and the scroller itself (its box
    // changes only when the layout around it does). `MessageArea` is not
    // remounted per thread; re-running on `activeId` is a cheap, defensive
    // refresh rather than a requirement.
    observer.observe(content);
    observer.observe(area);
    return () => observer.disconnect();
  }, [
    activeId,
    areaRef,
    contentRef,
    rowVirtualizer,
    atBottomRef,
    pendingAnchorRef,
    restoreAnchor,
    scrollToBottom,
  ]);
}
