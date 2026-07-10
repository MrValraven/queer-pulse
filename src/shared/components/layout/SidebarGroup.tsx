import { useId, type CSSProperties } from "react";
import { NavLink } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import type { MegaMenu } from "./navMenus";
import { linkToPath } from "../../../app/routeMap";
import styles from "./Sidebar.module.css";

/**
 * Per-row entrance stagger, capped so deep groups don't lag their last rows in.
 * Consumed by the `sbRowIn` animation in Sidebar.module.css via `calc(--i * …)`.
 */
const staggerVar = (index: number): CSSProperties =>
  ({ "--i": Math.min(index, 8) }) as CSSProperties;

/**
 * One nav group in the left rail. Expanded: an accordion button revealing its
 * column heads + links. Collapsed (icon rail): an icon button whose links
 * appear in a hover/focus flyout to the right.
 *
 * The expanded/collapsed accordion state is controlled by the parent `Sidebar`
 * (via `open`/`onToggle`) so a single "Collapse all" control can close every
 * group at once.
 */
export function SidebarGroup({
  menu,
  collapsed,
  open,
  onToggle,
  onNavigate,
}: {
  menu: MegaMenu;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const panelId = useId();
  const Icon = menu.icon;

  // A single entrance cascade runs across every row (subheads + links) in the
  // panel, so the children stream in top-to-bottom when the group opens.
  let row = 0;
  const links = (
    <div className={styles.groupLinks}>
      {menu.columns.map((col) => (
        <div key={col.head} className={styles.groupCol}>
          <div className={styles.groupSubhead} style={staggerVar(row++)}>
            {col.head}
          </div>
          {col.links.map((link) => (
            <NavLink
              key={link.label}
              to={linkToPath(link.href)}
              onClick={onNavigate}
              style={staggerVar(row++)}
              className={({ isActive }) =>
                [styles.link, isActive && styles.linkActive]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      ))}
    </div>
  );

  if (collapsed) {
    return (
      <div className={styles.groupCollapsed}>
        <button
          type="button"
          className={styles.groupBtn}
          aria-label={menu.key}
          aria-haspopup="true"
        >
          {Icon ? <Icon aria-hidden className={styles.groupIcon} /> : null}
        </button>
        <div className={styles.flyout} role="region" aria-label={menu.key}>
          <div className={styles.flyoutHead}>{menu.key}</div>
          {links}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.group}>
      <button
        type="button"
        className={styles.groupBtn}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        {Icon ? <Icon aria-hidden className={styles.groupIcon} /> : null}
        <span className={styles.groupLabel}>{menu.key}</span>
        <FiChevronDown
          className={[styles.chevron, open && styles.chevronOpen]
            .filter(Boolean)
            .join(" ")}
          aria-hidden
        />
      </button>
      <div
        id={panelId}
        className={[styles.groupPanel, open && styles.groupPanelOpen]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.groupPanelInner}>{links}</div>
      </div>
    </div>
  );
}
