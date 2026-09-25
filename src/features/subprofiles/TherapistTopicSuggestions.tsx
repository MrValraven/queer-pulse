import { useId } from "react";
import { FiPlus } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  therapistTopicSuggestionKey,
  type TherapistTopicSuggestionId,
} from "./therapistTopicSuggestions.data";
import refinedChipStyles from "./SkinMultiSelectInline.module.css";
import styles from "./TherapistTopicsControl.module.css";

/** Starter topics as quiet chips under "Add a topic", with a small lead: "Or
 *  start from one of these" while there are none, "More ideas" after. A chip
 *  adds a topic with that heading and puts the caret in its first line, so
 *  it leaves the row. They borrow the multiSelect's unpicked chips
 *  (SkinMultiSelectInline.module.css). */
export function TherapistTopicSuggestions({
  suggestionIds,
  leadKey,
  isDisabled,
  onPick,
}: {
  suggestionIds: readonly TherapistTopicSuggestionId[];
  leadKey: string;
  isDisabled: boolean;
  onPick: (heading: string) => void;
}) {
  const { t } = useTranslation();
  const leadId = useId();
  return (
    <div className={styles.suggestionsBlock}>
      <p id={leadId} className={styles.suggestionsLead}>
        {t(leadKey)}
      </p>
      <div
        className={refinedChipStyles.row}
        role="group"
        aria-labelledby={leadId}
      >
        {suggestionIds.map((id) => {
          const heading = t(therapistTopicSuggestionKey(id));
          return (
            <button
              key={id}
              type="button"
              className={refinedChipStyles.chip}
              disabled={isDisabled}
              onClick={() => onPick(heading)}
            >
              <FiPlus aria-hidden className={refinedChipStyles.chipIcon} />
              <span className={refinedChipStyles.chipText}>{heading}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
