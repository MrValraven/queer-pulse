import { NavLink } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
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

/** One destination in the admin rail. Shared by the loose Overview link and by
 * every item inside a collapsible section. */
export function AdminNavLink({
  item,
  count,
  onNavigate,
}: {
  item: AdminNavItem;
  count: number;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const { labelKey, to, icon: Icon, end, tone } = item;

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [styles.navItem, isActive && styles.navItemActive]
          .filter(Boolean)
          .join(" ")
      }
    >
      <Icon aria-hidden />
      <span className={styles.navLabel}>{t(labelKey)}</span>
      {count > 0 && (
        <span
          className={[
            styles.navCount,
            tone === "alert" ? styles.navCountAlert : styles.navCountWarn,
          ].join(" ")}
        >
          {count}
        </span>
      )}
    </NavLink>
  );
}

/** A collapsible heading plus its links. While collapsed the heading carries the
 * sum of its children's pending counts, so closing a section can never hide a
 * queue that needs attention. */
export function AdminNavGroup({
  section,
  badgeCounts,
  isOpen,
  onToggle,
  onNavigate,
}: {
  section: AdminNavSection;
  badgeCounts: AdminNavBadgeCounts;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const { t } = useTranslation();
  const panelId = `admin-nav-${section.id}`;

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
    <div className={styles.navSection}>
      <button
        type="button"
        className={styles.navHead}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <FiChevronDown
          className={[
            styles.navHeadChevron,
            isOpen && styles.navHeadChevronOpen,
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        />
        <span className={styles.navHeadLabel}>{t(section.labelKey)}</span>
        {!isOpen && rolledUpCount > 0 && (
          <span
            className={[
              styles.navCount,
              hasAlert ? styles.navCountAlert : styles.navCountWarn,
            ].join(" ")}
          >
            {rolledUpCount}
            <span className="visuallyHidden">
              {" "}
              {t("shared:adminNav.pendingSuffix")}
            </span>
          </span>
        )}
      </button>

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
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
