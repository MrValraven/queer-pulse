import { memo } from "react";
import { Avatar } from "../../shared/components/ui";
import { useIsOnline } from "../../shared/api/realtime";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { ThreadRowMenu } from "./ThreadRowMenu";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

/**
 * One inbox row: the row `<button>` (avatar + body, unchanged markup) plus a
 * sibling `<ThreadRowMenu>` — split out of `MessagesThreadList` to keep each
 * component under the 200-line cap.
 *
 * Wrapped in `React.memo`: subscribes to presence via `useIsOnline` itself
 * (a per-participant selector, not the whole online set) so a row only
 * re-renders on its OWN presence flip, and every other prop here is already a
 * primitive or a stable callback — so an unrelated row's presence change, or
 * an unrelated re-render of the list above, skips this row entirely.
 */
function MessagesThreadRowImpl({
  thread,
  activeId,
  readIds,
  onOpen,
  onRequestDelete,
}: {
  thread: Conversation;
  activeId: string;
  readIds: Set<string>;
  onOpen: (id: string) => void;
  onRequestDelete: (thread: Conversation) => void;
}) {
  const { t } = useTranslation();
  const isUnread =
    thread.unread && !readIds.has(thread.id) && thread.id !== activeId;
  const presenceOnline = useIsOnline(thread.otherParticipantId);
  const isOnline =
    (!!thread.otherParticipantId && presenceOnline) ||
    (!thread.otherParticipantId && !!thread.online);

  return (
    <div className={styles.threadRowWrap}>
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
            src={thread.avatarUrl}
            size={42}
          />
          {isOnline && (
            <span
              className={styles.presenceRing}
              title={t("messages:thread.presenceOnline")}
            />
          )}
        </div>
        <div className={styles.trBody}>
          <div className={styles.trHeader}>
            <span className={styles.nameRow}>
              <span className={styles.trName}>{thread.name}</span>
              <MemberStaffBadge slug={thread.slug} />
            </span>
            <span className={styles.trTime}>{thread.time}</span>
          </div>
          <div className={styles.trPreviewRow}>
            <div
              className={[styles.trPreview, isUnread && styles.trPreviewUnread]
                .filter(Boolean)
                .join(" ")}
            >
              {thread.preview}
            </div>
            {isUnread &&
              (thread.unreadCount && thread.unreadCount > 0 ? (
                <span className={styles.unreadBadge}>
                  {thread.unreadCount}
                </span>
              ) : (
                <span className={styles.unreadDot} />
              ))}
          </div>
        </div>
      </button>
      <ThreadRowMenu onDelete={() => onRequestDelete(thread)} />
    </div>
  );
}

export const MessagesThreadRow = memo(MessagesThreadRowImpl);
