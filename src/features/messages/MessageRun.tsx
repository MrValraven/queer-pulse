// src/features/messages/MessageRun.tsx
import { memo } from "react";
import { Avatar } from "../../shared/components/ui";
import type { AvatarTint } from "../../shared/components/ui/Avatar";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import type { MessageRun } from "./messageRuns";
import { MessageBubble } from "./MessageBubble";
import type { MetaStatus } from "./MessageSendStatus";
import { resolveSendStatus } from "./resolveSendStatus";
import type { LongPressOrigin } from "./useLongPress";
import type { ChatMessage } from "./data";
import styles from "./MessagesPage.module.css";

/** Avatar identity for one side of the conversation. */
export interface RunParticipant {
  initials: string;
  tint: AvatarTint;
  /** Optional profile photo; Avatar falls back to initials when absent. */
  src?: string;
}

/** Renders one sender run: a vertical stack of bubbles. */
function MessageRunViewImpl({
  run,
  counterpart,
  selfName,
  counterpartName,
  isGroup,
  onRetry,
  showSeen,
  showDelivered,
  onReactionToggle,
  onReply,
  onOpenActions,
  editingMessageId,
  onSubmitEdit,
  onCancelEdit,
  onJumpToMessage,
  isNewMessage,
  isNewReaction,
}: {
  run: MessageRun;
  counterpart: RunParticipant;
  /** Localized display name for the signed-in member, used in per-message aria-labels. */
  selfName: string;
  /** Display name of the conversation counterpart, used in per-message aria-labels. */
  counterpartName: string;
  /** GROUP thread → received runs show the sender's name label + their own
   *  avatar (resolved per-run from the first message). Absent/false = DM, which
   *  renders exactly as before (one shared counterpart avatar, no name label). */
  isGroup?: boolean;
  /** Retries a failed optimistic send. Only relevant for the "me" side. */
  onRetry?: (message: ChatMessage) => void;
  /** True only for the run containing the thread's last outbound message,
   *  once the counterpart's read watermark has caught up to it — renders
   *  "Seen" below that run instead of nothing. Ignored while the last item is
   *  still sending/failed (those take precedence). */
  showSeen?: boolean;
  /** Like `showSeen`, one rung down: the counterpart's DELIVERED watermark has
   *  caught the thread's final outbound message (double check, pre-read). */
  showDelivered?: boolean;
  /** Adds/removes a reaction on `message`; `mine` is whether the signed-in
   *  member already had that reaction (decides add vs. remove upstream). */
  onReactionToggle?: (
    message: ChatMessage,
    key: MessageReactionKey,
    mine: boolean,
  ) => void;
  /** Arms a reply to `message` (swipe-to-reply — the SAME handler the overlay's
   *  Reply calls). Forwarded to each bubble; undefined disables the gesture. */
  onReply?: (message: ChatMessage) => void;
  /** Opens the long-press/right-click action menu for `message`. */
  onOpenActions?: (
    message: ChatMessage,
    origin: LongPressOrigin,
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
  /** True only for a message genuinely arriving for the first time this
   *  session — gates each bubble's entrance (see `MessageBubbleImpl`). */
  isNewMessage?: (message: ChatMessage) => boolean;
  /** Same freshness gate, scoped to one reaction key on a message. */
  isNewReaction?: (message: ChatMessage, key: MessageReactionKey) => boolean;
}) {
  const { t } = useTranslation();
  const isSent = run.from === "me";
  const firstMessage = run.items[0];
  // GROUP received run: resolve the sender from the run's own messages (each
  // received run can be a different member); DMs keep the single shared
  // counterpart. Own runs never show a name/other-avatar (alignment identifies them).
  const showGroupSender = !!isGroup && !isSent;
  const runSenderName = isSent
    ? selfName
    : showGroupSender
      ? (firstMessage?.senderName ?? counterpartName)
      : counterpartName;
  const runAvatar: RunParticipant = showGroupSender
    ? {
        initials: initialsFromName(firstMessage?.senderName ?? counterpartName),
        tint: firstMessage?.senderTint ?? counterpart.tint,
        src: firstMessage?.senderAvatar,
      }
    : counterpart;
  const senderName = runSenderName;
  const lastIndex = run.items.length - 1;
  const lastMessage = run.items[lastIndex];
  // The status tick on the last outgoing bubble, resolved through the honest
  // ladder (failed > seen > delivered > sent > sending). Failed keeps its own
  // retry affordance below (the tick itself is null for it).
  const lastMetaStatus: MetaStatus =
    isSent && lastMessage
      ? resolveSendStatus(lastMessage, !!showSeen, !!showDelivered)
      : null;

  return (
    // No `role` here: this run's `listitem` semantics now live one level up,
    // on `MessageAreaRow`'s own wrapper div (the virtualized row's direct
    // list-child) — see that file's comment. A `listitem` nested directly
    // inside another `listitem` (without an intervening `list`) is invalid.
    <div
      className={[styles.run, isSent && styles.runSent]
        .filter(Boolean)
        .join(" ")}
    >
      {/* 1:1 threads show only the counterpart's avatar (the header already
          identifies who you're talking to); your own outgoing runs carry no
          avatar — alignment + colour distinguish them, WhatsApp/iMessage-style. */}
      {!isSent && (
        <div className={styles.runAvatar}>
          <Avatar
            initials={runAvatar.initials}
            tint={runAvatar.tint}
            src={runAvatar.src}
            size={28}
          />
        </div>
      )}
      <div className={styles.runBubbles}>
        {/* Group threads label a received run with its sender's name (WhatsApp
            style). Own runs and every DM run omit it — see `showGroupSender`. */}
        {showGroupSender && (
          <span className={styles.runSenderName}>{runSenderName}</span>
        )}
        {run.items.map((message, index) => (
          <MessageBubble
            key={message.id ?? `pos-${index}`}
            message={message}
            index={index}
            lastIndex={lastIndex}
            isSent={isSent}
            senderName={senderName}
            metaStatus={index === lastIndex ? lastMetaStatus : null}
            onReactionToggle={onReactionToggle}
            onReply={onReply}
            onOpenActions={onOpenActions}
            editingMessageId={editingMessageId}
            onSubmitEdit={onSubmitEdit}
            onCancelEdit={onCancelEdit}
            onJumpToMessage={onJumpToMessage}
            isNewMessage={isNewMessage}
            isNewReaction={isNewReaction}
          />
        ))}
        {/* Time + sending/seen ticks now live in the last bubble's meta; only the
            failed state keeps a standalone row, since retry is an action. */}
        {isSent && lastMessage?.status === "failed" && (
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => onRetry?.(lastMessage)}
          >
            {t("messages:status.retry")}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * A same-sender run, memoized — `MessageArea` renders one of these per block
 * in the timeline. `run` is a stable reference once `MessageArea` memoizes its
 * timeline build (see `buildTimeline`'s `useMemo` there) and `counterpart` is
 * memoized upstream in `ConversationPanel`; every callback prop below is
 * itself `useCallback`-stabilized (the action-menu handlers, `onSetReply`'s
 * `setState`, `useJumpToMessage`). So a re-render caused by something outside
 * this run (a typing frame, a receipt tick on a DIFFERENT run, the jump-pill
 * count) skips every run whose own props didn't change.
 */
export const MessageRunView = memo(MessageRunViewImpl);
