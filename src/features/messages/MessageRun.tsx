// src/features/messages/MessageRun.tsx
import { memo, useRef, useState, type KeyboardEvent } from "react";
import { Avatar } from "../../shared/components/ui";
import type { AvatarTint } from "../../shared/components/ui/Avatar";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { isEmojiOnly, type MessageRun } from "./messageRuns";
import { firstLinkUrl, renderWithLinks } from "./linkify";
import { MentionText } from "../../shared/mentions/MentionText";
import { LinkPreview } from "./LinkPreview";
import { MessageActions } from "./MessageActions";
import { ReactionChips } from "./ReactionChips";
import { findReactionMine } from "./reactionKeys";
import { InlineEditField } from "./InlineEditField";
import type { LongPressOrigin } from "./useLongPress";
import { useMessageGestures } from "./useMessageGestures";
import type { ChatMessage } from "./data";
import styles from "./MessagesPage.module.css";

/** Avatar identity for one side of the conversation. */
export interface RunParticipant {
  initials: string;
  tint: AvatarTint;
  /** Optional profile photo; Avatar falls back to initials when absent. */
  src?: string;
}

/** The honest send-status ladder the in-bubble tick renders (own bubbles only):
 *  clock while sending → single check once the server acked (sent) → double
 *  check once the recipient's device received it (delivered) → jade double check
 *  once read (seen). `null` = no tick (received bubbles; a failed send, which
 *  shows its own retry row instead). */
type MetaStatus = "sending" | "sent" | "delivered" | "seen" | null;

interface MessageBubbleProps {
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

/** i18n key per rung, so the tick carries a text alternative ("Sent"/"Read"/…). */
const STATUS_LABEL_KEY = {
  sending: "messages:status.sending",
  sent: "messages:status.sent",
  delivered: "messages:status.delivered",
  seen: "messages:status.seen",
} as const;

/** The send-status glyph for the in-bubble meta: a clock while sending, a single
 *  check once sent, a double check once delivered, a jade double check once
 *  seen. Only ever rendered on the user's own outgoing bubble (so it sits on the
 *  plum surface). Accessible name via the status i18n keys; the SVG is decorative.
 *  Colour: delivered/sent inherit the muted meta colour, only `seen` goes jade. */
function SendStatusTick({ status }: { status: Exclude<MetaStatus, null> }) {
  const { t } = useTranslation();
  const label = t(STATUS_LABEL_KEY[status]);
  return (
    <span
      className={[styles.metaTick, status === "seen" && styles.metaTickSeen]
        .filter(Boolean)
        .join(" ")}
      role="img"
      aria-label={label}
      title={label}
    >
      {status === "sending" ? (
        <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 4.6V8l2.3 1.6" />
        </svg>
      ) : status === "sent" ? (
        <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true" fill="none"
          stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 7.5 5 11l7-8" />
        </svg>
      ) : (
        <svg width="17" height="12" viewBox="0 0 20 14" aria-hidden="true" fill="none"
          stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 7.5 5 11l6.5-8" />
          <path d="M8.5 11 15 3" />
        </svg>
      )}
    </span>
  );
}

/** WhatsApp-style meta shown on a run's last bubble: a small time, plus (on the
 *  user's own outgoing bubble) the send-status tick. `floating` tucks it into a
 *  text bubble's bottom-right (text wraps around it); otherwise it renders as a
 *  standalone line under an emoji-only message. */
function MessageMeta({
  time,
  isSent,
  metaStatus,
  floating,
}: {
  time?: string;
  isSent: boolean;
  metaStatus: MetaStatus;
  floating: boolean;
}) {
  // Colour only tracks sent/received when tucked inside a coloured bubble; the
  // standalone (emoji) line always sits on the page, so it stays muted ink.
  const colorClass =
    floating && isSent ? styles.bubbleMetaSent : styles.bubbleMetaReceived;
  return (
    <span
      className={[floating ? styles.bubbleMeta : styles.bubbleMetaBelow, colorClass]
        .join(" ")}
    >
      {time && <span>{time}</span>}
      {isSent && metaStatus && <SendStatusTick status={metaStatus} />}
    </span>
  );
}

/** The bubble's content: the quoted-reply block (when present), the emoji-only
 *  or text body, and — on a run's last bubble — the time + status-tick meta.
 *  Split out of `MessageBubble` so that component stays under the line cap once
 *  it also owns the touch gestures. */
function MessageBubbleBody({
  message,
  index,
  lastIndex,
  isSent,
  isLast,
  senderName,
  metaStatus,
  onJumpToMessage,
  playEntrance,
}: {
  message: ChatMessage;
  index: number;
  lastIndex: number;
  isSent: boolean;
  isLast: boolean;
  senderName: string;
  metaStatus: MetaStatus;
  onJumpToMessage?: (messageId: string) => void;
  /** Gates the `msgBubbleIn`/`msgBubbleInSent` entrance — true only for a
   *  genuinely new arrival (see `MessageBubbleImpl`'s `playEntrance` state). */
  playEntrance: boolean;
}) {
  const { t } = useTranslation();
  // A subtle "Forwarded" label above the body (WhatsApp-style) when this message
  // was forwarded — only the body is carried on a forward, never reactions/receipts.
  const forwardedNode = message.forwarded && (
    <span className={styles.forwardedLabel}>
      {t("messages:actions.forwardedLabel")}
    </span>
  );
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
        {message.replyTo.deleted ? (
          t("messages:replyDeleted")
        ) : (
          <MentionText text={message.replyTo.snippet} />
        )}
      </span>
    </button>
  );

