import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { paneScrollRegistry } from "../../app/paneScrollRegistry";
import { PullToRefresh } from "../../shared/components/ui";
import { useMessageRequestsCount } from "./api/useMessageRequestsCount";
import { ConnectionStatusBanner } from "./ConnectionStatusBanner";
import { DeleteConversationDialog } from "./DeleteConversationDialog";
import { MessagesRailFooter } from "./MessagesRailChrome";
import { MessagesThreadListBody } from "./MessagesThreadListBody";
import { MessagesThreadListHeader } from "./MessagesThreadListHeader";
import { MessagesThreadListLoadMore } from "./MessagesThreadListLoadMore";
import { filterThreadsByTab, type InboxTab } from "./threadFilters";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

/**
 * The element that actually scrolls inside `.threadList`. `PullToRefresh`
 * nests its own `overflow-y: auto; height: 100%` scroller as the direct
 * child, so the rows overflow THAT element while `.threadList`'s single
 * child fits it exactly — meaning the inner one is the real scroll surface.
 * Register that so scroll-to-top / per-navigation restore act on the surface
 * that moves, falling back to `.threadList` itself if the structure ever
 * changes.
 */
function resolveScrollContainer(root: HTMLElement): HTMLElement {
  const child = root.firstElementChild;
  if (child instanceof HTMLElement) {
    const overflowY = getComputedStyle(child).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return child;
  }
  return root;
}

