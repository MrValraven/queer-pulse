import {
  useCallback,
  useLayoutEffect,
  useRef,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { isNearBottom } from "./useStickToBottom";
import type { ThreadWindowControls } from "./threadWindowTypes";

interface ThreadWindowScrollInput {
  threadWindow: ThreadWindowControls | undefined;
  activeId: string;
  messageCount: number;
  inboundCount: number;
  loadingOlder: boolean;
  areaRef: RefObject<HTMLDivElement | null>;
  atBottomRef: RefObject<boolean>;
  /** `useMessageScroll`'s growth baselines, reset when the rendered history
   *  swaps source so the swap never reads as growth. */
  previousCountRef: RefObject<number>;
  previousInboundCountRef: RefObject<number>;
  setNewMessagesCount: Dispatch<SetStateAction<number>>;
  resetOlderPageAnchor: (loadingOlder: boolean) => void;
  scrollToBottom: (animate: boolean) => void;
}

/**
 * PRD-401: the scroll layer's side of a detached history window, extracted
 * from `useMessageScroll`. MUST be called between that hook's thread-switch
 * effect and its content effect: its window-switch layout effect relies on
 * that declaration order (see `useMessageScroll`'s file comment).
 *
 * - The window-switch effect: the log swapped between the live tail and a
 *   detached window. The swap never reads as growth, since the rows on screen
 *   changed source and nothing arrived. A detached window is never pinned to
 *   the bottom (paging newer appends below the reader, who keeps their
 *   place). Going back through the jump-to-latest pill or a send pins to the
 *   latest message; a window that paged newer into the tail keeps the reader
 *   exactly where they are.
 * - `handleDetachedScroll`: a detached window's bottom is a page boundary, so
 *   reaching it pages newer and the reader stays unpinned. Returns true when
 *   it handled the scroll event's pin state.
 * - `jumpToLatest`: the pill tap. Out of a detached window it drops the
 *   window, and the window-switch effect pins once the live rows render. On
 *   the live tail it glides to the bottom and still cancels a window request
 *   that is loading.
 */
export function useThreadWindowScroll({
  threadWindow,
  activeId,
  messageCount,
  inboundCount,
  loadingOlder,
  areaRef,
  atBottomRef,
  previousCountRef,
  previousInboundCountRef,
  setNewMessagesCount,
  resetOlderPageAnchor,
  scrollToBottom,
}: ThreadWindowScrollInput) {
  const isDetached = (threadWindow?.anchorMessageId ?? null) !== null;
  const returnToLatestGeneration = threadWindow?.returnToLatestGeneration ?? 0;

  const isDetachedRef = useRef(isDetached);
  const previousWindowStateRef = useRef({
    activeId,
    isDetached,
    returnToLatestGeneration,
  });
  useLayoutEffect(() => {
    isDetachedRef.current = isDetached;
    const previous = previousWindowStateRef.current;
    previousWindowStateRef.current = {
      activeId,
      isDetached,
      returnToLatestGeneration,
    };
    // A thread switch is the thread-switch effect's to handle.
    if (previous.activeId !== activeId) return;
    const hasReturnedToLatest =
      previous.returnToLatestGeneration !== returnToLatestGeneration;
    if (previous.isDetached === isDetached && !hasReturnedToLatest) return;
    previousCountRef.current = messageCount;
    previousInboundCountRef.current = inboundCount;
    // Clears the pill alongside the swap of the rendered history.
    setNewMessagesCount(0);
    resetOlderPageAnchor(loadingOlder);
    if (isDetached) {
      atBottomRef.current = false;
    } else if (hasReturnedToLatest) {
      scrollToBottom(false);
    } else {
      const element = areaRef.current;
      atBottomRef.current = element ? isNearBottom(element) : true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, isDetached, returnToLatestGeneration]);

  const handleDetachedScroll = useCallback(
    (element: HTMLElement): boolean => {
      if (!isDetached) return false;
      atBottomRef.current = false;
      if (
        isNearBottom(element) &&
        threadWindow?.hasMoreNewer &&
        !threadWindow.isLoadingNewer
      ) {
        threadWindow.onLoadNewer();
      }
      return true;
    },
    [isDetached, threadWindow, atBottomRef],
  );

  const jumpToLatest = useCallback(() => {
    threadWindow?.onReturnToLatest();
    if (isDetached) return;
    scrollToBottom(true);
    setNewMessagesCount(0);
  }, [isDetached, threadWindow, scrollToBottom, setNewMessagesCount]);

  return { isDetached, isDetachedRef, handleDetachedScroll, jumpToLatest };
}
