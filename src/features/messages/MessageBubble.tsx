// src/features/messages/MessageBubble.tsx
import { memo, useRef, useState, type KeyboardEvent } from "react";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { firstLinkUrl } from "./linkify";
import { LinkPreview } from "./LinkPreview";
import { MessageActions } from "./MessageActions";
import { SwipeReplyHint, BubbleReactionStrip } from "./MessageBubbleParts";
import { findReactionMine } from "./reactionKeys";
import { InlineEditField } from "./InlineEditField";
import { MessageBubbleBody, MessageMarks } from "./MessageBubbleBody";
import type { MetaStatus } from "./MessageSendStatus";
import type { LongPressOrigin } from "./useLongPress";
import { useMessageGestures } from "./useMessageGestures";
import type { ChatMessage } from "./data";
import styles from "./MessagesPage.module.css";

export interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
  lastIndex: number;
  isSent: boolean;
  senderName: string;
  /** Resolved send-status for the in-bubble tick — only set on the last outgoing
   *  bubble of a run (null everywhere else, incl. all received bubbles). */
  metaStatus?: MetaStatus;
  /** Adds/removes a reaction on `message`; `mine` is whether the signed-in
   *  member already had that reaction (decides add vs. remove upstream). */
  onReactionToggle?: (
    message: ChatMessage,
    key: MessageReactionKey,
    mine: boolean,
  ) => void;
  /** Opens the long-press/right-click action menu for `message`. */
  onOpenActions?: (
    message: ChatMessage,
    origin: LongPressOrigin,
    isSent: boolean,
  ) => void;
  /** Arms a reply to `message` (swipe-to-reply on touch — the SAME handler the
   *  overlay's Reply calls). Undefined disables swipe for this bubble. */
  onReply?: (message: ChatMessage) => void;
  /** Server id of the message currently showing the inline editor, if any. */
  editingMessageId?: string | null;
  /** Saves the inline editor's current text for `message`. */
  onSubmitEdit?: (message: ChatMessage, nextBody: string) => void;
  /** Closes the inline editor without saving. */
  onCancelEdit?: () => void;
  /** Scrolls to and briefly highlights the quoted original message. */
  onJumpToMessage?: (messageId: string) => void;
  /** True only for a message that is genuinely arriving for the first time
   *  this session (never for the whole thread on open/switch, and never
   *  replayed for a message already on screen) — gates the `msgBubbleIn`
   *  entrance. Read exactly once, at this bubble's own mount (see
   *  `playEntrance` below), so it can never be retriggered by a later,
   *  unrelated re-render (a status-tick update, a sibling reaction). */
  isNewMessage?: (message: ChatMessage) => boolean;
  /** Same freshness gate, scoped to one reaction key on this message — an
   *  incremented count on an already-visible chip must not re-pop it. */
  isNewReaction?: (message: ChatMessage, key: MessageReactionKey) => boolean;
}

/** One rendered bubble within a run: its body (see `MessageBubbleBody`), the
 *  desktop hover action bar, reaction chips, and touch gestures via
 *  `useMessageGestures` — long-press/right-click → action overlay, a rightward
 *  swipe → reply (reuses `onReply`), a double-tap/double-click → love reaction
 *  (reuses `onReactionToggle`). While `editingMessageId` matches, content swaps
 *  for the inline editor. */
