// src/features/messages/MessageBubbleParts.tsx
import type { KeyboardEvent, RefObject } from "react";
import { FiCornerUpLeft } from "react-icons/fi";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ReactionChips } from "./ReactionChips";
import { MessageMarks } from "./MessageBubbleBody";
import { useBubbleLabelIds, type BubbleLabelIds } from "./bubbleLabelIds";
import type { UseLongPressHandlers } from "./useLongPress";
import type { ChatMessage } from "./data";
import styles from "./MessagesPage.module.css";

/** Hidden nodes a bubble's `aria-labelledby`/`aria-describedby` point at: the
 *  sender (the name; a run shows it once at most) and the time plus any
 *  forwarded, edited, pinned or starred marks (the tail of the description).
 *  `hidden` keeps them out of the reading order, while a node referenced by id
 *  still feeds the name or description. The message content is referenced
 *  where it actually renders (see `MessageBubbleBody`) rather than copied into
 *  a string, so its links and mentions stay individually reachable. */
export function BubbleHiddenLabels({
  labelIds,
  senderName,
  message,
}: {
  labelIds: BubbleLabelIds;
  senderName: string;
  message: ChatMessage;
}) {
  const { t } = useTranslation();
  const isDeleted = !!message.deletedAt;
  const details = [
    message.time,
    !isDeleted && message.forwarded && t("messages:actions.forwardedLabel"),
    !isDeleted && message.editedAt && t("messages:actions.edited"),
    !isDeleted && message.pinnedAt && t("messages:pinned.indicator"),
    !isDeleted && message.starred && t("messages:starred.indicator"),
  ].filter(Boolean);
  return (
    <>
      <span id={labelIds.sender} hidden>
        {senderName}
      </span>
      <span id={labelIds.details} hidden>
        {details.join(", ")}
      </span>
    </>
  );
}

/** A soft-deleted message's placeholder. Its accessible NAME is the fixed
 *  "Message deleted" (not the sender, unlike a live bubble) — the sender and
 *  time still ride its own hidden description span, so the slot still says
 *  whose message it was.
 *
 *  Stays exactly as inert as before UNLESS `canReport` is true: the server
 *  marks a "deleted for everyone" tombstone reportable, on a non-author
 *  participant, for its 30-day evidence hold (e.g. an explicit image unsent
 *  seconds after it was seen). That's the ONE action it ever exposes — long-
 *  press / right-click / Enter or Space on the focused bubble all open the
 *  SAME action overlay/context-menu a live bubble would, but with only
 *  Report in it (see `TombstoneReportMenu` in `MessageActionMenu.tsx`).
 *  Reportable, it becomes a genuinely interactive `role="button"` (its one
 *  action really is an activation, unlike the live bubble's own
 *  `role="group"`, which merely names a composite widget); a non-reportable
 *  tombstone keeps the plain, non-interactive `role="group"` and gets none
 *  of `canReport`'s other wiring, staying fully inert. */
