import { useEffect, useState } from "react";
import { FiSend } from "react-icons/fi";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Button, Toggle } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { reasonFor } from "../../shared/api/errorMessage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "../settings/SettingsPage.module.css";
import { testPush } from "./push.api";
import { usePushSubscription } from "./usePushSubscription";
import {
  readHidePushPreviews,
  writeHidePushPreviews,
} from "../../pushPrivacy";

export function PushNotificationRow() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { supported, permission, isSubscribed, busy, enable, disable } =
    usePushSubscription();
  const [sending, setSending] = useState(false);
  // Seeded from IndexedDB (the service worker's own source of truth) rather
  // than from React state, so the toggle always shows what the worker will
  // actually do, including after a reinstall on another device.
  const [isHidingPreviews, setIsHidingPreviews] = useState(false);
  const [isPreviewPrefLoaded, setIsPreviewPrefLoaded] = useState(false);

  useEffect(() => {
    let isActive = true;
    void readHidePushPreviews().then((stored) => {
      if (!isActive) return;
      setIsHidingPreviews(stored);
      setIsPreviewPrefLoaded(true);
    });
    return () => {
      isActive = false;
    };
  }, []);

  // Writing can fail (a locked-down browser context, private mode), and this
  // is a privacy control: if the write did not land, the toggle must snap back
  // rather than claim previews are hidden while the lock screen still shows
  // them.
  const handlePreviewToggle = async (next: boolean) => {
    setIsHidingPreviews(next);
    try {
      await writeHidePushPreviews(next);
    } catch {
      setIsHidingPreviews(!next);
      showToast(t("settings:notifications.phonePush.previews.error"), "error");
    }
  };

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

  // Turning it on can fail for reasons the member can act on (a blocked
  // origin, a 401, no network). It used to fail silently: the toggle snapped
  // back and nothing said why. `denied` is already explained by the helper
  // text above, so only a real failure raises a toast.
  const handleToggle = async (next: boolean) => {
    if (disabled) return;
    if (!next) {
      await disable();
      return;
    }
    const result = await enable();
    if (result.status === "failed") {
      showToast(
        reasonFor(result.error) ?? t("shared:social.genericError"),
        "error",
      );
    }
  };

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
            onChange={(next) => void handleToggle(next)}
            label={title}
          />
        </div>
      </div>
      <div className={styles.toggleRow}>
        <div className={styles.toggleLabel}>
          <div className={styles.toggleTitle}>
            {t("settings:notifications.phonePush.previews.title")}
          </div>
          <div className={styles.toggleDesc}>
            {t("settings:notifications.phonePush.previews.desc")}
          </div>
        </div>
        <div
          className={
            !isPreviewPrefLoaded ? styles.comingSoonControl : undefined
          }
          inert={!isPreviewPrefLoaded}
        >
          <Toggle
            tone="coral"
            checked={isHidingPreviews}
            onChange={(next) => void handlePreviewToggle(next)}
            label={t("settings:notifications.phonePush.previews.title")}
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
