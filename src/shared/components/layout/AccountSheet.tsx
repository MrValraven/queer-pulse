import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { FiX, FiLogOut, FiMoon, FiSun } from "react-icons/fi";
import {
  AnimatePresence,
  m,
  useDragControls,
  type PanInfo,
} from "motion/react";
import { Avatar, useScrimDismiss } from "../ui";
import { useInstallPrompt, useScrollLock } from "../../hooks";
import { useAuth } from "../../../app/providers/authContext";
import { useTheme } from "../../../app/providers/themeContext";
import { useNavDrawer } from "../../../app/providers/navDrawerContext";
import { useMotionPrefs } from "../../../app/providers/motionPrefs";
import {
  useNavMode,
  type NavMode,
} from "../../../app/providers/navModeContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useDisplayMode } from "../../../app/providers/displayModeContext";
import { useTeamRole, type TeamRole } from "../../../features/admin/adminRole";
import { routes } from "../../../app/routeMap";
import { isComingSoonLink } from "../../../app/authGate";
import { useTranslation } from "../../i18n/useTranslation";
import {
  ACCOUNT_GROUPS,
  HEADER_ACTIONS,
  INSTALL_APP_ACTION,
} from "./accountMenu.data";
import { useAccountIdentity } from "./useAccountIdentity";
import { QuickExitMenuItem } from "../../../features/safety/QuickExit";
import { useHasRoleLinks } from "./useHasRoleLinks";
import {
  RoleLinks,
  AccountMenuControls,
  AccountLanguageRow,
  AccountItemLabel,
} from "./accountMenuShared";
import { usePersonaBadge } from "./usePersonaBadge";
import { useGettingStartedBadge } from "../../../features/onboarding/useGettingStartedBadge";
import { useInviteQuotaBadge } from "./useInviteQuotaBadge";
import {
  useCommunityOwnershipOfferBadge,
  useOwnershipOfferRowHref,
} from "../../../features/communities/useCommunityOwnershipOfferBadge";
import { useAccountRowVisibility } from "./useAccountRowVisibility";
import { useNavDrawerFocus } from "./useNavDrawerFocus";
import { InstallAppModal } from "../system/InstallAppModal";
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
  const { canInstall, requestInstall } = useInstallPrompt();
  const { key: locationKey } = useLocation();
  const isSheetOpen = activeSheet === "account";
  // Lives here, in the component that stays mounted while the sheet is closed
  // (Navbar mounts it under the mobile breakpoint), because the sheet closes
  // as the install row is tapped. Held in the sheet's body, this state
  // unmounted with it in that same render, so the modal never appeared and
  // the tap looked like it did nothing.
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // The modal belongs to the page it opened over. A Back gesture that
  // navigates while it is up (Android) closes it, so it never floats over the
  // next page. Keyed on the router's location key, as Navbar's sheet close is:
  // popping the sheet's own history entry leaves the key unchanged.
  const previousLocationKeyRef = useRef(locationKey);
  useEffect(() => {
    if (previousLocationKeyRef.current === locationKey) return;
    previousLocationKeyRef.current = locationKey;
    setIsInstallModalOpen(false);
  }, [locationKey]);

  // One tap to the browser's own install dialog where Chrome has offered one;
  // the step-by-step modal everywhere else (iOS, in-app browsers, Chrome before
  // it fires `beforeinstallprompt`). `closeSheet` pops the sheet's history
  // entry with `history.back()`: opening a dialog is no navigation, so nothing
  // else consumed it.
  // Native path: `requestInstall` runs first, inside this click, which keeps
  // the user activation the dialog needs. The sheet stays open behind the
  // dialog and closes once it settles, so the history pop can never land
  // while the native dialog is up. A "failed" outcome (the dialog never
  // opened) falls through to the manual steps, so the tap always ends
  // somewhere. Modal path: the sheet closes first, then the modal opens.
  const openInstallApp = useCallback(() => {
    async function startInstall() {
      const outcome = canInstall ? await requestInstall() : "failed";
      closeSheet();
      if (outcome === "failed") setIsInstallModalOpen(true);
    }
    void startInstall();
  }, [closeSheet, canInstall, requestInstall]);

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

  // Conditional lock: this sheet stays mounted while closed and renders no
  // panel then, so an unconditional lock would freeze page scroll for as long
  // as it is mounted.
  useScrollLock(isSheetOpen);
  useNavDrawerFocus({
    isOpen: isSheetOpen,
    panelRef,
    onClose: closeSheet,
  });

  // Backdrop dismiss that ignores a click whose press started inside the panel
  // (a text-selection drag released past the edge) — see `useScrimDismiss`.
  const scrimProps = useScrimDismiss(closeSheet);

  // Rendered whether or not the sheet is open: the install row closes the
  // sheet in the same tap that opens this modal. AnimatePresence lets the
  // modal play its exit (see useModalExit), and the single return below keeps
  // it at one position in the tree so that exit is never cut short.
  const installModal = (
    <AnimatePresence>
      {isInstallModalOpen && (
        <InstallAppModal onClose={() => setIsInstallModalOpen(false)} />
      )}
    </AnimatePresence>
  );

  return (
    <>
      {isSheetOpen && (
        <div className={styles.overlay} role="presentation" {...scrimProps}>
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
              onInstallApp={openInstallApp}
              onSignOut={signOut}
            />
          </m.div>
        </div>
      )}
      {installModal}
    </>
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
  onInstallApp,
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
  /** Closes the sheet and starts the install (see AccountSheet). */
  onInstallApp: () => void;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();
  const personaBadge = usePersonaBadge();
  const gettingStartedBadge = useGettingStartedBadge();
  const inviteQuotaBadge = useInviteQuotaBadge();
  const communityOfferBadge = useCommunityOwnershipOfferBadge();
  const communityOfferRowHref = useOwnershipOfferRowHref();
  // Same per-row badge map the desktop `AccountMenuPanel` builds, kept in step
  // with it: live counts can't sit in the static ACCOUNT_GROUPS array.
  const badgeByRoute: Record<string, ReactNode> = {
    [routes.subprofilesDashboard]: personaBadge,
    [routes.gettingStarted]: gettingStartedBadge,
    [routes.invite]: inviteQuotaBadge,
    // PRD-514: ownership offers waiting on this member's answer.
    [routes.communities]: communityOfferBadge,
  };
  // While offers wait, that row leads to the invitations page listing them.
  const hrefByRoute: Record<string, string | undefined> = {
    [routes.communities]: communityOfferRowHref,
  };
  const { isInstalled } = useDisplayMode();
  const isAccountRowVisible = useAccountRowVisibility(); // liveOnly, earlyAccess
  const hasRoleLinks = useHasRoleLinks(role);
  const { theme, toggleTheme } = useTheme();
  const themeLabel = t(
    theme === "dark"
      ? "shared:accountMenu.items.lightMode"
      : "shared:accountMenu.items.darkMode",
  );
  return (
    <>
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
            .filter(isAccountRowVisible)
            .filter(
              (item) => item.action !== INSTALL_APP_ACTION || !isInstalled,
            )
            .filter((item) => !item.to || !isComingSoonLink(item.to)),
        )
          .filter((group) => group.length > 0)
          .map((group, groupIndex) => (
            <div key={group[0]?.to ?? group[0]?.action ?? groupIndex}>
              {groupIndex > 0 && <div className={menu.divider} />}
              {group.map((item) => {
                const ItemIcon = item.icon;
                const badge =
                  item.badge ?? (item.to ? badgeByRoute[item.to] : undefined);
                if (item.action === INSTALL_APP_ACTION) {
                  return (
                    <button
                      key={item.action}
                      type="button"
                      className={`${menu.item} ${styles.row}`}
                      onClick={onInstallApp}
                    >
                      <ItemIcon aria-hidden className={menu.itemIcon} />
                      <span className={menu.itemLabel}>{t(item.labelKey)}</span>
                    </button>
                  );
                }
                return (
                  <Link
                    key={item.to}
                    to={hrefByRoute[item.to] ?? item.to}
                    replace
                    className={`${menu.item} ${styles.row}`}
                    onClick={onNavigate}
                  >
                    <ItemIcon aria-hidden className={menu.itemIcon} />
                    <AccountItemLabel
                      labelKey={item.labelKey}
                      hintKey={item.hintKey}
                    />
                    {badge && <span className={menu.badgeSlot}>{badge}</span>}
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
        {/* The theme switch rides with Saved/Settings here for the same reason
            it does in the desktop AccountMenu: signed in, the top bar hands the
            setting to the account surface. Stays put — it toggles in place
            rather than navigating, so it never closes the sheet. */}
        <button
          type="button"
          className={`${menu.item} ${menu.itemButton} ${styles.row}`}
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <FiSun aria-hidden className={menu.itemIcon} />
          ) : (
            <FiMoon aria-hidden className={menu.itemIcon} />
          )}
          <span className={menu.itemLabel}>{themeLabel}</span>
        </button>
        {/* Language rides directly with the theme switch: both are display
            preferences the member sets in place, and neither closes the sheet. */}
        <AccountLanguageRow />

        {hasRoleLinks && (
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
      </div>
      {/* Pinned under the scroll region, as in the desktop menu's footer, so
          Quick Exit is one tap away however long the sheet runs. */}
      <div className={styles.leaveFooter}>
        <AccountSheetLeaveRows onNavigate={onNavigate} onSignOut={onSignOut} />
      </div>
    </>
  );
}

/** The sheet's last two rows: Quick Exit (the same action as the safety
 * pages' button) and Sign out. Split out to keep {@link AccountSheetBody}
 * under the repo's 200-line limit. */
function AccountSheetLeaveRows({
  onNavigate,
  onSignOut,
}: {
  onNavigate: () => void;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <QuickExitMenuItem
        className={`${menu.item} ${menu.itemButton} ${styles.row}`}
        iconClassName={menu.itemIcon}
        labelClassName={menu.itemLabel}
      />
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
    </>
  );
}
