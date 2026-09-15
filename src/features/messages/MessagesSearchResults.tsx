import { FiSearch } from "react-icons/fi";
import { EmptyState } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HitGroup } from "./MessagesSearchHitGroup";
import {
  MessageHitListSkeleton,
  MessageThreadListSkeleton,
} from "./MessagesSkeleton";
import { MessagesThreadRow } from "./MessagesThreadRow";
import { MIN_SEARCH_LENGTH, useMessageSearch } from "./api/useMessageSearch";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

/**
 * The inbox's search view, shown while the search box has a query. Unifies the
 * existing conversation-NAME filter (the `threads` already narrowed by the
 * controller) with cross-conversation message-BODY search (`useMessageSearch`,
 * dual-mode + debounced here). Selecting a message opens its thread and jumps to
 * the bubble; selecting a conversation just opens it.
 *
 * `isSearching` tracks the debounce lag against the LIVE query, not the
 * debounced one — while it's true, both the "nothing matches yet" empty state
 * and the plain "no messages"/"keep typing" status texts are held back in
 * favour of skeletons, so a fast typist never sees a false-negative empty
 * state flash before the real hits land.
 *
 * A query too short to search (`isTooShortToSearch`) is never described with
 * the "nothing matches yet" copy either — that claims a real search came
 * back empty, and none ran. It gets its own "keep typing" empty state (no
 * "Clear search" action) when no conversation name matched, or the same
 * "keep typing" status line inline when one did.
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
  const debouncedTrimmed = debounced.trim();

  const isTooShortToSearch = trimmed.length < MIN_SEARCH_LENGTH;
  // Pending covers both "debounce hasn't caught up with the live query yet"
  // and "request in flight" — derived from the LIVE length, never the
  // debounced one, so "keep typing" vs. "searching" reflects what's on screen.
  const isSearching =
    !isTooShortToSearch && (debouncedTrimmed !== trimmed || search.isLoading);
  const isMessageSearchEmpty =
    !isSearching && !isTooShortToSearch && search.totalHits === 0;

  const hasConversations = threads.length > 0;

  // The query is too short to have actually searched, and no conversation
  // name matched either: say so honestly (never claim a search came back
  // empty when none ran). No "Clear search" action — there's no settled
  // result to clear away from yet.
  if (isTooShortToSearch && hasConversations === false) {
    return (
      <EmptyState
        compact
        icon={<FiSearch />}
        title={t("messages:search.tooShortTitle")}
        description={t("messages:search.tooShortDescription")}
      />
    );
  }

  // Nothing on either axis, AND the search has actually settled: one warm,
  // combined empty state. Never rendered while pending, or it flashes ahead
  // of real hits.
  if (!isSearching && hasConversations === false && isMessageSearchEmpty) {
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
      {!hasConversations && isSearching && (
        <section className={styles.searchSection}>
          <div className={styles.searchSectionLabel}>
            {t("messages:search.conversationsLabel")}
          </div>
          <MessageThreadListSkeleton count={2} />
        </section>
      )}

      <section className={styles.searchSection}>
        <div className={styles.searchSectionLabel}>
          {t("messages:search.messagesLabel")}
        </div>
        {/* Announced to assistive tech even though the visible row is a
         *  skeleton — kept mounted so the aria-live region is already
         *  present when its text changes. */}
        <p className="visuallyHidden" role="status" aria-live="polite">
          {isSearching ? t("messages:search.searching") : ""}
        </p>
        {isSearching && <MessageHitListSkeleton />}
        {!isSearching && isTooShortToSearch && (
          <div className={styles.searchStatus}>
            {t("messages:search.keepTyping")}
          </div>
        )}
        {!isSearching && isMessageSearchEmpty && (
          <div className={styles.searchStatus}>
            {t("messages:search.noMessages", { query: trimmed })}
          </div>
        )}
        {!isSearching &&
          !isTooShortToSearch &&
          search.groups.map((group) => (
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