export function MessagesThreadList({
  loading,
  threads,
  activeId,
  readIds,
  query,
  isError,
  onRetry,
  hasMoreThreads,
  isLoadingMoreThreads,
  onLoadMoreThreads,
  onQueryChange,
  onOpen,
  onCompose,
  onComposeGroup,
  onDelete,
  onSelectResult,
  deletePending,
  onMarkThreadRead,
  onMarkThreadUnread,
  showRailChrome,
}: {
  loading: boolean;
  threads: Conversation[];
  activeId: string;
  readIds: Set<string>;
  query: string;
  /** DES-183: the inbox query settled in error (`useMessagesController`'s
   *  `inboxLoadError`), forwarded straight through to `MessagesThreadListBody`,
   *  which decides the load-error-vs-empty-state branching. */
  isError?: boolean;
  /** Refetches the inbox (`useMessagesController`'s `refetchInbox`). */
  onRetry?: () => void;
  /** ENG-253: `useMessagesController`'s own `hasMoreThreads`/
   *  `isLoadingMoreThreads`/`loadMoreThreads`, driving the "load more"
   *  sentinel/footer below the row list (`MessagesThreadListLoadMore`).
   *  Optional/undefined until a caller wires all three through. Every
   *  branch below then simply never renders the footer (today's existing
   *  "stops at the first page" shape), rather than throwing, so an older or
   *  test-only caller that only passes the props above keeps working
   *  unchanged. See this build's report for the one call site
   *  (`MessagesPage.tsx`) that still needs the three-line hookup. */
  hasMoreThreads?: boolean;
  isLoadingMoreThreads?: boolean;
  onLoadMoreThreads?: () => void;
  onQueryChange: (value: string) => void;
  onOpen: (id: string) => void;
  onCompose: () => void;
  /** Opens the create-group picker. */
  onComposeGroup: () => void;
  onDelete: (id: string) => void;
  /** Opens the result's conversation and (when the hit carries a server message
   *  id) jumps to that bubble. */
  onSelectResult: (conversationId: string, messageId?: string) => void;
  deletePending: boolean;
  /** Row menu "Mark as read" (PRD-225) — the same mutation opening a thread
   *  fires (`useMarkRead`), reused so a thread can be caught up without
   *  opening it. */
  onMarkThreadRead: (conversationId: string) => void;
  /** Row menu "Mark as unread" (PRD-225). */
  onMarkThreadUnread: (conversationId: string) => void;
  /** Desktop, where AppShell's `chromeless` leaves this route with no site
   *  nav: the panel carries the account footer itself. False on mobile, which
   *  keeps the bottom tab bar and gets a back chevron in the header instead,
   *  since the app bar that held one is hidden here too. */
  showRailChrome: boolean;
}) {
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<Conversation | null>(null);
  // All/Unread/Favorites/Groups/Requests — local UI state, doesn't need to
  // persist. Reset to "All" whenever a search starts so leaving the search
  // view never strands the list on a stale filter the user can't see the
  // control for.
  const [activeTab, setActiveTab] = useState<InboxTab>("all");
  const requestsCount = useMessageRequestsCount();
  // PRD-353: the `group_invite` bell row and its push counterpart deep-link to
  // `/messages?tab=requests` (mirrors the `?tab=` deep links other consoles
  // already use, e.g. `/admin/moderation?tab=health`). One-shot, cleared right
  // after so a later manual tab switch or a refresh never re-fires it.
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get("tab") !== "requests") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot deep-link intent from the URL (an external signal), consumed and cleared immediately below; mirrors useMessageDeepLinks' own notification-tap effect.
    setActiveTab("requests");
    // Delete only `tab`, not the whole query string: a `?c=<id>` deep-link
    // arriving alongside it (or any other param) must survive this clear.
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete("tab");
        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const searching = !loading && query.trim().length > 0;
  // Tabs stay visible whenever there's SOMETHING to filter — either an actual
  // conversation, or a pending message request (a brand-new member with
  // requests but no conversations yet must still be able to reach the
  // Requests tab, not just members who already have a thread).
  const showTabs =
    !loading && !searching && (threads.length > 0 || requestsCount > 0);
  const visibleThreads = useMemo(
    () => filterThreadsByTab(threads, activeTab, activeId, readIds),
    [threads, activeTab, activeId, readIds],
  );
  // The count the pin-toggle mutation caps against — the whole inbox
  // (pre-tab-filter), so pinning from inside e.g. the Favorites tab still
  // enforces the real cap.
  const pinnedCount = useMemo(
    () => threads.filter((thread) => !!thread.pinnedAt).length,
    [threads],
  );

  // The inbox list is this fullHeight route's own scroll surface (the window
  // doesn't move). Register it so ScrollManager can restore/reset its offset per
  // navigation and honour a tap-on-the-active-tab scroll-to-top — the pane half
  // of the internally-scrolled scroll logic (see paneScrollRegistry).
  const threadListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = threadListRef.current;
    if (!root) return;
    return paneScrollRegistry.register(resolveScrollContainer(root));
  }, []);
  return (
    <div className={styles.threadPanel}>
      <MessagesThreadListHeader
        query={query}
        onQueryChange={(value) => {
          if (value.trim()) setActiveTab("all");
          onQueryChange(value);
        }}
        onCompose={onCompose}
        onComposeGroup={onComposeGroup}
        loading={loading}
        showTabs={showTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        requestsCount={requestsCount}
        showBackButton={!showRailChrome}
      />

      {/* The reconnecting/offline strip: it otherwise only mounts inside the
          open thread (`ConversationTopSection`). A phone viewing just the
          list, or a desktop member with no thread open yet (where the panel
          is `MessagesEmptyPanel` instead), never learns the socket is down
          while pulling on stale rows (DES-197). `showRailChrome` is this
          route's own desktop signal (see its prop doc below); suppressed
          there once a thread IS open so the split view never shows the
          identical strip twice, since the open thread's own copy already
          covers it. Self-contained (reads the socket via `useRealtime`) and
          already demo-mode-inert. */}
      {!(showRailChrome && activeId) && <ConnectionStatusBanner />}

      <div
        className={styles.threadList}
        ref={threadListRef}
        // DES-194: the skeleton rows underneath are all `aria-hidden`
        // (MessagesSkeleton.tsx), so without this a screen-reader member
        // hears nothing at all while the inbox's first load is in flight.
        // Mirrors the `aria-busy` the search-results loading state already
        // carries (ThreadSearchModal/MessagesSearchResults) rather than a
        // second pattern.
        aria-busy={loading}
      >
        {/* `queryKey: ["conversations"]` matches useConversations' inline
            `["conversations", demoMode, deletedToken]` as a prefix — the same
            convention every conversations mutation in this feature already
            uses to invalidate the inbox (useMessageActions/useMessageMutations).
            No `disabled` gate: this panel is the thread LIST, which carries no
            composer of its own — the message composer lives entirely inside
            the separate `ConversationPanel` (on mobile the two panels aren't
            even shown at once; on desktop they're independent scroll regions),
            so a pull here can never fight a focused input. */}
        <PullToRefresh
          scrollable
          onRefresh={() =>
            // DES-197: `invalidateQueries` forwards straight to
            // `refetchQueries`, which swallows a failed refetch in its own
            // `.catch(noop)` unless `throwOnError` is set (query-core's
            // `queryClient.js`); without this the promise below never
            // rejected, so `usePullToRefresh`'s existing failure toast never
            // fired. This is the one path where the member needs to actually
            // learn THIS specific pull failed, since the ambient query-error
            // toast stays deliberately suppressed while cached rows exist.
            queryClient.invalidateQueries(
              { queryKey: ["conversations"] },
              { throwOnError: true },
            )
          }
        >
          <MessagesThreadListBody
            loading={loading}
            searching={searching}
            query={query}
            threads={threads}
            visibleThreads={visibleThreads}
            activeTab={activeTab}
            activeId={activeId}
            readIds={readIds}
            pinnedCount={pinnedCount}
            isError={isError}
            onRetry={onRetry}
            onOpen={onOpen}
            onCompose={onCompose}
            onQueryChange={onQueryChange}
            onSelectResult={onSelectResult}
            onRequestDelete={setConfirmDelete}
            onMarkThreadRead={onMarkThreadRead}
            onMarkThreadUnread={onMarkThreadUnread}
          />
          {/* ENG-253: the raw inbox's own next-page cursor, never shown
              mid-search (search is a name/body match over ALREADY-loaded rows
              rather than a server-paged view of its own) or under the
              "Requests" tab (its body swaps out for `MessagesRequestsPanel`
              entirely, unrelated to conversation paging). */}
          {!loading &&
            !searching &&
            activeTab !== "requests" &&
            onLoadMoreThreads && (
              <MessagesThreadListLoadMore
                hasNextPage={!!hasMoreThreads}
                isFetchingNextPage={!!isLoadingMoreThreads}
                onLoadMore={onLoadMoreThreads}
              />
            )}
        </PullToRefresh>
      </div>
      {showRailChrome && <MessagesRailFooter />}
      {confirmDelete && (
        <DeleteConversationDialog
          name={confirmDelete.name}
          isGroup={confirmDelete.isGroup}
          pending={deletePending}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => {
            onDelete(confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      )}
    </div>
  );
}
