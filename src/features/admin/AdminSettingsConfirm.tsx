import { ConfirmDialog, Eyebrow } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./AdminSettingsPage.module.css";

/**
 * Gate on the lockdown toggle. Enabling it takes the whole platform down for
 * every member, which should not be a stray click on a switch — so it states
 * the blast radius and shows the exact message members will see.
 *
 * Disabling confirms too, but lightly: the copy is shorter and the tone is the
 * default (non-destructive), because reopening is the safe direction.
 */
export function AdminSettingsConfirm({
  mode,
  message,
  onConfirm,
  onCancel,
}: {
  mode: "enable" | "disable";
  /** The resolved maintenance message, shown on enable so it can be checked. */
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const keyPrefix = `admin:settings.confirm.${mode}`;

  return (
    <ConfirmDialog
      open
      onClose={onCancel}
      onConfirm={onConfirm}
      title={t(`${keyPrefix}.title`)}
      tone={mode === "enable" ? "destructive" : "default"}
      confirmLabel={t(`${keyPrefix}.cta`)}
      cancelLabel={t("admin:common.cancel")}
    >
      <Eyebrow>{t(`${keyPrefix}.eyebrow`)}</Eyebrow>
      <p className={styles.confirmBody}>{t(`${keyPrefix}.body`)}</p>
      {mode === "enable" && (
        <>
          <p className={styles.confirmLabel}>
            {t("admin:settings.confirm.enable.messagePreview")}
          </p>
          <blockquote className={styles.confirmQuote}>{message}</blockquote>
          <p className={styles.confirmNote}>
            {t("admin:settings.lockdown.youKeepAccess")}
          </p>
        </>
      )}
    </ConfirmDialog>
  );
}
