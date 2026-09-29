// src/features/messages/useCachedThreadMessages.ts
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { groupMessages } from "./api/messages.adapters";
import { useMessageViewer } from "./useMessageViewer";
import type { MessagePage } from "./api/threadCacheTrim";
import type { MessageResponse } from "./api/messages.api";
import type { ChatMessage } from "./data";

type ThreadData = InfiniteData<MessagePage>;

const NO_THREAD_DATA: ThreadData[] = [];

/** Every cached page set for one thread, as one stable-identity snapshot:
 *  the same array comes back until one of the entries changes, which is what
 *  `useSyncExternalStore` needs. */
function createThreadDataSnapshot(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string | null,
  isDemoMode: boolean,
): () => ThreadData[] {
  let previous: ThreadData[] = [];
  return () => {
    if (!conversationId) return NO_THREAD_DATA;
    const next = queryClient
      .getQueriesData<ThreadData>({
        queryKey: ["messages", conversationId, isDemoMode],
      })
      .map(([, data]) => data)
      .filter((data): data is ThreadData => Array.isArray(data?.pages));
    const isUnchanged =
      next.length === previous.length &&
      next.every((data, index) => data === previous[index]);
    if (!isUnchanged) previous = next;
    return previous;
  };
}

/** The thread's total order `(createdAt, id)`, oldest first. */
function compareOldestFirst(
  first: MessageResponse,
  second: MessageResponse,
): number {
  if (first.createdAt !== second.createdAt) {
    return first.createdAt < second.createdAt ? -1 : 1;
  }
  if (first.id === second.id) return 0;
  return first.id < second.id ? -1 : 1;
}

/**
 * The open thread's server or demo messages, oldest first, read straight from
 * the react-query thread cache that `useMessageThread` fills and that socket
 * frames, send acks, edits and deletes patch (`shared/api/messageCache.ts`).
 * It subscribes to the cache without adding a query observer of its own, so
 * reading it can never trigger a fetch or disturb the thread's scroll
 * anchoring. Mapped through the same `groupMessages` the panel renders from,
 * so each bubble object is the one the thread already holds.
 *
 * It reads every entry under the documented `["messages", conversationId,
 * isDemoMode]` prefix: the live pages and any PRD-401 history window shown
 * around an older message (`api/threadWindow.ts`), kept once per id, so a
 * sheet opened from a bubble in that window finds it. The demo session store
 * (`["messages", id, "demo-store"]`) sits outside that prefix. A caller in
 * demo mode passes `isDemoMode` to read the same paged demo cache
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
  // Each cached entry is the cached object itself, a stable reference until
  // that entry changes, so this snapshot only re-renders on real updates.
  const getSnapshot = useMemo(
    () => createThreadDataSnapshot(queryClient, conversationId, isDemoMode),
    [queryClient, conversationId, isDemoMode],
  );
  const threadEntries = useSyncExternalStore(subscribe, getSnapshot);
  return useMemo(() => {
    // One copy per id across the live pages and a window, oldest to newest
    // as `useMessageThread` orders them before grouping.
    const byId = new Map<string, MessageResponse>();
    for (const data of threadEntries) {
      for (const page of data.pages) {
        for (const message of page.items) {
          if (!byId.has(message.id)) byId.set(message.id, message);
        }
      }
    }
    const oldestFirst = [...byId.values()].sort(compareOldestFirst);
    return groupMessages(oldestFirst, viewer).flatMap((group) => group.items);
  }, [threadEntries, viewer]);
}
