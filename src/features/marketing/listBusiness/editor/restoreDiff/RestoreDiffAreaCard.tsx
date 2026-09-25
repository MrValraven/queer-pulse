import { useId } from "react";
import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { RestoreDiffFieldRow } from "./RestoreDiffFieldRow";
import type { RestoreDiffArea } from "./restoreDiff.types";
import styles from "./RestoreDiff.module.css";

/**
 * One editor area in the review: a checkbox that decides whether this area
 * comes back, and every field in it that would change.
 *
 * The whole header is the checkbox's label, so the tap target is the full
 * width of the card and the checkbox is named "Basics, 3 changes". The card
 * is a labelled group, so a screen reader moving into its fields hears which
 * area they belong to. Leaving an area out greys its diff, lets the card sink
 * to the dialog's cream, and says in words that the area stays as it is and
 * its saved changes go: the grey alone would be colour doing all the work.
 */
export function RestoreDiffAreaCard({
  area,
  isTicked,
  onToggle,
}: {
  area: RestoreDiffArea;
  isTicked: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const keptNoteId = useId();

  return (
    <div
      className={styles.card}
      role="group"
      aria-labelledby={titleId}
      data-ticked={isTicked}
    >
      <label className={styles.cardHead}>
        <span className={styles.checkboxFrame}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={isTicked}
            onChange={onToggle}
            // Read on focus while the area is left out, so the consequence
            // of the untick is heard where the choice is made.
            aria-describedby={isTicked ? undefined : keptNoteId}
          />
          <FiCheck aria-hidden className={styles.checkMark} />
        </span>
        <span className={styles.cardHeadText}>
          <span id={titleId} className={styles.cardTitle}>
            {t(area.labelKey)}
          </span>
          {/* The two spans sit in a flex row, which drops the whitespace
              between them, so the pause the name needs is spelled out. */}
          <span className="visuallyHidden">, </span>
          <span className={styles.cardCount}>
            {t("marketing:listBusiness.editor.restore.review.changeCount", {
              count: area.changeCount,
            })}
          </span>
        </span>
      </label>
      {!isTicked && (
        <p id={keptNoteId} className={styles.cardKept}>
          {t("marketing:listBusiness.editor.restore.review.areaKept")}
        </p>
      )}
      <div className={styles.cardBody}>
        {area.fields.map((field) => (
          <RestoreDiffFieldRow key={field.key} field={field} />
        ))}
      </div>
    </div>
  );
}
