import type { PitchTab } from "./pitchTracker.data";
import styles from "./PitchTrackerPage.module.css";

export function PitchTabs({
  tabs,
  active,
  counts,
  onChange,
}: {
  tabs: PitchTab[];
  active: string;
  counts: Record<string, number>;
  onChange: (key: string) => void;
}) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Pitch status">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          className={[styles.tab, active === tab.key && styles.tabActive]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(tab.key)}
        >
          {tab.label} <span className={styles.tabCount}>{counts[tab.key]}</span>
        </button>
      ))}
    </div>
  );
}
