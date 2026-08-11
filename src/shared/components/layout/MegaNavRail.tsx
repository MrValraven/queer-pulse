import { useTranslation } from "../../i18n/useTranslation";
import type { MegaMenu } from "./navMenus";
import styles from "./MegaNav.module.css";

/**
 * Left rail of the unified mega panel: all six sections as selectable buttons
 * (title + subtitle). Hover / focus / click switches the active section without
 * closing the panel — selection is purely visual, it never navigates.
 */
export function MegaNavRail({
  menus,
  activeKey,
  onSelect,
}: {
  menus: MegaMenu[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.rail}>
      {menus.map((menu) => {
        const active = menu.key === activeKey;
        return (
          <button
            key={menu.key}
            type="button"
            className={[styles.railItem, active && styles.railItemActive]
              .filter(Boolean)
              .join(" ")}
            aria-current={active ? "true" : undefined}
            onMouseEnter={() => onSelect(menu.key)}
            onFocus={() => onSelect(menu.key)}
            onClick={() => onSelect(menu.key)}
          >
            <span className={styles.railTitle}>{t(menu.titleKey)}</span>
            <span className={styles.railSubtitle}>{t(menu.subtitleKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
