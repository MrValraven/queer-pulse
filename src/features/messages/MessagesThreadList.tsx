import { useMemo, useState } from "react";
import type { MailboxSummary } from "../../shared/api/mailboxViewer";
import { useMessageRequestsCount } from "./api/useMessageRequestsCount";
import { ConnectionStatusBanner } from "./ConnectionStatusBanner";
import { DeleteConversationDialog } from "./DeleteConversationDialog";
import { MessagesRailFooter } from "./MessagesRailChrome";
import { MessagesThreadListBody } from "./MessagesThreadListBody";
import { MessagesThreadListHeader } from "./MessagesThreadListHeader";
import { MessagesThreadListLoadMore } from "./MessagesThreadListLoadMore";
import { MessagesThreadListScroller } from "./MessagesThreadListScroller";
import { filterThreadsByTab } from "./threadFilters";
import { useInboxTab } from "./useInboxTab";
import { useMessageViewer } from "./useMessageViewer";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

const NO_MAILBOXES: MailboxSummary[] = [];

/** The switcher renders nothing without two mailboxes, so a caller that
 *  passes none never selects one. */
function ignoreMailboxSelection() {}

interface MessagesThreadListProps {
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
  /** Every mailbox the member may read, profile first (the header
   *  switcher). A caller that leaves these out gets no switcher and the
   *  personal mailbox's tabs. */
  mailboxes?: MailboxSummary[];
  /** The active mailbox, null until the mailboxes load. */
  activeMailbox?: MailboxSummary | null;
  onSelectMailbox?: (identityId: string) => void;
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
  mailboxes = NO_MAILBOXES,
  activeMailbox = null,
  onSelectMailbox = ignoreMailboxSelection,
}: MessagesThreadListProps) {
  const { myHandle } = useMessageViewer();
  const [confirmDelete, setConfirmDelete] = useState<Conversation | null>(null);
  const { activeTab, setActiveTab } = useInboxTab(activeMailbox);
  const requestsCount = useMessageRequestsCount();
  const searching = !loading && query.trim().length > 0;
  // Tabs stay visible whenever there's SOMETHING to filter — either an actual
  // conversation, or a pending message request (a brand-new member with
  // requests but no conversations yet must still be able to reach the
  // Requests tab, not just members who already have a thread).
  const showTabs =
    !loading && !searching && (threads.length > 0 || requestsCount > 0);
  const visibleThreads = useMemo(
    () => filterThreadsByTab(threads, activeTab, activeId, readIds, myHandle),
    [threads, activeTab, activeId, readIds, myHandle],
  );
  // The count the pin-toggle mutation caps against — the whole inbox
  // (pre-tab-filter), so pinning from inside e.g. the Favorites tab still
  // enforces the real cap.
  const pinnedCount = useMemo(
    () => threads.filter((thread) => !!thread.pinnedAt).length,
    [threads],
  );
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
        mailboxes={mailboxes}
        activeMailbox={activeMailbox}
        onSelectMailbox={onSelectMailbox}
      />

      {/* The reconnecting/offline strip: it otherwise only mounts inside the
          open thread (`ConversationTopSection`). A phone viewing just the
          list, or a desktop member with no thread open yet (where the panel
          is `MessagesEmptyPanel` instead), never learns the socket is down
          while pulling on stale rows (DES-197). `showRailChrome` is this
          route's own desktop signal (see its prop doc above); suppressed
          there once a thread IS open so the split view never shows the
          identical strip twice, since the open thread's own copy already
          covers it. Self-contained (reads the socket via `useRealtime`) and
          already demo-mode-inert. */}
      {!(showRailChrome && activeId) && <ConnectionStatusBanner />}

      <MessagesThreadListScroller loading={loading}>
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
          activeMailbox={activeMailbox}
        />
        {/* ENG-253: the raw inbox's own next-page cursor. It stays hidden
            mid-search (search is a name/body match over ALREADY-loaded rows,
            with no server-paged view of its own) and under the "Requests"
            tab (its body swaps out for `MessagesRequestsPanel` entirely,
            unrelated to conversation paging). */}
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
      </MessagesThreadListScroller>
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
