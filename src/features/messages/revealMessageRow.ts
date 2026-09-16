import type { Virtualizer } from "@tanstack/react-virtual";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";
import { findRowIndexForMessage, type MessageRow } from "./messageRows";
import { flashMessageHighlight } from "./messageJumpStore";

/** Longest we wait for the target row to mount and the scroll to come to rest
 *  before one final correction. Covers a smooth glide across two viewports plus
 *  the virtualizer's own re-targeting as unmeasured rows get their real size. */
const MAX_SETTLE_MS = 1500;
/** After that final correction, how long the row has to mount before the
 *  highlight is dropped instead of flashing on nothing. */
const FINAL_MOUNT_GRACE_MS = 500;
/** Consecutive frames the row must sit mounted, centred and still. */
const STABLE_FRAMES_REQUIRED = 2;
/** Sub-pixel rounding between the virtualizer's target and `scrollTop`. */
const CENTER_TOLERANCE_PX = 2;
/** A glide reads well for a nearby message; beyond this many viewports it is a
 *  long blur over rows that are still being measured, so the jump is instant. */
const GLIDE_MAX_VIEWPORTS = 2;
/** Input that means the reader has started scrolling on their own. After it,
 *  the settle loop never issues a correction that would pull them back. */
const READER_TAKEOVER_EVENTS = [
  "wheel",
  "touchstart",
  "pointerdown",
  "keydown",
] as const;

/**
 * Scrolls the row holding `messageId` to the centre of the log and flashes its
 * highlight once it has actually arrived. Returns a cancel function.
 *
 * The virtualizer is the only scroll writer. `scrollToIndex` already runs its
 * own reconcile loop, re-targeting frame by frame as rows between here and the
 * target are measured, so this loop only watches: it waits until the row is
 * mounted, centred and still for a couple of frames, then highlights. If the
 * settle window runs out while the row is still off-centre, it issues ONE
 * final `scrollToIndex`, unless the reader has taken over the scroll. The
 * highlight only ever flashes on a row that is mounted in the virtual window;
 * a takeover or a row that never lands ends the reveal without it.
 *
 * `beginProgrammaticJump` runs right before each `scrollToIndex`, so the
 * scroll layer's own writers (a bottom re-pin, a settling anchor) stand down.
 * `endProgrammaticJump` runs when the reveal ends on its own (never on an
 * outside cancel): a target in the last screen clamps the scroll with no
 * scroll event, so the scroll layer re-reads whether the reader is pinned.
 *
 * `getRows` is read every frame because a prepend or a live frame can shift
 * the target's index mid-settle; the lookup is by message id each time.
 */
export function revealMessageRow(
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>,
  getRows: () => MessageRow[],
  messageId: string,
  shouldAllowGlide: boolean,
  beginProgrammaticJump: () => void,
  endProgrammaticJump: () => void,
): () => void {
  const initialIndex = findRowIndexForMessage(getRows(), messageId);
  if (initialIndex === -1) return () => {};

  const currentOffset = rowVirtualizer.scrollOffset ?? 0;
  const initialTarget = rowVirtualizer.getOffsetForIndex(
    initialIndex,
    "center",
  )?.[0];
  const viewportHeight = rowVirtualizer.scrollRect?.height ?? 0;
  const isNearby =
    initialTarget !== undefined &&
    viewportHeight > 0 &&
    Math.abs(initialTarget - currentOffset) <=
      viewportHeight * GLIDE_MAX_VIEWPORTS;
  const shouldGlide =
    shouldAllowGlide && isNearby && !prefersReducedMotionNow();
  beginProgrammaticJump();
  rowVirtualizer.scrollToIndex(initialIndex, {
    align: "center",
    behavior: shouldGlide ? "smooth" : "auto",
  });

  const scrollElement = rowVirtualizer.scrollElement;
  const startedAt = performance.now();
  let frameId = 0;
  let isCancelled = false;
  let hasReaderTakenOver = false;
  let hasIssuedFinalCorrection = false;
  let stableFrames = 0;
  let previousOffset: number | null = null;

  const markReaderTakeover = () => {
    hasReaderTakenOver = true;
  };
  for (const eventName of READER_TAKEOVER_EVENTS) {
    scrollElement?.addEventListener(eventName, markReaderTakeover, {
      passive: true,
    });
  }

  const cleanup = () => {
    isCancelled = true;
    cancelAnimationFrame(frameId);
    for (const eventName of READER_TAKEOVER_EVENTS) {
      scrollElement?.removeEventListener(eventName, markReaderTakeover);
    }
  };
  const settle = () => {
    cleanup();
    endProgrammaticJump();
  };
  const finish = () => {
    settle();
    flashMessageHighlight(messageId);
  };

  const step = () => {
    if (isCancelled) return;
    const rows = getRows();
    const index = findRowIndexForMessage(rows, messageId);
    // The message left the loaded rows mid-settle (deleted for me, thread
    // replaced): nothing to land on or highlight.
    if (index === -1) {
      settle();
      return;
    }
    const rowKey = rows[index]?.key;
    // In the virtual window AND its node is on the page: the row is really
    // there to wear the ring.
    const isMounted =
      rowKey !== undefined &&
      rowVirtualizer.getVirtualItems().some((item) => item.key === rowKey) &&
      !!rowVirtualizer.elementsCache.get(rowKey)?.isConnected;
    if (hasReaderTakenOver) {
      if (isMounted) finish();
      else settle();
      return;
    }
    const offset = rowVirtualizer.scrollOffset ?? 0;
    const target = rowVirtualizer.getOffsetForIndex(index, "center")?.[0];
    const isCentered =
      target !== undefined && Math.abs(target - offset) <= CENTER_TOLERANCE_PX;
    const isStill = offset === previousOffset;
    stableFrames = isMounted && isCentered && isStill ? stableFrames + 1 : 0;
    previousOffset = offset;

    if (stableFrames >= STABLE_FRAMES_REQUIRED) {
      finish();
      return;
    }
    const elapsedMs = performance.now() - startedAt;
    if (hasIssuedFinalCorrection) {
      if (isMounted) {
        finish();
        return;
      }
      if (elapsedMs >= MAX_SETTLE_MS + FINAL_MOUNT_GRACE_MS) {
        settle();
        return;
      }
    } else if (elapsedMs >= MAX_SETTLE_MS) {
      hasIssuedFinalCorrection = true;
      if (!isCentered) {
        beginProgrammaticJump();
        rowVirtualizer.scrollToIndex(index, {
          align: "center",
          behavior: "auto",
        });
      } else if (isMounted) {
        finish();
        return;
      }
    }
    frameId = requestAnimationFrame(step);
  };
  frameId = requestAnimationFrame(step);

  return cleanup;
}
