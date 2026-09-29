import { useCallback, type RefObject } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
// TEMPORARY: see scrollTrace.ts's revert instructions.
import { traceScrollEvent } from "./scrollTrace";

/**
 * The message area's one pin to the bottom, extracted from `useMessageScroll`
 * so that hook stays inside its line budget. Every write goes through the
 * virtualizer's own scroll API (see `useMessageScroll`'s file comment for why
 * a raw `element.scrollTop =` is unsafe on the virtualized log), and every
 * call marks the reader as pinned (`atBottomRef`).
 *
 * `animate` requests a smooth glide (honouring prefers-reduced-motion:
 * reduced-motion readers always get an instant jump); every pin passes
 * `false` (an instant WhatsApp-style snap) EXCEPT the explicit pill tap
 * (`jumpToLatest`), which is a user-initiated jump across potentially many
 * messages and reads better as a glide. Thread-switch, new-message, and
 * resize-follow are all instant: the reader should never watch a growing
 * thread glide into place.
 *
 * Nothing wraps this in an animation: a transform on the log would hang
 * below its layout box and hand the next pin scroll room that does not
 * really exist. `.area`'s block padding is outside the virtualizer's
 * coordinate space (no `scrollMargin`/`paddingStart` is passed), so
 * `scrollToIndex(last, "end")` already targets ~40px past the true bottom
 * and will consume any such room on sight. Measured: an animated log walked
 * itself up 45px per frame and then snapped back.
 */
export function useScrollToBottom(
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>,
  areaRef: RefObject<HTMLDivElement | null>,
  atBottomRef: RefObject<boolean>,
): (animate: boolean) => void {
  return useCallback(
    (animate: boolean) => {
      const rowCount = rowVirtualizer.options.count;
      const behavior =
        animate && !prefersReducedMotionNow() ? "smooth" : "auto";
      traceScrollEvent(
        "scrollToBottom:before",
        areaRef.current,
        rowVirtualizer,
        atBottomRef,
        {
          rowCount,
          targetIndex: rowCount > 0 ? rowCount - 1 : null,
          behavior,
        },
      );
      if (rowCount > 0) {
        // `scrollToIndex` resolves iteratively across frames while the target
        // row's real height is still unknown. On a long thread that is exactly
        // the row nobody has measured yet, and a single offset computed from
        // the CURRENT (partly estimated) `getTotalSize()` consistently came up
        // short of the true bottom in practice.
        rowVirtualizer.scrollToIndex(rowCount - 1, { align: "end", behavior });
      } else {
        rowVirtualizer.scrollToOffset(0, { align: "start", behavior });
      }
      atBottomRef.current = true;
      traceScrollEvent(
        "scrollToBottom:after",
        areaRef.current,
        rowVirtualizer,
        atBottomRef,
        {
          rowCount,
          targetIndex: rowCount > 0 ? rowCount - 1 : null,
        },
      );
    },
    [rowVirtualizer, areaRef, atBottomRef],
  );
}
