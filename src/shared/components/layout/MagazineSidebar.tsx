import { Link, NavLink } from "react-router-dom";
import { FiArrowLeft, FiEdit3 } from "react-icons/fi";
import { Button } from "../ui";
import { routes } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import { useCurrentIssue } from "../../../features/magazine/api/useCurrentIssue";
import { MAGAZINE_NAV, MAGAZINE_ISSUE_FALLBACK_ROUTE } from "./magazineNav.data";
import { MagazineSidebarRecents } from "./MagazineSidebarRecents";
import styles from "./MagazineSidebar.module.css";

export function MagazineSidebar({
  onNavigate,
}: {
  /** Called when a navigation link is activated — the mobile off-canvas
   * drawer passes its close handler so tapping a link dismisses the drawer.
   * Absent on desktop, where the rail is static and nothing needs closing. */
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  // Dual-mode, honest-empty: `issue` is `null` before any issue exists in
  // live mode, in which case the eyebrow and the "Issue" nav destination
  // both fall back rather than fabricating a number/theme.
  const { issue } = useCurrentIssue();

  return (
    <aside className={styles.rail}>
      <Link to={routes.magazineEditor} className={styles.brand} onClick={onNavigate}>
        <span className={styles.brandName}>
          <Translation i18nKey="shared:brand.wordmark" components={{ em: <em /> }} />
        </span>
        <span className={styles.brandDot} aria-hidden />
      </Link>

      {issue && (
        <span className={styles.eyebrow}>
          {t("magazine:deskShell.issueEyebrow", { number: issue.number, theme: issue.theme })}
        </span>
      )}

      <nav className={styles.nav} aria-label={t("magazine:deskShell.menuAria")}>
        {MAGAZINE_NAV.map(({ labelKey, to, icon: Icon, end, needsCurrentIssueNumber }) => {
          const resolvedTo = needsCurrentIssueNumber
            ? issue
              ? to.replace(":number", issue.number)
              : MAGAZINE_ISSUE_FALLBACK_ROUTE
            : to;
          return (
            <NavLink
              key={labelKey}
              to={resolvedTo}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                [styles.navItem, isActive && styles.navItemActive].filter(Boolean).join(" ")
              }
            >
              <Icon aria-hidden />
              <span className={styles.navLabel}>{t(labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>

      <MagazineSidebarRecents onNavigate={onNavigate} />

      <div className={styles.railFoot}>
        <Link to={routes.feed} className={styles.backToPlatform} onClick={onNavigate}>
          <FiArrowLeft aria-hidden />
          <span>{t("magazine:deskShell.backToPlatform")}</span>
        </Link>
        <Button
          variant="primary"
          size="sm"
          to={`${routes.magazineEditor}?write=new`}
          onClick={onNavigate}
        >
          <FiEdit3 aria-hidden /> {t("magazine:deskShell.writePiece")}
        </Button>
        <span className={styles.kbdHint}>
          <span className={styles.kbd}>⌘K</span> {t("magazine:deskShell.kbdHintSuffix")}
        </span>
      </div>
    </aside>
  );
}
