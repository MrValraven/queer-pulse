import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  filterEntriesByKind,
  flattenNewestFirst,
  sessionOnlyEntries,
  type ConversationMediaEntry,
} from "../conversationMediaFilters";
import { conversations as mockConversations, type Conversation } from "../data";
import type { MessageGroup } from "../useMessagesController.helpers";
import { useMessageViewer } from "../useMessageViewer";
import {
  getConversationMedia,
  type ConversationMediaKind,
} from "./conversationMedia.api";
import { messageToChat } from "./messages.adapters";
import type { MessageResponse } from "./messages.api";

interface ConversationMediaPage {
  items: MessageResponse[];
  nextCursor: string | null;
}

/** Stable reference for the `messageGroups` dependency below when live, so a
 *  live caller's `messageGroups` changing identity (it plays no part in the
 *  live branch) never forces the shelf to recompute. */
const EMPTY_MESSAGE_GROUPS: MessageGroup[] = [];

/**
 * Kept in the messages namespace one level beside `["messages",
 * conversationId]` on purpose: `shared/api/messageCache.ts` fuzzy-writes every query below
 * that prefix with thread pages (`upsertMessage` on every `message:new`), which
 * would push each new text message onto the Media shelf. Same trap the
 * `UNREAD_COUNT_KEY` comment in `useConversations.ts` documents. The inactive
 * trim in `threadCacheTrim.ts` does match this key; it only drops pages past
 * the first and marks the entry stale, which suits a closed gallery too.
 */
export function conversationMediaQueryKey(
  conversationId: string | null,
  kind: ConversationMediaKind,
  demoMode: boolean,
) {
  return ["messages", "media", conversationId, kind, demoMode] as const;
}

/**
 * Demo mode's thread for `conversationId`: the `messages` groups of the demo
 * inbox (`useConversations` → `active.messages`, see `mergeOptimisticGroups`),
 * read from that query's cache without adding an observer, and the scripted
 * mock when the inbox was never loaded. Returning the cached array itself
 * keeps the snapshot reference stable. The thread's image viewer
 * (`useThreadImageGallery.ts`'s `findPhotoIndex`) matches a photo by its
 * message id first, so this shelf's demo entries only need matching ids, the
 * same contract as live.
 */
function useDemoThreadGroups(
  conversationId: string | null,
  demoMode: boolean,
): Conversation["messages"] | undefined {
  const queryClient = useQueryClient();
  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      queryClient.getQueryCache().subscribe(onStoreChange),
    [queryClient],
  );
  return useSyncExternalStore(subscribe, () => {
    if (!demoMode || !conversationId) return undefined;
    const cachedInboxes = queryClient.getQueriesData<Conversation[]>({
      queryKey: ["conversations", true],
    });
    for (const [, inbox] of cachedInboxes) {
      const match = inbox?.find(
        (conversation) => conversation.id === conversationId,
      );
      if (match) return match.messages;
    }
    return mockConversations.find(
      (conversation) => conversation.id === conversationId,
    )?.messages;
  });
}

/**
 * One shelf (Media, Links or Docs) of a conversation's shared-content gallery,
 * newest first (PRD-373). Live mode pages `GET /conversations/:id/media`;
 * demo mode derives the shelf from the demo thread in memory and never pages,
 * topped up with whatever `messageGroups` (the open panel's currently
 * rendered history) carries that the demo thread doesn't yet: a photo or
 * document sent this session (`sessionOnlyEntries`). The demo delivery path
 * only ever patches its `status`, so it stays in `useMessagesController`'s
 * in-memory `sent` state for the rest of the session; the `localId` dedupe in
 * `sessionOnlyEntries` is purely a safeguard against double-counting it there.
 * Entries are re-checked against the client classifier in both modes, so a
 * Links row always has a URL the bubble would also linkify.
 *
 * `conversationId` is the server id in live mode (null for a thread not
 * created yet, which has nothing to show) and the demo thread id in demo
 * mode. `messageGroups` is read only in demo mode; live ignores it.
 */
export function useConversationMedia(
  conversationId: string | null,
  kind: ConversationMediaKind,
  messageGroups: MessageGroup[],
) {
  const { demoMode } = useDemoMode();
  const viewer = useMessageViewer();
  const isLiveEnabled = !demoMode && !!conversationId;

  const query = useInfiniteQuery<ConversationMediaPage>({
    queryKey: conversationMediaQueryKey(conversationId, kind, demoMode),
    enabled: isLiveEnabled,
    // Always stale: a reopen or tab switch paints the cached rows at once and
    // then reconciles, so a document deleted or taken down since the last
    // fetch loses its row (and its working link) on the next paint.
    staleTime: 0,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam, signal }) => {
      const page = await getConversationMedia(
        conversationId!,
        kind,
        pageParam as string | undefined,
        signal,
      );
      const { hasMore, nextCursor } = page.pageInfo;
      return {
        items: page.data,
        nextCursor: hasMore && nextCursor ? nextCursor : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const demoGroups = useDemoThreadGroups(conversationId, demoMode);
  // Live ignores `messageGroups` entirely, so a live caller's identity churn
  // on it (it changes on every inbound frame) must never be a reason to
  // recompute the shelf below; only demo mode reads the real value.
  const demoMessageGroups = demoMode ? messageGroups : EMPTY_MESSAGE_GROUPS;

  const entries = useMemo<ConversationMediaEntry[]>(() => {
    if (demoMode) {
      const base = demoGroups ?? [];
      // Newest first: this session's sends that the scripted thread doesn't
      // carry yet (`sessionOnlyEntries` drops anything already covered from
      // that session list), then the whole scripted thread (already newest
      // first) untouched.
      const allEntries = [
        ...sessionOnlyEntries(base, demoMessageGroups),
        ...flattenNewestFirst(base),
      ];
      return filterEntriesByKind(allEntries, kind);
    }
    const liveEntries = (query.data?.pages ?? [])
      .flatMap((page) => page.items)
      .map((messageResponse) => ({
        message: messageToChat(messageResponse, viewer),
        at: messageResponse.createdAt,
      }));
    return filterEntriesByKind(liveEntries, kind);
  }, [demoMode, demoGroups, demoMessageGroups, query.data, viewer, kind]);

  const { isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = query;
  const loadMore = useCallback(() => {
    // `fetchNextPage` restarts an in-flight page by default; the sentinel and
    // the button can both ask, so a second ask while one runs is dropped.
    if (isFetchingNextPage || !hasNextPage) return;
    void fetchNextPage();
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);
  const retry = useCallback(() => void refetch(), [refetch]);

  return {
    entries,
    /** The first page is pending, offline-paused included. */
    isLoading: isLiveEnabled && query.isPending,
    /** The first page failed with nothing cached to show instead. */
    isError: isLiveEnabled && query.isLoadingError,
    hasNextPage: isLiveEnabled && hasNextPage,
    isFetchingNextPage: isLiveEnabled && isFetchingNextPage,
    isNextPageError: isLiveEnabled && query.isFetchNextPageError,
    loadMore,
    retry,
  };
}
