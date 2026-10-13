import { NavLink } from "react-router-dom";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { RailLink } from "./studioShell.data";
import styles from "./studio.module.css";

export function railClass({ isActive }: { isActive: boolean }) {
  return [styles.railItem, isActive && styles.railItemOn]
    .filter(Boolean)
    .join(" ");
}

export function RailGroup({ items }: { items: RailLink[] }) {
  const { t } = useTranslation();
  return (
    <>
      {items.map((item) => (
        <NavLink
          key={`${item.label}-${item.to}`}
          to={item.to}
          end={item.end}
          className={railClass}
        >
          <span className={styles.nm}>{t(item.labelKey)}</span>
        </NavLink>
      ))}
    </>
  );
}
