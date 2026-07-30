import { Fragment, type ReactNode } from "react";
import { FiSearch } from "react-icons/fi";
import { Avatar, EmptyState } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MessagesThreadRow } from "./MessagesThreadRow";
import {
  useMessageSearch,
  type MessageSearchGroupView,
  type MessageSearchHitView,
} from "./api/useMessageSearch";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

/** Wraps every case-insensitive occurrence of `query` in `text` with a <mark>,
 *  so the matched term stands out in the snippet. The query is regex-escaped
 *  before it's used as a pattern (never trust free text in a RegExp). */
function highlight(text: string, query: string): ReactNode {
  const term = query.trim();
  if (!term) return text;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "ig"));
  return parts.map((part, index) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={index} className={styles.searchMark}>
        {part}
      </mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

/** One matched-message row: sender + time, then the highlighted snippet. Selects
 *  the message (opens the thread and jumps to the bubble) on click. */
function MessageHitRow({
  hit,
  query,
  onSelect,
}: {
  hit: MessageSearchHitView;
  query: string;
  onSelect: (conversationId: string, messageId?: string) => void;
}) {
  return (
    <button
      type="button"
      className={styles.hitRow}
      onClick={() => onSelect(hit.conversationId, hit.id)}
    >
      <div className={styles.hitHeader}>
        <span className={styles.hitSender}>{hit.senderName}</span>
        {hit.time && <span className={styles.hitTime}>{hit.time}</span>}
      </div>
      <div className={styles.hitSnippet}>{highlight(hit.snippet, query)}</div>
    </button>
  );
}

/** A conversation's search hits under a small identity header. */
function HitGroup({
  group,
  query,
  onOpen,
  onSelect,
}: {
  group: MessageSearchGroupView;
  query: string;
  onOpen: (conversationId: string) => void;
  onSelect: (conversationId: string, messageId?: string) => void;
}) {
  return (
    <div className={styles.hitGroup}>
      <button
        type="button"
        className={styles.hitGroupHead}
        onClick={() => onOpen(group.conversationId)}
      >
        <Avatar
          initials={group.initials}
          tint={group.tint}
          src={group.avatarUrl}
          size={26}
        />
        <span className={styles.hitGroupName}>{group.name}</span>
      </button>
      {group.hits.map((hit, index) => (
        <MessageHitRow
          key={hit.id ?? `${group.conversationId}-${index}`}
          hit={hit}
          query={query}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

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
  onOpen,
  onRequestDelete,
  onSelectResult,
  onClearSearch,
}: {
  query: string;
  threads: Conversation[];
  activeId: string;
  readIds: Set<string>;
  onOpen: (id: string) => void;
  onRequestDelete: (thread: Conversation) => void;
  onSelectResult: (conversationId: string, messageId?: string) => void;
  onClearSearch: () => void;
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
              onOpen={onOpen}
              onRequestDelete={onRequestDelete}
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