export function BubbleTombstone({
  message,
  senderName,
  canReport,
  wrapRef,
  gestureHandlers,
  onOpenOverlay,
}: {
  message: ChatMessage;
  senderName: string;
  /** `ChatMessage.canReport`, gated on this being a tombstone and having a
   *  server id — see `MessageBubble`'s `canReportTombstone`. */
  canReport: boolean;
  /** Same node the live bubble anchors the overlay from — required so
   *  long-press/right-click/Enter can compute `getBoundingClientRect()` for
   *  the overlay's anchor, exactly like a live bubble. */
  wrapRef: RefObject<HTMLDivElement | null>;
  /** `useBubbleGestures`' handlers, already a no-op when `canReport` is
   *  false (its `enabled` gate) — safe to spread unconditionally. */
  gestureHandlers: UseLongPressHandlers;
  /** Opens the action overlay from a keyboard activation — the SAME handler
   *  a live bubble's own Enter key calls. */
  onOpenOverlay: () => void;
}) {
  const { t } = useTranslation();
  const labelIds = useBubbleLabelIds();
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    // A `role="button"` must answer to both Enter and Space (WAI-ARIA APG).
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenOverlay();
    }
  }
  return (
    <div
      ref={wrapRef}
      className={[styles.tombstone, canReport && styles.tombstoneReportable]
        .filter(Boolean)
        .join(" ")}
      role={canReport ? "button" : "group"}
      aria-roledescription={
        canReport ? undefined : t("messages:bubble.roleDescription")
      }
      aria-labelledby={labelIds.sender}
      aria-describedby={`${labelIds.content} ${labelIds.details}`}
      tabIndex={canReport ? 0 : undefined}
      onKeyDown={canReport ? handleKeyDown : undefined}
      {...gestureHandlers}
    >
      <span id={labelIds.sender} hidden>
        {t("messages:replyDeleted")}
      </span>
      <span id={labelIds.details} hidden>
        {[senderName, message.time].filter(Boolean).join(", ")}
      </span>
      <span id={labelIds.content}>{t("messages:tombstone")}</span>
    </div>
  );
}

/** The "edited" marker and the pin/star marks trailing a live bubble's body.
 *  Both are also folded into the bubble's description by
 *  `BubbleHiddenLabels`, so a focused bubble announces them. */
export function BubbleTrailingMarks({ message }: { message: ChatMessage }) {
  const { t } = useTranslation();
  if (message.deletedAt) return null;
  return (
    <>
      {message.editedAt && (
        <span className={styles.editedMarker}>
          {" "}
          · {t("messages:actions.edited")}
        </span>
      )}
      <MessageMarks pinned={!!message.pinnedAt} starred={!!message.starred} />
    </>
  );
}

/**
 * The reply-hint icon revealed on the side being uncovered as the bubble swipes
 * toward `replyDirection` (right for received, left for sent) — fades AND scales
 * in with drag progress. Always mounted (invisible at rest, opacity 0 below) so
 * `useMessageGestures` has a stable node to write opacity/scale progress to
 * DIRECTLY on every pointer move — no React state, no re-render, per frame. Still
 * cues progress under reduced motion even though the bubble itself doesn't
 * visibly move.
 *
 * `hintRef` is owned by `MessageBubbleImpl` (and shared with the gesture hook) so
 * the hook's own return value never bundles a ref alongside `swiping`; it's
 * passed in here rather than exposed as this component's own `ref` so that
 * ownership stays explicit.
 */
export function SwipeReplyHint({
  hintRef,
  isSent,
}: {
  hintRef: RefObject<HTMLSpanElement | null>;
  isSent: boolean;
}) {
  return (
    <span
      ref={hintRef}
      className={[styles.swipeReplyHint, isSent && styles.swipeReplyHintEnd]
        .filter(Boolean)
        .join(" ")}
      style={{ opacity: 0 }}
      aria-hidden="true"
    >
      <FiCornerUpLeft size={16} />
    </span>
  );
}

/** The reaction chips strip under a bubble — one chip per reaction key with a
 *  count > 0. Renders nothing when the bubble has no visible reactions, so the
 *  caller can mount it unconditionally. `onToggle`/`isNewReaction` are already
 *  bound to this bubble's message upstream. */
export function BubbleReactionStrip({
  reactions,
  onToggle,
  isNewReaction,
}: {
  reactions: NonNullable<ChatMessage["reactions"]>;
  onToggle: (key: MessageReactionKey, mine: boolean) => void;
  isNewReaction: (key: MessageReactionKey) => boolean;
}) {
  const hasVisibleReactions = reactions.some((reaction) => reaction.count > 0);
  if (!hasVisibleReactions) return null;
  return (
    <ReactionChips
      reactions={reactions}
      onToggle={onToggle}
      isNewReaction={isNewReaction}
    />
  );
}
