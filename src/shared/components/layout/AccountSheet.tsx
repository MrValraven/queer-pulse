import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { Link } from "react-router-dom";
import { FiX, FiLogOut } from "react-icons/fi";
import { m, useDragControls, type PanInfo } from "motion/react";
import { Avatar } from "../ui";
import { useScrollLock } from "../../hooks";
import { useAuth } from "../../../app/providers/authContext";
import { useNavDrawer } from "../../../app/providers/navDrawerContext";
import { useMotionPrefs } from "../../../app/providers/MotionProvider";
import { useNavMode, type NavMode } from "../../../app/providers/navModeContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTeamRole, type TeamRole } from "../../../features/admin/adminRole";
import { routes } from "../../../app/routeMap";
import { isComingSoonLink } from "../../../app/authGate";
import { useTranslation } from "../../i18n/useTranslation";
import { ACCOUNT_GROUPS, HEADER_ACTIONS } from "./accountMenu.data";
import { useAccountIdentity } from "./useAccountIdentity";
import { RoleLinks, AccountMenuControls } from "./accountMenuShared";
import { usePersonaBadge } from "./usePersonaBadge";
import { useGettingStartedBadge } from "../../../features/onboarding/useGettingStartedBadge";
import { useNavDrawerFocus } from "./useNavDrawerFocus";
import menu from "./AccountMenu.module.css";
import styles from "./AccountSheet.module.css";

/** Downward drag distance past which release commits to closing, px. */
const DISMISS_DISTANCE = 120;
/** A fast downward flick commits even short of the distance threshold; px/s.
 * See MobileNavDrawer for the note on motion's PanInfo.velocity units. */
const DISMISS_VELOCITY = 500;

/**
 * The mobile account bottom sheet, opened by the BottomTabBar "You" avatar tab.
 * It shares the two-sheet drawer provider ({@link useNavDrawer}) with the
 * "browse" MobileNavDrawer — this is the `"account"` sheet — so at most one is
 * ever open, and it reuses that sheet's mechanics (grabber drag-to-dismiss,
 * scroll-lock, focus trap, Escape/backdrop/Back dismissal via the shared
 * provider + useNavDrawerFocus). Its content mirrors the desktop AccountMenu:
 * identity header, grouped account links, Saved/Settings, role links, controls,
 * and Sign out. Every link navigates with `replace` and reports its close
 * through `closeSheetForNavigation` (see NavDrawerProvider for the rationale).
 */
export function AccountSheet() {
  const { activeSheet, closeSheet, closeSheetForNavigation } = useNavDrawer();
  const { signOut } = useAuth();
  const { name, photo, initials } = useAccountIdentity();
  const { role, setRole, canSwitch } = useTeamRole();
  const { navMode, setNavMode } = useNavMode();
  const { demoMode, available, toggle } = useDemoMode();
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const panelRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Drag is armed only from the grabber (see .grabberZone's onPointerDown),
  // never the panel itself — the panel is the sheet's scroll container, so a
  // generic drag listener there would fight a user scrolling the link list.
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
      // Otherwise motion's dragConstraints spring the panel back to y:0 — the
      // sheet can never be left half-dismissed.
    },
    [closeSheet],
  );

  // Conditional lock: this sheet is mounted for the whole session and
  // early-returns null when closed, so an unconditional lock would freeze page
  // scroll permanently (and the hook can't move below the early return).
  useScrollLock(activeSheet === "account");
  useNavDrawerFocus({
    isOpen: activeSheet === "account",
    panelRef,
    onClose: closeSheet,
  });

  if (activeSheet !== "account") return null;

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
        aria-label={t("shared:accountSheet.title")}
        tabIndex={-1}
        drag={reducedMotion ? false : "y"}
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        dragMomentum={false}
        onDragEnd={onPanelDragEnd}
      >
        {/* Supplementary gesture surface (aria-hidden); the always-present
            Close button below — plus backdrop/Esc/Back — is the real
            keyboard-reachable equivalent, and the only one under reduced
            motion, where this pointerdown handler no-ops. */}
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
        <AccountSheetBody
          name={name}
          photo={photo}
          initials={initials}
          role={role}
          setRole={setRole}
          canSwitch={canSwitch}
          navMode={navMode}
          setNavMode={setNavMode}
          demoMode={demoMode}
          available={available}
          toggle={toggle}
          onNavigate={closeSheetForNavigation}
          onSignOut={signOut}
        />
      </m.div>
    </div>
  );
}

