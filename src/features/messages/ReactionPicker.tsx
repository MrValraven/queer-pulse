// src/features/messages/ReactionPicker.tsx
import { useRef, useState, type KeyboardEvent } from "react";
import type { MessageReactionKey } from "../../shared/contracts/contracts";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useReactionLabels } from "./useReactionLabels";
import { REACTION_EMOJI, REACTION_ORDER } from "./reactionKeys";
import styles from "./MessagesPage.module.css";

export interface ReactionPickerProps {
  /** Called with the picked reaction key; the caller decides add/remove and
   *  closes the popover. */
  onPick: (key: MessageReactionKey) => void;
  /** The reaction keys the signed-in member already holds on this message
   *  (see `myReactionKeys`/`findReactionMine` in `reactionKeys.ts`), so the
   *  matching button(s) can carry `aria-pressed="true"` and the roving tab
   *  stop can start on one of them. */
  myReactionKeys: MessageReactionKey[];
}

/**
 * Row of the 6 reaction emoji (from `REACTION_ORDER`/`REACTION_EMOJI`). A
 * WAI-ARIA toolbar with roving tabindex: exactly one button is a tab stop at
 * a time, and ArrowLeft/ArrowRight/Home/End move it, per the APG toolbar
 * pattern. Each button's accessible name is the translated reaction name,
 * never the raw key, which read English identifiers to PT screen-reader
 * members regardless of the active language (DES-201), and `aria-pressed`
 * reflects whether the viewer already holds that reaction. Six independent,
 * always-visible toggles with their own accessible names and pressed states
 * are the toolbar pattern (APG): one roving tab stop and arrow-key movement
 * between peer buttons.
 */
export function ReactionPicker({
  onPick,
  myReactionKeys,
}: ReactionPickerProps) {
  const { t } = useTranslation();
  const labels = useReactionLabels();
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const lastIndex = REACTION_ORDER.length - 1;
  const [activeIndex, setActiveIndex] = useState(() => {
    const mineIndex = REACTION_ORDER.findIndex((key) =>
      myReactionKeys.includes(key),
    );
    return mineIndex === -1 ? 0 : mineIndex;
  });

  function moveFocus(nextIndex: number) {
    setActiveIndex(nextIndex);
    buttonRefs.current[nextIndex]?.focus();
  }

  // Read the moving-from position off the actual focused button rather than
  // trusting `activeIndex` alone: the long-press overlay's focus trap can
  // Tab-wrap focus onto a button whose tabIndex is -1 (roving tabindex only
  // controls the *default* tab stop, not where Tab itself can land), and
  // state-based position would then skip a button on the next arrow press.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const focusedIndex = buttonRefs.current.indexOf(
      event.target as HTMLButtonElement,
    );
    const fromIndex = focusedIndex === -1 ? activeIndex : focusedIndex;
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        moveFocus(fromIndex === lastIndex ? 0 : fromIndex + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        moveFocus(fromIndex === 0 ? lastIndex : fromIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        moveFocus(0);
        break;
      case "End":
        event.preventDefault();
        moveFocus(lastIndex);
        break;
      default:
        break;
    }
  }

  return (
    <div
      className={styles.reactionPicker}
      role="toolbar"
      aria-label={t("messages:actions.reactionsLabel")}
      onKeyDown={handleKeyDown}
    >
      {REACTION_ORDER.map((key, index) => {
        const isMine = myReactionKeys.includes(key);
        return (
          <button
            key={key}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            type="button"
            className={styles.reactionPickerBtn}
            aria-label={labels[key]}
            aria-pressed={isMine}
            tabIndex={index === activeIndex ? 0 : -1}
            onFocus={() => setActiveIndex(index)}
            onClick={() => {
              setActiveIndex(index);
              onPick(key);
            }}
          >
            {REACTION_EMOJI[key]}
          </button>
        );
      })}
    </div>
  );
}
