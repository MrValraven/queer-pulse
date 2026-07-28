import { useState } from "react";
import { FiMessageCircle, FiSearch } from "react-icons/fi";
import { EmptyState, FadeIn, SearchInput } from "../../shared/components/ui";
import { usePresenceOnline } from "../../shared/api/realtime";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DeleteConversationDialog } from "./DeleteConversationDialog";
import { MessageThreadListSkeleton } from "./MessagesSkeleton";
import { MessagesThreadRow } from "./MessagesThreadRow";
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
  onDelete,
  deletePending,
}: {
  loading: boolean;
  threads: Conversation[];
  activeId: string;
  readIds: Set<string>;
  query: string;
  onQueryChange: (value: string) => void;
  onOpen: (id: string) => void;
  onCompose: () => void;
  onDelete: (id: string) => void;
  deletePending: boolean;
}) {
  const { t } = useTranslation();
  /** Live online-userId set from realtime presence frames; always empty in
   *  demo mode (no socket) — rows without an `otherParticipantId` fall back
   *  to the static `thread.online` mock flag instead. */
  const online = usePresenceOnline();
  const [confirmDelete, setConfirmDelete] = useState<Conversation | null>(
    null,
  );
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
          threads.map((thread, i) => (
            <FadeIn key={thread.id} delay={Math.min(i, 8) * 60}>
              <MessagesThreadRow
                thread={thread}
                activeId={activeId}
                readIds={readIds}
                online={online}
                onOpen={onOpen}
                onRequestDelete={setConfirmDelete}
              />
            </FadeIn>
          ))}
      </div>
      {confirmDelete && (
        <DeleteConversationDialog
          name={confirmDelete.name}
          pending={deletePending}
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => {
            onDelete(confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      )}
    </div>
  );
}
