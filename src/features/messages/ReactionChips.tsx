// src/features/messages/ReactionChips.tsx
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
}

/** Chips rendered under a bubble: one per reaction key with count > 0, each
 *  showing its emoji + count. A chip the signed-in member reacted with
 *  (`mine`) gets a plum-tint active style; clicking any chip toggles it. */
export function ReactionChips({ reactions, onToggle }: ReactionChipsProps) {
  const visibleReactions = reactions.filter((reaction) => reaction.count > 0);
  if (visibleReactions.length === 0) return null;

  return (
    <div className={styles.reactionChips}>
      {visibleReactions.map((reaction) => (
        <button
          key={reaction.key}
          type="button"
          className={[
            styles.reactionChip,
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
      ))}
    </div>
  );
}
