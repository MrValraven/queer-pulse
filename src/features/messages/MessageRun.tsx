// src/features/messages/MessageRun.tsx
import { useRef } from "react";
import { Avatar } from "../../shared/components/ui";
import type { AvatarTint } from "../../shared/components/ui/Avatar";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { isEmojiOnly, type MessageRun } from "./messageRuns";
import { renderWithLinks } from "./linkify";
import { MessageActions } from "./MessageActions";
import { ReactionChips } from "./ReactionChips";
import { InlineEditField } from "./InlineEditField";
import { useLongPress } from "./useLongPress";
import type { ChatMessage } from "./data";
import styles from "./MessagesPage.module.css";

/** Avatar identity for one side of the conversation. */
export interface RunParticipant {
  initials: string;
  tint: AvatarTint;
  /** Optional profile photo; Avatar falls back to initials when absent. */
  src?: string;
}

interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
  lastIndex: number;
  isSent: boolean;
  senderName: string;
  /** Adds/removes a reaction on `message`; `mine` is whether the signed-in
   *  member already had that reaction (decides add vs. remove upstream). */
  onReactionToggle?: (
    message: ChatMessage,
    key: MessageReactionKey,
    mine: boolean,
  ) => void;
  /** Opens the long-press/right-click action overlay for `message`. */
  onOpenActions?: (
    message: ChatMessage,
    origin: { rect: DOMRect },
    isSent: boolean,
  ) => void;
  /** Server id of the message currently showing the inline editor, if any. */
  editingMessageId?: string | null;
  /** Saves the inline editor's current text for `message`. */
  onSubmitEdit?: (message: ChatMessage, nextBody: string) => void;
  /** Closes the inline editor without saving. */
  onCancelEdit?: () => void;
  /** Scrolls to and briefly highlights the quoted original message. */
  onJumpToMessage?: (messageId: string) => void;
}

/** One rendered bubble within a run: emoji-only/text body, tombstone
 *  placeholder, the desktop hover action bar, and reaction chips. Owns its own
 *  `useLongPress` instance (one per bubble, at component top level) so a touch
 *  long-press or right-click opens the action overlay. While `editingMessageId`
 *  matches this message, the bubble content is swapped for an inline editor. */
