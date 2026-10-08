import { FiAlertCircle, FiBell } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { EditSaveProblem } from "./editDetailsChanges";
import styles from "./EditDetailsFooterStatus.module.css";

/**
 * Where the edit stands, on the left of the edit-details modal's footer:
 * nothing changed yet, how many sections changed (and whether attendees will
 * be told), or that one field holds Save, with a button that goes to it.
 *
 * The words sit in one polite live region that stays mounted, so a screen
 * reader hears each new state once and the region never has to be found
 * again. They are kept short, and on a phone they hold to one line.
 */
export function EditDetailsFooterStatus({
  editedCount,
  isNotifyingAttendees,
  saveProblem,
  onShowField,
}: {
  editedCount: number;
  /** A change to a field the server tells attendees about (the start or the
   *  place) is in the draft. */
  isNotifyingAttendees: boolean;
  /** What holds Save, or `null` when nothing does. */
  saveProblem: EditSaveProblem | null;
  onShowField: (problem: EditSaveProblem | null) => void;
}) {
  const { t } = useTranslation();
  const isBlocked = saveProblem !== null;
  const canShowField = saveProblem !== null && saveProblem.sectionKey !== null;

  return (
    <div className={styles.status}>
      <p
        className={styles.line}
        data-tone={isBlocked ? "blocked" : undefined}
        aria-live="polite"
      >
        {isBlocked ? (
          <>
            <FiAlertCircle className={styles.icon} aria-hidden />
            <span className={styles.text}>
              {t("gatherings:manage.editModal.status.blocked")}
            </span>
          </>
        ) : editedCount === 0 ? (
          <span className={styles.text}>
            {t("gatherings:manage.editModal.status.clean")}
          </span>
        ) : (
          <>
            <span className={styles.count}>
              {t("gatherings:manage.editModal.status.changed", {
                count: editedCount,
              })}
            </span>
            {isNotifyingAttendees && (
              <span className={styles.notify}>
                <FiBell className={styles.icon} aria-hidden />
                <span className={styles.text}>
                  {t("gatherings:manage.editModal.status.notify")}
                </span>
              </span>
            )}
          </>
        )}
      </p>
      {canShowField && (
        <button
          type="button"
          className={styles.showField}
          onClick={() => onShowField(saveProblem)}
        >
          {t("gatherings:manage.editModal.status.showField")}
        </button>
      )}
    </div>
  );
}
