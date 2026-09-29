import { Link, NavLink, useLocation } from "react-router-dom";
import { FiArrowLeft, FiEdit3 } from "react-icons/fi";
import { Button } from "../ui";
import { routes } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import { Translation } from "../../i18n/Translation";
import { useFormat } from "../../i18n/format";
import { useCurrentIssue } from "../../../features/magazine/api/useCurrentIssue";
import { countForFocus } from "../../../features/magazine/desk/deskFocus";
import { formattedCountValues } from "../../../features/magazine/desk/deskHeaderCopy";
import type { Piece } from "../../../features/magazine/data/desk.data";
import {
  MAGAZINE_NAV,
  MAGAZINE_ISSUE_FALLBACK_ROUTE,
} from "./magazineNav.data";
import { MagazineSidebarRecents } from "./MagazineSidebarRecents";
import { MagazineSidebarDeskCount } from "./MagazineSidebarDeskCount";
import { magazineWriteHref } from "./magazineWriteHref";
import styles from "./MagazineSidebar.module.css";

// `magazineNav.data.ts` belongs to another session and cannot grow a field to
// mark "this is the Desk item", so the waiting-on-you pill matches on the
// registry's own label key instead. `needsCurrentIssueNumber` already does
// the equivalent for "Issue" without a new field, for the same reason.
const DESK_NAV_LABEL_KEY = "magazine:deskShell.nav.desk";

export function MagazineSidebar({
  onNavigate,
  pieces,
  me,
}: {
  /** Called when a navigation link is activated: the mobile off-canvas
   * drawer passes its close handler so tapping a link dismisses the drawer.
   * Absent on desktop, where the rail is static and nothing needs closing. */
  onNavigate?: () => void;
  /** Every desk piece, dual-mode, for the "Desk" nav item's waiting-on-you
   *  count. `MagazineDeskShell` already fetches this once with `usePieces()`
   *  for the command palette and the "Open now" list, and shares it here. */
  pieces: Piece[];
  /** The viewer's editor id. See `MagazineDeskShell` for how it is resolved
   *  in demo vs live mode (the same rule `EditorDashboardPage` uses). */
  me: string;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const location = useLocation();
  // Dual-mode, honest-empty: `issue` is `null` before any issue exists in
  // live mode, in which case the eyebrow and the "Issue" nav destination
  // both fall back rather than fabricating a number/theme.
  const { issue } = useCurrentIssue();
  // The desk route (`/magazine/editor`) has its own scope menu in the header
  // (`DeskScopeMenu`) that already states "Issue {number} · {theme}" right
  // next to this eyebrow, so the two repeated the same fact side by side.
  // No other magazine route (Issue production, Archive, a single
  // piece) has that menu, so the eyebrow still earns its place there.
  const isDeskRoute = location.pathname === routes.magazineEditor;
  // Reuses the desk's own "your turn" focus predicate (`deskFocus.ts`) rather
  // than restating `wait === "you" && editorId === me`, so this count can
  // never drift from the chip it names.
  const yourTurnCount = countForFocus(pieces, me, "your-turn");

  return (
    <aside className={styles.rail}>
      <Link
        to={routes.magazineEditor}
        className={styles.brand}
        onClick={onNavigate}
      >
        <span className={styles.brandName}>
          <Translation
            i18nKey="shared:brand.wordmark"
            components={{ em: <em /> }}
          />
        </span>
        <span className={styles.brandDot} aria-hidden />
      </Link>

      {issue && !isDeskRoute && (
        <span className={styles.eyebrow}>
          {t("magazine:deskShell.issueEyebrow", {
            number: issue.number,
            theme: issue.theme,
          })}
        </span>
      )}

      <nav className={styles.nav} aria-label={t("magazine:deskShell.menuAria")}>
        {MAGAZINE_NAV.map(
          ({ labelKey, to, icon: Icon, end, needsCurrentIssueNumber }) => {
            const resolvedTo = needsCurrentIssueNumber
              ? issue
                ? to.replace(":number", issue.number)
                : MAGAZINE_ISSUE_FALLBACK_ROUTE
              : to;
            // `issue.closes` (not `closesOn`) is the desk's own "is there a
            // close date to show" check (`DeskPulseLine` reads the same
            // display string for its identical question).
            const hasCloseDate =
              needsCurrentIssueNumber && Boolean(issue?.closes);
            const hasYourTurnCount =
              labelKey === DESK_NAV_LABEL_KEY && yourTurnCount > 0;
            const navLink = (
              <NavLink
                key={labelKey}
                to={resolvedTo}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [styles.navItem, isActive && styles.navItemActive]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                <Icon aria-hidden />
                <span className={styles.navLabel}>{t(labelKey)}</span>
                {hasCloseDate && issue && (
                  <>
                    <span className={styles.issueDays} aria-hidden="true">
                      {t("magazine:deskShell.nav.daysToClose", {
                        days: format.number(issue.daysLeft),
                      })}
                    </span>
                    <span className="visuallyHidden">
                      {t(
                        "magazine:deskShell.nav.daysToCloseAria",
                        formattedCountValues(issue.daysLeft, format.number),
                      )}
                    </span>
                  </>
                )}
              </NavLink>
            );
            if (!hasYourTurnCount) return navLink;
            // The pill is its own link, so it sits beside the Desk link
            // (a link inside a link is invalid) in a row styled as one item.
            return (
              <div key={labelKey} className={styles.navRow}>
                {navLink}
                <MagazineSidebarDeskCount
                  count={yourTurnCount}
                  onNavigate={onNavigate}
                />
              </div>
            );
          },
        )}
      </nav>

      <MagazineSidebarRecents onNavigate={onNavigate} me={me} />

      <div className={styles.railFoot}>
        <Link
          to={routes.feed}
          className={styles.backToPlatform}
          onClick={onNavigate}
        >
          <FiArrowLeft aria-hidden />
          <span>{t("magazine:deskShell.backToPlatform")}</span>
        </Link>
        <Button
          variant="primary"
          size="sm"
          to={magazineWriteHref(location)}
          onClick={onNavigate}
        >
          <FiEdit3 aria-hidden /> {t("magazine:deskShell.writePiece")}
        </Button>
        <span className={styles.kbdHint}>
          <span className={styles.kbd}>⌘K</span>{" "}
          {t("magazine:deskShell.kbdHintSuffix")}
        </span>
      </div>
    </aside>
  );
}
