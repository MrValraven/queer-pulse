import { Link, NavLink, useLocation } from "react-router-dom";
import { Tooltip } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RailLink } from "./studioShell.data";
import styles from "./studio.module.css";

export function railClass({ isActive }: { isActive: boolean }) {
  return [styles.railItem, isActive && styles.railItemOn]
    .filter(Boolean)
    .join(" ");
}

function isInSection(item: RailLink, pathname: string): boolean {
  return (item.sectionPaths ?? []).some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/** The rail's main nav rows. Folded to the icon strip, each row's label
 *  fades and its icon carries a tooltip; the wrapper stays mounted either
 *  way, so the row keeps focus and its transitions as the rail folds. A
 *  page of a row's section (Browse under Search) lights the row and reads
 *  as the current section. */
export function RailGroup({
  items,
  isCollapsed = false,
}: {
  items: RailLink[];
  isCollapsed?: boolean;
}) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  return (
    <>
      {items.map((item) => {
        const Icon = item.icon;
        const label = t(item.labelKey);
        return (
          <Tooltip
            key={`${item.label}-${item.to}`}
            label={label}
            placement="right"
            isDisabled={!isCollapsed}
          >
            {isInSection(item, pathname) ? (
              <Link
                to={item.to}
                aria-current="true"
                className={railClass({ isActive: true })}
              >
                {Icon && <Icon className={styles.railIcon} aria-hidden />}
                <span className={`${styles.nm} ${styles.railFade}`}>
                  {label}
                </span>
              </Link>
            ) : (
              <NavLink to={item.to} end={item.end} className={railClass}>
                {Icon && <Icon className={styles.railIcon} aria-hidden />}
                <span className={`${styles.nm} ${styles.railFade}`}>
                  {label}
                </span>
              </NavLink>
            )}
          </Tooltip>
        );
      })}
    </>
  );
}
