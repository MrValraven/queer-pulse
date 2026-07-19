import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminModal } from "./ui";
import styles from "./AdminSettingsPage.module.css";

/**
 * Gate on the lockdown toggle. Enabling it takes the whole platform down for
 * every member, which should not be a stray click on a switch — so it states
 * the blast radius and shows the exact message members will see.
 *
 * Disabling confirms too, but lightly: the copy is shorter and the button is
 * not destructive-styled, because reopening is the safe direction.
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
  const k = `admin:settings.confirm.${mode}`;

  return (
    <AdminModal
      eyebrow={t(`${k}.eyebrow`)}
      title={t(`${k}.title`)}
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {t("admin:common.cancel")}
          </Button>
          <Button
            variant={mode === "enable" ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {t(`${k}.cta`)}
          </Button>
        </>
      }
    >
      <p className={styles.confirmBody}>{t(`${k}.body`)}</p>
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
    </AdminModal>
  );
}
