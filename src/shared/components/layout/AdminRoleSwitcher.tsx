import { useNavigate } from "react-router-dom";
import { FiChevronDown, FiUser } from "react-icons/fi";
import { useTeamRole } from "../../../features/admin/adminRole";
import { useToast } from "../feedback/useToast";
import { useTranslation } from "../../i18n/useTranslation";
import { modPanel } from "../../../app/routeMap";
import { Tooltip } from "../ui";
import { STEWARDED, ADMIN_PROFILE } from "./adminNav.data";
import { useAccountIdentity } from "./useAccountIdentity";
import { useSidebarMenu } from "./useSidebarMenu";
import styles from "./AdminShell.module.css";

const COMMUNITY_SLUGS = ["trans-hub", "rainbow-arts"];

/**
 * Avatar + role/scope lines: the switcher's trigger content, and the whole of
 * what live mode renders (there's nothing to switch to).
 *
 * `initials` is empty whenever the viewer's own mark can't be derived: live mode
 * with no resolved session, or a profile whose name parts are blank. That draws
 * a neutral person mark. It used to fall back to the DEMO persona's monogram,
 * which put a mock member's initials in a real admin's sidebar.
 */
function RoleChip({
  initials,
  role,
  scope,
  isCollapsed,
}: {
  initials: string;
  role: string;
  scope: string;
  /** Icon-only rail: the monogram alone, with role and scope moved into the
   * tooltip that names the chip. */
  isCollapsed: boolean;
}) {
  const { t } = useTranslation();
  return (
    <>
      {initials ? (
        <span className={styles.switchAv}>{initials}</span>
      ) : (
        <span
          className={`${styles.switchAv} ${styles.switchAvBlank}`}
          role="img"
          aria-label={t("shared:adminRoleSwitcher.avatarPlaceholderAria")}
        >
          <FiUser aria-hidden />
        </span>
      )}
      <span className={isCollapsed ? "visuallyHidden" : styles.switchTx}>
        <span className={styles.switchRole}>{role}</span>
        <span className={styles.switchScope}>{scope}</span>
      </span>
    </>
  );
}

/**
 * The identity chip at the top of the admin sidebar.
 *
 * In DEMO mode it doubles as the role switcher the prototype needs: act as
 * "Staff admin", or jump into one of the mock stewarded communities' mod panels.
 *
 * In LIVE mode the chip is static. The role it shows is the real `useAuth().role`
 * that the route gate and the backend RolesGuard enforce, so there is nothing a
 * click could change; and the menu's contents (`STEWARDED`, `COMMUNITY_SLUGS`)
 * are hardcoded fixtures with no relationship to the communities the signed-in
 * moderator actually stewards. Rendering it live would offer a real moderator a
 * list of communities they may have no standing in. The chip itself stays so the
 * sidebar header keeps its shape.
 */
export function AdminRoleSwitcher({
  isCollapsed = false,
}: {
  /** Icon-only rail: the chip shrinks to its monogram and the menu it opens
   * floats out to its own width rather than matching the 68px column. */
  isCollapsed?: boolean;
} = {}) {
  const { role, setRole, canSwitch } = useTeamRole();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { open, toggle, close, wrapRef, menuRef, triggerRef, onMenuKeyDown } =
    useSidebarMenu();

  const isAdmin = role === "admin";
  const roleLabel = isAdmin
    ? t("shared:adminRoleSwitcher.roleStaffAdmin")
    : t("shared:adminRoleSwitcher.roleCommunityMod");
  const scopeLabel = isAdmin
    ? t("shared:adminRoleSwitcher.scopeAll")
    : t("shared:adminRoleSwitcher.scopeStewarded");

  // Identity comes from `useAccountIdentity`, the demo-safe resolver the account
  // menu at the foot of this same rail already uses. It branches on demo mode
  // explicitly: the mock persona's monogram is a DEMO fixture and is returned
  // only in demo mode, so live mode gets the signed-in member's own mark or an
  // empty string, which RoleChip draws as a neutral person mark.
  const { initials } = useAccountIdentity();

  const chipLabel = `${roleLabel} \u00b7 ${scopeLabel}`;
  const chipClass = [styles.switchBtn, isCollapsed && styles.switchBtnIcon]
    .filter(Boolean)
    .join(" ");

  if (!canSwitch) {
    const chip = (
      <div className={chipClass}>
        <RoleChip
          initials={initials}
          role={roleLabel}
          scope={scopeLabel}
          isCollapsed={isCollapsed}
        />
      </div>
    );
    return (
      <div className={styles.switch}>
        {isCollapsed ? (
          <Tooltip label={chipLabel} placement="right">
            {chip}
          </Tooltip>
        ) : (
          chip
        )}
      </div>
    );
  }

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      className={chipClass}
      onClick={toggle}
      aria-haspopup="menu"
      aria-expanded={open}
    >
      <RoleChip
        initials={initials}
        role={roleLabel}
        scope={scopeLabel}
        isCollapsed={isCollapsed}
      />
      {!isCollapsed && (
        <FiChevronDown
          className={[styles.switchChev, open && styles.switchChevOpen]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        />
      )}
    </button>
  );

  return (
    <div className={styles.switch} ref={wrapRef}>
      {isCollapsed ? (
        <Tooltip label={chipLabel} placement="right">
          {trigger}
        </Tooltip>
      ) : (
        trigger
      )}

      {open && (
        <div
          className={[styles.switchMenu, isCollapsed && styles.switchMenuFloat]
            .filter(Boolean)
            .join(" ")}
          role="menu"
          tabIndex={-1}
          ref={menuRef}
          onKeyDown={onMenuKeyDown}
        >
          <div className={styles.switchSep}>
            {t("shared:adminRoleSwitcher.yourRoles")}
          </div>
          <button
            type="button"
            role="menuitemradio"
            tabIndex={-1}
            aria-checked={isAdmin}
            className={[styles.switchOpt, isAdmin && styles.switchOptOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              setRole("admin");
              close();
              showToast(t("shared:adminRoleSwitcher.toastNowStaff"), "info");
            }}
          >
            <span
              className={styles.switchOptAv}
              style={{
                background: "rgba(var(--accent-rgb),.2)",
                color: "var(--accent-soft)",
              }}
            >
              {/* Demo-only branch (`canSwitch` is true only in demo mode), so
                  the fixture persona's monogram is the right mark here. */}
              {ADMIN_PROFILE.initials}
            </span>
            <span>
              <span className={styles.switchOptName}>
                {t("shared:adminRoleSwitcher.roleStaffAdmin")}
              </span>
              <span className={styles.switchOptMeta}>
                {t("shared:adminRoleSwitcher.staffOversight")}
              </span>
            </span>
          </button>

          <div className={styles.switchSep}>
            {t("shared:adminRoleSwitcher.communitiesYouSteward")}
          </div>
          {STEWARDED.map((c, i) => (
            <button
              key={c.name}
              type="button"
              role="menuitem"
              tabIndex={-1}
              className={styles.switchOpt}
              onClick={() => {
                setRole("moderator");
                close();
                void navigate(modPanel(COMMUNITY_SLUGS[i] ?? ""));
              }}
            >
              <span
                className={styles.switchOptAv}
                style={{ background: c.tintBg, color: c.tintFg }}
              >
                {c.initials}
              </span>
              <span>
                <span className={styles.switchOptName}>{c.name}</span>
                <span className={styles.switchOptMeta}>{c.meta}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
