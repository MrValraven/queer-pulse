import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FiShield,
  FiTool,
  FiUser,
  FiUserPlus,
  FiFileText,
  FiBriefcase,
  FiBookmark,
  FiRss,
  FiCalendar,
  FiMessageSquare,
  FiUsers,
  FiSettings,
  FiHelpCircle,
  FiHeart,
  FiLogOut,
  FiDatabase,
} from "react-icons/fi";
import { Avatar } from "../ui";
import { useAuth } from "../../../app/providers/authContext";
import { useNavMode } from "../../../app/providers/navModeContext";
import { routes, modPanel } from "../../../app/routeMap";
import { useAdminRole, DEMO_MOD_SLUG } from "../../../features/admin/adminRole";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { currentUser, fullName } from "../../../features/members/data/members";
import styles from "./AccountMenu.module.css";

type AccountItem = { label: string; to: string; icon: IconType };

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
    { label: "Profile", to: routes.accountProfile, icon: FiUser },
    { label: "Connections", to: routes.connections, icon: FiUserPlus },
  ],
  // Talking & belonging
  [
    { label: "Messages", to: routes.messages, icon: FiMessageSquare },
    { label: "Communities", to: routes.communitiesHome, icon: FiUsers },
  ],
  // Career
  [
    { label: "Applications", to: routes.applicationStatus, icon: FiFileText },
    { label: "Work", to: routes.work, icon: FiBriefcase },
  ],
  // Activity
  [
    { label: "Events", to: routes.myEvents, icon: FiCalendar },
    { label: "Feed", to: "/feed", icon: FiRss },
  ],
  // Your stuff / system
  [
    { label: "Saved", to: routes.collections, icon: FiBookmark },
    { label: "Membership", to: routes.sustainer, icon: FiHeart },
    { label: "Settings", to: routes.settings, icon: FiSettings },
    { label: "Help", to: routes.help, icon: FiHelpCircle },
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
  const { role, setRole } = useAdminRole();
  const { navMode, setNavMode } = useNavMode();
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
      <button
        type="button"
        className={[styles.trigger, placement === "rail" && styles.triggerRail]
          .filter(Boolean)
          .join(" ")}
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
              <div className={styles.headerMeta}>Profile &amp; account</div>
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
                    <span className={styles.itemLabel}>{item.label}</span>
                  </Link>
                );
              })}
              {role === "staff" && (
                <Link
                  to={routes.admin}
                  role="menuitem"
                  className={styles.item}
                  onClick={() => setOpen(false)}
                >
                  <FiShield aria-hidden className={styles.itemIcon} />
                  <span className={styles.itemLabel}>Admin</span>
                </Link>
              )}
              {role === "mod" && (
                <Link
                  to={modPanel(DEMO_MOD_SLUG)}
                  role="menuitem"
                  className={styles.item}
                  onClick={() => setOpen(false)}
                >
                  <FiTool aria-hidden className={styles.itemIcon} />
                  <span className={styles.itemLabel}>Mod tools</span>
                </Link>
              )}
            </div>
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
              <span className={styles.itemLabel}>Populate platform</span>
              <span
                className={[styles.populateState, demoMode && styles.populateOn]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden
              >
                {available ? (demoMode ? "On" : "Off") : "No API"}
              </span>
            </button>
            <div className={styles.divider} />
            <div className={styles.roleLabel}>Acting as</div>
            <div
              className={styles.roleSwitch}
              role="group"
              aria-label="Simulated team role"
            >
              {(["staff", "mod", "member"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={[
                    styles.roleBtn,
                    role === r && styles.roleBtnActive,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setRole(r)}
                >
                  {r === "staff" ? "Staff" : r === "mod" ? "Mod" : "Member"}
                </button>
              ))}
            </div>
            <div className={styles.divider} />
            <div className={styles.roleLabel}>Navigation</div>
            <div
              className={styles.roleSwitch}
              role="group"
              aria-label="Navigation layout"
            >
              {(["mega", "sidebar"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={[
                    styles.roleBtn,
                    navMode === m && styles.roleBtnActive,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setNavMode(m)}
                >
                  {m === "mega" ? "Top bar" : "Sidebar"}
                </button>
              ))}
            </div>
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
              <span className={styles.itemLabel}>Sign out</span>
            </Link>
          </div>
        </div>
      )}
    </div>
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
