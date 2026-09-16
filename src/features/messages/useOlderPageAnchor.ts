// src/features/messages/useOlderPageAnchor.ts
import { useCallback, useMemo, useRef, type RefObject } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import type { MessageRow } from "./messageRows";
import { isNearBottom } from "./useStickToBottom";
import {
  captureScrollAnchor,
  holdAnchorThroughSettle,
  resolveAnchorScrollTop,
  type PendingScrollAnchor,
  type ScrollAnchor,
} from "./scrollAnchor";
// TEMPORARY — see scrollTrace.ts's revert instructions.
import { traceScrollEvent } from "./scrollTrace";

/** An armed anchor whose page has not started loading this long after it was
 *  armed was dropped by the fetch layer; it must not block the next request. */
const ARMED_ANCHOR_PICKUP_GRACE_MS = 1500;

function isAbandonedArmedAnchor(
  pendingAnchor: PendingScrollAnchor,
  hasPageStartedLoading: boolean,
): boolean {
  return (
    !pendingAnchor.isRestoring &&
    !hasPageStartedLoading &&
    performance.now() - (pendingAnchor.armedAtMs ?? 0) >
      ARMED_ANCHOR_PICKUP_GRACE_MS
  );
}

/** The open thread's history paging state, as the controller derives it (see
 *  `useMessageThread`). One object so it travels to the scroll layer, the
 *  unread landing and the jump hunter unchanged. */
export interface ThreadHistory {
  hasMoreOlder: boolean;
  loadingOlder: boolean;
  /** Requests the next older page: from the server live, and from the demo
   *  session store in demo (`demoThreadCache.ts`). */
  onLoadOlder: () => void;
  /** Page 0 fetched, its last fetch succeeded, and no fetch of it pending. */
  isHistorySettled: boolean;
  /** Page 0's last fetch failed (an older page failing never sets this). */
  isHistoryError: boolean;
  /** The query holds SOME page-0 data, even an empty page for a thread with
   *  no messages yet (a brand new group). Distinct from `isHistorySettled`:
   *  a paused background refetch while offline can hold that false even
   *  though restored data is sitting right there. Lets a reader tell "this
   *  thread is genuinely empty" apart from "this thread was never loaded". */
  hasLoadedThreadData: boolean;
}

/** The scroll layer's side of a jump-to-message, handed to the jump hunter. */
export interface JumpScrollBridge {
  /** Right before a reveal scrolls: the reveal owns the viewport from here. It
   *  un-pins the reader from the bottom, releases a settling anchor (either
   *  would overwrite the reveal's scroll) and cancels a pending unread landing.
   *  Stable identity. */
  beginProgrammaticJump: () => void;
  /** When a reveal ends on its own: re-reads whether the reader is pinned to
   *  the bottom, since a clamped scroll to a target in the last screen fires
   *  no scroll event to do it. Stable identity. */
  endProgrammaticJump: () => void;
  /** When a hunt starts: a pending unread landing must not move the reader. */
  cancelUnreadLanding: () => void;
  /** Right before a hunt or landing requests an older page: keeps the reader's
   *  place through the prepend. */
  armHistoryPageAnchor: () => void;
}

/**
 * Keeps the reader's place while an older-history page loads and prepends
 * (see `scrollAnchor.ts` for the coordinate space and the anchor-row choice).
 *
 * Lifecycle of one anchor: ARMED when the scroll handler requests a page (and
 * re-captured on every scroll while the page is in flight, so it describes
 * where the reader is when the page lands), then on the request's settle edge
 * either RESTORING for a short window (rows landed) or disarmed (the page
 * failed or came back empty). The settle edge is `loadingOlder` going from true
 * to false: react-query flips `isFetchingNextPage` off in the same commit that
 * lands the page, or with no new rows at all on an error or an empty page, so a
 * flaky request can never leave an anchor armed that blocks load-older for good
 * or re-snaps the reader on a later resize.
 */
