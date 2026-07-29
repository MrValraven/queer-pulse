import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiTool,
  FiLayout,
  FiLogOut,
  FiDatabase,
  FiChevronDown,
} from "react-icons/fi";
import { Avatar, Tooltip } from "../ui";
import { useAuth } from "../../../app/providers/authContext";
import {
  useNavMode,
  type NavMode,
} from "../../../app/providers/navModeContext";
import { routes, modPanel } from "../../../app/routeMap";
import {
  useTeamRole,
  DEMO_MOD_SLUG,
  type TeamRole,
} from "../../../features/admin/adminRole";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { currentUser, fullName } from "../../../features/members/data/members";
import { useTranslation } from "../../i18n/useTranslation";
import { initialsFromName } from "../../lib/initials";
import { ACCOUNT_GROUPS, HEADER_ACTIONS } from "./accountMenu.data";
import styles from "./AccountMenu.module.css";

/** Profile chip in the logged-in nav that opens a menu: profile, settings, sign out. */
export function AccountMenu({
  name: nameProp,
  initials: initialsProp,
  photo: photoProp,
  placement = "default",
}: {
  name?: string;
  initials?: string;
  photo?: string;
  /**
   * "default" opens the menu down-left from a top-right navbar chip. "rail"
   * flips it to open upward and left-aligned, for the bottom of the left
   * sidebar where a downward/right-anchored menu would run off-screen.
   */
  placement?: "default" | "rail";
}) {
  const { signOut, user } = useAuth();
  const { demoMode, available, toggle } = useDemoMode();
  // Prefer the live/demo signed-in user, then props. The mock persona
  // ("Tiago") is a DEMO fixture — only fall back to it in demo mode, never in
  // live, where a missing profile falls back to the account email instead so
  // the demo identity can't leak into a real session.
  const profile = user?.profile;
  const profileName = profile
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : undefined;
  const name =
    nameProp ??
    profileName ??
    (demoMode ? fullName(currentUser) : (user?.email ?? ""));
  const photo =
    photoProp ??
    profile?.avatarUrl ??
    (demoMode ? currentUser.photo : undefined);
  const initials =
    initialsProp ??
    (profile
      ? initialsFromName(name)
      : demoMode
        ? currentUser.initials
        : initialsFromName(name));
  const { role, setRole, canSwitch } = useTeamRole();
  const { navMode, setNavMode } = useNavMode();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      // Escape closes and restores focus to the trigger.
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.wrap} ref={ref}>
      {placement === "rail" ? (
        // Identity opens the menu on the left; a single round chevron control
        // sits on the right and also opens the menu.
        <div className={styles.railTrigger}>
          <button
            ref={triggerRef}
            type="button"
            className={styles.railMain}
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
          >
            <Avatar
              initials={initials}
              src={photo ?? undefined}
              alt={name}
              tint="coral"
              size={30}
            />
            <span className={styles.railName}>{name.split(" ")[0]}</span>
          </button>
          <div className={styles.railCluster}>
            <button
              type="button"
              className={styles.railMini}
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={t("shared:accountMenu.ariaLabel")}
            >
              <FiChevronDown
                aria-hidden
                className={[styles.railChevIcon, open && styles.railChevOpen]
                  .filter(Boolean)
                  .join(" ")}
              />
            </button>
          </div>
        </div>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          className={styles.trigger}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <Avatar
            initials={initials}
            src={photo ?? undefined}
            alt={name}
            tint="coral"
            size={28}
          />
          <span className={styles.name}>{name.split(" ")[0]}</span>
          <FiChevronDown
            aria-hidden
            className={[styles.chevron, open && styles.chevronOpen]
              .filter(Boolean)
              .join(" ")}
          />
        </button>
      )}

      {open && (
        <AccountMenuPanel
          name={name}
          photo={photo ?? undefined}
          initials={initials}
          placement={placement}
          role={role}
          setRole={setRole}
          canSwitch={canSwitch}
          navMode={navMode}
          setNavMode={setNavMode}
          demoMode={demoMode}
          available={available}
          toggle={toggle}
          onClose={() => setOpen(false)}
          onSignOut={signOut}
        />
      )}
    </div>
  );
}

/** The open dropdown panel for {@link AccountMenu}: header, scrollable link
 * groups, and the sign-out footer. Split out to keep AccountMenu itself under
 * the repo's 200-line-per-component limit. */