function MessageBubbleImpl({
  message,
  index,
  lastIndex,
  isSent,
  senderName,
  metaStatus,
  onReactionToggle,
  onOpenActions,
  onReply,
  editingMessageId,
  onSubmitEdit,
  onCancelEdit,
  onJumpToMessage,
  isNewMessage,
  isNewReaction,
}: MessageBubbleProps) {
  const { t } = useTranslation();
  const reducedMotion = usePrefersReducedMotion();
  const isLast = index === lastIndex;
  // First http(s) link in the body → a compact unfurl card below the bubble.
  const previewUrl = firstLinkUrl(message.text);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Owned here (not by the gesture hook) so the hook's own return value never
  // bundles a ref alongside `swiping` — see `useMessageGestures`'s `hintRef`
  // option doc for why that matters to `react-hooks/refs`.
  const hintRef = useRef<HTMLSpanElement>(null);
  const bubbleDomId = message.id ? `message-${message.id}` : undefined;
  // Decided ONCE, at this exact bubble instance's own mount — a lazy `useState`
  // initializer runs exactly once per instance, so a later re-render (a
  // status-tick update, a sibling's reaction) can never flip this back on or
  // cut the entrance short. `isNewMessage` reflects the newness set as of
  // JUST BEFORE this render (see `MessageArea`'s tracker), which is exactly
  // right the one time this call matters: right as the bubble is created.
  const [playEntrance] = useState(() => isNewMessage?.(message) ?? false);
  // A message with a server id can open the action overlay; give its bubble a
  // guaranteed keyboard entry point (Enter), mirroring long-press / right-click.
  const canOpenOverlay = !!message.id;
  const canInteract = canOpenOverlay && !message.deletedAt;
  const reactions = message.reactions ?? [];
  function openOverlayFromBubble() {
    const node = wrapRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    onOpenActions?.(
      message,
      {
        rect,
        source: "pointer",
        point: { x: isSent ? rect.right : rect.left, y: rect.top },
      },
      isSent,
    );
  }
  function handleBubbleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // Only when the bubble itself is focused — never when the event bubbled up
    // from a nested control (React/More buttons, reply-quote, reaction chips).
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter") {
      event.preventDefault();
      openOverlayFromBubble();
    }
  }
  // Double-tap/double-click → toggle the love reaction through the EXISTING handler
  // (no second reaction path). WhatsApp-style: the feedback is simply the
  // reaction chip landing under the bubble (it has its own subtle entrance),
  // with no separate overlay flourish.
  function quickReact() {
    const loveMine = findReactionMine(reactions, "love");
    onReactionToggle?.(message, "love", loveMine);
  }

  const gestures = useMessageGestures({
    enabled: canInteract,
    onOpenActions: (origin) => onOpenActions?.(message, origin, isSent),
    // Reuse the overlay's reply handler; only a message with a server id can be
    // replied to (optimistic ones can't), so swipe is inert until then.
    onReply: canInteract && onReply ? () => onReply(message) : undefined,
    onQuickReact: canInteract && onReactionToggle ? quickReact : undefined,
    // Received (left-aligned) bubbles swipe right to reply; sent (own,
    // right-aligned) bubbles swipe left — always away from where they sit.
    replyDirection: isSent ? "left" : "right",
    // The hook writes the follow-transform/hint-progress straight to these
    // same nodes — no React state, no per-frame re-render of this bubble's
    // subtree.
    bubbleRef: wrapRef,
    hintRef,
    reducedMotion,
  });

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

  // Tombstoned messages (soft-deleted, live mode): muted placeholder — no
  // bubble colour, no action bar, no reaction chips, no gestures.
  if (message.deletedAt) {
    return <div className={styles.tombstone}>{t("messages:tombstone")}</div>;
  }

  return (
    // The bubble is a deliberately focusable composite widget: a guaranteed
    // keyboard entry to the action overlay (Enter / Menu key), mirroring
    // long-press + right-click. `role="button"` is intentionally NOT used — it
    // prohibits the interactive descendants this bubble legitimately owns.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      id={bubbleDomId}
      ref={wrapRef}
      className={[
        styles.bubbleWrap,
        gestures.swiping && styles.bubbleWrapSwiping,
      ]
        .filter(Boolean)
        .join(" ")}
      {...gestures.handlers}
      /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- intentional: the bubble is a deliberately focusable composite widget (see comment above) so keyboard users get a guaranteed entry to the action overlay. */
      tabIndex={canOpenOverlay ? 0 : undefined}
      onKeyDown={canOpenOverlay ? handleBubbleKeyDown : undefined}
      aria-keyshortcuts={canOpenOverlay ? "Enter" : undefined}
    >
      {/* Reply-hint icon revealed as the bubble swipes toward `replyDirection`;
          `useMessageGestures` writes opacity/scale progress straight to `hintRef`
          every pointer move (no React state). See `SwipeReplyHint`. */}
      <SwipeReplyHint hintRef={hintRef} isSent={isSent} />
      <MessageBubbleBody
        message={message}
        index={index}
        lastIndex={lastIndex}
        isSent={isSent}
        isLast={isLast}
        senderName={senderName}
        metaStatus={metaStatus ?? null}
        onJumpToMessage={onJumpToMessage}
        playEntrance={playEntrance}
      />
      {message.editedAt && !message.deletedAt && (
        <span className={styles.editedMarker}>
          {" "}
          · {t("messages:actions.edited")}
        </span>
      )}
      {!message.deletedAt && (
        <MessageMarks pinned={!!message.pinnedAt} starred={!!message.starred} />
      )}
      {previewUrl && <LinkPreview url={previewUrl} isSent={isSent} />}
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
            // Actual prior state, not a hardcoded `false` — otherwise
            // re-picking a reaction you already have "adds" it again instead
            // of toggling it off.
            onReactionToggle?.(
              message,
              reactionKey,
              findReactionMine(reactions, reactionKey),
            )
          }
          // Same gate as swipe-to-reply: only a server-acked, non-deleted
          // message can be quoted, so the button hides until then.
          onReply={canInteract && onReply ? () => onReply(message) : undefined}
          onOpenOverlay={openOverlayFromBubble}
        />
      </div>
      <BubbleReactionStrip
        reactions={reactions}
        onToggle={(reactionKey, mine) =>
          onReactionToggle?.(message, reactionKey, mine)
        }
        isNewReaction={(reactionKey) =>
          isNewReaction?.(message, reactionKey) ?? false
        }
      />
    </div>
  );
}

/** One rendered bubble, memoized — a run can hold many bubbles, and once its
 *  callback/object props are stabilized upstream (see `ConversationPanel`'s
 *  `counterpart` memo and `useMessageActionMenu`/`useMessageSending`'s
 *  `useCallback`-wrapped handlers), an unrelated re-render higher up the tree
 *  (a typing frame, a receipt tick on a DIFFERENT run) no longer re-renders
 *  every bubble in the log. */
export const MessageBubble = memo(MessageBubbleImpl);
