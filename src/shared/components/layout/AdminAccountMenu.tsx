import { Link } from "react-router-dom";
import {
  FiChevronUp,
  FiLogOut,
  FiSettings,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { useAuth } from "../../../app/providers/authContext";
import { useTeamRole } from "../../../features/admin/adminRole";
import { useMyStaffRoles } from "../../../features/auth/api/useMyStaffRoles";
import { STAFF_ROLES } from "../../../features/admin/staffRoles.registry";
import { useTranslation } from "../../i18n/useTranslation";
import { Avatar } from "../ui";
import { useAccountIdentity } from "./useAccountIdentity";
import { useSidebarMenu } from "./useSidebarMenu";
import styles from "./AdminShell.module.css";

/**
 * The staff account control at the foot of the admin sidebar.
 *
 * It deliberately does NOT restate identity: `AdminRoleSwitcher` at the top of
 * the rail already shows role and scope. This one answers "which account am I
 * signed in as, and how do I leave" — the questions admin has no answer for
 * otherwise, since "Back to platform" keeps the session alive and the only real
 * sign-out lives three navigations away in the member account menu. On a shared
 * machine that gap is the reason this exists.
 *
 * Identity comes from `useAccountIdentity`, the demo-safe resolver: the mock
 * persona is only ever a demo fallback, never a stand-in for a live session.
 */
export function AdminAccountMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();
  const { role } = useTeamRole();
  const staffRoles = useMyStaffRoles();
  const { name, photo, initials } = useAccountIdentity();
  const { t } = useTranslation();
  const { open, toggle, close, wrapRef, menuRef, triggerRef, onMenuKeyDown } =
    useSidebarMenu();

  const isAdmin = role === "admin";
  // The tier labels are the role switcher's own, reused rather than restated:
  // two keys for one concept is how the rail's top and bottom start disagreeing.
  const tierLabel = isAdmin
    ? t("shared:adminRoleSwitcher.roleStaffAdmin")
    : role === "moderator"
      ? t("shared:adminRoleSwitcher.roleCommunityMod")
      : t("shared:adminSidebar.account.tierMember");
  // An admin holds every staff grant by definition (`useMyStaffRoles` mirrors
  // the backend's superset rule), so listing them would print the whole
  // catalogue back. Say so in one phrase instead. Everyone else gets the real
  // additive grants — the ones that decide which sidebar sections work, and
  // which the role chip at the top of the rail never shows.
  const grantLabels = isAdmin
    ? [t("shared:adminSidebar.account.allAreas")]
    : STAFF_ROLES.filter((staffRole) => staffRoles.includes(staffRole.id)).map(
        (staffRole) => t(staffRole.labelKey),
      );
  const accessLine = [tierLabel, ...grantLabels].join(" · ");

  const closeAfterNavigate = () => {
    close();
    onNavigate?.();
  };

  return (
    <div className={styles.meWrap} ref={wrapRef}>
      {open && (
        <div
          className={styles.meMenu}
          role="menu"
          tabIndex={-1}
          ref={menuRef}
          onKeyDown={onMenuKeyDown}
        >
          <div className={styles.meMenuAccess}>
            <span className={styles.meMenuAccessLabel}>
              {t("shared:adminSidebar.account.accessHeading")}
            </span>
            <span className={styles.meMenuAccessValue}>{accessLine}</span>
          </div>

          <Link
            to={routes.accountProfile}
            role="menuitem"
            tabIndex={-1}
            className={styles.meMenuItem}
            onClick={closeAfterNavigate}
          >
            <FiUser aria-hidden />
            <span>{t("shared:adminSidebar.account.profile")}</span>
          </Link>
          <Link
            to={routes.settings}
            role="menuitem"
            tabIndex={-1}
            className={styles.meMenuItem}
            onClick={closeAfterNavigate}
          >
            <FiSettings aria-hidden />
            <span>{t("shared:adminSidebar.account.settings")}</span>
          </Link>
          <Link
            to={routes.sessions}
            role="menuitem"
            tabIndex={-1}
            className={styles.meMenuItem}
            onClick={closeAfterNavigate}
          >
            <FiShield aria-hidden />
            <span>{t("shared:adminSidebar.account.sessions")}</span>
          </Link>

          <div className={styles.meMenuRule} />

          {/* A Link, not a button: signing out has to leave the admin console,
              which is gated — staying put would bounce through the auth gate. */}
          <Link
            to={routes.homepage}
            role="menuitem"
            tabIndex={-1}
            className={`${styles.meMenuItem} ${styles.meMenuSignOut}`}
            onClick={() => {
              signOut();
              closeAfterNavigate();
            }}
          >
            <FiLogOut aria-hidden />
            <span>{t("nav:signOut")}</span>
          </Link>
        </div>
      )}

      <button
        ref={triggerRef}
        type="button"
        className={styles.me}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {/* No `alt`/`name`: the visible name sits right beside it, so the image
            is decorative and Avatar falls back to alt="". */}
        <Avatar initials={initials} src={photo} tint="coral" size={32} />
        <span className={styles.meTx}>
          <span className={styles.meName}>{name}</span>
          {/* The account address, not the role: the role chip at the top of the
              rail already carries that, and "which of my accounts is this?" is
              the question a privileged console should answer at a glance. */}
          <span className={styles.meRole}>{user?.email}</span>
        </span>
        <FiChevronUp
          className={[styles.meGear, open && styles.meChevOpen]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        />
      </button>
    </div>
  );
}
