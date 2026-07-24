import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiShield,
  FiTool,
  FiUser,
  FiUserPlus,
  FiFileText,
  FiEdit3,
  FiSend,
  FiBriefcase,
  FiBookmark,
  FiLayers,
  FiRss,
  FiCalendar,
  FiUsers,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiDatabase,
  FiLayout,
  FiChevronDown,
} from "react-icons/fi";
import { Avatar } from "../ui";
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
import styles from "./AccountMenu.module.css";

type AccountItem = { labelKey: string; to: string; icon: IconType };

/**
 * The canonical account links, grouped by type. Each inner array is a cluster;
 * flattened in order they fill the desktop two-column grid row by row, so each
 * pair of consecutive items reads as a category (people, talking & belonging,
 * career, activity, your stuff / system). The mobile drawer in Navbar flattens
 * them via ACCOUNT_ITEMS, ignoring the icon. Labels are bare nouns (no
 * "My"/"Your" mix) — the menu is already scoped to "you" by the avatar header.
 */
export const ACCOUNT_GROUPS: AccountItem[][] = [
  // You / people
  [
    {
      labelKey: "shared:accountMenu.items.profile",
      to: routes.accountProfile,
      icon: FiUser,
    },
    {
      labelKey: "shared:accountMenu.items.connections",
      to: routes.connections,
      icon: FiUserPlus,
    },
  ],
  // Belonging — Messages now lives as a top-level nav icon (Navbar/SidebarFooter),
  // beside notifications, rather than as a link here.
  [{ labelKey: "nav:communities", to: routes.communitiesHome, icon: FiUsers }],
  // Career
  [
    {
      labelKey: "shared:accountMenu.items.applications",
      to: routes.applicationStatus,
      icon: FiFileText,
    },
    {
      labelKey: "shared:accountMenu.items.work",
      to: routes.work,
      icon: FiBriefcase,
    },
    {
      labelKey: "shared:accountMenu.items.subprofiles",
      to: routes.subprofilesDashboard,
      icon: FiLayers,
    },
  ],
  // Activity
  [
    {
      labelKey: "shared:accountMenu.items.events",
      to: routes.myEvents,
      icon: FiCalendar,
    },
    { labelKey: "shared:accountMenu.items.feed", to: "/feed", icon: FiRss },
  ],
  // Your stuff / system
  [
    {
      labelKey: "shared:accountMenu.items.drafts",
      to: routes.drafts,
      icon: FiEdit3,
    },
    {
      labelKey: "shared:accountMenu.items.pitches",
      to: routes.pitchTracker,
      icon: FiSend,
    },
    {
      labelKey: "shared:accountMenu.items.saved",
      to: routes.collections,
      icon: FiBookmark,
    },
    {
      labelKey: "shared:accountMenu.items.settings",
      to: routes.settings,
      icon: FiSettings,
    },
    {
      labelKey: "shared:accountMenu.items.help",
      to: routes.help,
      icon: FiHelpCircle,
    },
  ],
];

/** Flattened links for the mobile drawer and the desktop icon grid. */
export const ACCOUNT_ITEMS = ACCOUNT_GROUPS.flat();

/** Initials from a name, e.g. "Tiago Costa" -> "TC". */
function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

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
  // Prefer the live/demo signed-in user; fall back to props, then the mock.
  const profile = user?.profile;
  const name =
    nameProp ??
    (profile
      ? `${profile.firstName} ${profile.lastName}`.trim()
      : fullName(currentUser));
  const photo = photoProp ?? profile?.avatarUrl ?? currentUser.photo;
  const initials =
    initialsProp ?? (profile ? nameInitials(name) : currentUser.initials);
  const { demoMode, available, toggle } = useDemoMode();
  const { role, setRole, canSwitch } = useTeamRole();
  const { navMode, setNavMode } = useNavMode();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
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
        // "Balanced split": identity opens the menu on the left; a matching pair
        // of round controls (a Settings shortcut + the menu chevron) sits on the
        // right, so weight lands at both ends of the rail instead of a lone chip.
        <div className={styles.railTrigger}>
          <button
            type="button"
            className={styles.railMain}
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="menu"
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
            <Link
              to={routes.settings}
              className={styles.railMini}
              aria-label={t("shared:accountMenu.items.settings")}
              onClick={() => setOpen(false)}
            >
              <FiSettings aria-hidden />
            </Link>
            <button
              type="button"
              className={styles.railMini}
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="menu"
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
          type="button"
          className={styles.trigger}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="menu"
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
          <ChevronIcon open={open} />
        </button>
      )}

      {open && (
        <div
          className={[styles.menu, placement === "rail" && styles.menuRail]
            .filter(Boolean)
            .join(" ")}
          role="menu"
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
          </div>

          <div className={styles.scroll}>
            <div className={styles.grid}>
              {ACCOUNT_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    role="menuitem"
                    className={styles.item}
                    onClick={() => setOpen(false)}
                  >
                    <Icon aria-hidden className={styles.itemIcon} />
                    <span className={styles.itemLabel}>{t(item.labelKey)}</span>
                  </Link>
                );
              })}
              <RoleLinks role={role} onNavigate={() => setOpen(false)} />
            </div>
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
              to="/"
              role="menuitem"
              className={`${styles.item} ${styles.signOut}`}
              onClick={() => {
                signOut();
                setOpen(false);
              }}
            >
              <FiLogOut aria-hidden className={styles.itemIcon} />
              <span className={styles.itemLabel}>{t("nav:signOut")}</span>
            </Link>
          </div>
        </div>
      )}
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
          role="menuitem"
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
          role="menuitem"
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
        role="menuitem"
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
        role="menuitemcheckbox"
        aria-checked={demoMode}
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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={[styles.chevron, open && styles.chevronOpen]
        .filter(Boolean)
        .join(" ")}
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
