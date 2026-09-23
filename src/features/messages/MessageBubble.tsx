// src/features/messages/MessageBubble.tsx
import { memo, useRef } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { MessageActions } from "./MessageActions";
import { attachmentCaption } from "./messageCopy";
import {
  SwipeReplyHint,
  BubbleReactionStrip,
  BubbleHiddenLabels,
  BubbleTombstone,
  BubbleTrailingMarks,
} from "./MessageBubbleParts";
import { useBubbleLabelIds } from "./bubbleLabelIds";
import {
  findReactionMine,
  myReactionKeys as heldReactionKeys,
} from "./reactionKeys";
import { InlineEditField } from "./InlineEditField";
import { MessageBubbleBody } from "./MessageBubbleBody";
import type { MetaStatus } from "./MessageSendStatus";
import type { LongPressOrigin } from "./useLongPress";
import { useBubbleInteractionState } from "./useBubbleInteractionState";
import { useIsMessageHighlighted } from "./messageJumpStore";
import type { ChatMessage } from "./data";
import styles from "./MessagesPage.module.css";

export interface MessageBubbleProps {
  message: ChatMessage;
  index: number;
  lastIndex: number;
  isSent: boolean;
  senderName: string;
  /** Resolved send-status for the in-bubble tick, only set on the last outgoing
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
  /** Arms a reply to `message` (swipe-to-reply on touch, the SAME handler the
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
  /** Freshness gate for one reaction key on this message: an
   *  incremented count on an already-visible chip must not re-pop it. */
  isNewReaction?: (message: ChatMessage, key: MessageReactionKey) => boolean;
}

/** One rendered bubble within a run: its body (see `MessageBubbleBody`), the
 *  desktop hover action bar, reaction chips, and touch gestures via
 *  `useMessageGestures`: long-press/right-click → action overlay, a rightward
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
  isNewReaction,
}: MessageBubbleProps) {
  const { t } = useTranslation();
  const isLast = index === lastIndex;
  const wrapRef = useRef<HTMLDivElement>(null);
  // Owned here (not by the gesture hook) so the hook's own return value never
  // bundles a ref alongside `swiping`; see `useMessageGestures`'s `hintRef`
  // option doc for why that matters to `react-hooks/refs`.
  const hintRef = useRef<HTMLSpanElement>(null);
  const labelIds = useBubbleLabelIds();
  const bubbleDomId = message.id ? `message-${message.id}` : undefined;
  // Jump highlight read from the store at render, so it survives this bubble
  // being unmounted and remounted by the virtualizer mid-flash.
  const isHighlighted = useIsMessageHighlighted(message.id);
  // Overlay/keyboard gates, touch/pointer gestures and the focus-follows-
  // remount effect: one cohesive hook, see useBubbleInteractionState's own
  // file comment for why they're split out of this render function.
  const {
    canOpenOverlay,
    canInteract,
    canReportThisTombstone,
    reactions,
    gestures,
    openOverlayFromBubble,
    handleBubbleKeyDown,
  } = useBubbleInteractionState({
    message,
    isSent,
    onOpenActions,
    onReply,
    onReactionToggle,
    wrapRef,
    hintRef,
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

  // Tombstoned (soft-deleted): muted placeholder, no action bar/reactions.
  // See `BubbleTombstone`'s own doc for the evidence-hold Report exception.
  if (message.deletedAt) {
    return (
      <BubbleTombstone
        message={message}
        senderName={senderName}
        canReport={canReportThisTombstone}
        wrapRef={wrapRef}
        gestureHandlers={gestures.handlers}
        onOpenOverlay={openOverlayFromBubble}
      />
    );
  }

  return (
    // The bubble is a deliberately focusable composite widget: a guaranteed
    // keyboard entry to the action overlay (Enter / Menu key), mirroring
    // long-press + right-click. `role="button"` is intentionally NOT used: it
    // prohibits the interactive descendants this bubble legitimately owns.
    // `role="group"` is what lets it carry a name at all (a generic div can't).
    // The name stays short (the sender, APG Feed pattern) so browse mode does
    // not read the message twice on entering the group; the content, caption,
    // time and marks ride the description, which focus still announces.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- intentional: the named group is still the focusable composite widget described above, and Enter on it opens the action overlay.
    <div
      id={bubbleDomId}
      ref={wrapRef}
      className={[
        styles.bubbleWrap,
        gestures.swiping && styles.bubbleWrapSwiping,
        isHighlighted && styles.messageHighlight,
      ]
        .filter(Boolean)
        .join(" ")}
      {...gestures.handlers}
      /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- intentional: the bubble is a deliberately focusable composite widget (see comment above) so keyboard users get a guaranteed entry to the action overlay. */
      tabIndex={canOpenOverlay ? 0 : undefined}
      onKeyDown={canOpenOverlay ? handleBubbleKeyDown : undefined}
      aria-keyshortcuts={canOpenOverlay ? "Enter" : undefined}
      role="group"
      aria-roledescription={t("messages:bubble.roleDescription")}
      aria-labelledby={labelIds.sender}
      aria-describedby={[
        labelIds.content,
        // Only when `MessageBubbleBody` actually renders a caption node.
        // Reuses `messageCopy.ts`'s own `attachmentCaption` (rather than
        // reading `message.attachment?.caption` directly) so the one place
        // that already excludes the sticker shape's captionless attachment
        // is not duplicated here.
        attachmentCaption(message) && labelIds.caption,
        labelIds.details,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <BubbleHiddenLabels
        labelIds={labelIds}
        senderName={senderName}
        message={message}
      />
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
        labelIds={labelIds}
        onJumpToMessage={onJumpToMessage}
      />
      <BubbleTrailingMarks message={message} />
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
            // Reads the reaction's actual prior state, so re-picking a
            // reaction you already have toggles it off instead of "adding"
            // it again.
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
          myReactionKeys={heldReactionKeys(reactions)}
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

/** One rendered bubble, memoized: a run can hold many bubbles, and once its
 *  callback/object props are stabilized upstream (see `ConversationPanel`'s
 *  `counterpart` memo and `useMessageActionMenu`/`useMessageSending`'s
 *  `useCallback`-wrapped handlers), an unrelated re-render higher up the tree
 *  (a typing frame, a receipt tick on a DIFFERENT run) no longer re-renders
 *  every bubble in the log. */
export const MessageBubble = memo(MessageBubbleImpl);
