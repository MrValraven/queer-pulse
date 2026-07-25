// src/features/messages/ReactionPicker.tsx
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { REACTION_EMOJI, REACTION_ORDER } from "./reactionKeys";
import styles from "./MessagesPage.module.css";

export interface ReactionPickerProps {
  /** Called with the picked reaction key; the caller decides add/remove and
   *  closes the popover. */
  onPick: (key: MessageReactionKey) => void;
}

/** Row of the 6 reaction emoji (from `REACTION_ORDER`/`REACTION_EMOJI`). Each
 *  button is keyboard-operable and carries the reaction key as its
 *  `aria-label` (screen readers announce the semantic name, not the glyph). */
export function ReactionPicker({ onPick }: ReactionPickerProps) {
  return (
    <div className={styles.reactionPicker} role="menu">
      {REACTION_ORDER.map((key) => (
        <button
          key={key}
          type="button"
          role="menuitem"
          className={styles.reactionPickerBtn}
          aria-label={key}
          onClick={() => onPick(key)}
        >
          {REACTION_EMOJI[key]}
        </button>
      ))}
    </div>
  );
}
