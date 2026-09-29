// src/features/messages/api/useThreadWindow.ts
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "../../../shared/api/client";
import type {
  ThreadWindowControls,
  ThreadWindowOutcome,
} from "../threadWindowTypes";
import {
  mergeWindowIntoLiveThread,
  threadWindowKey,
  threadWindowQueryOptions,
  type ThreadWindowPage,
  type ThreadWindowPageParam,
} from "./threadWindow";
import { THREAD_HISTORY_STALE_TIME_MS } from "./threadCacheTrim";

interface WindowAnchor {
  conversationId: string;
  messageId: string;
}

/** Where the observer points while no window is shown: outside the
 *  `["messages"]` prefix, so no cache walk or trim ever sees it. */
const IDLE_WINDOW_KEY = ["thread-window-idle"];

/**
 * PRD-401: the open thread's detached history window (see `threadWindow.ts`).
 * `openWindowAround` prefetches a window centred on a message and
 * `showWindow` shows it, only while that request is still the current one;
 * the reader pages older and newer inside it, and it hands back to the live
 * query either when paging newer reaches the tail (merged, so the rows
 * on screen keep their place) or when the reader returns to the latest
 * message (dropped). The live query stays observed the whole time, so live
 * frames, reconnect sync and every cache patch keep it current underneath.
 * A thread switch drops the window.
 */
export function useThreadWindow(
  conversationId: string | null,
  demoMode: boolean,
) {
  const queryClient = useQueryClient();
  const [anchor, setAnchor] = useState<WindowAnchor | null>(null);
  const [returnToLatestGeneration, setReturnToLatestGeneration] = useState(0);
  const activeAnchor =
    anchor && anchor.conversationId === conversationId ? anchor : null;
  // A window belongs to the visit that opened it: leaving the thread drops it.
  if (anchor && !activeAnchor) setAnchor(null);

  const windowOptions = threadWindowQueryOptions(
    queryClient,
    activeAnchor?.conversationId ?? "",
    demoMode,
    activeAnchor?.messageId ?? "",
  );
  const windowQuery = useInfiniteQuery<
    ThreadWindowPage,
    Error,
    InfiniteData<ThreadWindowPage, ThreadWindowPageParam>,
    unknown[],
    ThreadWindowPageParam
  >({
    ...windowOptions,
    queryKey: activeAnchor ? windowOptions.queryKey : IDLE_WINDOW_KEY,
    enabled: activeAnchor !== null,
    staleTime: THREAD_HISTORY_STALE_TIME_MS,
  });

  // The one window request that may still be shown. Every new request
  // replaces it and a return to the latest message clears it, so a response
  // that lands after either one is never shown (a superseded jump, or a send
  // or pill tap made while it was loading).
  const pendingRequestRef = useRef<WindowAnchor | null>(null);
  // Counts every return to the latest message (each send, each pill tap),
  // whether or not a window was shown. A ref keeps it off the render path, so
  // a send never scrolls, resets the pill or re-anchors older pages through
  // it. The jump hunter reads it to end a hunt the reader has moved on from.
  const cancelCountRef = useRef(0);
  const readCancelCount = useCallback(() => cancelCountRef.current, []);

  const openWindowAround = useCallback(
    async (messageId: string): Promise<ThreadWindowOutcome> => {
      if (!conversationId) return "failed";
      const request: WindowAnchor = { conversationId, messageId };
      pendingRequestRef.current = request;
      try {
        await queryClient.fetchInfiniteQuery({
          ...threadWindowQueryOptions(
            queryClient,
            conversationId,
            demoMode,
            messageId,
          ),
          staleTime: THREAD_HISTORY_STALE_TIME_MS,
        });
      } catch (error) {
        if (pendingRequestRef.current !== request) return "cancelled";
        return error instanceof ApiError && error.status === 404
          ? "notFound"
          : "failed";
      }
      return pendingRequestRef.current === request ? "ready" : "cancelled";
    },
    [conversationId, demoMode, queryClient],
  );

  const showWindow = useCallback(
    (messageId: string): boolean => {
      const request = pendingRequestRef.current;
      const isCurrentRequest =
        request !== null &&
        request.messageId === messageId &&
        request.conversationId === conversationId;
      if (!isCurrentRequest) return false;
      pendingRequestRef.current = null;
      setAnchor(request);
      return true;
    },
    [conversationId],
  );

  // A shown window is dropped from the cache once it stops being shown.
  useEffect(() => {
    if (!activeAnchor) return;
    const windowKey = threadWindowKey(
      activeAnchor.conversationId,
      demoMode,
      activeAnchor.messageId,
    );
    return () => {
      queryClient.removeQueries({ queryKey: windowKey, exact: true });
    };
  }, [activeAnchor, demoMode, queryClient]);

  // Paging newer reached the tail: the window becomes the live thread. An
  // in-flight live refetch is cancelled first so it cannot overwrite the
  // merge with a shorter page 0.
  const windowData = windowQuery.data;
  const isWindowAtTail =
    activeAnchor !== null &&
    windowData !== undefined &&
    windowData.pages[0]?.newerCursor === null &&
    !windowQuery.isFetching;
  useEffect(() => {
    if (!isWindowAtTail || !windowData || !activeAnchor) return;
    let isCancelled = false;
    const liveKey = ["messages", activeAnchor.conversationId, demoMode];
    void queryClient
      .cancelQueries({ queryKey: liveKey, exact: true })
      .then(() => {
        if (isCancelled) return;
        mergeWindowIntoLiveThread(queryClient, liveKey, windowData);
        setAnchor((current) => (current === activeAnchor ? null : current));
      });
    return () => {
      isCancelled = true;
    };
  }, [isWindowAtTail, windowData, activeAnchor, demoMode, queryClient]);

  const { hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage } =
    windowQuery;
  const onLoadNewer = useCallback(() => {
    if (!hasPreviousPage || isFetchingPreviousPage) return;
    void fetchPreviousPage({ cancelRefetch: false });
  }, [hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage]);

  const onReturnToLatest = useCallback(() => {
    // Also cancels a window still loading, and any jump hunt still on its
    // way to one (see `readCancelCount`): the reader asked for the latest.
    pendingRequestRef.current = null;
    cancelCountRef.current += 1;
    if (!activeAnchor) return;
    setAnchor(null);
    setReturnToLatestGeneration((generation) => generation + 1);
  }, [activeAnchor]);

  const controls: ThreadWindowControls = useMemo(
    () => ({
      anchorMessageId: activeAnchor?.messageId ?? null,
      hasMoreNewer: activeAnchor !== null && hasPreviousPage,
      isLoadingNewer: activeAnchor !== null && isFetchingPreviousPage,
      onLoadNewer,
      onReturnToLatest,
      returnToLatestGeneration,
      readCancelCount,
      openWindowAround,
      showWindow,
    }),
    [
      activeAnchor,
      hasPreviousPage,
      isFetchingPreviousPage,
      onLoadNewer,
      onReturnToLatest,
      returnToLatestGeneration,
      readCancelCount,
      openWindowAround,
      showWindow,
    ],
  );

  return { controls, windowQuery, isDetached: activeAnchor !== null };
}
