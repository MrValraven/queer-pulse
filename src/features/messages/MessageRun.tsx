// src/features/messages/MessageRun.tsx
import { Avatar } from "../../shared/components/ui";
import type { AvatarTint } from "../../shared/components/ui/Avatar";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { isEmojiOnly, type MessageRun } from "./messageRuns";
import { renderWithLinks } from "./linkify";
import { MessageActions } from "./MessageActions";
import { ReactionChips } from "./ReactionChips";
import type { ChatMessage } from "./data";
import styles from "./MessagesPage.module.css";

/** Avatar identity for one side of the conversation. */
export interface RunParticipant {
  initials: string;
  tint: AvatarTint;
  /** Optional profile photo; Avatar falls back to initials when absent. */
  src?: string;
}

/** Renders one sender run: a single avatar plus a vertical stack of bubbles. */
export function MessageRunView({
  run,
  counterpart,
  self,
  selfName,
  counterpartName,
  onRetry,
  showSeen,
  onReactionToggle,
  onReportMessage,
  onDeleteMessage,
  viewerIsStaff,
}: {
  run: MessageRun;
  counterpart: RunParticipant;
  self: RunParticipant;
  /** Localized display name for the signed-in member, used in per-message aria-labels. */
  selfName: string;
  /** Display name of the conversation counterpart, used in per-message aria-labels. */
  counterpartName: string;
  /** Retries a failed optimistic send. Only relevant for the "me" side. */
  onRetry?: (message: ChatMessage) => void;
  /** True only for the run containing the thread's last outbound message,
   *  once the counterpart's read watermark has caught up to it — renders
   *  "Seen" below that run instead of nothing. Ignored while the last item is
   *  still sending/failed (those take precedence). */
  showSeen?: boolean;
  /** Adds/removes a reaction on `message`; `mine` is whether the signed-in
   *  member already had that reaction (decides add vs. remove upstream). */
  onReactionToggle?: (
    message: ChatMessage,
    key: MessageReactionKey,
    mine: boolean,
  ) => void;
  /** Opens the report flow for `message` (Task 5 renders the modal). */
  onReportMessage?: (message: ChatMessage) => void;
  /** Opens the delete-confirm flow for `message` (Task 6 renders the modal). */
  onDeleteMessage?: (message: ChatMessage) => void;
  /** True when the signed-in member is an admin/moderator — widens `canDelete`
   *  to any message, not just the member's own. */
  viewerIsStaff?: boolean;
}) {
  const { t } = useTranslation();
  const isSent = run.from === "me";
  const who = isSent ? self : counterpart;
  const senderName = isSent ? selfName : counterpartName;
  const lastIndex = run.items.length - 1;
  const runTime = run.items[lastIndex]?.time;
  const canDelete = isSent || !!viewerIsStaff;

  return (
    <div
      className={[styles.run, isSent && styles.runSent].filter(Boolean).join(" ")}
      role="listitem"
    >
      <div className={styles.runAvatar}>
        <Avatar initials={who.initials} tint={who.tint} src={who.src} size={28} />
      </div>
      <div className={styles.runBubbles}>
        {run.items.map((message, index) => {
          const isLast = index === lastIndex;
          const key = message.id ?? `pos-${index}`;
          const bubbleContent = isEmojiOnly(message.text) ? (
            <div
              className={styles.emojiOnly}
              title={message.time}
              aria-label={`${senderName}: ${message.text}`}
            >
              {message.text}
            </div>
          ) : (
            <div
              className={[
                styles.bubble,
                isSent ? styles.sent : styles.received,
                index > 0 && styles.groupTop,
                index < lastIndex && styles.groupBottom,
                isLast && (isSent ? styles.tailSent : styles.tailReceived),
              ]
                .filter(Boolean)
                .join(" ")}
              title={message.time}
              aria-label={`${senderName}: ${message.text}`}
            >
              {renderWithLinks(message.text)}
            </div>
          );

          // Tombstoned messages (soft-deleted, live mode): the server blanks the
          // body, so render a muted placeholder — no bubble colour, no action
          // bar, no reaction chips (nothing left to react to or moderate).
          if (message.deletedAt) {
            return (
              <div key={key} className={styles.tombstone}>
                {t("messages:tombstone")}
              </div>
            );
          }

          const reactions = message.reactions ?? [];
          const hasVisibleReactions = reactions.some(
            (reaction) => reaction.count > 0,
          );

          return (
            <div key={key} className={styles.bubbleWrap}>
              {bubbleContent}
              <div
                className={[
                  styles.messageActionsSlot,
                  isSent && styles.messageActionsSlotSent,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <MessageActions
                  canDelete={canDelete}
                  onReact={(reactionKey) =>
                    onReactionToggle?.(message, reactionKey, false)
                  }
                  onReport={() => onReportMessage?.(message)}
                  onDelete={() => onDeleteMessage?.(message)}
                />
              </div>
              {hasVisibleReactions && (
                <ReactionChips
                  reactions={reactions}
                  onToggle={(reactionKey, mine) =>
                    onReactionToggle?.(message, reactionKey, mine)
                  }
                />
              )}
            </div>
          );
        })}
        {runTime && <div className={styles.bubbleTime}>{runTime}</div>}
        {isSent && (() => {
          const lastMessage = run.items[lastIndex];
          if (lastMessage?.status === "sending")
            return <div className={styles.msgStatus}>{t("messages:status.sending")}</div>;
          if (lastMessage?.status === "failed")
            return (
              <button type="button" className={styles.retryBtn} onClick={() => onRetry?.(lastMessage)}>
                {t("messages:status.retry")}
              </button>
            );
          if (showSeen)
            return <div className={styles.msgStatus}>{t("messages:status.seen")}</div>;
          return null;
        })()}
      </div>
    </div>
  );
}