  // A GIF renders as an inline image (no text-bubble chrome, like the emoji-only
  // case). Rendered BEFORE the emoji/text branches so a gif never falls through
  // to text. Reply-quote/forwarded labels still apply. The meta sits below (not
  // floating), since a GIF has no coloured bubble to tuck it into.
  if (message.kind === "gif" && message.attachment) {
    const { url, width, height } = message.attachment;
    // Reserve the bubble's final box BEFORE the image decodes. The provider's
    // per-item dimensions are sometimes missing/zero (see demoGifs mapping
    // uncertainty), in which case a plain 1:1 fallback keeps the jump small
    // and predictable — without it the bubble has no intrinsic height at all
    // until decode, which also nudges the resize-follow scroll (item 4) right
    // after the entrance has already played.
    const aspectRatio = width > 0 && height > 0 ? width / height : 1;
    return (
      <>
        {forwardedNode}
        {replyQuoteNode}
        <img
          className={styles.gifBubble}
          src={url}
          width={width || undefined}
          height={height || undefined}
          style={{ aspectRatio: String(aspectRatio) }}
          loading="lazy"
          alt={message.text}
        />
        {isLast && (
          <MessageMeta
            time={message.time}
            isSent={isSent}
            metaStatus={metaStatus}
            floating={false}
          />
        )}
      </>
    );
  }
  // The meta (time + status tick) rides only on the run's LAST bubble; grouped
  // bubbles above it keep their exact time reachable via each bubble's `title`.
  if (isEmojiOnly(message.text)) {
    return (
      <>
        {forwardedNode}
        {replyQuoteNode}
        <div
          className={[styles.emojiOnly, playEntrance && styles.bubbleEnter]
            .filter(Boolean)
            .join(" ")}
          title={message.time}
          aria-label={`${senderName}: ${message.text}`}
        >
          {message.text}
        </div>
        {isLast && (
          <MessageMeta
            time={message.time}
            isSent={isSent}
            metaStatus={metaStatus}
            floating={false}
          />
        )}
      </>
    );
  }
  return (
    <div
      className={[
        styles.bubble,
        isSent ? styles.sent : styles.received,
        playEntrance && styles.bubbleEnter,
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
      {forwardedNode}
      {replyQuoteNode}
      <MentionText text={message.text} renderText={renderWithLinks} />
      {isLast && (
        <MessageMeta
          time={message.time}
          isSent={isSent}
          metaStatus={metaStatus}
          floating
        />
      )}
    </div>
  );
}

/** Small pin/star indicators on a bubble: the SHARED pin (both participants see
 *  it) and the PRIVATE star (owner-only — the server sets `starred` for the
 *  viewer alone). Decorative glyphs with accessible labels. */
function MessageMarks({
  pinned,
  starred,
}: {
  pinned: boolean;
  starred: boolean;
}) {
  const { t } = useTranslation();
  if (!pinned && !starred) return null;
  return (
    <span className={styles.messageMarks}>
      {pinned && (
        <span className={styles.messageMark} role="img" aria-label={t("messages:pinned.indicator")}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M12.5 2.5 17.5 7.5M11 4 4 11l1 4 4 1 7-7M8 12l-4.5 4.5"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      {starred && (
        <span className={styles.messageMark} role="img" aria-label={t("messages:starred.indicator")}>
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 1.8l2.35 4.76 5.25.76-3.8 3.7.9 5.23L10 13.75l-4.7 2.48.9-5.23-3.8-3.7 5.25-.76z" />
          </svg>
        </span>
      )}
    </span>
  );
}

/** One rendered bubble within a run: its body (see `MessageBubbleBody`), the
 *  desktop hover action bar, reaction chips, and touch gestures via
 *  `useMessageGestures` — long-press/right-click → action overlay, a rightward
 *  swipe → reply (reuses `onReply`), a double-tap/double-click → ❤️ (reuses
 *  `onReactionToggle`). While `editingMessageId` matches, the content is swapped
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
  const hasVisibleReactions = reactions.some((reaction) => reaction.count > 0);
  function openOverlayFromBubble() {
    const node = wrapRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    onOpenActions?.(
      message,
      { rect, source: "pointer", point: { x: isSent ? rect.right : rect.left, y: rect.top } },
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
  // Double-tap/double-click → toggle ❤️ through the EXISTING reaction handler
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
      className={[styles.bubbleWrap, gestures.swiping && styles.bubbleWrapSwiping]
        .filter(Boolean)
        .join(" ")}
      {...gestures.handlers}
      /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
      tabIndex={canOpenOverlay ? 0 : undefined}
      onKeyDown={canOpenOverlay ? handleBubbleKeyDown : undefined}
      aria-keyshortcuts={canOpenOverlay ? "Enter" : undefined}
    >
      {/* Reply-hint icon revealed on the side being uncovered as the bubble
          swipes toward `replyDirection` (right for received, left for sent) —
          fades AND scales in with drag progress. Always mounted (invisible at
          rest, opacity 0 below) so `useMessageGestures` has a stable node to
          write opacity/scale progress to DIRECTLY on every pointer move — no
          React state, no re-render, per frame. Still cues progress under
          reduced motion even though the bubble itself doesn't visibly move. */}
      <span
        ref={hintRef}
        className={[styles.swipeReplyHint, isSent && styles.swipeReplyHintEnd]
          .filter(Boolean)
          .join(" ")}
        style={{ opacity: 0 }}
        aria-hidden="true"
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5 4 10l5 5" />
          <path d="M4 10h8a4 4 0 0 1 4 4v1" />
        </svg>
      </span>
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
        <span className={styles.editedMarker}> · {t("messages:actions.edited")}</span>
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
            onReactionToggle?.(message, reactionKey, findReactionMine(reactions, reactionKey))
          }
          // Same gate as swipe-to-reply: only a server-acked, non-deleted
          // message can be quoted, so the button hides until then.
          onReply={canInteract && onReply ? () => onReply(message) : undefined}
          onOpenOverlay={openOverlayFromBubble}
        />
      </div>
      {hasVisibleReactions && (
        <ReactionChips
          reactions={reactions}
          onToggle={(reactionKey, mine) =>
            onReactionToggle?.(message, reactionKey, mine)
          }
          isNewReaction={(reactionKey) => isNewReaction?.(message, reactionKey) ?? false}
        />
      )}
    </div>
  );
}

