import { useCallback, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "../../i18n/useTranslation";
import { useLocalStorage, useMediaQuery, useScrollLock } from "../../hooks";
import { mediaMax } from "../../theme/breakpoints";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar, type AdminCrumb } from "./AdminTopbar";
import { MAIN_CONTENT_ID, SkipToContentLink } from "./SkipToContentLink";
import { useAdminTopbarHeight } from "./useAdminTopbarHeight";
import { useNavDrawerFocus } from "./useNavDrawerFocus";
import styles from "./AdminShell.module.css";

export { ADMIN_NAV } from "./adminNav.data";

/** id linking the topbar hamburger (`aria-controls`) to the off-canvas panel. */
const SIDEBAR_DRAWER_ID = "admin-sidebar-drawer";

/** Mirrors the CSS `@media (max-width: 900px)` where the sidebar goes off-canvas. */
const MOBILE_QUERY = mediaMax("wide");

/** Whether the desktop rail is showing icons only. Persisted, because an admin
 * who has traded rail width for table width means it for the whole session. */
const RAIL_COLLAPSED_KEY = "qp.adminNav.collapsed";

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function AdminShell({
  children,
  title,
  breadcrumb = [],
  isFullBleed = false,
}: {
  children: ReactNode;
  title: ReactNode;
  breadcrumb?: AdminCrumb[];
  /** Drop the console's 1240px reading measure for this surface. Reserved for
   * screens that genuinely need the width (a side-by-side editor); everything
   * else keeps the measure. */
  isFullBleed?: boolean;
}) {
  const { t } = useTranslation();

  // Below the mobile breakpoint the sidebar is a slide-in off-canvas panel; on
  // desktop it stays a static rail (the panel wrapper is `display: contents`),
  // so the drawer machinery only engages while `isMobile`.
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [isRailCollapsed, setIsRailCollapsed] = useLocalStorage<boolean>(
    RAIL_COLLAPSED_KEY,
    false,
    isBoolean,
  );
  // The off-canvas drawer is always full width: there is nothing to reclaim by
  // narrowing a panel that is already covering the page.
  const isCollapsed = !isMobile && isRailCollapsed;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerPanelRef = useRef<HTMLDivElement>(null);
  const isDrawerActive = isMobile && isDrawerOpen;
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  // Sticky page chrome reads `--admin-topbar-h` to stop under the bar.
  const { shellRef, topbarRef } = useAdminTopbarHeight();

  // Growing past the breakpoint reveals the static rail, so any open state is
  // dropped, and no stale off-canvas panel is left behind the desktop layout.
  // Enforced during render, outside any effect: the invariant "the
  // drawer can only be open on mobile" is derived purely from render-available
  // state, and correcting it here avoids painting the stale open state for one
  // frame first. `isDrawerOpen` is false on the next render, so this
  // terminates.
  if (!isMobile && isDrawerOpen) {
    setIsDrawerOpen(false);
  }

  // Lock page scroll and trap focus only while the drawer is genuinely open on
  // mobile. `useNavDrawerFocus` (shared with MobileNavDrawer) captures the
  // trigger, traps Tab inside the panel, closes on Escape, and restores focus
  // to the hamburger on close.
  useScrollLock(isDrawerActive);
  useNavDrawerFocus({
    isOpen: isDrawerActive,
    panelRef: drawerPanelRef,
    onClose: closeDrawer,
  });

  // Dialog semantics belong to the panel only when it is acting as the mobile
  // off-canvas drawer. The static desktop rail carries none.
  const drawerDialogProps = isMobile
    ? {
        role: "dialog" as const,
        "aria-modal": true,
        "aria-label": t("nav:menu"),
        tabIndex: -1,
      }
    : {};

  return (
    <div
      ref={shellRef}
      className={[styles.shell, isCollapsed && styles.shellCollapsed]
        .filter(Boolean)
        .join(" ")}
    >
      <SkipToContentLink />
      {isDrawerActive && (
        <div
          className={styles.scrim}
          role="presentation"
          onClick={closeDrawer}
        />
      )}

      <div
        id={SIDEBAR_DRAWER_ID}
        ref={drawerPanelRef}
        className={[styles.sidebarDock, isDrawerOpen && styles.sidebarDockOpen]
          .filter(Boolean)
          .join(" ")}
        // When collapsed off-canvas on mobile, take the panel out of the tab
        // order and hide it from assistive tech; on desktop it is the live rail.
        inert={isMobile && !isDrawerOpen}
        {...drawerDialogProps}
      >
        <AdminSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={
            isMobile
              ? undefined
              : () => setIsRailCollapsed((collapsed) => !collapsed)
          }
          onClose={isMobile ? closeDrawer : undefined}
          onNavigate={closeDrawer}
        />
      </div>

      <div className={styles.main}>
        <AdminTopbar
          barRef={topbarRef}
          title={title}
          breadcrumb={breadcrumb}
          isMobile={isMobile}
          drawerId={SIDEBAR_DRAWER_ID}
          isDrawerOpen={isDrawerOpen}
          onToggleDrawer={() => setIsDrawerOpen((open) => !open)}
        />

        {/* Same landmark contract as every member shell: the shared
            MAIN_CONTENT_ID that <SkipToContentLink> targets, `tabIndex={-1}`
            so that fragment jump (and RouteAnnouncer's post-navigation focus
            move) actually lands focus here, and `data-page-main` so the app's
            one page landmark is findable, which is also what the drawer's
            focus-restore fallback in useNavDrawerFocus looks for. Like
            MagazineDeskShell, this shell renders its own left rail in the
            floating Navbar's stead, so `data-shell="rail"` opts out of the chrome
            offsets `data-page-main` otherwise carries (base.css's `--nav-band`
            padding, nav-mode.css's rail indent, standalone.css's mobile
            app-bar margin and tab-bar padding). */}
        <main
          id={MAIN_CONTENT_ID}
          tabIndex={-1}
          data-page-main
          data-shell="rail"
          className={[styles.content, isFullBleed && styles.contentFullBleed]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
