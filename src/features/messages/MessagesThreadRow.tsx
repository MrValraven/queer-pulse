import { memo } from "react";
import { Avatar } from "../../shared/components/ui";
import { useIsOnline } from "../../shared/api/realtime";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { ThreadRowMenu } from "./ThreadRowMenu";
import type { Conversation } from "./data";
import styles from "./MessagesPage.module.css";

interface MessagesThreadRowProps {
  thread: Conversation;
  activeId: string;
  readIds: Set<string>;
  onOpen: (id: string) => void;
  onRequestDelete: (thread: Conversation) => void;
}

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
}: MessagesThreadRowProps) {
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

/**
 * Every row in the list is handed the SAME `activeId` string and the SAME
 * `readIds` Set reference — switching the open thread, or marking any ONE
 * thread read, hands every row a new `readIds` Set identity, which the
 * default shallow-props memo comparator would see as "changed" for every
 * row, not just the one whose own state actually flipped. Compare the two
 * DERIVED booleans this row actually renders from instead of the raw
 * props, so a row only re-renders when its OWN active/read state changes
 * (or its own `thread`/callback identities do) — not on every other row's.
 * (Not a prop-shape refactor — `activeId`/`readIds` stay as-is so this
 * doesn't ripple into `MessagesSearchResults.tsx`'s call site.)
 */
function areRowPropsEqual(
  previous: MessagesThreadRowProps,
  next: MessagesThreadRowProps,
): boolean {
  if (previous.thread !== next.thread) return false;
  if (previous.onOpen !== next.onOpen) return false;
  if (previous.onRequestDelete !== next.onRequestDelete) return false;
  const wasActive = previous.thread.id === previous.activeId;
  const isActive = next.thread.id === next.activeId;
  if (wasActive !== isActive) return false;
  const wasRead = previous.readIds.has(previous.thread.id);
  const isRead = next.readIds.has(next.thread.id);
  return wasRead === isRead;
}

export const MessagesThreadRow = memo(MessagesThreadRowImpl, areRowPropsEqual);
