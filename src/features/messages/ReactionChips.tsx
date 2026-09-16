// src/features/messages/ReactionChips.tsx
import { useState } from "react";
import type {
  MessageReactionKey,
  ReactionSummary,
} from "../../shared/contracts/contracts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useReactionLabels } from "./useReactionLabels";
import { useWhoReactedGesture } from "./useWhoReactedGesture";
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
  const { t } = useTranslation();
  const labels = useReactionLabels();
  const [playEntrance] = useState(() => isNew);
  // "Love, 3 reactions, including yours" (or without the trailing clause when
  // the viewer hasn't reacted): translated name, pluralized count, and whether
  // this is the viewer's own reaction, never the raw key (DES-201). Chips are
  // real toggles, `onClick` below calls `onToggle`, so `aria-pressed` carries
  // the correct on/off semantics; the label spells out the count and "yours"
  // too since a bare "pressed"/"not pressed" wouldn't say how many people
  // reacted.
  const label = t(
    reaction.mine
      ? "messages:reactions.chipLabelMine"
      : "messages:reactions.chipLabel",
    { name: labels[reaction.key], count: reaction.count },
  );
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
      aria-label={label}
      onClick={() => onToggle(reaction.key, reaction.mine)}
    >
      <span aria-hidden>{REACTION_EMOJI[reaction.key]}</span>
      <span>{reaction.count}</span>
    </button>
  );
}

/** Chips rendered under a bubble: one per reaction key with count > 0, each
 *  showing its emoji + count. A chip the signed-in member reacted with
 *  (`mine`) gets a plum-tint active style; clicking any chip toggles it.
 *  Long-pressing or right-clicking the row opens "who reacted" (PRD-352, see
 *  `useWhoReactedGesture`). */
export function ReactionChips({
  reactions,
  onToggle,
  isNewReaction,
}: ReactionChipsProps) {
  const whoReactedGesture = useWhoReactedGesture();
  const visibleReactions = reactions.filter((reaction) => reaction.count > 0);
  if (visibleReactions.length === 0) return null;

  return (
    <div className={styles.reactionChips} {...whoReactedGesture}>
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
