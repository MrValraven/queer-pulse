import { Link } from "react-router-dom";
import { FiArrowLeft, FiBell } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { AccountMenu } from "../../shared/components/layout/AccountMenu";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useUnreadCount } from "../notifications/api/useUnreadCount";
import styles from "./MessagesPage.module.css";

/**
 * The chrome the inbox panel carries in place of the site nav.
 *
 * On desktop this route is `desktopChromeless` (see AppShell): AppChrome mounts
 * neither the top bar nor the left rail, so the panel has to answer the
 * question they answered — how do I get back — from inside its own column
 * (the wordmark in `MessagesThreadListHeader` now answers "where am I" on
 * every viewport). Desktop-only; on mobile the bottom tab bar is still on
 * screen and rendering this would duplicate it.
 */

/**
 * Pinned foot of the panel: the notifications bell and the way back to the
 * platform, over the account chip. The chip is the shared `AccountMenu` in its
 * `rail-light` placement — the same control the left nav rail uses, re-inked for
 * this white ground — so profile, settings, sign-out and the rest stay in one
 * place rather than being restated per surface.
 */
export function MessagesRailFooter() {
  const { t } = useTranslation();
  const unreadCount = useUnreadCount();
  return (
    <div className={styles.railFooter}>
      <div className={styles.railFooterRow}>
        <Link to={routes.feed} className={styles.railBack}>
          <FiArrowLeft aria-hidden />
          <span>{t("messages:rail.backToPlatform")}</span>
        </Link>
        <Link
          to={routes.notifications}
          className={styles.railBell}
          aria-label={t("nav:notifications")}
        >
          <FiBell aria-hidden />
          {unreadCount > 0 && (
            <span className={styles.railBellBadge}>{unreadCount}</span>
          )}
        </Link>
      </div>
      <AccountMenu placement="rail-light" />
    </div>
  );
}
