import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import {
  EmptyState,
  LoadErrorState,
  Modal,
  SearchInput,
} from "../../shared/components/ui";
import { useDebouncedValue } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MessageHitRow } from "./MessagesSearchHitGroup";
import { MessageHitListSkeleton } from "./MessagesSkeleton";
import { MIN_SEARCH_LENGTH, useMessageSearch } from "./api/useMessageSearch";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

interface ThreadSearchModalProps {
  conversation: Conversation;
  onClose: () => void;
  /** Starts the jump to a message in the OPEN thread, the same mechanism the
   *  pinned-messages banner and a reply-quote tap use
   *  (`jumpToMessageVirtualized`): it scrolls to a loaded message, or pages
   *  back for an older one with its own status over the log, or says the
   *  message can't be found. A demo hit with no server id just closes, since
   *  the thread is already open (mirrors the cross-inbox search's demo
   *  behaviour). */
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
  const debouncedTrimmed = debounced.trim();
  const hits = useMemo(
    () => search.groups.flatMap((group) => group.hits),
    [search.groups],
  );

  const isTooShortToSearch = trimmed.length < MIN_SEARCH_LENGTH;
  // Pending covers both "debounce hasn't caught up with the live query yet"
  // and "request in flight" — derived from the LIVE length, never the
  // debounced one, so the empty state never flashes ahead of real hits.
  const isSearching =
    !isTooShortToSearch && (debouncedTrimmed !== trimmed || search.isLoading);
  // Excludes an errored search from ever reading as a settled miss (DES-184);
  // see isMessageSearchError below.
  const isMessageSearchEmpty =
    !isSearching && !isTooShortToSearch && !search.isError && hits.length === 0;
  const isMessageSearchError =
    !isSearching && !isTooShortToSearch && search.isError;

  function handleSelect(_conversationId: string, messageId?: string) {
    // Jump first, close second: by the time focus returns to the header the
    // jump is underway and its feedback lives over the log, outside this modal.
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
      <div
        className={styles.searchResults}
        // aria-busy while the debounced query/fetch is pending (DES-194):
        // the section beneath is a skeleton, not settled content, until this
        // clears.
        aria-busy={isSearching}
      >
        <section className={styles.searchSection}>
          {/* Announced to assistive tech even though the visible row is a
           *  skeleton — kept mounted so the aria-live region is already
           *  present when its text changes. */}
          <p className="visuallyHidden" role="status" aria-live="polite">
            {isSearching ? t("messages:search.searching") : ""}
          </p>
          {isSearching && <MessageHitListSkeleton />}
          {!isSearching && isTooShortToSearch && (
            <div
              className={styles.searchStatus}
              role="status"
              aria-live="polite"
            >
              {t("messages:search.keepTyping")}
            </div>
          )}
          {/* An outage never reads as "no messages match" either (DES-184).
           *  `EmptyState`/`LoadErrorState` both carry their own role="status"
           *  live region. */}
          {isMessageSearchError && (
            <LoadErrorState
              compact
              onRetry={search.refetch}
              description={t("messages:search.loadErrorBody")}
            />
          )}
          {isMessageSearchEmpty && (
            <EmptyState
              compact
              icon={<FiSearch />}
              title={t("messages:search.emptyTitle")}
              description={t("messages:search.noMessages", { query: trimmed })}
            />
          )}
          {!isSearching &&
            !isTooShortToSearch &&
            hits.map((hit, index) => (
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
