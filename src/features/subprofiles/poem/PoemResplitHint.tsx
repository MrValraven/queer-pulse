import { FiScissors } from "react-icons/fi";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./PoemResplitHint.module.css";

export interface PoemResplitHintProps {
  /** Splits the detected merged-stanza line into candidate lines. A
   *  suggestion the poet can still edit or undo afterwards — not an
   *  automatic, silent rewrite. */
  onResplit: () => void;
}

/**
 * Inline hint shown above the editor when the current poem normalizes to a
 * single stanza whose one line is a very long run (legacy merged data — see
 * `detectMergedStanzaLine` in `PoemBodyEditor.tsx`). Offers to re-split that
 * line on sentence/clause punctuation; the poet reviews and edits the result.
 */
export function PoemResplitHint({ onResplit }: PoemResplitHintProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.hint} role="note">
      <FiScissors aria-hidden className={styles.icon} />
      <div className={styles.copy}>
        <p className={styles.title}>
          {t("subprofiles:poem.editor.resplit.title")}
        </p>
        <p className={styles.body}>
          {t("subprofiles:poem.editor.resplit.body")}
        </p>
      </div>
      <button type="button" className={styles.action} onClick={onResplit}>
        {t("subprofiles:poem.editor.resplit.action")}
      </button>
    </div>
  );
}
