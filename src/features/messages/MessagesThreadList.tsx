import { FiMessageCircle, FiSearch } from "react-icons/fi";
import {
  Avatar,
  EmptyState,
  FadeIn,
  SearchInput,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MessageThreadListSkeleton } from "./MessagesSkeleton";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

export function MessagesThreadList({
  loading,
  threads,
  activeId,
  readIds,
  query,
  onQueryChange,
  onOpen,
  onCompose,
}: {
  loading: boolean;
  threads: Conversation[];
  activeId: string;
  readIds: Set<string>;
  query: string;
  onQueryChange: (value: string) => void;
  onOpen: (id: string) => void;
  onCompose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.threadPanel}>
      <div className={styles.tpTop}>
        <div className={styles.tpHeadRow}>
          <div className={styles.tpTitle}>{t("messages:thread.title")}</div>
          <button
            type="button"
            className={styles.composeBtn}
            title={t("messages:thread.composeTooltip")}
            onClick={onCompose}
          >
            <svg
              width={15}
              height={15}
              viewBox="0 0 15 15"
              fill="none"
              aria-hidden
            >
              <path
                d="M10.5 2L13 4.5l-7 7H3.5V9l7-7Z"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
              <path
                d="M2 13h11"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <SearchInput
          value={query}
          onChange={onQueryChange}
          placeholder={t("messages:thread.searchPlaceholder")}
          ariaLabel={t("messages:thread.searchAria")}
        />
      </div>

      <div className={styles.threadList}>
        {loading && <MessageThreadListSkeleton count={6} />}
        {!loading &&
          threads.length === 0 &&
          (query.trim() ? (
            <EmptyState
              compact
              icon={<FiSearch />}
              title={t("messages:thread.emptySearchTitle")}
              description={t("messages:thread.emptySearchDescription", {
                query: query.trim(),
              })}
              action={{
                label: t("messages:thread.clearSearch"),
                onClick: () => onQueryChange(""),
              }}
            />
          ) : (
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
          ))}
        {!loading &&
          threads.map((thread, i) => {
            const isUnread =
              thread.unread &&
              !readIds.has(thread.id) &&
              thread.id !== activeId;
            return (
              <FadeIn key={thread.id} delay={Math.min(i, 8) * 60}>
                <button
                  type="button"
                  className={[
                    styles.threadRow,
                    thread.id === activeId && styles.threadActive,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => onOpen(thread.id)}
                >
                  <div className={styles.trAv}>
                    <Avatar
                      initials={thread.initials}
                      tint={thread.tint}
                      size={42}
                    />
                    {isUnread && <span className={styles.unreadDot} />}
                  </div>
                  <div className={styles.trBody}>
                    <div className={styles.trHeader}>
                      <span className={styles.trName}>{thread.name}</span>
                      <span className={styles.trTime}>{thread.time}</span>
                    </div>
                    <div
                      className={[
                        styles.trPreview,
                        isUnread && styles.trPreviewUnread,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {thread.preview}
                    </div>
                  </div>
                </button>
              </FadeIn>
            );
          })}
      </div>
    </div>
  );
}