/** The scrollable content of {@link AccountSheet}: identity header, grouped
 * links, Saved/Settings, role links, controls, and Sign out. Split out to keep
 * each component under the repo's 200-line limit. Rows reuse AccountMenu's row
 * primitives (`menu.*`) so they match the extracted RoleLinks/Controls exactly. */
function AccountSheetBody({
  name,
  photo,
  initials,
  role,
  setRole,
  canSwitch,
  navMode,
  setNavMode,
  demoMode,
  available,
  toggle,
  onNavigate,
  onSignOut,
}: {
  name: string;
  photo?: string;
  initials: string;
  role: TeamRole;
  setRole: (role: TeamRole) => void;
  canSwitch: boolean;
  navMode: NavMode;
  setNavMode: (mode: NavMode) => void;
  demoMode: boolean;
  available: boolean;
  toggle: () => void;
  onNavigate: () => void;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();
  const personaBadge = usePersonaBadge();
  const gettingStartedBadge = useGettingStartedBadge();
  return (
    <div className={menu.scroll}>
      <div className={styles.header}>
        <Avatar
          initials={initials}
          src={photo ?? undefined}
          alt={name}
          tint="coral"
          size={44}
        />
        <div className={styles.headerText}>
          <div className={styles.headerName}>{name}</div>
          <Link
            to={routes.accountProfile}
            replace
            className={styles.viewProfile}
            onClick={onNavigate}
          >
            {t("shared:accountSheet.viewProfile")}
          </Link>
        </div>
      </div>

      {ACCOUNT_GROUPS.map((group) =>
        group
          .filter((item) => item.to !== routes.accountProfile)
          .filter((item) => !item.liveOnly || !demoMode)
          .filter((item) => !isComingSoonLink(item.to)),
      )
        .filter((group) => group.length > 0)
        .map((group, groupIndex) => (
        <div key={group[0]?.to ?? groupIndex}>
          {groupIndex > 0 && <div className={menu.divider} />}
          {group.map((item) => {
              const ItemIcon = item.icon;
              const badge =
                item.badge ??
                (item.to === routes.subprofilesDashboard
                  ? personaBadge
                  : item.to === routes.gettingStarted
                    ? gettingStartedBadge
                    : undefined);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  replace
                  className={`${menu.item} ${styles.row}`}
                  onClick={onNavigate}
                >
                  <ItemIcon aria-hidden className={menu.itemIcon} />
                  <span className={menu.itemLabel}>{t(item.labelKey)}</span>
                  {badge && (
                    <span className={menu.badgeSlot}>{badge}</span>
                  )}
                </Link>
              );
            })}
        </div>
      ))}

      <div className={menu.divider} />
      {HEADER_ACTIONS.map((item) => {
        const ItemIcon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            replace
            className={`${menu.item} ${styles.row}`}
            onClick={onNavigate}
          >
            <ItemIcon aria-hidden className={menu.itemIcon} />
            <span className={menu.itemLabel}>{t(item.labelKey)}</span>
          </Link>
        );
      })}

      {role !== "member" && (
        <>
          <div className={menu.divider} />
          <RoleLinks role={role} onNavigate={onNavigate} />
        </>
      )}

      <AccountMenuControls
        demoMode={demoMode}
        available={available}
        toggle={toggle}
        role={role}
        setRole={setRole}
        canSwitch={canSwitch}
        navMode={navMode}
        setNavMode={setNavMode}
        showNavModeSwitch={false}
        onNavigate={onNavigate}
      />

      <div className={menu.divider} />
      <Link
        to={routes.homepage}
        replace
        className={`${menu.item} ${menu.signOut} ${styles.row}`}
        onClick={() => {
          onSignOut();
          onNavigate();
        }}
      >
        <FiLogOut aria-hidden className={menu.itemIcon} />
        <span className={menu.itemLabel}>{t("nav:signOut")}</span>
      </Link>
    </div>
  );
}
