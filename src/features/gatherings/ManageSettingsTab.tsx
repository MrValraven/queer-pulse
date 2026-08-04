import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CohostManager } from "./CohostManager";
import { GATHERING_SETTINGS } from "./manageGathering.data";
import styles from "./ManageGatheringPage.module.css";

interface SettingsTabProps {
  slug: string;
  onCancel: () => void;
}

export function SettingsTab({ slug, onCancel }: SettingsTabProps) {
  const { t } = useTranslation();
  const [toggles, setToggles] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      GATHERING_SETTINGS.map((setting) => [setting.id, setting.on]),
    ),
  );
  return (
    <div>
      <CohostManager slug={slug} />
      <div className={styles.sectionLabel}>
        {t("gatherings:manage.settings.optionsHeading")}
      </div>
      <div className={styles.toggleList}>
        {GATHERING_SETTINGS.map((setting) => (
          <div className={styles.tglRow} key={setting.id}>
            <div>
              <div className={styles.tglTitle}>{t(setting.titleKey)}</div>
              <div className={styles.tglDesc}>{t(setting.descriptionKey)}</div>
            </div>
            <label className={styles.tglSw}>
              <input
                type="checkbox"
                aria-label={t(setting.titleKey)}
                checked={toggles[setting.id] ?? false}
                onChange={() =>
                  setToggles((prev) => ({
                    ...prev,
                    [setting.id]: !prev[setting.id],
                  }))
                }
              />
              <div className={styles.tglTrack} />
              <div className={styles.tglThumb} />
            </label>
          </div>
        ))}
      </div>
      <div className={styles.dangerLabel}>
        {t("gatherings:manage.settings.dangerZoneHeading")}
      </div>
      <div className={styles.dangerZone}>
        <div className={styles.dzLabel}>
          {t("gatherings:manage.settings.cancelLabel")}
        </div>
        <div className={styles.dzText}>
          {t("gatherings:manage.settings.cancelText")}
        </div>
        <Button variant="ghost" className={styles.cancelBtn} onClick={onCancel}>
          {t("gatherings:manage.settings.cancelCta")}
        </Button>
      </div>
    </div>
  );
}