/** One rendered bubble, memoized — a run can hold many bubbles, and once its
 *  callback/object props are stabilized upstream (see `ConversationPanel`'s
 *  `counterpart` memo and `useMessageActionMenu`/`useMessageSending`'s
 *  `useCallback`-wrapped handlers), an unrelated re-render higher up the tree
 *  (a typing frame, a receipt tick on a DIFFERENT run) no longer re-renders
 *  every bubble in the log. */
const MessageBubble = memo(MessageBubbleImpl);

/** Resolve the honest send-status tick for an OWN outgoing message. Precedence,
 *  highest first: failed (→ null; its own retry row renders) > seen > delivered
 *  > sent > sending. `showSeen`/`showDelivered` are the live watermark flags for
 *  the thread's final outbound message; `message.deliveredAt` is the per-message
 *  stamp that lets earlier own bubbles read "delivered" on load; the demo
 *  simulation drives the same rungs via `status` ("delivered"/"seen"). */
function resolveSendStatus(
  message: ChatMessage,
  showSeen: boolean,
  showDelivered: boolean,
): MetaStatus {
  if (message.status === "failed") return null;
  if (message.status === "sending") return "sending";
  if (message.status === "seen" || showSeen) return "seen";
  if (message.status === "delivered" || showDelivered || message.deliveredAt) {
    return "delivered";
  }
  // Acked: a demo "sent", or any server message (has an id) → single check.
  if (message.status === "sent" || message.id) return "sent";
  return null;
}

/** Two-letter initials from a display name, for a group sender's fallback avatar. */
function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join("");
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
    <div
      className={[styles.run, isSent && styles.runSent].filter(Boolean).join(" ")}
      role="listitem"
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
