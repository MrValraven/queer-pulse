import type { TabId } from "./connections.data";
import styles from "./ConnectionsPage.module.css";

export type ConnectionsTab = {
  id: TabId;
  label: string;
  /** Omitted when no honest count is known yet — the badge is then not rendered. */
  count?: number;
  accent?: boolean;
};

export function ConnectionsTabs({
  tabs,
  active,
  onSelect,
}: {
  tabs: ConnectionsTab[];
  active: TabId;
  onSelect: (id: TabId) => void;
}) {
  return (
    <div className={styles.tabs}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={[styles.tab, active === t.id && styles.tabActive]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onSelect(t.id)}
        >
          {t.label}
          {t.count != null && (
            <span
              className={[styles.badge, t.accent && styles.badgeAccent]
                .filter(Boolean)
                .join(" ")}
            >
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
