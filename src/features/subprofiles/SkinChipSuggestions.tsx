import { useId, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinChipsField } from "./useSkinChipsField";
import styles from "./SkinChipSuggestions.module.css";

/** How many suggestions show before "More" opens the rest. */
const FIRST_SHOWN = 8;

const identity = (text: string) => text.trim().toLocaleLowerCase();

/**
 * Common entries for a `chips` control (`control.suggestions`), offered as
 * one-tap chips under its add input: a press adds that entry to the list and
 * the chip leaves the row. Entries already on the list, in any case, are left
 * out, and the row is gone once every suggestion is in. The first few show;
 * "More" opens the rest. Typing your own still works as before.
 *
 * A pressed chip leaves the row, so focus would fall to the page: it moves
 * to the chip that takes its place, or back to the add input once the row
 * is empty.
 */
export function SkinChipSuggestions({
  suggestions,
  field,
}: {
  suggestions: readonly string[];
  field: SkinChipsField;
}) {
  const { t } = useTranslation();
  const labelId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const taken = new Set(field.list.entries.map(identity));
  const open = suggestions.filter(
    (suggestion) => !taken.has(identity(suggestion)),
  );
  if (open.length === 0) return null;
  const shown = isExpanded ? open : open.slice(0, FIRST_SHOWN);
  const hiddenCount = open.length - shown.length;

  return (
    <div className={styles.suggestions}>
      <span id={labelId} className={styles.label}>
        {t("subprofiles:skinChips.suggestionsLabel")}
      </span>
      <ul ref={listRef} className={styles.list} aria-labelledby={labelId}>
        {shown.map((suggestion) => (
          <li key={suggestion}>
            <button
              type="button"
              className={styles.chip}
              aria-label={t("subprofiles:skinChips.addSuggestion", {
                text: suggestion,
              })}
              onClick={(event) => {
                const hadFocus = event.currentTarget === document.activeElement;
                const index = shown.indexOf(suggestion);
                field.list.addMany([suggestion]);
                if (!hadFocus) return;
                requestAnimationFrame(() => {
                  const buttons =
                    listRef.current?.querySelectorAll("button") ?? [];
                  const next = buttons[Math.min(index, buttons.length - 1)];
                  (next ?? field.keyboard.inputRef.current)?.focus();
                });
              }}
            >
              <FiPlus aria-hidden className={styles.icon} />
              {suggestion}
            </button>
          </li>
        ))}
        {hiddenCount > 0 && (
          <li>
            <button
              type="button"
              className={`${styles.chip} ${styles.more}`}
              onClick={() => setIsExpanded(true)}
            >
              {t("subprofiles:skinChips.moreSuggestions", {
                count: hiddenCount,
              })}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
