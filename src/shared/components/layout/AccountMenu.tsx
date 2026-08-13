import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiLogOut, FiChevronDown } from "react-icons/fi";
import { Avatar, Tooltip } from "../ui";
import { useAuth } from "../../../app/providers/authContext";
import {
  useNavMode,
  type NavMode,
} from "../../../app/providers/navModeContext";
import { routes } from "../../../app/routeMap";
import {
  useTeamRole,
  type TeamRole,
} from "../../../features/admin/adminRole";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../i18n/useTranslation";
import { ACCOUNT_GROUPS, HEADER_ACTIONS } from "./accountMenu.data";
import { useAccountIdentity } from "./useAccountIdentity";
import { RoleLinks, AccountMenuControls } from "./accountMenuShared";
import { usePersonaBadge } from "./usePersonaBadge";
import { useGettingStartedBadge } from "../../../features/onboarding/useGettingStartedBadge";
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
  const { signOut } = useAuth();
  const { demoMode, available, toggle } = useDemoMode();
  // Prefer the live/demo signed-in identity, then props.
  const identity = useAccountIdentity();
  const name = nameProp ?? identity.name;
  const photo = photoProp ?? identity.photo;
  const initials = initialsProp ?? identity.initials;
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
  const personaBadge = usePersonaBadge();
  const gettingStartedBadge = useGettingStartedBadge();
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
              {group
                .filter((item) => !item.liveOnly || !demoMode)
                .map((item) => {
                const Icon = item.icon;
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
                    className={styles.item}
                    onClick={onClose}
                  >
                    <Icon aria-hidden className={styles.itemIcon} />
                    <span className={styles.itemLabel}>
                      {t(item.labelKey)}
                    </span>
                    {badge && (
                      <span className={styles.badgeSlot}>{badge}</span>
                    )}
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
