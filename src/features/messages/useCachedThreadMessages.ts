// src/features/messages/useCachedThreadMessages.ts
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { groupMessages } from "./api/messages.adapters";
import { useMessageViewer } from "./useMessageViewer";
import type { MessagePage } from "./api/threadCacheTrim";
import type { ChatMessage } from "./data";

/**
 * The open thread's server or demo messages, oldest first, read straight from
 * the react-query thread cache that `useMessageThread` fills and that socket
 * frames, send acks, edits and deletes patch (`shared/api/messageCache.ts`).
 * It subscribes to the cache without adding a query observer of its own, so
 * reading it can never trigger a fetch or disturb the thread's scroll
 * anchoring. Mapped through the same `groupMessages` the panel renders from,
 * so each bubble object is the one the thread already holds.
 *
 * The key is the documented `["messages", conversationId, isDemoMode]`, so a
 * caller in demo mode passes `isDemoMode` to read the same paged demo cache
 * `useMessageThread` fills, exactly as live does. Defaults to live (`false`)
 * for the existing live-only callers. A null id or a thread that was never
 * loaded reads as empty.
 */
export function useCachedThreadMessages(
  conversationId: string | null,
  isDemoMode = false,
): ChatMessage[] {
  const queryClient = useQueryClient();
  const viewer = useMessageViewer();
  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      queryClient.getQueryCache().subscribe(onStoreChange),
    [queryClient],
  );
  // `getQueryData` returns the cached object itself, a stable reference until
  // the thread data changes, so this snapshot only re-renders on real updates.
  const threadData = useSyncExternalStore(subscribe, () =>
    conversationId
      ? queryClient.getQueryData<InfiniteData<MessagePage>>([
          "messages",
          conversationId,
          isDemoMode,
        ])
      : undefined,
  );
  return useMemo(() => {
    // Pages arrive newest-first per page; flatten oldest to newest, exactly as
    // `useMessageThread` does before grouping.
    const oldestFirst = (threadData?.pages ?? [])
      .flatMap((page) => page.items)
      .reverse();
    return groupMessages(oldestFirst, viewer).flatMap((group) => group.items);
  }, [threadData, viewer]);
}
