import { useLayoutEffect, useRef, useState } from "react";
import { isNearBottom } from "./useStickToBottom";

/**
 * Owns the message-area scroll position for a conversation: sticks to the
 * bottom on new content only when the reader is already near it (else surfaces
 * a "new messages" pill), preserves the viewport when older history prepends,
 * and jumps to the latest message on a thread switch. Extracted from
 * `ConversationPanel` so that delicate logic lives in one focused unit.
 *
 * The two `useLayoutEffect`s MUST stay in this declaration order: React flushes
 * layout effects before paint in declaration order, so the thread-switch effect
 * runs first (resetting the growth baseline) and the content effect then sees no
 * spurious growth. Keeping both in ONE hook preserves that guarantee.
 */
export function useMessageScroll(
  messageCount: number,
  activeId: string,
  hasMoreOlder: boolean,
  loadingOlder: boolean,
  onLoadOlder: () => void,
) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [showJumpPill, setShowJumpPill] = useState(false);
  const previousCountRef = useRef(0);
  /** Distance-from-bottom to restore after an older-history prepend, so the
   *  viewport doesn't jump; null when no restore is pending. */
  const pendingAnchorRef = useRef<number | null>(null);

  // Thread switch: jump to bottom, hide the pill, reset the growth baseline, and
  // (desktop only) focus the composer. Declared BEFORE the content effect below.
  useLayoutEffect(() => {
    const element = areaRef.current;
    if (element) element.scrollTop = element.scrollHeight;
    setShowJumpPill(false);
    previousCountRef.current = messageCount;
    pendingAnchorRef.current = null;
    if (window.matchMedia?.("(pointer: fine)").matches) {
      document.getElementById("messages-composer")?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Single owner of scroll position on content change, in priority order:
  //  1. An older-history page just prepended → restore the reader's viewport.
  //  2. New content at the bottom → stick if already near it, else show the pill.
  useLayoutEffect(() => {
    const element = areaRef.current;
    if (!element) return;
    const previousCount = previousCountRef.current;
    previousCountRef.current = messageCount;
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
      element.scrollTop = element.scrollHeight;
      setShowJumpPill(false);
      return;
    }
    if (!grew) return;
    if (isNearBottom(element)) {
      element.scrollTop = element.scrollHeight;
      setShowJumpPill(false);
    } else {
      setShowJumpPill(true);
    }
  }, [messageCount]);

  function handleAreaScroll() {
    const element = areaRef.current;
    if (!element) return;
    if (isNearBottom(element)) setShowJumpPill(false);
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
  }

  function jumpToLatest() {
    const element = areaRef.current;
    if (element) element.scrollTop = element.scrollHeight;
    setShowJumpPill(false);
  }

  return { areaRef, showJumpPill, handleAreaScroll, jumpToLatest };
}
