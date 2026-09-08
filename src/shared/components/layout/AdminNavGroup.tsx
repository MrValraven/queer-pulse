import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import { Tooltip } from "../ui";
import type {
  AdminNavBadge,
  AdminNavItem,
  AdminNavSection,
} from "./adminNav.data";
import styles from "./AdminShell.module.css";

/** Live pending count per queue, resolved once in AdminSidebar and passed down. */
export type AdminNavBadgeCounts = Record<AdminNavBadge, number>;

function pendingCount(item: AdminNavItem, counts: AdminNavBadgeCounts): number {
  return item.badge ? counts[item.badge] : 0;
}

/** In the collapsed rail the name is gone from the surface, so it is carried by
 * a tooltip instead — every icon-only control in the rail goes through here. */
function RailLabel({
  label,
  isCollapsed,
  children,
}: {
  label: string;
  isCollapsed: boolean;
  children: ReactNode;
}) {
  if (!isCollapsed) return <>{children}</>;
  return (
    <Tooltip label={label} placement="right">
      {children}
    </Tooltip>
  );
}

/** A pending count, as a pill while the rail is wide and as a corner dot once it
 * is collapsed to icons. The number is spoken either way. */
function NavCount({
  count,
  isAlert,
  isCollapsed,
  suffix,
}: {
  count: number;
  isAlert: boolean;
  isCollapsed: boolean;
  suffix?: string;
}) {
  if (isCollapsed) {
    return (
      <span
        className={[
          styles.navDot,
          isAlert ? styles.navCountAlert : styles.navCountWarn,
        ].join(" ")}
      >
        <span className="visuallyHidden">
          {count}
          {suffix ? ` ${suffix}` : ""}
        </span>
      </span>
    );
  }
  return (
    <span
      className={[
        styles.navCount,
        isAlert ? styles.navCountAlert : styles.navCountWarn,
      ].join(" ")}
    >
      {count}
      {suffix && <span className="visuallyHidden"> {suffix}</span>}
    </span>
  );
}

/** One destination in the admin rail. Shared by the loose Overview link and by
 * every item inside a collapsible section. */
export function AdminNavLink({
  item,
  count,
  isCollapsed = false,
  onNavigate,
}: {
  item: AdminNavItem;
  count: number;
  /** Icon-only rail: the label moves into a tooltip and the pill becomes a dot. */
  isCollapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const { labelKey, to, icon: Icon, end, tone } = item;
  const label = t(labelKey);

  return (
    <RailLabel label={label} isCollapsed={isCollapsed}>
      <NavLink
        to={to}
        end={end}
        onClick={onNavigate}
        className={({ isActive }) =>
          [
            styles.navItem,
            isCollapsed && styles.navItemIcon,
            isActive && styles.navItemActive,
          ]
            .filter(Boolean)
            .join(" ")
        }
      >
        <Icon aria-hidden />
        <span className={isCollapsed ? "visuallyHidden" : styles.navLabel}>
          {label}
        </span>
        {count > 0 && (
          <NavCount
            count={count}
            isAlert={tone === "alert"}
            isCollapsed={isCollapsed}
          />
        )}
      </NavLink>
    </RailLabel>
  );
}

/** A collapsible heading plus its links. While collapsed the heading carries the
 * sum of its children's pending counts, so closing a section can never hide a
 * queue that needs attention. */
export function AdminNavGroup({
  section,
  badgeCounts,
  isOpen,
  isCollapsed = false,
  onToggle,
  onNavigate,
}: {
  section: AdminNavSection;
  badgeCounts: AdminNavBadgeCounts;
  isOpen: boolean;
  /** Icon-only rail: the heading is its mark alone, named by a tooltip. */
  isCollapsed?: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const panelId = `admin-nav-${section.id}`;
  const SectionIcon = section.icon;
  const sectionLabel = t(section.labelKey);

  const rolledUpCount = section.items.reduce(
    (total, item) => total + pendingCount(item, badgeCounts),
    0,
  );
  // One urgent child makes the whole rolled-up pill urgent; otherwise it reads
  // as waiting, matching the tone the items themselves would show.
  const hasAlert = section.items.some(
    (item) => item.tone === "alert" && pendingCount(item, badgeCounts) > 0,
  );

  return (
    <div
      className={[styles.navSection, isCollapsed && styles.navSectionIcon]
        .filter(Boolean)
        .join(" ")}
    >
      <RailLabel label={sectionLabel} isCollapsed={isCollapsed}>
        <button
          type="button"
          className={[styles.navHead, isCollapsed && styles.navHeadIcon]
            .filter(Boolean)
            .join(" ")}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        >
          {isCollapsed ? (
            <SectionIcon className={styles.navHeadIconMark} aria-hidden />
          ) : (
            <FiChevronDown
              className={[
                styles.navHeadChevron,
                isOpen && styles.navHeadChevronOpen,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-hidden
            />
          )}
          <span
            className={isCollapsed ? "visuallyHidden" : styles.navHeadLabel}
          >
            {sectionLabel}
          </span>
          {!isOpen && rolledUpCount > 0 && (
            <NavCount
              count={rolledUpCount}
              isAlert={hasAlert}
              isCollapsed={isCollapsed}
              suffix={t("shared:adminNav.pendingSuffix")}
            />
          )}
        </button>
      </RailLabel>

      {/* The panel stays mounted so it can animate; the closed class handles
          both the collapse and taking its links out of reach. */}
      <div
        id={panelId}
        className={[
          styles.navSectionItems,
          isOpen && styles.navSectionItemsOpen,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.navSectionLinks}>
          {section.items.map((item) => (
            <AdminNavLink
              key={item.to}
              item={item}
              count={pendingCount(item, badgeCounts)}
              isCollapsed={isCollapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
