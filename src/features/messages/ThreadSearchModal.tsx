import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { EmptyState, Modal, SearchInput } from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MessageHitRow } from "./MessagesSearchHitGroup";
import { useMessageSearch } from "./api/useMessageSearch";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

interface ThreadSearchModalProps {
  conversation: Conversation;
  onClose: () => void;
  /** Jumps to (and highlights) a message already loaded in the OPEN thread —
   *  the same mechanism the pinned-messages banner and a reply-quote tap use
   *  (`jumpToMessageVirtualized`). A demo hit with no server id is a no-op
   *  here — the thread is already open, so there's simply nothing to scroll
   *  to (mirrors the cross-inbox search's own demo behaviour). */
  onJumpToMessage: (messageId: string) => void;
}

/**
 * "Search in this chat" — opened from the conversation header, scoped to just
 * the OPEN thread (unlike the inbox-root search box, which fans out across
 * every conversation). Reuses `useMessageSearch`'s `scopedToConversationId`
 * param and the same `MessageHitRow` the cross-inbox results already render —
 * just without the per-conversation group header, which would be redundant
 * here since the chat is already open.
 */
export function ThreadSearchModal({
  conversation,
  onClose,
  onJumpToMessage,
}: ThreadSearchModalProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 300);
  const search = useMessageSearch(
    debounced,
    t("messages:conversation.you"),
    conversation.id,
  );
  const trimmed = query.trim();
  const hits = useMemo(
    () => search.groups.flatMap((group) => group.hits),
    [search.groups],
  );
  const noMessages = search.enabled && !search.isLoading && hits.length === 0;

  function handleSelect(_conversationId: string, messageId?: string) {
    if (messageId) onJumpToMessage(messageId);
    onClose();
  }

  return (
    <Modal
      title={t("messages:search.inChatTitle", { name: conversation.name })}
      onClose={onClose}
    >
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={t("messages:search.inChatPlaceholder")}
        ariaLabel={t("messages:search.inChatAria")}
      />
      <div className={styles.searchResults}>
        <section className={styles.searchSection}>
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
          {noMessages && (
            <EmptyState
              compact
              icon={<FiSearch />}
              title={t("messages:search.emptyTitle")}
              description={t("messages:search.noMessages", { query: trimmed })}
            />
          )}
          {hits.map((hit, index) => (
            <MessageHitRow
              key={hit.id ?? `${conversation.id}-${index}`}
              hit={hit}
              query={trimmed}
              onSelect={handleSelect}
            />
          ))}
        </section>
      </div>
    </Modal>
  );
}
