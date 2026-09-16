// src/features/messages/StarredMessagesModal.tsx
import { useState } from "react";
import { FiStar } from "react-icons/fi";
import { Avatar, EmptyState, Modal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { groupIdentity } from "./starredMessageIdentity";
import { useStarredMessages } from "./api/useMessagePinStar";
import { StarredMessagesError } from "./StarredMessagesError";
import { StarredMessagesLoadMore } from "./StarredMessagesLoadMore";
import { StarredMessagesToolbar } from "./StarredMessagesToolbar";
import { useStarredMessagesLoadMoreAnnouncement } from "./useStarredMessagesLoadMoreAnnouncement";
import { useStarredMessagesView } from "./useStarredMessagesView";
import type { StarredMessageFilterType } from "./starredMessagesFilter";
import styles from "./NewMessageModal.module.css";

interface StarredMessagesModalProps {
  onClose: () => void;
  /** Opens the conversation and jumps to the starred message. */
  onPick: (conversationId: string, messageId: string) => void;
}

/**
 * The "Starred messages" view: the caller's PRIVATE bookmarks, newest-star-first,
 * each with the counterpart, a snippet, and a jump-to. Reuses the cross-inbox
 * jump (`onPick`, `openThreadAtMessage`) so tapping opens the thread and
 * highlights the original. Demo mode lists the seeded stars plus this
 * session's, derived from the demo thread cache (`readDemoStarredMessages`).
 *
 * PRD-374: a toolbar (`StarredMessagesToolbar`) narrows the list by text
 * (body/sender/conversation/group title, and attachment caption/file name)
 * and by type (All/Photos/Documents/Links). Demo mode still filters the
 * already-loaded list purely client-side (`starredMessagesFilter.ts`), no
 * network. Live mode fans `q`/`type` out to a debounced, keyset-paginated
 * server search (`useStarredMessages`). Which of the two is actually driving
 * `visibleItems` at any moment (`useStarredMessagesView`) depends on whether
 * the server has answered the CURRENT filters yet: while it hasn't
 * (`isSearchPending`), the client filter narrows whatever page is still on
 * screen so typing keeps feeling instant; once it has, the server's own page
 * renders as-is; it alone can match text past the 160-character snippet a
 * starred hit carries, and it folds accents server-side the same way the
 * client filter does.
 */
export function StarredMessagesModal({
  onClose,
  onPick,
}: StarredMessagesModalProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<StarredMessageFilterType>("all");
  const {
    data,
    isLoading,
    isSearchPending,
    shouldFilterClientSide,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useStarredMessages(true, { q: query, type: filterType });
  const view = useStarredMessagesView(
    data,
    query,
    filterType,
    isLoading,
    isSearchPending,
    shouldFilterClientSide,
    hasNextPage,
  );
  const { listRef, announcement, isAnnouncementPending } =
    useStarredMessagesLoadMoreAnnouncement(
      view.visibleItems.length,
      isFetchingNextPage,
      isFetchNextPageError,
      hasNextPage,
    );

  function clearFilters() {
    setQuery("");
    setFilterType("all");
  }

  return (
    <Modal
      title={t("messages:starred.title")}
      sub={t("messages:starred.sub")}
      onClose={onClose}
    >
      {view.shouldShowToolbar && (
        <StarredMessagesToolbar
          query={query}
          onQueryChange={setQuery}
          type={filterType}
          onTypeChange={setFilterType}
          shouldAnnounceResultCount={
            view.shouldAnnounceResultCount && !isAnnouncementPending
          }
          resultCount={view.resultCount}
          resultCountIsPartial={view.resultCountIsPartial}
        />
      )}
      {isError && !isFetchNextPageError ? (
        <StarredMessagesError onRetry={refetch} />
      ) : view.hasNoMatches ? (
        <EmptyState
          compact
          icon={<FiStar />}
          title={t("messages:starred.noMatchesTitle")}
          description={t("messages:starred.noMatchesDescription")}
          action={{
            label: t("messages:starred.clearFilters"),
            onClick: clearFilters,
          }}
        />
      ) : (
        <ul className={styles.list} ref={listRef} tabIndex={-1}>
          {view.visibleItems.map((item) => {
            const identity = groupIdentity(
              view.groupsById.get(item.conversationId),
              t,
            );
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={styles.row}
                  onClick={() => onPick(item.conversationId, item.id)}
                >
                  <Avatar
                    initials={identity.initials}
                    tint={identity.tint}
                    src={identity.avatarUrl}
                    size={40}
                  />
                  <div className={styles.rowBody}>
                    <span className={styles.rowName}>{identity.name}</span>
                    <span className={styles.rowMeta}>{item.snippet}</span>
                  </div>
                </button>
              </li>
            );
          })}
          {(isLoading || isSearchPending) && (
            <li className={styles.empty}>{t("messages:starred.loading")}</li>
          )}
          {view.isNeverStarred && (
            <li className={styles.empty}>{t("messages:starred.empty")}</li>
          )}
          {hasNextPage && !isSearchPending && view.visibleItems.length > 0 && (
            <li>
              <StarredMessagesLoadMore
                isFetchingNextPage={isFetchingNextPage}
                isFetchNextPageError={isFetchNextPageError}
                onLoadMore={fetchNextPage}
              />
            </li>
          )}
        </ul>
      )}
      <p className="visuallyHidden" role="status" aria-live="polite">
        {announcement}
      </p>
    </Modal>
  );
}
