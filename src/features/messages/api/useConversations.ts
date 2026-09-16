import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useDeletedConversations } from "../../../app/providers/useDeletedConversations";
import { applyConversationPrefs } from "../conversationPrefs";
import { isServerConversationId } from "../useMessagesController.helpers";
import { conversations as mockConversations } from "../data";
import {
  getConversation,
  getConversationsPage,
  getConversationsUnreadCount,
} from "./messages.api";
import {
  conversationToView,
  type ConversationWithPreview,
} from "./messages.adapters";

// ENG-253: server default is 30, kept explicit here so a demo/live page-size
// mismatch never becomes a silent behavior difference.
const CONVERSATIONS_PAGE_SIZE = 30;

interface ConversationsPageCursor {
  nextCursor: string | null;
  hasMore: boolean;
}

const NO_MORE_PAGES: ConversationsPageCursor = {
  nextCursor: null,
  hasMore: false,
};

/**
 * Inbox list. ENG-253: `GET /conversations` now cursor-paginates (default 30
 * rows) instead of answering the whole inbox as a bare array; the old
 * endpoint silently truncated at a fixed count, which is the bug this fixes.
 *
 * The `["conversations", ...]` cache entry deliberately stays the plain,
 * flat `ConversationWithPreview[]` shape it always was. Later pages are
 * fetched and appended into that same array (see `fetchNextPage` below)
 * instead of switching to `useInfiniteQuery`'s `InfiniteData<Page>` wrapper.
 * That wrapper would change this cache entry's shape out from under at least
 * seven other `setQueriesData<Conversation[]>` call sites across the messages
 * feature (group management, conversation prefs, invites, demo signals) that
 * this build does not own, and would silently break them. See this build's
 * report. Every existing consumer (`useMessagesController`, `ShareToChatModal`,
 * `useIncomingMessageBanner`) keeps reading `data` exactly as `Conversation[]`,
 * unchanged.
 *
 * Demo mode resolves the whole scripted list as a single page (no network, no
 * real pagination to exercise) and reports `hasNextPage: false`.
 *
 * `queryKey` includes `demoMode` so cache entries never cross the boundary.
 */
