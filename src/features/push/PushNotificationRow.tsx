import { Toggle } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "../settings/SettingsPage.module.css";
import { usePushSubscription } from "./usePushSubscription";

export function PushNotificationRow() {
  const { t } = useTranslation();
  const { supported, permission, isSubscribed, busy, enable, disable } =
    usePushSubscription();

  const blocked = permission === "denied";
  const disabled = !supported || blocked || busy;
  const helper = !supported
    ? t("settings:notifications.phonePush.unsupported")
    : blocked
      ? t("settings:notifications.phonePush.blocked")
      : t("settings:notifications.phonePush.desc");

  const title = t("settings:notifications.phonePush.title");

  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleLabel}>
        <div className={styles.toggleTitle}>{title}</div>
        <div className={styles.toggleDesc}>{helper}</div>
      </div>
      <div
        className={disabled ? styles.comingSoonControl : undefined}
        inert={disabled}
      >
        <Toggle
          tone="coral"
          checked={isSubscribed}
          onChange={(next) => {
            if (disabled) return;
            void (next ? enable() : disable());
          }}
          label={title}
        />
      </div>
    </div>
  );
}
