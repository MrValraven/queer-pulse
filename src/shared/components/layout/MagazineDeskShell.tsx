import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { useToast } from "../feedback/useToast";
import { useTranslation } from "../../i18n/useTranslation";
import { useMediaQuery, useScrollLock } from "../../hooks";
import { mediaMax } from "../../theme/breakpoints";
import { routes } from "../../../app/routeMap";
import { usePieces } from "../../../features/magazine/api/usePieces";
import { CommandPalette } from "../../../features/magazine/desk/CommandPalette";
import { DeskNotifications } from "../../../features/magazine/desk/DeskNotifications";
import { MagazineSidebar } from "./MagazineSidebar";
import { useNavDrawerFocus } from "./useNavDrawerFocus";
import { SkipToContentLink, MAIN_CONTENT_ID } from "./SkipToContentLink";
import { MagazineShellOverlayContext } from "./magazineShellOverlay";
import styles from "./MagazineDeskShell.module.css";

const SIDEBAR_DRAWER_ID = "magazine-sidebar-drawer";

/** Mirrors the CSS `@media (max-width: 900px)` where the rail goes off-canvas
 *  — same cutover `AdminShell` uses for its own sidebar. */
const MOBILE_QUERY = mediaMax("wide");

/**
 * The magazine editor's own chrome — a left rail (Desk/Pitches/Issue) in
 * place of the community meganav — mirroring `AdminShell`. It deliberately
 * does NOT call `useRegisterShellFrame`: that hook is how a page tells
 * `AppChrome` a standard frame is on screen, which is what makes the meganav
 * render. Skipping it here is the entire mechanism that drops the meganav on
 * every editor surface, exactly like `AdminShell`.
 *
 * Also hoists the two globals every editor surface shares: the ⌘K command
 * palette and the "Since Friday" notifications panel (both used to live only
 * on `EditorDashboardPage`) — see `useMagazineShellOverlay` for how pages
 * with their own single-key shortcuts coordinate with these overlays.
 */
export function MagazineDeskShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerPanelRef = useRef<HTMLDivElement>(null);
  const isDrawerActive = isMobile && isDrawerOpen;
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  useEffect(() => {
    if (!isMobile) setIsDrawerOpen(false);
  }, [isMobile]);

  useScrollLock(isDrawerActive);
  useNavDrawerFocus({ isOpen: isDrawerActive, panelRef: drawerPanelRef, onClose: closeDrawer });

  const drawerDialogProps = isMobile
    ? {
        role: "dialog" as const,
        "aria-modal": true,
        "aria-label": t("nav:menu"),
        tabIndex: -1,
      }
    : {};

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  // Dual-mode piece list, shared by the palette's search and the rail's
  // "Open now" recents — react-query dedupes both callers onto one request.
  const { pieces } = usePieces();

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsPaletteOpen((current) => !current);
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const paletteItems = useMemo(
    () => pieces.map((piece) => ({ id: piece.id, title: piece.title, format: piece.format })),
    [pieces],
  );

  const overlayState = useMemo(
    () => ({ isPaletteOpen, isNotificationsOpen }),
    [isPaletteOpen, isNotificationsOpen],
  );

  return (
    <MagazineShellOverlayContext.Provider value={overlayState}>
      <div className={styles.app}>
        {isDrawerActive && (
          <div className={styles.scrim} role="presentation" onClick={closeDrawer} />
        )}

        <div
          id={SIDEBAR_DRAWER_ID}
          ref={drawerPanelRef}
          className={[styles.sidebarDock, isDrawerOpen && styles.sidebarDockOpen]
            .filter(Boolean)
            .join(" ")}
          inert={isMobile && !isDrawerOpen}
          {...drawerDialogProps}
        >
          <MagazineSidebar
            onNavigate={closeDrawer}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />
        </div>

        <div className={styles.main}>
          {isMobile && (
            <div className={styles.mobileBar}>
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
            </div>
          )}

          <SkipToContentLink />
          <main id={MAIN_CONTENT_ID} tabIndex={-1} data-page-main className={styles.content}>
            {children}
          </main>
        </div>
      </div>

      <CommandPalette
        open={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        pieces={paletteItems}
        onSelectPiece={(id) => void navigate(routes.magazinePiece.replace(":id", id))}
        onGoDesk={() => void navigate(routes.magazineEditor)}
        onNewPiece={() => void navigate(`${routes.magazineEditor}?commission=new`)}
      />
      <DeskNotifications
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigate={(route) =>
          route
            ? void navigate(route)
            : showToast(t("magazine:desk.page.notificationsNotWired"), "info")
        }
      />
    </MagazineShellOverlayContext.Provider>
  );
}