export function useConversations() {
  const { demoMode } = useDemoMode();
  const { deletedIds } = useDeletedConversations();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  // Stable, order-independent token so the demo query re-derives when a chat is
  // deleted. Live mode never writes deletedIds, so this stays "".
  const deletedToken = [...deletedIds].sort().join(",");
  const queryKey = useMemo(
    () => ["conversations", demoMode, deletedToken] as const,
    [demoMode, deletedToken],
  );

  // Cursor bookkeeping for "load more", kept alongside the query rather than
  // inside its cache entry, so the cache itself never has to carry anything
  // but the flat row list every other consumer already expects.
  const [pageCursor, setPageCursor] =
    useState<ConversationsPageCursor>(NO_MORE_PAGES);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const query = useQuery<ConversationWithPreview[]>({
    queryKey,
    queryFn: async () => {
      if (demoMode) {
        // Fold in DEMO pin/favorite overrides (localStorage) so a toggle
        // survives this refetch and a reload, see conversationPrefs.ts. The
        // whole seeded list is one page; there is nothing to page through.
        setPageCursor(NO_MORE_PAGES);
        return applyConversationPrefs(
          mockConversations.filter(
            (conversation) => !deletedIds.has(conversation.id),
          ),
        );
      }
      const page = await getConversationsPage({
        limit: CONVERSATIONS_PAGE_SIZE,
      });
      // ENG-192-style guard (mirrors `useMessageThread`): a next page exists
      // only when the server says so AND hands back a cursor to fetch it
      // with; either alone ends "load more".
      setPageCursor(
        page.pageInfo.hasMore && page.pageInfo.nextCursor
          ? { nextCursor: page.pageInfo.nextCursor, hasMore: true }
          : NO_MORE_PAGES,
      );
      return page.data.map((row) => conversationToView(row, t));
    },
  });

  /** Fetch the next inbox page and append its (deduped) rows onto the same
   *  flat `["conversations", ...]` cache entry `data`/every other consumer
   *  reads; see this hook's own doc for why not `useInfiniteQuery`. A no-op
   *  in demo mode, while a fetch is already underway, or once the server has
   *  said there is nothing more (mirrors `useMessageThread`'s `hasNextPage`). */
  const fetchNextPage = useCallback(async () => {
    if (demoMode || !pageCursor.hasMore || isFetchingNextPage) return;
    setIsFetchingNextPage(true);
    try {
      const page = await getConversationsPage({
        cursor: pageCursor.nextCursor ?? undefined,
        limit: CONVERSATIONS_PAGE_SIZE,
      });
      const rows = page.data.map((row) => conversationToView(row, t));
      setPageCursor(
        page.pageInfo.hasMore && page.pageInfo.nextCursor
          ? { nextCursor: page.pageInfo.nextCursor, hasMore: true }
          : NO_MORE_PAGES,
      );
      queryClient.setQueryData<ConversationWithPreview[]>(
        queryKey,
        (previous) => {
          const existingIds = new Set((previous ?? []).map((c) => c.id));
          const additions = rows.filter((row) => !existingIds.has(row.id));
          return [...(previous ?? []), ...additions];
        },
      );
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [demoMode, pageCursor, isFetchingNextPage, queryClient, t, queryKey]);

  return {
    ...query,
    fetchNextPage,
    hasNextPage: pageCursor.hasMore,
    isFetchingNextPage,
  };
}

/**
 * ENG-253: the full-detail single-conversation read (`GET /conversations/:id`).
 * Carries the real member roster (with read/delivered watermarks) and the
 * full stored draft that an inbox LIST row no longer does (see
 * `ConversationResponse.members`/`.draft`'s own docs). Demo mode needs no
 * network call: the seeded `Conversation` mocks already carry the full
 * roster/draft (ENG-253 trims only the LIVE list endpoint), so this simply
 * stays `undefined`/disabled there. See this build's report for exactly
 * which caller (`useMessagesController`'s `active`) needs to merge this
 * result's `.members`/`.draft` onto the list-derived conversation object for
 * the open thread once it resolves.
 */
export function useConversationDetail(conversationId: string | null) {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const isFetchable =
    !demoMode && !!conversationId && isServerConversationId(conversationId);
  return useQuery<ConversationWithPreview>({
    queryKey: ["conversation-detail", conversationId, demoMode],
    queryFn: async () => {
      const dto = await getConversation(conversationId!);
      return conversationToView(dto, t);
    },
    enabled: isFetchable,
  });
}

/** Query key for the nav DM-badge count. Deliberately NOT under the
 *  `["conversations", ...]` prefix: the realtime layer fuzzy-writes
 *  `["conversations"]` with a `ConversationWithPreview[]`-shaped updater
 *  (messageCache.ts), and a number entry sharing that prefix would be
 *  corrupted by it. This isolated key is invalidated explicitly at every
 *  unread-changing point instead (see below).
 */
export const UNREAD_COUNT_KEY = "conversations-unread-count";

/**
 * Unread-messages badge for the nav (`Navbar` MessagesLink / `SidebarFooter`).
 *
 * PERF: this badge must NOT pull the whole DM inbox on every route just to show
 * a number. It now fetches the dedicated cheap `GET /conversations/unread-count`
 * endpoint (the count of conversations with unread messages, the same thing the
 * demo badge counts), mirroring `notifications/api/useUnreadCount`. So the badge
 * is accurate app-wide before the member has even opened `/messages`, without
 * ever loading the full list. The realtime socket keeps it live by invalidating
 * `[UNREAD_COUNT_KEY]` on `message:new` / `conversation:new` (realtime.ts) and
 * `useMarkRead` invalidates it when the member reads a thread.
 *
 * AUTH GATE: the endpoint is behind `ActiveMemberGuard`, so live mode only
 * fetches once the session is settled AND the member is active, otherwise the
 * badge would 401 (logged out) / 403 (pending) on every public page. Until then
 * it stays 0. Demo mode is always enabled (the mock count is a local filter,
 * zero network cost, so the scripted badge renders everywhere as before).
 *
 * `retry:false` keeps the badge from hard-failing the app if the count can't
 * load. Mirrors notifications/useUnreadCount.
 */
export function useUnreadMessages(): number {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  const { deletedIds } = useDeletedConversations();
  // Stable, order-independent token so the demo count re-derives when a chat is
  // deleted. Live mode never writes deletedIds, so this stays "".
  const deletedToken = [...deletedIds].sort().join(",");
  const { data } = useQuery<number>({
    queryKey: [UNREAD_COUNT_KEY, demoMode, deletedToken],
    queryFn: async () => {
      if (demoMode) {
        // PRD-341: the SAME "unread thread" definition the Unread tab
        // (`threadFilters.ts`) and the row highlight use: not archived AND
        // (unreadCount > 0 OR markedUnreadAt set), folding in the DEMO
        // pin/favorite/archive/mark-unread overrides first (`useConversations`
        // above does the same before deriving `allThreads`), so toggling
        // archive or mark-unread in demo mode moves this badge exactly as it
        // does live, instead of reading the mock's own never-changing
        // baseline. Also honours locally-deleted chats, the exact number the
        // badge showed before, at zero network cost.
        return applyConversationPrefs(mockConversations).filter(
          (conversation) =>
            conversation.unread &&
            !conversation.archivedAt &&
            !deletedIds.has(conversation.id),
        ).length;
      }
      return getConversationsUnreadCount();
    },
    // Live: only once the session is settled and the member is active, so the
    // badge never 401s (logged out) / 403s (pending) on public routes.
    enabled: demoMode || (!checking && loggedIn && status === "active"),
    retry: false,
  });
  return data ?? 0;
}
