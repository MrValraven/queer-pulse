import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { EventHostDTO } from "./api/events.api";
import { CohostManager } from "./CohostManager";
import { GATHERING_SETTINGS } from "./manageGathering.data";
import styles from "./ManageGatheringPage.module.css";

type SettingId = (typeof GATHERING_SETTINGS)[number]["id"];

interface SettingsTabProps {
  slug: string;
  onCancel: () => void;
  /** The event's real accepted co-hosts — see `CohostManager`. */
  cohosts?: EventHostDTO[];
  /** The two toggles' real current values (`Event.allowWaitlist`/
   *  `showAttendeeCount`) — `undefined` in demo mode, where the tab falls
   *  back to `GATHERING_SETTINGS.on`'s static starting state. */
  allowWaitlist?: boolean;
  showAttendeeCount?: boolean;
  /** Persists a toggle change for real (`PATCH /events/:slug`) — a no-op in
   *  demo mode (still called, so this component doesn't need its own
   *  demoMode branch; `ManageGatheringPage` owns that check). */
  onUpdateSettings?: (patch: Partial<Record<SettingId, boolean>>) => void;
}

export function SettingsTab({
  slug,
  onCancel,
  cohosts,
  allowWaitlist,
  showAttendeeCount,
  onUpdateSettings,
}: SettingsTabProps) {
  const { t } = useTranslation();
  // Live mode always resolves both real fields (the backend defaults every
  // event to `true`, never omits them); demo mode's `gathering` is `null`, so
  // both stay `undefined` and the toggle list falls back to its static mock
  // starting state instead.
  const isLive = allowWaitlist !== undefined || showAttendeeCount !== undefined;
  const [toggles, setToggles] = useState<Record<SettingId, boolean>>(() =>
    isLive
      ? { allowWaitlist: allowWaitlist ?? true, showAttendeeCount: showAttendeeCount ?? true }
      : (Object.fromEntries(
          GATHERING_SETTINGS.map((setting) => [setting.id, setting.on]),
        ) as Record<SettingId, boolean>),
  );
  const toggle = (id: SettingId) => {
    const next = !toggles[id];
    setToggles((prev) => ({ ...prev, [id]: next }));
    onUpdateSettings?.({ [id]: next });
  };
  return (
    <div>
      <CohostManager slug={slug} cohosts={cohosts} />
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
                onChange={() => toggle(setting.id)}
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
