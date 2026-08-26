import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiSend } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useDisplayMode } from "../../app/providers/displayModeContext";
import { Button, Toggle } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { reasonFor } from "../../shared/api/errorMessage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "../settings/SettingsPage.module.css";
import rowStyles from "./PushNotificationRow.module.css";
import { testPush } from "./push.api";
import { usePushSubscription } from "./usePushSubscription";
import { useHidePushPreviews } from "../settings/api/useHidePushPreviews";

export function PushNotificationRow() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const {
    supported,
    supportState,
    permission,
    isSubscribed,
    busy,
    enable,
    disable,
  } = usePushSubscription();
  const { isInstalled } = useDisplayMode();
  const [sending, setSending] = useState(false);
  // Read from the SERVER, not from IndexedDB (ID-13). The browser flag this
  // row used to own could not be honoured on iPhone at all, because iOS never
  // runs the service worker's push handler, so the setting moved onto
  // `member_preferences` where the composer can read it before a payload is
  // ever built. The hook writes the local mirror too, and surfaces a failed
  // save as a toast: a privacy control that silently did not save is worse
  // than one that was never offered.
  const {
    isHidingPreviews,
    setHidingPreviews,
    isLoading: isPreviewPrefLoading,
  } = useHidePushPreviews();

  const blocked = permission === "denied";
  const disabled = !supported || blocked || busy;
  // ID-17. iOS and iPadOS Safari expose push only to a web app added to the
  // Home Screen, so "needsInstall" gets the install route instead of the
  // generic "your browser can't do this yet" dead end this row used to show
  // every iPhone member.
  const needsInstall = supportState === "needsInstall";
  const helper = needsInstall
    ? t("system:pwaInstall.pushRow.helper")
    : !supported
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
          {/* Until now nothing in production linked to PwaPromptPage. It holds
              correct per-platform steps already, so this points at it rather
              than repeating them. Shown to anyone still in a browser tab, and
              it is the actual fix for the "needsInstall" helper above. */}
          {!isInstalled && (
            <Link className={rowStyles.installLink} to={routes.pwaPrompt}>
              {t("system:pwaInstall.pushRow.cta")}
              <FiArrowRight aria-hidden />
            </Link>
          )}
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
            isPreviewPrefLoading ? styles.comingSoonControl : undefined
          }
          inert={isPreviewPrefLoading}
        >
          <Toggle
            tone="coral"
            checked={isHidingPreviews}
            onChange={setHidingPreviews}
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
