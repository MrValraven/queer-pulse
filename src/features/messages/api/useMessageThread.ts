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
import { useThreadWindow } from "./useThreadWindow";
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

  // PRD-401: a jump to a message older than the loaded pages shows a window
  // of history around it in place of the live tail (see `useThreadWindow`).
  // While it is shown, rendering, paging and history readiness all read the
  // window; this live query stays observed underneath and keeps receiving
  // every live frame.
  const threadWindow = useThreadWindow(conversationId, demoMode);
  const { windowQuery, isDetached } = threadWindow;
  const shownPages: MessagePage[] | undefined = isDetached
    ? windowQuery.data?.pages
    : query.data?.pages;

  // Pages arrive newest-first per page; flatten oldest to newest for display.
  // A window's newer page can repeat its millisecond boundary row, so rows
  // are kept once by id. Demo bubbles keep their seeded sender presentation
  // (`withDemoPresentation`).
  const groups = useMemo(() => {
    const seenIds = new Set<string>();
    const oldestFirst = (shownPages ?? [])
      .flatMap((page) => page.items)
      .filter((message) => {
        if (seenIds.has(message.id)) return false;
        seenIds.add(message.id);
        return true;
      })
      .reverse();
    const grouped = groupMessages(oldestFirst, viewer);
    return demoMode && conversationId
      ? withDemoPresentation(conversationId, grouped)
      : grouped;
  }, [shownPages, viewer, demoMode, conversationId]);

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
  // The window's own page 0 is the page it was opened around; its older and
  // newer pages are excluded from "refetching" by react-query itself.
  const isWindowError =
    windowQuery.isLoadingError || windowQuery.isRefetchError;
  const { fetchNextPage, refetch } = query;
  const { fetchNextPage: fetchWindowOlderPage, refetch: refetchWindow } =
    windowQuery;
  return {
    ...query,
    groups: groups as { day: string; dayKey: string; items: ChatMessage[] }[],
    isLoadingOlder: isDetached
      ? windowQuery.isFetchingNextPage
      : isLoadingOlder,
    /** True once page 0 has been fetched, its last fetch succeeded and no
     *  fetch of it is pending (offline-paused included), so the loaded
     *  history is current. Always true when there is nothing to fetch (a
     *  not-yet-created thread). Demo's page 0 is local and present from the
     *  first render, so it only waits on a pending refetch. A shown window
     *  reads the same about the page it was opened around. */
    isHistorySettled: isDetached
      ? windowQuery.data !== undefined &&
        !windowQuery.isRefetching &&
        !isWindowError
      : !isEnabled ||
        ((demoMode || query.isFetched) &&
          !isPageZeroPending &&
          !isPageZeroError),
    /** Page 0's last fetch failed and nothing is retrying it. A failed older
     *  page never sets this: whoever requested that page sees it not land. */
    isHistoryError: isDetached
      ? isWindowError && windowQuery.fetchStatus === "idle"
      : isEnabled && isPageZeroError && query.fetchStatus === "idle",
    /** Older history exists past the oldest shown row. */
    hasMoreOlder:
      (isDetached ? windowQuery.hasNextPage : query.hasNextPage) ?? false,
    /** Requests the next older page of whatever is shown. */
    requestOlderPage: () => {
      void (isDetached
        ? fetchWindowOlderPage({ cancelRefetch: false })
        : fetchNextPage({ cancelRefetch: false }));
    },
    /** Retries the shown history's page 0 after it failed. */
    retryHistory: () => {
      void (isDetached
        ? refetchWindow({ cancelRefetch: false })
        : refetch({ cancelRefetch: false }));
    },
    /** The shown history holds SOME page-0 data (see `ThreadHistory`). */
    hasLoadedThreadData: isDetached
      ? windowQuery.data !== undefined
      : query.data !== undefined,
    /** PRD-401: the detached history window's controls. */
    threadWindow: threadWindow.controls,
  };
}
