import { Button } from "../../../shared/components/ui";
import { describeError } from "../../../shared/api/errorMessage";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { EmailTemplateSaveError } from "./emailTemplateSaveError";
import styles from "./AdminEmailTemplates.module.css";

export function EmailTemplateSaveErrorBanner({
  error,
  onSaveAsNew,
}: {
  error: EmailTemplateSaveError;
  onSaveAsNew: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.errorBanner} role="alert">
      {error.kind === "validation" && (
        <>
          <p className={styles.errorTitle}>
            {t("admin:emailTemplates.editor.validationTitle")}
          </p>
          <ul className={styles.errorList}>
            {error.messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </>
      )}
      {error.kind === "labelTaken" && (
        <p>{t("admin:emailTemplates.editor.labelTaken")}</p>
      )}
      {error.kind === "notFound" && (
        <>
          <p>{t("admin:emailTemplates.editor.deletedWhileEditing")}</p>
          <Button variant="primary" size="md" onClick={onSaveAsNew}>
            {t("admin:emailTemplates.editor.saveAsNewCta")}
          </Button>
        </>
      )}
      {error.kind === "other" && (
        <p>
          {describeError(
            t("admin:emailTemplates.saveError"),
            error.cause,
            t("shared:apiError.tryAgainTail"),
          )}
        </p>
      )}
    </div>
  );
}
