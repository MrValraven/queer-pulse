import { useCallback, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiMoon, FiSun, FiBell, FiMenu } from "react-icons/fi";
import { useTheme } from "../../../app/providers/themeContext";
import { useToast } from "../feedback/useToast";
import { useTranslation } from "../../i18n/useTranslation";
import { useMediaQuery, useScrollLock } from "../../hooks";
import { mediaMax } from "../../theme/breakpoints";
import { AdminSidebar } from "./AdminSidebar";
import { useNavDrawerFocus } from "./useNavDrawerFocus";
import styles from "./AdminShell.module.css";

export { ADMIN_NAV } from "./adminNav.data";

/** id linking the topbar hamburger (`aria-controls`) to the off-canvas panel. */
const SIDEBAR_DRAWER_ID = "admin-sidebar-drawer";

/** Mirrors the CSS `@media (max-width: 900px)` where the sidebar goes off-canvas. */
const MOBILE_QUERY = mediaMax("wide");

interface Crumb {
  label: string;
  to?: string;
}

export function AdminShell({
  children,
  title,
  breadcrumb = [],
  searchPlaceholder,
}: {
  children: ReactNode;
  title: ReactNode;
  breadcrumb?: Crumb[];
  searchPlaceholder?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? t("shared:adminShell.searchPlaceholder");

  // Below the mobile breakpoint the sidebar is a slide-in off-canvas panel; on
  // desktop it stays a static rail (the panel wrapper is `display: contents`),
  // so the drawer machinery only engages while `isMobile`.
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerPanelRef = useRef<HTMLDivElement>(null);
  const isDrawerActive = isMobile && isDrawerOpen;
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  // Growing past the breakpoint reveals the static rail, so drop any open state
  // rather than leave a stale off-canvas panel behind the desktop layout.
  // Enforced during render (rather than in an effect): the invariant "the
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
  // off-canvas drawer — never on the static desktop rail.
  const drawerDialogProps = isMobile
    ? {
        role: "dialog" as const,
        "aria-modal": true,
        "aria-label": t("nav:menu"),
        tabIndex: -1,
      }
    : {};

  return (
    <div className={styles.shell}>
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
        <AdminSidebar onNavigate={closeDrawer} />
      </div>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.menuBtn}
            aria-label={isDrawerOpen ? t("nav:closeMenu") : t("nav:openMenu")}
            aria-expanded={isDrawerOpen}
            aria-controls={SIDEBAR_DRAWER_ID}
            onClick={() => setIsDrawerOpen((open) => !open)}
          >
            <FiMenu aria-hidden />
          </button>

          <div className={styles.crumb}>
            {breadcrumb.map((c) => (
              <span key={c.to ?? c.label} className={styles.crumbCrumb}>
                {c.to ? (
                  <Link to={c.to} className={styles.crumbLink}>
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
            <span className={styles.crumbTitle}>{title}</span>
          </div>

          <label className={styles.search}>
            <FiSearch aria-hidden />
            <input
              type="text"
              aria-label={resolvedSearchPlaceholder}
              placeholder={resolvedSearchPlaceholder}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  showToast(
                    t("shared:adminShell.toastSearchIllustrative"),
                    "info",
                  );
              }}
            />
          </label>

          <div className={styles.topRight}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={toggleTheme}
              title={t("shared:adminShell.toggleTheme")}
              aria-label={t("shared:adminShell.toggleTheme")}
            >
              {theme === "dark" ? (
                <FiSun aria-hidden />
              ) : (
                <FiMoon aria-hidden />
              )}
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() =>
                showToast(t("shared:adminShell.toastNoAlerts"), "info")
              }
              title={t("shared:adminShell.alerts")}
              aria-label={t("shared:adminShell.alerts")}
            >
              <span className={styles.iconDot} aria-hidden />
              <FiBell aria-hidden />
            </button>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
