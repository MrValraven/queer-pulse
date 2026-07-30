import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { isNearBottom } from "./useStickToBottom";
import { prefersReducedMotionNow } from "../../shared/hooks/usePrefersReducedMotion";

/**
 * Owns the message-area scroll position for a conversation: sticks to the
 * bottom on new content only when the reader is already near it (else surfaces
 * a counted "new messages" pill), preserves the viewport when older history
 * prepends, keeps the reader pinned when a visible bubble *resizes* (a late
 * image, an added reaction, an expanded edit), and jumps to the latest message
 * on a thread switch. Extracted from `ConversationPanel` so that delicate logic
 * lives in one focused unit.
 *
 * The two content-mutating `useLayoutEffect`s MUST stay in this declaration
 * order: React flushes layout effects before paint in declaration order, so the
 * thread-switch effect runs first (resetting the growth baseline) and the
 * content effect then sees no spurious growth. The ResizeObserver effect is
 * set-up only (its work runs async, off `atBottomRef`), so its position is
 * immaterial — it lives last.
 */
export function useMessageScroll(
  messageCount: number,
  /** How many of the rendered messages are inbound (`from === "them"`). Drives
   *  the jump-pill count: only genuinely-inbound arrivals while scrolled up
   *  count as unread — the reader's own sends never do. */
  inboundCount: number,
  activeId: string,
  hasMoreOlder: boolean,
  loadingOlder: boolean,
  onLoadOlder: () => void,
) {
  const areaRef = useRef<HTMLDivElement>(null);
  /** A single stable wrapper around the day-groups + typing row (see
   *  `MessageArea`'s `.areaContent`) — the ONE node the resize-follow effect
   *  below observes. `areaRef`'s own box is fixed (`overflow-y: auto`), so it
   *  never reports a growing bubble; a plain in-flow wrapper's box grows with
   *  any descendant, so observing just this one node (instead of re-observing
   *  every child on every new message) catches every resize for the whole
   *  life of the thread. */
  const contentRef = useRef<HTMLDivElement>(null);
  /** Inbound messages that arrived while the reader was scrolled up; 0 when
   *  they're at the bottom. Shown on the jump-to-latest pill. */
  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const previousCountRef = useRef(0);
  const previousInboundCountRef = useRef(0);
  /** Distance-from-bottom to restore after an older-history prepend, so the
   *  viewport doesn't jump; null when no restore is pending. */
  const pendingAnchorRef = useRef<number | null>(null);
  /** Whether the reader is currently anchored to the bottom — the single source
   *  of truth for stick-to-bottom. Read on resize (a growing bubble must not
   *  un-stick a reader who WAS at the bottom) and on new content; updated on
   *  every scroll and after every programmatic pin. Deliberately NOT a
   *  post-mutation re-measure of `isNearBottom`: freshly-added or freshly-grown
   *  content skews distance-from-bottom, so a reader who was pinned would read
   *  as "far from bottom" the instant a tall bubble lands. */
  const atBottomRef = useRef(true);

  /** Pin to the bottom. `animate` requests a smooth glide (honouring
   *  prefers-reduced-motion — reduced-motion readers always get an instant
   *  jump, no animation); every pin passes `false` (an instant WhatsApp-style
   *  snap) EXCEPT the explicit pill tap (`jumpToLatest`), which is a
   *  user-initiated jump across potentially many messages and reads better as
   *  a glide. Thread-switch, new-message, and resize-follow are all instant —
   *  the reader should never watch a growing thread glide into place. */
  function scrollToBottom(element: HTMLDivElement, animate: boolean) {
    if (animate && !prefersReducedMotionNow()) {
      element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
    } else {
      element.scrollTop = element.scrollHeight;
    }
    atBottomRef.current = true;
  }

  // Thread switch: jump to bottom, reset the pill count and growth baselines,
  // and (desktop only) focus the composer. Declared BEFORE the content effect.
  useLayoutEffect(() => {
    const element = areaRef.current;
    if (element) scrollToBottom(element, false);
    // Resets the scroll pill on thread switch, alongside the DOM scroll pin.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNewMessagesCount(0);
    previousCountRef.current = messageCount;
    previousInboundCountRef.current = inboundCount;
    pendingAnchorRef.current = null;
    atBottomRef.current = true;
    if (window.matchMedia?.("(pointer: fine)").matches) {
      document.getElementById("messages-composer")?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Single owner of scroll position on content change, in priority order:
  //  1. An older-history page just prepended → restore the reader's viewport.
  //  2. New content at the bottom → stick if the reader is pinned there, else
  //     accrue the inbound arrivals onto the pill count.
  useLayoutEffect(() => {
    const element = areaRef.current;
    if (!element) return;
    const previousCount = previousCountRef.current;
    const previousInbound = previousInboundCountRef.current;
    previousCountRef.current = messageCount;
    previousInboundCountRef.current = inboundCount;
    if (pendingAnchorRef.current !== null) {
      element.scrollTop = element.scrollHeight - pendingAnchorRef.current;
      pendingAnchorRef.current = null;
      return;
    }
    // First time this thread's messages populate — in live mode history arrives
    // on a LATER commit than the thread switch, when the container was still
    // empty (count 0). Land on the latest message, never surface the pill.
    const isFirstPopulation = previousCount === 0 && messageCount > 0;
    const grew = messageCount > previousCount;
    if (isFirstPopulation) {
      scrollToBottom(element, false);
      setNewMessagesCount(0);
      return;
    }
    if (!grew) return;
    if (atBottomRef.current) {
      scrollToBottom(element, false);
      setNewMessagesCount(0);
    } else {
      // Only inbound arrivals count as "new" on the pill; my own sends (which
      // also grow the list) never do.
      const inboundArrived = inboundCount - previousInbound;
      if (inboundArrived > 0) {
        setNewMessagesCount((current) => current + inboundArrived);
      }
    }
  }, [messageCount, inboundCount]);

  // Stick-to-bottom must survive a *resize* of already-rendered content — a
  // late-loading image, an added reaction chip, an expanding inline edit —
  // none of which change `messageCount`, so the effect above never fires for
  // them. A ResizeObserver re-pins a reader who WAS at the bottom (read off
  // `atBottomRef`, never a post-resize re-measure), and does it INSTANTLY —
  // WhatsApp-style, a pinned reader's viewport should snap as content grows,
  // not glide, and a smooth scroll here would otherwise compete with (and get
  // visibly interrupted by) the very next resize a moment later. It never
  // fights the two other paths: during an older-history load the reader is at
  // the TOP, so `atBottomRef` is false and this stays inert; and it only ever
  // pins toward the bottom, never toward a prepend.
  useLayoutEffect(() => {
    const area = areaRef.current;
    const content = contentRef.current;
    if (!area || !content || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (!atBottomRef.current) return;
      if (isNearBottom(area, 1)) return; // already flush to the bottom
      scrollToBottom(area, false);
    });
    // ONE stable node for the whole panel's lifetime (see `contentRef`'s
    // comment) — no re-subscribing per message. `MessageArea` itself isn't
    // remounted per thread, so `content` doesn't actually change across a
    // switch either; re-running on `activeId` is a cheap, defensive refresh
    // rather than a requirement.
    observer.observe(content);
    return () => observer.disconnect();
  }, [activeId]);

  // Stabilized: `ConversationPanel` re-renders more often than this hook's own
  // logic changes (a receipt tick, a thread-unrelated state update), and this
  // callback is handed to `MessageArea` as `onScroll` — an unstable reference
  // there is harmless today (`MessageArea` isn't itself `React.memo`'d), but
  // keeping it stable costs nothing and matches the rest of this pane.
  const handleAreaScroll = useCallback(() => {
    const element = areaRef.current;
    if (!element) return;
    if (isNearBottom(element)) {
      atBottomRef.current = true;
      setNewMessagesCount(0);
    } else {
      atBottomRef.current = false;
    }
    if (
      element.scrollTop <= 48 &&
      hasMoreOlder &&
      !loadingOlder &&
      pendingAnchorRef.current === null
    ) {
      // Preserve the viewport: remember distance-from-bottom, restore after prepend.
      pendingAnchorRef.current = element.scrollHeight - element.scrollTop;
      onLoadOlder();
    }
  }, [hasMoreOlder, loadingOlder, onLoadOlder]);

  const jumpToLatest = useCallback(() => {
    const element = areaRef.current;
    if (element) scrollToBottom(element, true);
    setNewMessagesCount(0);
  }, []);

  return {
    areaRef,
    contentRef,
    showJumpPill: newMessagesCount > 0,
    newMessagesCount,
    handleAreaScroll,
    jumpToLatest,
  };
}
