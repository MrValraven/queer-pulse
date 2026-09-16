import { LoadErrorState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HitGroup } from "./MessagesSearchHitGroup";
import { MessageHitListSkeleton } from "./MessagesSkeleton";
import type { MessageSearchGroupView } from "./api/useMessageSearch";
import styles from "./MessagesPage.module.css";

interface MessagesSearchMessagesSectionProps {
  isSearching: boolean;
  isTooShortToSearch: boolean;
  /** True once the (settled) body search request failed (DES-184). */
  isMessageSearchError: boolean;
  /** True once the (settled) body search request came back with zero hits. */
  isMessageSearchEmpty: boolean;
  query: string;
  groups: MessageSearchGroupView[];
  onRetry: () => void;
  onOpen: (conversationId: string) => void;
  onSelect: (conversationId: string, messageId?: string) => void;
}

/**
 * The "Messages" (cross-conversation body-hit) section of the unified search
 * view. Split out of `MessagesSearchResults` to keep it under the 200-line
 * cap. Owns the loading/error/empty/settled rendering for this one axis
 * (DES-184, DES-194); the Conversations section and the two combined
 * full-panel states (too-short-with-no-name-match, both-axes-empty) stay in
 * the parent, since they decide whether this section renders at all.
 */
export function MessagesSearchMessagesSection({
  isSearching,
  isTooShortToSearch,
  isMessageSearchError,
  isMessageSearchEmpty,
  query,
  groups,
  onRetry,
  onOpen,
  onSelect,
}: MessagesSearchMessagesSectionProps) {
  const { t } = useTranslation();
  return (
    <section className={styles.searchSection}>
      <h2 className={styles.searchSectionLabel}>
        {t("messages:search.messagesLabel")}
      </h2>
      {/* Announced to assistive tech even though the visible row is a
       *  skeleton. Kept mounted so the aria-live region is already
       *  present when its text changes. */}
      <p className="visuallyHidden" role="status" aria-live="polite">
        {isSearching ? t("messages:search.searching") : ""}
      </p>
      {isSearching && <MessageHitListSkeleton />}
      {!isSearching && isTooShortToSearch && (
        <div className={styles.searchStatus} role="status" aria-live="polite">
          {t("messages:search.keepTyping")}
        </div>
      )}
      {/* Inline, compact: the Conversations section above may already be
       *  showing real name-matched rows, so a failed body search never
       *  replaces the whole panel (DES-184). */}
      {isMessageSearchError && (
        <LoadErrorState
          compact
          onRetry={onRetry}
          description={t("messages:search.loadErrorBody")}
        />
      )}
      {!isSearching && isMessageSearchEmpty && (
        <div className={styles.searchStatus} role="status" aria-live="polite">
          {t("messages:search.noMessages", { query })}
        </div>
      )}
      {!isSearching &&
        !isTooShortToSearch &&
        groups.map((group) => (
          <HitGroup
            key={group.conversationId}
            group={group}
            query={query}
            onOpen={onOpen}
            onSelect={onSelect}
          />
        ))}
    </section>
  );
}