function AccountMenuPanel({
  name,
  photo,
  initials,
  placement,
  role,
  setRole,
  canSwitch,
  navMode,
  setNavMode,
  demoMode,
  available,
  toggle,
  onClose,
  onSignOut,
}: {
  name: string;
  photo?: string;
  initials: string;
  placement: "default" | "rail";
  role: TeamRole;
  setRole: (role: TeamRole) => void;
  canSwitch: boolean;
  navMode: NavMode;
  setNavMode: (mode: NavMode) => void;
  demoMode: boolean;
  available: boolean;
  toggle: () => void;
  onClose: () => void;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={[styles.menu, placement === "rail" && styles.menuRail]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.header}>
        <Avatar
          initials={initials}
          src={photo ?? undefined}
          alt={name}
          tint="coral"
          size={36}
        />
        <div className={styles.headerText}>
          <div className={styles.headerName}>{name}</div>
          <div className={styles.headerMeta}>
            {t("shared:accountMenu.header.subtitle")}
          </div>
        </div>
        <div className={styles.headerActions}>
          {HEADER_ACTIONS.map((action) => {
            const ActionIcon = action.icon;
            const actionLabel = t(action.labelKey);
            return (
              <Tooltip key={action.to} label={actionLabel}>
                <Link
                  to={action.to}
                  className={styles.headerIcon}
                  aria-label={actionLabel}
                  onClick={onClose}
                >
                  <ActionIcon aria-hidden />
                </Link>
              </Tooltip>
            );
          })}
        </div>
      </div>

      <div className={styles.scroll}>
        {ACCOUNT_GROUPS.map((group, groupIndex) => (
          <div key={group[0]?.to ?? groupIndex}>
            {groupIndex > 0 && <div className={styles.divider} />}
            <div className={styles.grid}>
              {group.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={styles.item}
                    onClick={onClose}
                  >
                    <Icon aria-hidden className={styles.itemIcon} />
                    <span className={styles.itemLabel}>
                      {t(item.labelKey)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        {role !== "member" && (
          <>
            <div className={styles.divider} />
            <div className={styles.grid}>
              <RoleLinks role={role} onNavigate={onClose} />
            </div>
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
        />
      </div>

      <div className={styles.footer}>
        <Link
          to={routes.homepage}
          className={`${styles.item} ${styles.signOut}`}
          onClick={() => {
            onSignOut();
            onClose();
          }}
        >
          <FiLogOut aria-hidden className={styles.itemIcon} />
          <span className={styles.itemLabel}>{t("nav:signOut")}</span>
        </Link>
      </div>
    </div>
  );
}

/**
 * The role-gated entries in the account menu. `role` is the real `useAuth().role`
 * in live mode (simulated only in demo), so these links now appear exactly to the
 * people the route gate and the backend RolesGuard will actually let through —
 * previously every member saw them and every one of them bounced to the homepage.
 */
function RoleLinks({
  role,
  onNavigate,
}: {
  role: TeamRole;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  if (role === "admin") {
    return (
      <>
        <Link
          to={routes.magazineEditor}
          className={styles.item}
          onClick={onNavigate}
        >
          <FiLayout aria-hidden className={styles.itemIcon} />
          <span className={styles.itemLabel}>
            {t("shared:accountMenu.staff.magazineEditor")}
          </span>
        </Link>
        <Link
          to={routes.admin}
          className={styles.item}
          onClick={onNavigate}
        >
          <FiShield aria-hidden className={styles.itemIcon} />
          <span className={styles.itemLabel}>
            {t("shared:accountMenu.staff.admin")}
          </span>
        </Link>
      </>
    );
  }
  if (role === "moderator") {
    return (
      <Link
        to={modPanel(DEMO_MOD_SLUG)}
        className={styles.item}
        onClick={onNavigate}
      >
        <FiTool aria-hidden className={styles.itemIcon} />
        <span className={styles.itemLabel}>
          {t("shared:accountMenu.mod.modTools")}
        </span>
      </Link>
    );
  }
  return null;
}

/** Controls at the foot of the menu: the demo data toggle, the navigation-layout
 * switch, and — in demo mode only — the simulated team role switch. */
function AccountMenuControls({
  demoMode,
  available,
  toggle,
  role,
  setRole,
  canSwitch,
  navMode,
  setNavMode,
}: {
  demoMode: boolean;
  available: boolean;
  toggle: () => void;
  role: TeamRole;
  setRole: (role: TeamRole) => void;
  canSwitch: boolean;
  navMode: NavMode;
  setNavMode: (mode: NavMode) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.divider} />
      <button
        type="button"
        aria-pressed={demoMode}
        className={styles.populate}
        disabled={!available}
        onClick={() => toggle()}
      >
        <FiDatabase aria-hidden className={styles.itemIcon} />
        <span className={styles.itemLabel}>
          {t("shared:accountMenu.controls.populatePlatform")}
        </span>
        <span
          className={[styles.populateState, demoMode && styles.populateOn]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        >
          {available
            ? demoMode
              ? t("shared:accountMenu.controls.on")
              : t("shared:accountMenu.controls.off")
            : t("shared:accountMenu.controls.noApi")}
        </span>
      </button>
      {/* Demo-only: in live mode the team role is the real `useAuth().role`,
          which the backend RolesGuard enforces — nothing to switch. */}
      {canSwitch && (
        <>
          <div className={styles.divider} />
          <div className={styles.roleLabel}>
            {t("shared:accountMenu.controls.actingAs")}
          </div>
          <div
            className={styles.roleSwitch}
            role="group"
            aria-label={t("shared:accountMenu.controls.simulatedRoleAria")}
          >
            {(["admin", "moderator", "member"] as const).map((r) => (
              <button
                key={r}
                type="button"
                className={[styles.roleBtn, role === r && styles.roleBtnActive]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setRole(r)}
              >
                {r === "admin"
                  ? t("shared:accountMenu.controls.roleStaff")
                  : r === "moderator"
                    ? t("shared:accountMenu.controls.roleMod")
                    : t("shared:accountMenu.controls.roleMember")}
              </button>
            ))}
          </div>
        </>
      )}
      <div className={styles.divider} />
      <div className={styles.roleLabel}>
        {t("shared:accountMenu.controls.navigation")}
      </div>
      <div
        className={styles.roleSwitch}
        role="group"
        aria-label={t("shared:accountMenu.controls.navigationLayoutAria")}
      >
        {(["mega", "sidebar"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={[styles.roleBtn, navMode === m && styles.roleBtnActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setNavMode(m)}
          >
            {m === "mega"
              ? t("shared:accountMenu.controls.navTopBar")
              : t("shared:accountMenu.controls.navSidebar")}
          </button>
        ))}
      </div>
    </>
  );
}
