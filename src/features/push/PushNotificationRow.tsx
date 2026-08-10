import { useState } from "react";
import { FiSend } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Button, Toggle } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "../settings/SettingsPage.module.css";
import { testPush } from "./push.api";
import { usePushSubscription } from "./usePushSubscription";

export function PushNotificationRow() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { supported, permission, isSubscribed, busy, enable, disable } =
    usePushSubscription();
  const [sending, setSending] = useState(false);

  const blocked = permission === "denied";
  const disabled = !supported || blocked || busy;
  const helper = !supported
    ? t("settings:notifications.phonePush.unsupported")
    : blocked
      ? t("settings:notifications.phonePush.blocked")
      : t("settings:notifications.phonePush.desc");

  const title = t("settings:notifications.phonePush.title");

  // A test push only makes sense once the device is actually subscribed and
  // permission is granted; in demo mode there is no live endpoint to send to.
  const canTest =
    supported &&
    permission === "granted" &&
    isSubscribed &&
    !demoMode &&
    !busy &&
    !sending;

  const handleTest = async () => {
    setSending(true);
    try {
      await testPush();
      showToast(t("settings:notifications.phonePush.test.sent"), "success");
    } catch {
      showToast(t("settings:notifications.phonePush.test.error"), "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
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
      <div className={styles.toggleRow}>
        <div className={styles.toggleLabel}>
          <div className={styles.toggleTitle}>
            {t("settings:notifications.phonePush.test.title")}
          </div>
          <div className={styles.toggleDesc}>
            {t("settings:notifications.phonePush.test.desc")}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          disabled={!canTest}
          onClick={() => void handleTest()}
        >
          <FiSend aria-hidden />
          {t("settings:notifications.phonePush.test.action")}
        </Button>
      </div>
    </>
  );
}
