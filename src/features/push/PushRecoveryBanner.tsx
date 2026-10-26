import { FiBellOff, FiX } from "react-icons/fi";
import { reasonFor } from "../../shared/api/errorMessage";
import { Button, Collapse } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAuth } from "../../app/providers/authContext";
import type { PushRecoveryReason } from "./pushResyncDecision";
import { reportPushSyncOutcome } from "./pushSyncOutcomeStore";
import styles from "./PushRecoveryBanner.module.css";
import { usePushRecoveryPrompt } from "./usePushRecoveryPrompt";
import { usePushSubscription } from "./usePushSubscription";

const BODY_KEY_BY_REASON: Record<PushRecoveryReason, string> = {
  permissionDefault: "settings:notifications.phonePush.recovery.bodyDefault",
  permissionDenied: "settings:notifications.phonePush.recovery.bodyDenied",
  subscribeFailed: "settings:notifications.phonePush.recovery.bodyFailed",
};

/**
 * Tells a member push stopped on this device when the silent recovery in
 * `usePushSubscriptionSync` could not bring it back (permission reset or
 * blocked, a refused subscribe, iOS wanting a tap). The button runs the same
 * `enable()` flow as the settings toggle, from a real click, because
 * `Notification.requestPermission` and iOS subscribes need a user gesture.
 *
 * Blocked permission cannot be re-asked from a page, so that case explains how
 * to allow it in the browser settings and offers no button. The sync re-runs
 * when the tab becomes visible again, which clears the banner once allowed.
 * Mounted from `PushAppEffects`; renders nothing in demo mode (no live member).
 */
export function PushRecoveryBanner() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { reason, dismiss } = usePushRecoveryPrompt();
  const { enable, busy } = usePushSubscription();
  const memberId = user?.id ?? null;
  const shownReason = reason ?? "permissionDefault";
  const isDenied = shownReason === "permissionDenied";

  async function handleEnable() {
    const result = await enable();
    if (result.status === "enabled") {
      if (memberId) reportPushSyncOutcome(memberId, "working");
      showToast(t("settings:notifications.phonePush.recovery.done"), "success");
    } else if (result.status === "denied") {
      showToast(
        t("settings:notifications.phonePush.recovery.promptClosed"),
        "error",
      );
    } else if (result.status === "failed") {
      showToast(
        reasonFor(result.error) ??
          t("settings:notifications.phonePush.recovery.error"),
        "error",
      );
    }
  }

  return (
    <Collapse isOpen={reason !== null} className={styles.host}>
      <aside
        className={styles.banner}
        aria-label={t("settings:notifications.phonePush.recovery.title")}
      >
        <span className={styles.icon}>
          <FiBellOff aria-hidden />
        </span>
        <div className={styles.body}>
          <p className={styles.title}>
            {t("settings:notifications.phonePush.recovery.title")}
          </p>
          <p className={styles.text}>{t(BODY_KEY_BY_REASON[shownReason])}</p>
          {!isDenied && (
            <Button
              variant="primary"
              size="sm"
              disabled={busy}
              onClick={() => void handleEnable()}
            >
              {t("settings:notifications.phonePush.recovery.action")}
            </Button>
          )}
        </div>
        <button
          type="button"
          className={styles.dismiss}
          aria-label={t("settings:notifications.phonePush.recovery.dismiss")}
          onClick={dismiss}
        >
          <FiX aria-hidden />
        </button>
      </aside>
    </Collapse>
  );
}
