import { FiSearch } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HitGroup } from "./MessagesSearchHitGroup";
import { MessagesThreadRow } from "./MessagesThreadRow";
import { useMessageSearch } from "./api/useMessageSearch";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

/**
 * The inbox's search view, shown while the search box has a query. Unifies the
 * existing conversation-NAME filter (the `threads` already narrowed by the
 * controller) with cross-conversation message-BODY search (`useMessageSearch`,
 * dual-mode + debounced here). Selecting a message opens its thread and jumps to
 * the bubble; selecting a conversation just opens it.
 */
export function MessagesSearchResults({
  query,
  threads,
  activeId,
  readIds,
  pinnedCount,
  onOpen,
  onRequestDelete,
  onSelectResult,
  onClearSearch,
  onMarkThreadRead,
  onMarkThreadUnread,
}: {
  query: string;
  threads: Conversation[];
  activeId: string;
  readIds: Set<string>;
  /** Total pinned chats across the whole inbox (not just these name-matched
   *  results) — forwarded to each row's pin-toggle cap check. */
  pinnedCount: number;
  onOpen: (id: string) => void;
  onRequestDelete: (thread: Conversation) => void;
  onSelectResult: (conversationId: string, messageId?: string) => void;
  onClearSearch: () => void;
  /** Row menu "Mark as read"/"Mark as unread" (PRD-225). */
  onMarkThreadRead: (conversationId: string) => void;
  onMarkThreadUnread: (conversationId: string) => void;
}) {
  const { t } = useTranslation();
  // Debounce only the body-search fan-out; the name filter (from the controller)
  // already updates on every keystroke.
  const debounced = useDebouncedValue(query, 300);
  const search = useMessageSearch(debounced, t("messages:conversation.you"));
  const trimmed = query.trim();

  const hasConversations = threads.length > 0;
  const noMessageHits =
    search.enabled && !search.isLoading && search.totalHits === 0;

  // Nothing on either axis: one warm, combined empty state.
  if (hasConversations === false && (noMessageHits || !search.enabled)) {
    return (
      <EmptyState
        compact
        icon={<FiSearch />}
        title={t("messages:search.emptyTitle")}
        description={t("messages:search.emptyDescription", { query: trimmed })}
        action={{
          label: t("messages:thread.clearSearch"),
          onClick: onClearSearch,
        }}
      />
    );
  }

  return (
    <div className={styles.searchResults}>
      {hasConversations && (
        <section className={styles.searchSection}>
          <div className={styles.searchSectionLabel}>
            {t("messages:search.conversationsLabel")}
          </div>
          {threads.map((thread) => (
            <MessagesThreadRow
              key={thread.id}
              thread={thread}
              activeId={activeId}
              readIds={readIds}
              pinnedCount={pinnedCount}
              onOpen={onOpen}
              onRequestDelete={onRequestDelete}
              onMarkThreadRead={onMarkThreadRead}
              onMarkThreadUnread={onMarkThreadUnread}
            />
          ))}
        </section>
      )}

      <section className={styles.searchSection}>
        <div className={styles.searchSectionLabel}>
          {t("messages:search.messagesLabel")}
        </div>
        {search.isLoading && (
          <div className={styles.searchStatus}>
            {t("messages:search.searching")}
          </div>
        )}
        {!search.isLoading && !search.enabled && (
          <div className={styles.searchStatus}>
            {t("messages:search.keepTyping")}
          </div>
        )}
        {!search.isLoading && noMessageHits && (
          <div className={styles.searchStatus}>
            {t("messages:search.noMessages", { query: trimmed })}
          </div>
        )}
        {search.groups.map((group) => (
          <HitGroup
            key={group.conversationId}
            group={group}
            query={trimmed}
            onOpen={onOpen}
            onSelect={onSelectResult}
          />
        ))}
      </section>
    </div>
  );
}
