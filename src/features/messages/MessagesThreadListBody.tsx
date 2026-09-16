import { FiMessageCircle } from "react-icons/fi";
import { EmptyState, FadeIn, LoadErrorState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { InboxLoadErrorStrip } from "./InboxLoadErrorStrip";
import { MessagesRequestsPanel } from "./MessagesRequestsPanel";
import { MessagesSearchResults } from "./MessagesSearchResults";
import { MessageThreadListSkeleton } from "./MessagesSkeleton";
import { MessagesThreadRow } from "./MessagesThreadRow";
import type { InboxTab } from "./threadFilters";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

/** Empty-state copy per tab. "All" used to be unreachable here (the
 *  whole-inbox empty state above it already covers a fully empty `threads`),
 *  but archiving (SOC-16) made a NEW all-empty case possible: every thread
 *  archived, so `threads.length > 0` yet the "all" tab's own filtered view is
 *  empty. Its copy points at the Archived tab rather than repeating the
 *  whole-inbox "start a conversation" copy, which would be misleading when
 *  the member very much has conversations, just all tucked away. */
const TAB_EMPTY_KEY: Partial<Record<InboxTab, string>> = {
  all: "thread.tabEmptyAllArchived",
  unread: "thread.tabEmptyUnread",
  favorites: "thread.tabEmptyFavorites",
  groups: "thread.tabEmptyGroups",
  archived: "thread.tabEmptyArchived",
};

/**
 * The scrollable contents of the inbox — skeleton / search results / empty
 * states / thread rows — split out of `MessagesThreadList` (which owns the
 * `PullToRefresh` wrapper and the scroll-registry ref around this) to keep
 * both components under the 200-line cap.
 */
export function MessagesThreadListBody({
  loading,
  searching,
  query,
  threads,
  visibleThreads,
  activeTab,
  activeId,
  readIds,
  pinnedCount,
  isError,
  onRetry,
  onOpen,
  onCompose,
  onQueryChange,
  onSelectResult,
  onRequestDelete,
  onMarkThreadRead,
  onMarkThreadUnread,
}: {
  loading: boolean;
  searching: boolean;
  query: string;
  /** The full (unfiltered) list — drives the whole-inbox empty state and the
   *  search view, which does its own name-matching over it. */
  threads: Conversation[];
  /** `threads` after the active tab's filter — what actually renders as rows. */
  visibleThreads: Conversation[];
  activeTab: InboxTab;
  activeId: string;
  readIds: Set<string>;
  pinnedCount: number;
  /** DES-183: the inbox query settled in error (mirrors `useConversations()`'s
   *  own `isError` from `useMessagesController`). Optional/undefined until the
   *  controller/list wire it through; every branch below degrades to today's
   *  behaviour when absent. */
  isError?: boolean;
  /** Refetches the inbox, wired to `useConversations()`'s own `refetch`. */
  onRetry?: () => void;
  onOpen: (id: string) => void;
  onCompose: () => void;
  onQueryChange: (value: string) => void;
  onSelectResult: (conversationId: string, messageId?: string) => void;
  onRequestDelete: (thread: Conversation) => void;
  /** Row menu "Mark as read"/"Mark as unread" (PRD-225). */
  onMarkThreadRead: (conversationId: string) => void;
  onMarkThreadUnread: (conversationId: string) => void;
}) {
  const { t } = useTranslation();
  // "Requests" isn't a conversation filter at all (see `threadFilters.ts`) —
  // it swaps the whole body for the incoming message-request list, bypassing
  // every conversation-list/empty-state branch below.
  if (!loading && !searching && activeTab === "requests") {
    return <MessagesRequestsPanel />;
  }
  return (
    <>
      {/* DES-194: announced to assistive tech even though the skeleton rows
       *  beneath are all `aria-hidden`. Kept mounted so the aria-live
       *  region already exists in the tree when its text changes, mirroring
       *  `MessagesSearchResults`'/`ThreadSearchModal`'s own pattern for the
       *  search-results loading state. */}
      <p className="visuallyHidden" role="status" aria-live="polite">
        {loading ? t("messages:thread.loadingInbox") : ""}
      </p>
      {loading && <MessageThreadListSkeleton count={6} />}
      {/* Query present → the unified search view: name-matched conversations
          (already filtered by the controller into `threads`) alongside
          cross-conversation message-body hits. */}
      {searching && (
        <MessagesSearchResults
          query={query}
          threads={threads}
          activeId={activeId}
          readIds={readIds}
          pinnedCount={pinnedCount}
          onOpen={onOpen}
          onRequestDelete={onRequestDelete}
          onSelectResult={onSelectResult}
          onClearSearch={() => onQueryChange("")}
          onMarkThreadRead={onMarkThreadRead}
          onMarkThreadUnread={onMarkThreadUnread}
        />
      )}
      {/* DES-183: no cached rows to fall back to, the same shape as
          `MessagesRequestsPanel`'s own `LoadErrorState`, so a 5xx/throttle/
          expired-session never reads as "you have no conversations". */}
      {!loading && !searching && isError && threads.length === 0 && (
        <LoadErrorState
          compact
          onRetry={onRetry}
          description={t("messages:thread.loadErrorBody")}
        />
      )}
      {/* "No conversations yet" only on a SETTLED, SUCCESSFUL empty list,
          never while a failed refresh just hasn't produced any rows yet. */}
      {!loading && !searching && !isError && threads.length === 0 && (
        <EmptyState
          compact
          icon={<FiMessageCircle />}
          title={t("messages:thread.emptyTitle")}
          description={t("messages:thread.emptyDescription")}
          action={{
            label: t("messages:thread.newMessage"),
            onClick: onCompose,
          }}
        />
      )}
      {/* Cached rows survive a failed refresh: a compact inline retry line
          ABOVE the stale rows, rather than replacing them. */}
      {!loading && !searching && isError && threads.length > 0 && onRetry && (
        <InboxLoadErrorStrip onRetry={onRetry} />
      )}
      {!loading &&
        !searching &&
        threads.length > 0 &&
        visibleThreads.length === 0 &&
        TAB_EMPTY_KEY[activeTab] && (
          <EmptyState
            compact
            icon={<FiMessageCircle />}
            title={t(`messages:${TAB_EMPTY_KEY[activeTab]}`)}
          />
        )}
      {/* DES-188: a real list. `aria-current`/visually-hidden state on each
          row (see `MessagesThreadRow`) only reads as list-item state to a
          screen reader inside actual `ul`/`li` semantics. */}
      {!loading && !searching && visibleThreads.length > 0 && (
        <ul className={styles.threadRowList}>
          {visibleThreads.map((thread, index) => (
            <FadeIn
              as="li"
              key={thread.id}
              delay={Math.min(index, 8) * 60}
              className={styles.threadRowFade}
            >
              <MessagesThreadRow
                thread={thread}
                activeId={activeId}
                readIds={readIds}
                pinnedCount={pinnedCount}
                onOpen={onOpen}
                onRequestDelete={onRequestDelete}
                onMarkThreadRead={onMarkThreadRead}
                onMarkThreadUnread={onMarkThreadUnread}
              />
            </FadeIn>
          ))}
        </ul>
      )}
    </>
  );
}
