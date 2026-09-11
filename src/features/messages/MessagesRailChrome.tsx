import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiBell, FiChevronLeft } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { AccountMenu } from "../../shared/components/layout/AccountMenu";
import {
  canGoBack,
  currentHistoryIdx,
} from "../../shared/components/layout/canGoBack";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { NotificationsBellMenu } from "../notifications/NotificationsBellMenu";
import styles from "./MessagesPage.module.css";

/**
 * The chrome the inbox panel carries in place of the site nav.
 *
 * This route is `chromeless` (see AppShell): AppChrome shows no top bar on any
 * viewport and no left rail on desktop, so the panel has to answer the question
 * they answered (how do I get back) from inside its own column. The wordmark in
 * `MessagesThreadListHeader` answers "where am I" on every viewport. On a phone
 * the back chevron beside it answers the way back; on desktop, where the bottom
 * tab bar is gone too, the footer below does.
 */

/**
 * The way back on a phone, beside the wordmark. The mobile app bar is where
 * the back chevron otherwise lives, and this route hides it, so the header
 * carries its own. It walks history back when there is a page in the app to
 * return to (the same guard the app bar and the edge-swipe use), and falls
 * back to the feed for a deep link or a fresh tab, where the desktop footer's
 * link also goes.
 */
export function MessagesBackButton() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className={`${styles.composeBtn} ${styles.tpBack}`}
      aria-label={t("nav:back")}
      onClick={() => {
        if (canGoBack(currentHistoryIdx())) void navigate(-1);
        else void navigate(routes.feed);
      }}
    >
      <FiChevronLeft aria-hidden />
    </button>
  );
}

/**
 * Pinned foot of the panel: the notifications bell and the way back to the
 * platform, over the account chip. The bell opens the recent-notifications
 * popover in place, so checking them never leaves the conversation. The chip is
 * the shared `AccountMenu` in its `rail-light` placement — the same control the
 * left nav rail uses, re-inked for this white ground — so profile, settings,
 * sign-out and the rest stay in one place rather than being restated per
 * surface.
 */
export function MessagesRailFooter() {
  const { t } = useTranslation();
  return (
    <div className={styles.railFooter}>
      <div className={styles.railFooterRow}>
        <Link to={routes.feed} className={styles.railBack}>
          <FiArrowLeft aria-hidden />
          <span>{t("messages:rail.backToPlatform")}</span>
        </Link>
        <NotificationsBellMenu
          icon={<FiBell aria-hidden />}
          triggerClassName={styles.railBell}
          badgeClassName={styles.railBellBadge}
        />
      </div>
      <AccountMenu placement="rail-light" />
    </div>
  );
}
