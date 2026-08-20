import { FiMessageCircle } from "react-icons/fi";
import { EmptyState, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MessagesRequestsPanel } from "./MessagesRequestsPanel";
import { MessagesSearchResults } from "./MessagesSearchResults";
import { MessageThreadListSkeleton } from "./MessagesSkeleton";
import { MessagesThreadRow } from "./MessagesThreadRow";
import type { InboxTab } from "./threadFilters";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

/** Empty-state copy per non-"all" tab — "All" can't be empty here (that case
 *  is the whole-inbox empty state above it), so it has no key. */
const TAB_EMPTY_KEY: Partial<Record<InboxTab, string>> = {
  unread: "thread.tabEmptyUnread",
  favorites: "thread.tabEmptyFavorites",
  groups: "thread.tabEmptyGroups",
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
  onOpen,
  onCompose,
  onQueryChange,
  onSelectResult,
  onRequestDelete,
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
  onOpen: (id: string) => void;
  onCompose: () => void;
  onQueryChange: (value: string) => void;
  onSelectResult: (conversationId: string, messageId?: string) => void;
  onRequestDelete: (thread: Conversation) => void;
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
        />
      )}
      {!loading && !searching && threads.length === 0 && (
        <EmptyState
          compact
          icon={<FiMessageCircle />}
          title={t("messages:thread.emptyTitle")}
          description={t("messages:thread.emptyDescription")}
          action={{ label: t("messages:thread.newMessage"), onClick: onCompose }}
        />
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
      {!loading &&
        !searching &&
        visibleThreads.map((thread, index) => (
          <FadeIn
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
            />
          </FadeIn>
        ))}
    </>
  );
}
