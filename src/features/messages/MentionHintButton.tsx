import { useRef } from "react";
import { FiHelpCircle } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { MENTION_SHORTCUTS } from "./mentionShortcuts.data";
import styles from "./MentionHintButton.module.css";

interface MentionHintButtonProps {
  /** Whether this popover is the one currently open (controlled by Composer so
   *  only one composer popover is ever open at a time). */
  open: boolean;
  /** Toggle request — the Composer flips its single open-popover state. */
  onToggle: () => void;
  /** Drops the tapped sigil into the draft (and closes the popover + focuses
   *  the input, handled Composer-side) so mention typeahead opens next keystroke. */
  onInsert: (sigil: string) => void;
}

/** The composer's shortcut cheat-sheet: a "?" button that toggles a small
 *  popover listing the six mention sigils. Tapping a row inserts that sigil.
 *  Controlled so it can't co-exist with the GIF picker — the Composer owns
 *  open state and outside-click/Esc dismissal for both. */
export function MentionHintButton({
  open,
  onToggle,
  onInsert,
}: MentionHintButtonProps) {
  const { t } = useTranslation();
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={styles.control}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.btn}
        aria-label={t("messages:shortcuts.open")}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={onToggle}
      >
        <FiHelpCircle aria-hidden />
      </button>
      {open && (
        <div
          className={styles.panel}
          role="dialog"
          aria-label={t("messages:shortcuts.panelLabel")}
        >
          <p className={styles.title}>{t("messages:shortcuts.title")}</p>
          <ul className={styles.list}>
            {MENTION_SHORTCUTS.map((shortcut) => (
              <li key={shortcut.sigil}>
                <button
                  type="button"
                  className={styles.row}
                  onClick={() => onInsert(shortcut.sigil)}
                >
                  <span className={styles.sigil} aria-hidden>
                    {shortcut.sigil}
                  </span>
                  <span className={styles.label}>{t(shortcut.labelKey)}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className={styles.hint}>{t("messages:shortcuts.hint")}</p>
        </div>
      )}
    </div>
  );
}
