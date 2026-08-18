import { Link } from "react-router-dom";
import {
  FiShield,
  FiTool,
  FiLayout,
  FiEdit3,
  FiDatabase,
  FiPlayCircle,
} from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import { isSandbox } from "../../sandbox/sandbox";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useMyCommunities } from "../../../features/communities/api/useMyCommunities";
import { useHasStaffRole } from "../../../features/auth/api/useMyStaffRoles";
import { routes, modPanel } from "../../../app/routeMap";
import {
  DEMO_MOD_SLUG,
  type TeamRole,
} from "../../../features/admin/adminRole";
import type { NavMode } from "../../../app/providers/navModeContext";
import styles from "./AccountMenu.module.css";

/**
 * The role-gated entries in the account menu. `role` is the real `useAuth().role`
 * in live mode (simulated only in demo), so the admin/mod links appear exactly to
 * the people the route gate and the backend RolesGuard will actually let through —
 * previously every member saw them and every one of them bounced to the homepage.
 *
 * The magazine-editor and magazine-writer links are gated separately on their
 * `magazine_editor`/`magazine_writer` staff-role *capabilities*
 * (`useHasStaffRole`), not on `role`, since granting either capability to a
 * non-admin member (via `AdminMembersService.grantStaffRole`) already gives
 * them backend access and passes the matching authGate — the menu just needs
 * to surface a link to it. Admins remain covered because `useHasStaffRole`
 * treats them as a superset, and demo mode grants every staff role so the
 * sandbox stays explorable.
 */
export function RoleLinks({
  role,
  onNavigate,
}: {
  role: TeamRole;
  onNavigate: () => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const memberships = useMyCommunities();
  const canEditMagazine = useHasStaffRole("magazine_editor");
  const canWriteForMagazine = useHasStaffRole("magazine_writer");
  // The community the "Mod tools" link opens. Demo deep-links into the mock
  // flagship; live resolves the moderator's OWN first owned/moderated community
  // from their real memberships (previously hardcoded to the demo slug, which
  // 404'd — or worse, PATCHed the demo community — for a real moderator).
  const liveModSlug = Object.keys(memberships).find(
    (communitySlug) =>
      memberships[communitySlug]!.role === "owner" ||
      memberships[communitySlug]!.role === "mod",
  );
  const modSlug = demoMode ? DEMO_MOD_SLUG : liveModSlug;
  const magazineEditorLink = canEditMagazine ? (
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
  ) : null;
  const magazineWriterLink = canWriteForMagazine ? (
    <Link
      to={routes.magazineWriter}
      className={styles.item}
      onClick={onNavigate}
    >
      <FiEdit3 aria-hidden className={styles.itemIcon} />
      <span className={styles.itemLabel}>
        {t("shared:accountMenu.staff.magazineWriter")}
      </span>
    </Link>
  ) : null;
  if (role === "admin") {
    return (
      <>
        {magazineEditorLink}
        {magazineWriterLink}
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
    // No owned/moderated community resolved (live) → nothing to moderate, so
    // don't surface a link that dead-ends. The magazine-editor/writer links
    // (if any) are independent of this and still render.
    if (!modSlug) {
      return (
        <>
          {magazineEditorLink}
          {magazineWriterLink}
        </>
      );
    }
    return (
      <>
        {magazineEditorLink}
        {magazineWriterLink}
        <Link
          to={modPanel(modSlug)}
          className={styles.item}
          onClick={onNavigate}
        >
          <FiTool aria-hidden className={styles.itemIcon} />
          <span className={styles.itemLabel}>
            {t("shared:accountMenu.mod.modTools")}
          </span>
        </Link>
      </>
    );
  }
  return (
    <>
      {magazineEditorLink}
      {magazineWriterLink}
    </>
  );
}

/** Controls at the foot of the menu: the demo data toggle, the navigation-layout
 * switch, and — in demo mode only — the simulated team role switch. */
export function AccountMenuControls({
  demoMode,
  available,
  toggle,
  role,
  setRole,
  canSwitch,
  navMode,
  setNavMode,
  showNavModeSwitch = true,
  onNavigate,
}: {
  demoMode: boolean;
  available: boolean;
  toggle: () => void;
  role: TeamRole;
  setRole: (role: TeamRole) => void;
  canSwitch: boolean;
  navMode: NavMode;
  setNavMode: (mode: NavMode) => void;
  /** Hide the navigation-layout (mega/sidebar) switch — not applicable in
   * contexts (e.g. a mobile account sheet) that don't have that choice. */
  showNavModeSwitch?: boolean;
  /** Closes the menu/sheet after the dev-only "Flow simulations" link
   * navigates. Optional since only the Link needs it, unlike the buttons
   * below which never leave the page. */
  onNavigate?: () => void;
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
      {/* Dev-only entry point into the /simulations sandbox (see
          features/simulations/routes.tsx, which is itself a no-op in
          production): sits next to the demo-data toggle above since both are
          maintainer/dev tooling, not member-facing account settings.
          Hidden with !isSandbox() so a sandbox instance (itself a full app
          instance running inside another simulation's iframe) cannot open
          this link and recurse into /simulations from within itself. */}
      {import.meta.env.DEV && !isSandbox() && (
        <Link to={routes.simulations} className={styles.item} onClick={onNavigate}>
          <FiPlayCircle aria-hidden className={styles.itemIcon} />
          <span className={styles.itemLabel}>
            {t("simulations:home.title")}
          </span>
        </Link>
      )}
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
      {showNavModeSwitch && (
        <>
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
                className={[
                  styles.roleBtn,
                  navMode === m && styles.roleBtnActive,
                ]
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
      )}
    </>
  );
}