function MessageBubble({
  message,
  index,
  lastIndex,
  isSent,
  senderName,
  onReactionToggle,
  onOpenActions,
  editingMessageId,
  onSubmitEdit,
  onCancelEdit,
  onJumpToMessage,
}: MessageBubbleProps) {
  const { t } = useTranslation();
  const isLast = index === lastIndex;
  const wrapRef = useRef<HTMLDivElement>(null);
  const longPress = useLongPress(
    (origin) => onOpenActions?.(message, origin, isSent),
    { enabled: !!message.id && !message.deletedAt },
  );
  const bubbleDomId = message.id ? `message-${message.id}` : undefined;

  if (editingMessageId && editingMessageId === message.id) {
    return (
      <div id={bubbleDomId} className={styles.bubbleWrap}>
        <InlineEditField
          initialValue={message.text}
          onSubmit={(nextValue) => onSubmitEdit?.(message, nextValue)}
          onCancel={() => onCancelEdit?.()}
        />
      </div>
    );
  }

  // The quoted-reply block. On a normal text bubble it renders *inside* the
  // bubble (WhatsApp-style, tucked under the shared radius); a `sent`/`received`
  // variant recolors the accent so it reads on plum vs. paper. Emoji-only
  // bubbles have no surface to tuck it into, so it sits above them instead.
  const replyQuoteNode = message.replyTo && (
    <button
      type="button"
      className={[
        styles.replyQuote,
        isSent ? styles.replyQuoteSent : styles.replyQuoteReceived,
      ].join(" ")}
      disabled={message.replyTo.deleted}
      onClick={() =>
        !message.replyTo!.deleted && onJumpToMessage?.(message.replyTo!.id)
      }
    >
      <span className={styles.replyQuoteName}>{message.replyTo.senderName}</span>
      <span className={styles.replyQuoteSnippet}>
        {message.replyTo.deleted
          ? t("messages:replyDeleted")
          : message.replyTo.snippet}
      </span>
    </button>
  );

  const bubbleContent = isEmojiOnly(message.text) ? (
    <>
      {replyQuoteNode}
      <div
        className={styles.emojiOnly}
        title={message.time}
        aria-label={`${senderName}: ${message.text}`}
      >
        {message.text}
      </div>
    </>
  ) : (
    <div
      className={[
        styles.bubble,
        isSent ? styles.sent : styles.received,
        message.replyTo && styles.bubbleWithReply,
        index > 0 && styles.groupTop,
        index < lastIndex && styles.groupBottom,
        isLast && (isSent ? styles.tailSent : styles.tailReceived),
      ]
        .filter(Boolean)
        .join(" ")}
      title={message.time}
      aria-label={`${senderName}: ${message.text}`}
    >
      {replyQuoteNode}
      {renderWithLinks(message.text)}
    </div>
  );

  // Tombstoned messages (soft-deleted, live mode): the server blanks the
  // body, so render a muted placeholder — no bubble colour, no action
  // bar, no reaction chips (nothing left to react to or moderate).
  if (message.deletedAt) {
    return <div className={styles.tombstone}>{t("messages:tombstone")}</div>;
  }

  const reactions = message.reactions ?? [];
  const hasVisibleReactions = reactions.some((reaction) => reaction.count > 0);

  return (
    <div
      id={bubbleDomId}
      ref={wrapRef}
      className={styles.bubbleWrap}
      {...longPress}
    >
      {bubbleContent}
      {message.editedAt && !message.deletedAt && (
        <span className={styles.editedMarker}> · {t("messages:actions.edited")}</span>
      )}
      <div
        className={[
          styles.messageActionsSlot,
          isSent && styles.messageActionsSlotSent,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <MessageActions
          onReact={(reactionKey) =>
            onReactionToggle?.(message, reactionKey, false)
          }
          onOpenOverlay={() => {
            if (wrapRef.current) {
              onOpenActions?.(
                message,
                { rect: wrapRef.current.getBoundingClientRect() },
                isSent,
              );
            }
          }}
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
}

/** Renders one sender run: a vertical stack of bubbles. */
export function MessageRunView({
  run,
  counterpart,
  self,
  selfName,
  counterpartName,
  onRetry,
  showSeen,
  onReactionToggle,
  onOpenActions,
  editingMessageId,
  onSubmitEdit,
  onCancelEdit,
  onJumpToMessage,
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
  /** Opens the long-press/right-click action overlay for `message`. */
  onOpenActions?: (
    message: ChatMessage,
    origin: { rect: DOMRect },
    isSent: boolean,
  ) => void;
  /** Server id of the message currently showing the inline editor, if any. */
  editingMessageId?: string | null;
  /** Opens the inline editor for a message. Not consumed within this run —
   *  the long-press overlay in `ConversationPanel` calls it directly — but
   *  accepted here so callers can forward all four edit props uniformly. */
  onBeginEdit?: (message: ChatMessage) => void;
  /** Saves the inline editor's current text for a message. */
  onSubmitEdit?: (message: ChatMessage, nextBody: string) => void;
  /** Closes the inline editor without saving. */
  onCancelEdit?: () => void;
  /** Scrolls to and briefly highlights the quoted original message. */
  onJumpToMessage?: (messageId: string) => void;
}) {
  const { t } = useTranslation();
  const isSent = run.from === "me";
  const who = isSent ? self : counterpart;
  const senderName = isSent ? selfName : counterpartName;
  const lastIndex = run.items.length - 1;
  const runTime = run.items[lastIndex]?.time;

  return (
    <div
      className={[styles.run, isSent && styles.runSent].filter(Boolean).join(" ")}
      role="listitem"
    >
      <div className={styles.runAvatar}>
        <Avatar initials={who.initials} tint={who.tint} src={who.src} size={28} />
      </div>
      <div className={styles.runBubbles}>
        {run.items.map((message, index) => (
          <MessageBubble
            key={message.id ?? `pos-${index}`}
            message={message}
            index={index}
            lastIndex={lastIndex}
            isSent={isSent}
            senderName={senderName}
            onReactionToggle={onReactionToggle}
            onOpenActions={onOpenActions}
            editingMessageId={editingMessageId}
            onSubmitEdit={onSubmitEdit}
            onCancelEdit={onCancelEdit}
            onJumpToMessage={onJumpToMessage}
          />
        ))}
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
