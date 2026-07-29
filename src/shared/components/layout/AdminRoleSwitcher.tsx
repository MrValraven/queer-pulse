import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { useTeamRole } from "../../../features/admin/adminRole";
import { useAuth } from "../../../app/providers/authContext";
import { useToast } from "../feedback/useToast";
import { useTranslation } from "../../i18n/useTranslation";
import { modPanel } from "../../../app/routeMap";
import { STEWARDED, ADMIN_PROFILE } from "./adminNav.data";
import styles from "./AdminShell.module.css";

const COMMUNITY_SLUGS = ["trans-hub", "rainbow-arts"];

/** Avatar + role/scope lines — the switcher's trigger content, and the whole of
 *  what live mode renders (there's nothing to switch to). */
function RoleChip({
  initials,
  role,
  scope,
}: {
  initials: string;
  role: string;
  scope: string;
}) {
  return (
    <>
      <span className={styles.switchAv}>{initials}</span>
      <span className={styles.switchTx}>
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
export function AdminRoleSwitcher() {
  const { role, setRole, canSwitch } = useTeamRole();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isAdmin = role === "admin";
  const roleLabel = isAdmin
    ? t("shared:adminRoleSwitcher.roleStaffAdmin")
    : t("shared:adminRoleSwitcher.roleCommunityMod");
  const scopeLabel = isAdmin
    ? t("shared:adminRoleSwitcher.scopeAll")
    : t("shared:adminRoleSwitcher.scopeStewarded");

  // Live mode shows the signed-in member's own initials; demo keeps the fixture.
  const profile = user?.profile;
  const initials = profile
    ? `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase()
    : ADMIN_PROFILE.initials;

  if (!canSwitch) {
    return (
      <div className={styles.switch}>
        <div className={styles.switchBtn}>
          <RoleChip initials={initials} role={roleLabel} scope={scopeLabel} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.switch} ref={ref}>
      <button
        type="button"
        className={styles.switchBtn}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <RoleChip initials={initials} role={roleLabel} scope={scopeLabel} />
        <FiChevronDown
          className={[styles.switchChev, open && styles.switchChevOpen]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        />
      </button>

      {open && (
        <div className={styles.switchMenu} role="menu">
          <div className={styles.switchSep}>
            {t("shared:adminRoleSwitcher.yourRoles")}
          </div>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={isAdmin}
            className={[styles.switchOpt, isAdmin && styles.switchOptOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              setRole("admin");
              setOpen(false);
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
              className={styles.switchOpt}
              onClick={() => {
                setRole("moderator");
                setOpen(false);
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
