import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useMediaQuery } from "../../shared/hooks";
import { mediaMax } from "../../shared/theme/breakpoints";
import {
  MAIN_CONTENT_ID,
  SkipToContentLink,
} from "../../shared/components/layout/SkipToContentLink";
import { useAccountIdentity } from "../../shared/components/layout/useAccountIdentity";
import { StudioRail } from "./StudioRail";
import { StudioSidePanelColumn } from "./StudioSidePanelColumn";
import { StudioAccountMenu } from "./StudioAccountMenu";
import { StudioDemoLibrarySeed } from "./StudioDemoLibrarySeed";
import { StudioNotificationsBell } from "./StudioNotificationsBell";
import { StudioShellHistoryNav } from "./StudioShellHistoryNav";
import { StudioShellSearch } from "./StudioShellSearch";
import { StudioTabBar } from "./StudioTabBar";
import { SUSTAIN_PRICE } from "./studioShell.data";
import { useStudioDocumentTitle } from "./useStudioDocumentTitle";
import {
  StudioShellRailCollapsedContext,
  useStudioRailTransitionFlag,
} from "./useStudioRailCollapsed";
import { useStudioSearchShortcut } from "./useStudioSearchShortcut";
import { useStudioSearchShortcutFallback } from "./useStudioSearchShortcutFallback";
import { useStudioShowcase } from "./useStudioShowcase";
import { useStudioShellSidePanel } from "./useStudioShellSidePanel";
import { useStudioShellSignal } from "./useStudioShellSignal";
import {
  StudioPageWidthBucketContext,
  useStudioPageWidthBucket,
} from "./studioHeroLayout";
import styles from "./studio.module.css";

/**
 * The listener shell: the rail (folding to an icon strip on desktop), the
 * sticky topbar, the page tile holding the page's `<main>`, the docked side
 * panel and the phone tab bar. The topbar is a grid child of its own,
 * running across the page column and the docked panel column, so the bell
 * and avatar keep the top end corner. Above 880px the rail, the page and
 * the panel are separate rounded tiles on the Studio backdrop, and the
 * topbar sits on that backdrop above the page and panel tiles. It stays
 * outside `<main>`, so the skip link and the focus that RouteAnnouncer
 * moves to `#main-content` after every navigation land on the page itself.
 * Every Studio page names the tab "Studio · QueerPulse" through this shell
 * until the page sets its own title.
 */
export function StudioShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isShowcase = useStudioShowcase();
  const identity = useAccountIdentity();
  const isCompact = useMediaQuery(mediaMax(880));
  const { isDockedPlacement, dockedView, isRailCollapsed } =
    useStudioShellSidePanel(isCompact);
  const appRef = useRef<HTMLDivElement>(null);
  useStudioRailTransitionFlag(appRef);
  // The page column's width, so a detail hero's action row folds to icons
  // when the rail or the docked panel leaves it too little room.
  const pageRef = useRef<HTMLElement>(null);
  const pageWidthBucket = useStudioPageWidthBucket(pageRef);
  useStudioShellSignal();
  useStudioDocumentTitle();
  // "/" and Cmd/Ctrl+K at every width: the hook focuses a field on screen,
  // and the fallback (mounted after it, so it acts last) opens the search
  // page where the topbar has no field.
  useStudioSearchShortcut();
  useStudioSearchShortcutFallback();
  // Phones get the short action labels so the brand fits whole beside them;
  // the full wording stays the link's accessible name.
  const sustainLabel = t("studio:shell.sustainCta", {
    price: fmt.currency(SUSTAIN_PRICE),
  });
  // One menu, placed by width: on phones and tablets the avatar leads the
  // single-row topbar and opens a side sheet; wider, it ends the actions.
  const accountMenu = (
    <StudioAccountMenu
      triggerLabel={t("studio:shell.accountLabel", { name: identity.name })}
      isSheetOnCompact
    />
  );
  // Studio follows the app theme: its colours come from the theme-following
  // --studio-* tokens, so the shell and the shared components inside it
  // (buttons, avatars, empty states, selects) switch with the rest of the app.
  return (
    <div className={styles.root}>
      <SkipToContentLink />
      {/* Every Studio page mounts the shell, so the demo library fixture
          seeds on whichever page a visitor opens first. The leaf reads the
          saved store, so a save re-renders it alone. */}
      <StudioDemoLibrarySeed />
      <div
        ref={appRef}
        className={styles.app}
        data-rail-collapsed={(!isCompact && isRailCollapsed) || undefined}
        data-side-panel-open={dockedView !== null || undefined}
      >
        {/* The rail is hidden at this width anyway; leaving it unmounted
            spares phones its playlist queries. Its readers take the grid's
            fold, so its labels start folded with the grid. */}
        {!isCompact && (
          <StudioShellRailCollapsedContext.Provider value={isRailCollapsed}>
            <StudioRail />
          </StudioShellRailCollapsedContext.Provider>
        )}

        {/* The topbar spans the page and panel tracks (studio.module.css
            .topbar), so the docked panel opens under it. */}
        <header className={styles.topbar}>
          {isCompact && accountMenu}
          <StudioShellHistoryNav />
          {/* Search is a tab on phones and /studio/search has its own
              field, so the bar shows the brand there. */}
          {isCompact ? (
            // No pulse dot here: the avatar's attention dot sits beside
            // the brand, and one dot on the bar reads clearly.
            <Link to={routes.studio} className={styles.topBrand}>
              <span className={styles.topBrandWord}>
                <Translation
                  i18nKey="studio:brand.lockup"
                  components={{ em: <em /> }}
                />
              </span>
              <span className={styles.visuallyHidden}>
                {` ${t("studio:brand.studioLabel")}`}
              </span>
            </Link>
          ) : (
            <StudioShellSearch />
          )}
          <div className={styles.topRight}>
            {isShowcase && (
              <Link
                to={routes.cinemaMembership}
                className={styles.sustainPill}
                aria-label={isCompact ? sustainLabel : undefined}
              >
                {isCompact ? t("studio:shell.sustainShort") : sustainLabel}
              </Link>
            )}
            <StudioNotificationsBell />
            {!isCompact && accountMenu}
          </div>
        </header>

        {/* The page tile. Its head and foot marks hold the tile's rounded
            corners on screen while the document scrolls the page under the
            topbar and above the player bar (studio.module.css). */}
        <div className={styles.pageTile}>
          <div className={styles.pageTileHead} aria-hidden />
          <div className={styles.main}>
            <main
              ref={pageRef}
              id={MAIN_CONTENT_ID}
              tabIndex={-1}
              className={styles.content}
            >
              <StudioPageWidthBucketContext.Provider value={pageWidthBucket}>
                {children}
              </StudioPageWidthBucketContext.Provider>
            </main>
            <StudioTabBar />
          </div>
          <div className={styles.pageTileFoot} aria-hidden />
        </div>
        {/* Phones keep one grid track, so the column mounts from 1280px
            only. The floating card covers the widths in between. */}
        {isDockedPlacement && <StudioSidePanelColumn view={dockedView} />}
      </div>
    </div>
  );
}
