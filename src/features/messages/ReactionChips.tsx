// src/features/messages/ReactionChips.tsx
import { useState } from "react";
import type {
  MessageReactionKey,
  ReactionSummary,
} from "../../shared/contracts/contracts";
import { REACTION_EMOJI } from "./reactionKeys";
import styles from "./MessagesPage.module.css";

export interface ReactionChipsProps {
  reactions: ReactionSummary[];
  /** Called with the chip's key and whether the signed-in member already had
   *  it (`mine`) — the caller decides add vs. remove. */
  onToggle: (key: MessageReactionKey, mine: boolean) => void;
  /** True only for a reaction key that's genuinely new on this message (never
   *  for one already visible when the thread opened, and never re-true once a
   *  chip has mounted) — gates the chip's `msgBubbleIn` pop. Absent → chips
   *  never pop (safe default). */
  isNewReaction?: (key: MessageReactionKey) => boolean;
}

/** One reaction chip. A tiny component of its own (rather than inline JSX in
 *  the `.map` below) so `playEntrance` can be frozen with a lazy `useState`
 *  initializer at THIS chip's own mount — a later count change re-renders the
 *  same instance (same `key`, no remount) and must never replay the pop. */
function ReactionChip({
  reaction,
  isNew,
  onToggle,
}: {
  reaction: ReactionSummary;
  isNew: boolean;
  onToggle: (key: MessageReactionKey, mine: boolean) => void;
}) {
  const [playEntrance] = useState(() => isNew);
  return (
    <button
      type="button"
      className={[
        styles.reactionChip,
        playEntrance && styles.reactionChipEnter,
        reaction.mine && styles.reactionChipMine,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={reaction.mine}
      aria-label={`${reaction.key} (${reaction.count})`}
      onClick={() => onToggle(reaction.key, reaction.mine)}
    >
      <span aria-hidden>{REACTION_EMOJI[reaction.key]}</span>
      <span>{reaction.count}</span>
    </button>
  );
}

/** Chips rendered under a bubble: one per reaction key with count > 0, each
 *  showing its emoji + count. A chip the signed-in member reacted with
 *  (`mine`) gets a plum-tint active style; clicking any chip toggles it. */
export function ReactionChips({
  reactions,
  onToggle,
  isNewReaction,
}: ReactionChipsProps) {
  const visibleReactions = reactions.filter((reaction) => reaction.count > 0);
  if (visibleReactions.length === 0) return null;

  return (
    <div className={styles.reactionChips}>
      {visibleReactions.map((reaction) => (
        <ReactionChip
          key={reaction.key}
          reaction={reaction}
          isNew={isNewReaction?.(reaction.key) ?? false}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
