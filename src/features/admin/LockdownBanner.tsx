import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useToast } from "../../shared/components/feedback/useToast";
import { useUpdatePlatformSettings } from "./api/usePlatformSettings";
import styles from "./AdminSettingsPage.module.css";

/**
 * Shown to an admin whenever lockdown is active. The one-click "End lockdown"
 * is the point: an admin dealing with an incident should never have to hunt for
 * the off switch, and a lockdown whose off switch is hard to reach is a
 * one-way door in practice even when it is not one in code.
 *
 * Deliberately skips the confirmation modal — reopening the platform is the
 * safe direction, and friction here costs uptime.
 */
export function LockdownBanner() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const update = useUpdatePlatformSettings();

  return (
    <div className={styles.banner} role="status">
      <div className={styles.bannerText}>
        <strong>{t("admin:settings.banner.title")}</strong>
        <span>{t("admin:settings.banner.sub")}</span>
      </div>
      <Button
        variant="primary"
        disabled={update.isPending}
        onClick={() =>
          update.mutate(
            { lockdownEnabled: false },
            {
              onError: () => showToast(t("admin:settings.saveError"), "error"),
            },
          )
        }
      >
        {t("admin:settings.banner.cta")}
      </Button>
    </div>
  );
}