export function useOlderPageAnchor(
  areaRef: RefObject<HTMLDivElement | null>,
  contentRef: RefObject<HTMLDivElement | null>,
  rowVirtualizer: Virtualizer<HTMLDivElement, Element>,
  rows: MessageRow[],
  atBottomRef: RefObject<boolean>,
) {
  /** The anchor armed or settling; null when there is none. */
  const pendingAnchorRef = useRef<PendingScrollAnchor | null>(null);
  /** `loadingOlder` as of the previous settle check (see the file comment). */
  const wasLoadingOlderRef = useRef(false);

  /** Puts a remembered anchor back on screen: the target is resolved in the
   *  scroller's DOM scroll space, the space the anchor was captured in, and
   *  written through the virtualizer's own offset API (see `useMessageScroll`
   *  for why every write goes through it). */
  const restoreAnchor = useCallback(
    (anchor: ScrollAnchor) => {
      const area = areaRef.current;
      const content = contentRef.current;
      if (!area || !content) return;
      const targetOffset = resolveAnchorScrollTop(
        area,
        content,
        rowVirtualizer,
        anchor,
      );
      traceScrollEvent(
        "restoreAnchor:before",
        area,
        rowVirtualizer,
        atBottomRef,
        { rowKey: anchor.rowKey, targetOffset },
      );
      rowVirtualizer.scrollToOffset(targetOffset, {
        align: "start",
        behavior: "auto",
      });
    },
    [areaRef, contentRef, rowVirtualizer, atBottomRef],
  );

  /** Thread switch: drop any anchor, and treat the previous thread's in-flight
   *  page as not this thread's settle edge. */
  const resetOlderPageAnchor = useCallback((loadingOlder: boolean) => {
    pendingAnchorRef.current = null;
    wasLoadingOlderRef.current = loadingOlder;
  }, []);

  /** Runs on every content change. Returns whether an older-page request just
   *  settled, and whether an armed anchor consumed that settle (the caller then
   *  moves nothing else this commit). */
  const settleOlderPage = useCallback(
    (loadingOlder: boolean, hasGrown: boolean) => {
      const isOlderPageSettle = wasLoadingOlderRef.current && !loadingOlder;
      wasLoadingOlderRef.current = loadingOlder;
      const pendingAnchor = pendingAnchorRef.current;
      if (!isOlderPageSettle || !pendingAnchor || pendingAnchor.isRestoring) {
        // No settle, or a page loaded without an anchor (the unread landing's
        // own paging). Growth while a page is in flight is a live arrival at
        // the bottom, which moves nothing above it.
        return { isOlderPageSettle, isConsumed: false };
      }
      if (hasGrown) {
        restoreAnchor(pendingAnchor.anchor);
        holdAnchorThroughSettle(pendingAnchorRef, pendingAnchor.anchor);
      } else {
        pendingAnchorRef.current = null;
      }
      return { isOlderPageSettle, isConsumed: true };
    },
    [restoreAnchor],
  );

  /** From the scroll handler: re-captures an armed anchor so it follows the
   *  reader while the page is in flight. Restore writes are skipped. */
  const followReaderWhileArmed = useCallback(
    (element: HTMLElement) => {
      const content = contentRef.current;
      const pendingAnchor = pendingAnchorRef.current;
      if (!content || !pendingAnchor || pendingAnchor.isRestoring) return;
      pendingAnchor.anchor = captureScrollAnchor(
        element,
        content,
        rowVirtualizer,
        rows,
      );
    },
    [contentRef, rowVirtualizer, rows],
  );

  /** Arms an anchor ahead of a load-older request. False when one is already
   *  armed or settling (or the content node is missing): request nothing. */
  const armOlderPageAnchor = useCallback(
    (element: HTMLElement): boolean => {
      const content = contentRef.current;
      const pendingAnchor = pendingAnchorRef.current;
      if (
        !content ||
        (pendingAnchor !== null &&
          !isAbandonedArmedAnchor(pendingAnchor, wasLoadingOlderRef.current))
      ) {
        return false;
      }
      pendingAnchorRef.current = {
        anchor: captureScrollAnchor(element, content, rowVirtualizer, rows),
        isRestoring: false,
        armedAtMs: performance.now(),
      };
      return true;
    },
    [contentRef, rowVirtualizer, rows],
  );

  /** Before a jump hunt or the unread landing requests a page. A settling
   *  anchor has already been applied, so the reader's current place replaces
   *  it; an armed one already covers the page in flight and stays. */
  const armHistoryPageAnchor = useCallback(() => {
    const area = areaRef.current;
    const pendingAnchor = pendingAnchorRef.current;
    if (!area) return;
    if (
      pendingAnchor !== null &&
      !pendingAnchor.isRestoring &&
      !isAbandonedArmedAnchor(pendingAnchor, wasLoadingOlderRef.current)
    ) {
      return;
    }
    pendingAnchorRef.current = null;
    armOlderPageAnchor(area);
  }, [areaRef, armOlderPageAnchor]);

  /** A reveal is taking the viewport: a settling anchor would pull it back.
   *  An armed anchor stays, since it follows every scroll, the reveal's too. */
  const releaseSettlingAnchor = useCallback(() => {
    if (pendingAnchorRef.current?.isRestoring) pendingAnchorRef.current = null;
  }, []);

  return {
    pendingAnchorRef,
    restoreAnchor,
    resetOlderPageAnchor,
    settleOlderPage,
    followReaderWhileArmed,
    armOlderPageAnchor,
    armHistoryPageAnchor,
    releaseSettlingAnchor,
  };
}

/** Builds the `JumpScrollBridge` from the scroll layer's pieces. */
export function useJumpScrollBridge(
  areaRef: RefObject<HTMLDivElement | null>,
  atBottomRef: RefObject<boolean>,
  releaseSettlingAnchor: () => void,
  cancelUnreadLanding: () => void,
  armHistoryPageAnchor: () => void,
): JumpScrollBridge {
  const beginProgrammaticJump = useCallback(() => {
    atBottomRef.current = false;
    releaseSettlingAnchor();
    cancelUnreadLanding();
  }, [atBottomRef, releaseSettlingAnchor, cancelUnreadLanding]);
  const endProgrammaticJump = useCallback(() => {
    const area = areaRef.current;
    if (area) atBottomRef.current = isNearBottom(area);
  }, [areaRef, atBottomRef]);
  return useMemo(
    () => ({
      beginProgrammaticJump,
      endProgrammaticJump,
      cancelUnreadLanding,
      armHistoryPageAnchor,
    }),
    [
      beginProgrammaticJump,
      endProgrammaticJump,
      cancelUnreadLanding,
      armHistoryPageAnchor,
    ],
  );
}
