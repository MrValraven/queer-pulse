import { FiAlertCircle, FiX } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import styles from "./WizardExtras.module.css";

/**
 * Inline banner for a server-side (422) validation failure — shown on the step
 * that owns the offending field, with the backend's own message (item #4).
 * Dismissible; a fresh submit attempt clears it too.
 */
export function WizardServerError({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.serverError} role="alert">
      <FiAlertCircle size={17} className={styles.serverErrorIcon} aria-hidden />
      <div className={styles.serverErrorBody}>
        <div className={styles.serverErrorTitle}>
          {t("marketing:listBusiness.serverError.title")}
        </div>
        <div className={styles.serverErrorMessage}>{message}</div>
      </div>
      <button
        type="button"
        className={styles.serverErrorDismiss}
        onClick={onDismiss}
        aria-label={t("marketing:listBusiness.serverError.dismiss")}
      >
        <FiX size={15} aria-hidden />
      </button>
    </div>
  );
}

/**
 * "Save & finish later" — persists the draft (localStorage in demo, the
 * cross-device server row in live) and returns the member to the directory
 * (item #11). Secondary/ghost so it never competes with the step's primary
 * Next/Send button.
 */
export function SaveLaterButton({
  onSave,
  saving,
}: {
  onSave: () => void;
  saving: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.saveLaterRow}>
      <Button variant="ghost" onClick={onSave} disabled={saving}>
        {saving
          ? t("marketing:listBusiness.saveLater.saving")
          : t("marketing:listBusiness.saveLater.cta")}
      </Button>
    </div>
  );
}

/**
 * The two banners that sit above the wizard's step pane: a server-side
 * validation failure (when the last submit produced one) and the create-mode
 * "save & finish later" escape hatch.
 */
export function WizardFormChrome({
  serverError,
  onDismissError,
  isSaveLaterVisible,
  onSaveLater,
  isSavingLater,
}: {
  /** Backend 422 message, or null when the last submit was clean. */
  serverError: string | null;
  onDismissError: () => void;
  /** Create mode only, and only once a listing path has been picked. */
  isSaveLaterVisible: boolean;
  onSaveLater: () => void;
  isSavingLater: boolean;
}) {
  return (
    <>
      {serverError && (
        <WizardServerError message={serverError} onDismiss={onDismissError} />
      )}
      {isSaveLaterVisible && (
        <SaveLaterButton onSave={onSaveLater} saving={isSavingLater} />
      )}
    </>
  );
}
