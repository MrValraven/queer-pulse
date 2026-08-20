import { FiX } from "react-icons/fi";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { usePlatformStatus } from "../../api/usePlatformStatus";
import { useTranslation } from "../../i18n/useTranslation";
import { useAnnouncementDismissal } from "./useAnnouncementDismissal";
import styles from "./AnnouncementBanner.module.css";

/**
 * Sitewide, admin-authored announcement banner (ADM-25) — mounted at the top
 * of both `AppShell` and `PageShell`, so it reaches every visitor regardless
 * of whether they're signed in. Content and on/off state come from
 * `usePlatformStatus()`, the same bootstrap read the app already uses to
 * learn about lockdown — no separate polling loop.
 *
 * Deliberately dismissible (unlike `LockdownBanner`, which is a kill-switch
 * notice an admin must act on): this is informational, so a member should be
 * able to put it away and not see it again until the content actually
 * changes. See `useAnnouncementDismissal` for how "again" is decided.
 */
export function AnnouncementBanner() {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const { demoMode } = useDemoMode();
  const { data: status } = usePlatformStatus();

  const version = status?.announcementVersion ?? null;
  const { dismissed, dismiss } = useAnnouncementDismissal(
    version,
    status?.announcementDismissed ?? false,
    loggedIn,
    demoMode,
  );

  if (!status?.announcementEnabled || !status.announcementMessage) {
    return null;
  }
  if (dismissed) return null;

  return (
    <div className={styles.banner} role="status">
      <p className={styles.message}>{status.announcementMessage}</p>
      <button
        type="button"
        className={styles.dismiss}
        onClick={dismiss}
        aria-label={t("shared:announcement.dismiss")}
      >
        <FiX size={16} aria-hidden />
      </button>
    </div>
  );
}
