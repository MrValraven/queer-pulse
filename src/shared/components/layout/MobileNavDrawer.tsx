import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { m, useDragControls, type PanInfo } from "motion/react";
import { Button } from "../ui";
import { useScrollLock } from "../../hooks";
import { useAuth } from "../../../app/providers/authContext";
import { useNavDrawer } from "../../../app/providers/navDrawerContext";
import { useMotionPrefs } from "../../../app/providers/MotionProvider";
import { routes } from "../../../app/routeMap";
import { useTranslation } from "../../i18n/useTranslation";
import { MegaNavDrawer } from "./MegaNavDrawer";
import { useNavDrawerFocus } from "./useNavDrawerFocus";
import styles from "./MobileNavDrawer.module.css";

/** Downward drag distance past which release commits to closing, px. */
const DISMISS_DISTANCE = 120;
/** A fast downward flick commits even short of the distance threshold.
 * motion's PanInfo.velocity is px/s (the type declaration's px/ms comment is
 * stale — the runtime computes distance/seconds); 500px/s is a brisk flick,
 * secondary to the DISMISS_DISTANCE check above. */
const DISMISS_VELOCITY = 500;

/**
 * The mobile navigation drawer, extracted from Navbar so that both the
 * hamburger and the installed-mode "More" tab can open the same panel. Open
 * state (and Back-gesture handling) lives in NavDrawerProvider; focus capture,
 * the Tab trap and Escape live in useNavDrawerFocus.
 *
 * Every link inside navigates with `replace` and reports its close through
 * `closeSheetForNavigation`, so the history entry the drawer pushed for the
 * Back gesture is overwritten by the destination rather than left behind as a
 * dead Back press. See NavDrawerProvider for the full rationale.
 */
export function MobileNavDrawer() {
  const { activeSheet, closeSheet, closeSheetForNavigation } = useNavDrawer();
  const { loggedIn } = useAuth();
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const panelRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Drag is armed only from the grabber (see its onPointerDown below), never
  // from the panel itself — the panel is the sheet's own scroll container
  // (see .panel's overflow-y in the CSS module), so a generic drag listener
  // there would fight a user scrolling the link list. dragListener={false} on
  // the panel means motion never attaches that generic listener at all.
  const armSheetDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      dragControls.start(event);
    },
    [dragControls, reducedMotion],
  );

  const onPanelDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const pastThreshold =
        info.offset.y > DISMISS_DISTANCE || info.velocity.y > DISMISS_VELOCITY;
      if (pastThreshold) closeSheet();
      // Otherwise: no close call, so motion's dragConstraints spring the
      // panel back to y:0 — the sheet can never be left half-dismissed.
    },
    [closeSheet],
  );

  // Conditional, unlike the self-contained modals CLAUDE.md describes: those are
  // only mounted while open, so they can lock unconditionally. This drawer is
  // mounted for the whole session and early-returns null when closed, so an
  // unconditional lock would freeze page scroll permanently — and the hook
  // cannot move below the early return without breaking the rules of hooks.
  useScrollLock(activeSheet === "browse");
  useNavDrawerFocus({
    isOpen: activeSheet === "browse",
    panelRef,
    onClose: closeSheet,
  });

  if (activeSheet !== "browse") return null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeSheet();
      }}
    >
      <m.div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav:menu")}
        tabIndex={-1}
        drag={reducedMotion ? false : "y"}
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        dragMomentum={false}
        onDragEnd={onPanelDragEnd}
      >
        {/* Drag-to-dismiss handle: arms the panel's drag (above) from a
            pointerdown here, not from the panel at large, so the sheet's own
            scrollable content is never hijacked mid-scroll. aria-hidden
            because it is a supplementary gesture surface, not a discrete
            control — the always-present Close button below (plus
            backdrop-click / Esc / Back) is the real, keyboard-reachable
            equivalent, and stays fully functional under reduced motion, where
            the grabber's pointerdown handler no-ops and drag is disabled. */}
        <div
          className={styles.grabberZone}
          aria-hidden
          onPointerDown={armSheetDrag}
        >
          <div className={styles.grabber} />
        </div>
        <button
          type="button"
          className={styles.closeButton}
          aria-label={t("nav:closeMenu")}
          onClick={closeSheet}
        >
          <FiX />
        </button>
        <MegaNavDrawer onNavigate={closeSheetForNavigation} />
        <Link
          to={routes.search}
          replace
          className={styles.link}
          onClick={closeSheetForNavigation}
        >
          {t("nav:searchShort")}
        </Link>
        {!loggedIn && (
          <>
            <Link
              to={routes.signIn}
              replace
              className={styles.link}
              onClick={closeSheetForNavigation}
            >
              {t("nav:signIn")}
            </Link>
            <Button
              to={routes.requestInvite}
              replace
              className={styles.cta}
              onClick={closeSheetForNavigation}
            >
              {t("nav:requestInvite")}
            </Button>
          </>
        )}
      </m.div>
    </div>
  );
}
