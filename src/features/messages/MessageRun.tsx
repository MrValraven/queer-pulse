// src/features/messages/MessageRun.tsx
import { memo, useMemo } from "react";
import { Avatar } from "../../shared/components/ui";
import type { AvatarTint } from "../../shared/components/ui/Avatar";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { initialsFromName } from "../../shared/lib/initials";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { isMessageBodyOverLimit } from "./messageBodyLimit";
import type { MessageRun } from "./messageRuns";
import { groupIntoAlbums } from "./messageAlbums";
import { lastUndeletedIndex } from "./messageRows";
import { MessageAlbum } from "./MessageAlbum";
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

/**
 * The tick for the own message at run position `index`. EVERY own bubble (and
 * album) carries its own time + tick, WhatsApp-style, resolved through the
 * same honest ladder (failed > seen > delivered > sent > sending). The
 * thread-level watermark flags describe the FINAL outbound message only, so
 * they reach the `receiptIndex` message alone; earlier ones read their own
 * `deliveredAt` / `status` / `id`, which is exactly what `deliveredAt` is on
 * the DTO for. Keeping the meta on the last bubble alone meant that bubble's
 * time and tick jumped down into each new message, snapping the one above
 * 62px narrower mid-send (measured). Received messages carry no tick.
 */
function runMetaStatus(
  message: ChatMessage,
  index: number,
  isSent: boolean,
  receiptIndex: number,
  showSeen: boolean | undefined,
  showDelivered: boolean | undefined,
): MetaStatus {
  if (!isSent) return null;
  const isReceiptMessage = index === receiptIndex;
  return resolveSendStatus(
    message,
    isReceiptMessage && !!showSeen,
    isReceiptMessage && !!showDelivered,
  );
}

export interface MessageRunViewProps {
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
  /** Freshness gate for one reaction key on a message. */
  isNewReaction?: (message: ChatMessage, key: MessageReactionKey) => boolean;
}

/** Renders one sender run: a vertical stack of bubbles and photo albums. */
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
  isNewReaction,
}: MessageRunViewProps) {
  const { t } = useTranslation();
  const isSent = run.from === "me";
  const firstMessage = run.items[0];
  // GROUP received run: resolve the sender from the run's own messages (each
  // received run can be a different member); DMs keep the single shared
  // counterpart. Own runs never show a name/other-avatar (alignment identifies them).
  const showGroupSender = !!isGroup && !isSent;
  // ENG-243: a received run from a member who erased their account reads as a
  // localized "Former member" behind a blank neutral avatar, in a DM too.
  const isFormerMemberRun = !isSent && !!firstMessage?.isSenderFormerMember;
  const runSenderName = isSent
    ? selfName
    : isFormerMemberRun
      ? t("messages:formerMember")
      : showGroupSender
        ? (firstMessage?.senderName ?? counterpartName)
        : counterpartName;
  const runAvatar: RunParticipant = isFormerMemberRun
    ? { initials: "", tint: "default" }
    : showGroupSender
      ? {
          initials: initialsFromName(
            firstMessage?.senderName ?? counterpartName,
          ),
          tint: firstMessage?.senderTint ?? counterpart.tint,
          src: firstMessage?.senderAvatar,
        }
      : counterpart;
  const senderName = runSenderName;
  const lastIndex = run.items.length - 1;
  const lastMessage = run.items[lastIndex];
  // The bubble the thread-level seen/delivered flags ride: the newest one that
  // is not a tombstone, which renders no meta to carry them.
  const receiptIndex = lastUndeletedIndex(run.items);
  // Photo bursts collapse into albums (DES-219); everything else stays a bubble.
  const segments = useMemo(() => groupIntoAlbums(run.items), [run.items]);
  const metaStatusAt = (index: number) =>
    runMetaStatus(
      run.items[index]!,
      index,
      isSent,
      receiptIndex,
      showSeen,
      showDelivered,
    );

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
        {segments.map((segment) => {
          if (segment.kind === "album") {
            // Keyed by its first photo, which stays first as the burst grows;
            // its one meta comes from its last photo.
            const firstPhoto = segment.messages[0]!;
            const lastIndexInRun =
              segment.startIndex + segment.messages.length - 1;
            return (
              <MessageAlbum
                key={`album-${firstPhoto.localId ?? firstPhoto.id ?? segment.startIndex}`}
                messages={segment.messages}
                isSent={isSent}
                senderName={senderName}
                metaStatus={metaStatusAt(lastIndexInRun)}
                onOpenActions={onOpenActions}
              />
            );
          }
          const { message, index } = segment;
          return (
            <MessageBubble
              // `localId` comes first because an acked send KEEPS it once it
              // gains a server `id` (`messageToChat` carries it over), so the
              // key never changes as the ack lands. Preferring `id` flipped the
              // key at the ack and React remounted the bubble rather than
              // updating it in place, resetting `useBubbleMetaAlign`'s measured
              // alignment and any gesture in flight. Same identity ladder as
              // `messageRows.ts`'s `messageIdentity`.
              key={message.localId ?? message.id ?? `pos-${index}`}
              message={message}
              index={index}
              lastIndex={lastIndex}
              isSent={isSent}
              senderName={senderName}
              metaStatus={metaStatusAt(index)}
              onReactionToggle={onReactionToggle}
              onReply={onReply}
              onOpenActions={onOpenActions}
              editingMessageId={editingMessageId}
              onSubmitEdit={onSubmitEdit}
              onCancelEdit={onCancelEdit}
              onJumpToMessage={onJumpToMessage}
              isNewReaction={isNewReaction}
            />
          );
        })}
        {/* Time + sending/seen ticks live in each bubble's own meta; only the
            failed state keeps a standalone row, since retry is an action.
            A body that's grown past the server's length limit since it was
            typed (DES-202) can never succeed on retry: the server rejects it
            the same way every time, so Retry is misleading there. A short
            reason replaces it instead of offering a dead action. */}
        {isSent &&
          lastMessage?.status === "failed" &&
          (isMessageBodyOverLimit(lastMessage.text) ? (
            <span className={styles.failedReason}>
              {t("messages:status.tooLongToSend")}
            </span>
          ) : lastMessage.failureCode === "ACCOUNT_RESTRICTED" ? (
            // ENG-242: a moderator `restrict` action refused this send. Named
            // honestly rather than folded into the generic Retry copy — this
            // is a standing moderation state, not a network hiccup, and
            // nothing like an expired session (no sign-in prompt applies
            // here). Retry stays offered: the restriction is timed and may
            // have lifted by the time the member tries again.
            <>
              <span className={styles.failedReason}>
                {t("messages:status.restricted")}
              </span>
              {/* `status.retryAction` is the bare verb ("Retry"), not
                  `status.retry`'s "Not delivered · Retry" — the reason span
                  above already says "Not delivered", so pairing it with the
                  full string would repeat that prefix on two stacked lines. */}
              <button
                type="button"
                className={styles.retryBtn}
                onClick={() => onRetry?.(lastMessage)}
              >
                {t("messages:status.retryAction")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles.retryBtn}
              onClick={() => onRetry?.(lastMessage)}
            >
              {t("messages:status.retry")}
            </button>
          ))}
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
