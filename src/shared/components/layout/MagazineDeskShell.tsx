import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import { useMediaQuery, useScrollLock } from "../../hooks";
import { mediaMax } from "../../theme/breakpoints";
import { routes } from "../../../app/routeMap";
import { usePieces } from "../../../features/magazine/api/usePieces";
import { CommandPalette } from "../../../features/magazine/desk/CommandPalette";
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
 * Also hoists the one global every editor surface shares: the ⌘K command
 * palette (it used to live only on `EditorDashboardPage`) — see
 * `useMagazineShellOverlay` for how pages with their own single-key shortcuts
 * coordinate with it.
 */
export function MagazineDeskShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
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

  const overlayState = useMemo(() => ({ isPaletteOpen }), [isPaletteOpen]);

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
          <MagazineSidebar onNavigate={closeDrawer} />
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
          {/* `data-page-main` keeps this <main> reachable as the app's page landmark (skip
              link, nav-drawer focus fallback), but this shell renders NO floating
              Navbar/BottomTabBar — AppChrome only mounts those for a registered shell frame,
              and this shell deliberately registers none. So it opts out of the chrome offsets
              that attribute otherwise carries (base.css's `--nav-band` padding, nav-mode.css's
              rail indent, standalone.css's mobile app-bar margin + tab-bar padding) with
              `data-shell="rail"` — the same escape hatch `full-height` uses. */}
          <main
            id={MAIN_CONTENT_ID}
            tabIndex={-1}
            data-page-main
            data-shell="rail"
            className={styles.content}
          >
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
        onNewPiece={() => void navigate(`${routes.magazineEditor}?write=new`)}
      />
    </MagazineShellOverlayContext.Provider>
  );
}
