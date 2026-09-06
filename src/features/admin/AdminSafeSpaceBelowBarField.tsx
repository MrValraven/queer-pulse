import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  BELOW_VISIT_BAR_REASON_MIN_LENGTH,
  isBelowVisitBarReasonLongEnough,
  type VisitBarRefusal,
} from "./api/safeSpaceVisitBarError";
import styles from "./AdminSafeSpaceModal.module.css";

/**
 * The audited exception, on the DIRECT door to a safe-space badge.
 *
 * `PATCH /admin/listings/:ref/safe-space` refuses a move INTO `verified` for a
 * listing under the three-independent-visit bar unless a written reason comes
 * with it, exactly as the reviewed nomination path does. Gating only the
 * reviewed path would have left the published three-visit guarantee with an
 * unguarded bypass sitting beside it in the same console.
 *
 * The label and the requirement text are the reviewed path's own strings
 * (`safety:governance.action.belowBar*`), deliberately: one rule stated in one
 * set of words, whichever door the moderator came through.
 *
 * Three things this adds on top, because a disabled Save with no explanation is
 * its own failure:
 *
 * 1. A live character count, so the moderator can see how far from the floor
 *    they are instead of watching a button refuse to light up.
 * 2. What the exception costs the "Verified by" field sitting right above it in
 *    this same form. Above the bar that line is the moderator's to set; below
 *    it the server discards it and forces the public provenance line to state
 *    the real visit count. Promising a custom line here would be a lie the
 *    moderator only discovers on the live page.
 * 3. The refusal, when the server has already refused one. Read from the typed
 *    `code`, rendered with the counts the server returned.
 */
export function AdminSafeSpaceBelowBarField({
  independentVisitCount,
  requiredVisitCount,
  reason,
  onReasonChange,
  refusal,
  hasOpenNomination,
}: {
  independentVisitCount: number;
  requiredVisitCount: number;
  reason: string;
  onReasonChange: (reason: string) => void;
  /** The counts a refused save came back with, when one has been refused. */
  refusal: VisitBarRefusal | null;
  /** Whether a nomination for this listing is open in the review queue. When
   *  one is, that route is the better one, so this says so in a line rather
   *  than blocking a moderator who has a reason to be here. */
  hasOpenNomination: boolean;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const helpId = `${fieldId}-help`;
  const trimmedLength = reason.trim().length;
  const isLongEnough = isBelowVisitBarReasonLongEnough(reason);

  return (
    <div className={styles.overrideBox}>
      <p className={styles.overrideTitle}>
        {t("admin:adminSafeSpaces.underBar.title")}
      </p>
      <p className={styles.overrideNote}>
        {t("safety:governance.action.belowBarHelper", {
          count: independentVisitCount,
          required: requiredVisitCount,
          min: BELOW_VISIT_BAR_REASON_MIN_LENGTH,
        })}
      </p>
      <p className={styles.overrideNote}>
        {t("admin:adminSafeSpaces.underBar.verifierIgnored")}
      </p>
      {hasOpenNomination && (
        <p className={styles.overrideNote}>
          {t("admin:adminSafeSpaces.underBar.queueHint")}
        </p>
      )}

      {refusal && (
        <div className={styles.overrideRefusal} role="alert">
          <p className={styles.overrideTitle}>
            {t("admin:adminSafeSpaces.underBar.refusedTitle")}
          </p>
          <p className={styles.overrideNote}>
            {t("admin:adminSafeSpaces.underBar.refusedBody", {
              count: refusal.independentVisitCount,
              required: refusal.requiredVisitCount,
            })}
          </p>
          {refusal.notIndependentVouchCount > 0 && (
            <p className={styles.overrideNote}>
              {t("safety:governance.visits.notIndependent", {
                count: refusal.notIndependentVouchCount,
              })}
            </p>
          )}
        </div>
      )}

      <label className={styles.overrideLabel} htmlFor={fieldId}>
        {t("safety:governance.action.belowBarLabel")}
      </label>
      <textarea
        id={fieldId}
        className={styles.textarea}
        rows={3}
        required
        aria-required="true"
        aria-invalid={isLongEnough ? undefined : true}
        aria-describedby={helpId}
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
      />
      <p id={helpId} className={styles.overrideCount}>
        {t("admin:adminSafeSpaces.underBar.reasonCount", {
          count: trimmedLength,
          min: BELOW_VISIT_BAR_REASON_MIN_LENGTH,
        })}
      </p>
      {!isLongEnough && (
        <p className={styles.overrideShort}>
          {t("admin:adminSafeSpaces.underBar.reasonShort", {
            min: BELOW_VISIT_BAR_REASON_MIN_LENGTH,
          })}
        </p>
      )}
    </div>
  );
}
