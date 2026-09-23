import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { ChatMessage } from "../data";
import { useMessageViewer } from "../useMessageViewer";
import {
  demoThreadPage,
  fetchDemoThreadPage,
  readDemoThread,
  withDemoPresentation,
} from "./demoThreadCache";
import { getMessages } from "./messages.api";
import { groupMessages } from "./messages.adapters";
import {
  ensureInactiveThreadTrim,
  THREAD_HISTORY_STALE_TIME_MS,
  type MessagePage,
} from "./threadCacheTrim";

/**
 * Message history for one conversation, cursor-paginated (load-older on scroll-
 * up). Demo mode runs this same query over a local session store of the seeded
 * thread (`demoThreadCache.ts`): the newest 30 messages, then 30 older ones per
 * request, with no network. Returns messages grouped into the `{ day, items }[]`
 * shape ConversationPanel already renders.
 */
export function useMessageThread(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const viewer = useMessageViewer();

  useEffect(() => {
    ensureInactiveThreadTrim(queryClient);
  }, [queryClient]);

  // Deliberately free of the viewer and the active mailbox, the one exception
  // to keying every query by the active identity: the server renders these
  // DTOs per reading member whichever mailbox is active, and every patch in
  // `shared/api/messageCache.ts` and `useCachedThreadMessages` addresses this
  // exact key. The viewer-dependent bubbles rebuild through `groupMessages`'
  // own context key.
  const queryKey = ["messages", conversationId, demoMode];
  const isEnabled = !!conversationId;
  const query = useInfiniteQuery<MessagePage>({
    queryKey,
    enabled: isEnabled,
    staleTime: THREAD_HISTORY_STALE_TIME_MS,
    initialPageParam: undefined as string | undefined,
    // Demo paints its newest page on the first render, as it did when the
    // panel rendered the seed directly. Live waits for page 0.
    initialData:
      demoMode && conversationId
        ? () => ({
            pages: [
              demoThreadPage(
                readDemoThread(queryClient, conversationId),
                undefined,
              ),
            ],
            pageParams: [undefined],
          })
        : undefined,
    queryFn: async ({ pageParam, signal }) => {
      if (demoMode) {
        return fetchDemoThreadPage(
          queryClient,
          conversationId!,
          pageParam as string | undefined,
          signal,
        );
      }
      const page = await getMessages(
        conversationId!,
        pageParam as string | undefined,
        signal,
      );
      const { hasMore, nextCursor } = page.pageInfo;
      // ENG-192: older history exists only when the server says so AND hands
      // back a cursor to fetch it with; either alone ends load-older.
      return {
        items: page.data,
        nextCursor: hasMore && nextCursor ? nextCursor : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  // Pages arrive newest-first per page; flatten oldest to newest for display.
  // Demo bubbles keep their seeded sender presentation (`withDemoPresentation`).
  const groups = useMemo(() => {
    const oldestFirst = (query.data?.pages ?? [])
      .flatMap((page) => page.items)
      .reverse();
    const grouped = groupMessages(oldestFirst, viewer);
    return demoMode && conversationId
      ? withDemoPresentation(conversationId, grouped)
      : grouped;
  }, [query.data, viewer, demoMode, conversationId]);

  // react-query keeps `fetchMeta` from the last fetch until the next one
  // starts, and its optimistic result for a mount or key change marks the
  // query fetching before that fetch begins. Reopening a thread whose last
  // fetch was an older page therefore reads `isFetchingNextPage` while the
  // real query is still idle and about to refetch page 0. The cache's own
  // state tells the two apart. A request held while offline is `paused`
  // rather than fetching, and is just as pending.
  const cachedState = queryClient.getQueryState(queryKey);
  const isOlderPageRequest =
    cachedState !== undefined &&
    cachedState.fetchStatus !== "idle" &&
    cachedState.fetchMeta?.fetchMore?.direction === "forward";
  const isLoadingOlder =
    query.isFetchingNextPage && cachedState?.fetchStatus === "fetching";
  const isPageZeroPending = query.fetchStatus !== "idle" && !isOlderPageRequest;
  // Page 0 (the first load or a refetch) failed. An older page failing is a
  // different thing: the loaded history is still current then.
  const isPageZeroError = query.isLoadingError || query.isRefetchError;
  return {
    ...query,
    groups: groups as { day: string; dayKey: string; items: ChatMessage[] }[],
    isLoadingOlder,
    /** True once page 0 has been fetched, its last fetch succeeded and no
     *  fetch of it is pending (offline-paused included), so the loaded
     *  history is current. Always true when there is nothing to fetch (a
     *  not-yet-created thread). Demo's page 0 is local and present from the
     *  first render, so it only waits on a pending refetch. */
    isHistorySettled:
      !isEnabled ||
      ((demoMode || query.isFetched) && !isPageZeroPending && !isPageZeroError),
    /** Page 0's last fetch failed and nothing is retrying it. A failed older
     *  page never sets this: whoever requested that page sees it not land. */
    isHistoryError:
      isEnabled && isPageZeroError && query.fetchStatus === "idle",
  };
}
