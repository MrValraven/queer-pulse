import { useId } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminToggle } from "./ui";
import { MAX_LEGAL_REQUEST_TEXT_LENGTH } from "./api/adminLegalRequests.api";
import {
  isWithheldReasonRequired,
  type LegalRequestFormDraft,
} from "./adminLegalRequestForm.utils";
import styles from "./AdminLegalRequestsPage.module.css";

/**
 * What the affected members were told, and what stays inside the team.
 *
 * These fields RECORD that the named members were told. Nothing on this screen
 * tells anybody: QueerPulse sends no notification and no email here or
 * anywhere. An admin enters what the team actually did, and the public report
 * publishes the total.
 *
 * The withheld-reason field announces itself as required the moment the draft
 * describes a disclosure that reached nobody, so an operator sees the rule
 * before they press save rather than in a 400 afterwards.
 */
export function AdminLegalRequestNotifyFields({
  draft,
  onChange,
}: {
  draft: LegalRequestFormDraft;
  onChange: (patch: Partial<LegalRequestFormDraft>) => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const isReasonRequired = isWithheldReasonRequired(draft);

  return (
    <>
      <label className={styles.fieldLabel} htmlFor={`${fieldId}-notified-on`}>
        {t("admin:legalRequests.field.memberNotifiedOn")}
      </label>
      <input
        id={`${fieldId}-notified-on`}
        type="date"
        className={styles.textInput}
        value={draft.memberNotifiedOn}
        onChange={(event) => onChange({ memberNotifiedOn: event.target.value })}
      />
      <p className={styles.fieldHint}>
        {t("admin:legalRequests.field.memberNotifiedOnHint")}
      </p>

      <label className={styles.fieldLabel} htmlFor={`${fieldId}-notified`}>
        {t("admin:legalRequests.field.accountsNotified")}
      </label>
      <input
        id={`${fieldId}-notified`}
        type="number"
        inputMode="numeric"
        min={0}
        className={styles.textInput}
        value={draft.accountsNotified}
        onChange={(event) => onChange({ accountsNotified: event.target.value })}
      />
      <p className={styles.fieldHint}>
        {t("admin:legalRequests.field.accountsNotifiedHint")}
      </p>

      <label className={styles.fieldLabel} htmlFor={`${fieldId}-withheld`}>
        {isReasonRequired
          ? t("admin:legalRequests.field.withheldReasonRequired")
          : t("admin:legalRequests.field.withheldReason")}
      </label>
      <textarea
        id={`${fieldId}-withheld`}
        className={styles.textarea}
        rows={3}
        value={draft.notificationWithheldReason}
        maxLength={MAX_LEGAL_REQUEST_TEXT_LENGTH}
        onChange={(event) =>
          onChange({ notificationWithheldReason: event.target.value })
        }
        required={isReasonRequired}
      />
      <p className={styles.fieldHint}>
        {isReasonRequired
          ? t("admin:legalRequests.field.withheldReasonRequiredHint")
          : t("admin:legalRequests.field.withheldReasonHint")}
      </p>

      <span className={styles.fieldLabel}>
        {t("admin:legalRequests.field.gagOrder")}
      </span>
      <AdminToggle
        checked={draft.isUnderGagOrder}
        onChange={(checked) => onChange({ isUnderGagOrder: checked })}
        label={t("admin:legalRequests.field.gagOrder")}
      />
      <p className={styles.fieldHint}>
        {t("admin:legalRequests.field.gagOrderHint")}
      </p>

      <label className={styles.fieldLabel} htmlFor={`${fieldId}-note`}>
        {t("admin:legalRequests.field.internalNote")}
      </label>
      <textarea
        id={`${fieldId}-note`}
        className={styles.textarea}
        rows={4}
        value={draft.internalNote}
        maxLength={MAX_LEGAL_REQUEST_TEXT_LENGTH}
        onChange={(event) => onChange({ internalNote: event.target.value })}
      />
      <p className={styles.fieldHint}>
        {t("admin:legalRequests.field.internalNoteHint")}
      </p>
    </>
  );
}
