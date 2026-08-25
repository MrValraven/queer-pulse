// src/features/messages/MessageBubbleParts.tsx
import type { RefObject } from "react";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { ReactionChips } from "./ReactionChips";
import type { ChatMessage } from "./data";
import styles from "./MessagesPage.module.css";

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
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 5 4 10l5 5" />
        <path d="M4 10h8a4 4 0 0 1 4 4v1" />
      </svg>
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
