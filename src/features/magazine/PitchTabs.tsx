import { useTablistKeys } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
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
  const { t } = useTranslation();
  // APG tablist keys: Arrow/Home/End with a roving tabIndex.
  const { tabProps } = useTablistKeys(tabs.length, (index) => {
    const nextTab = tabs[index];
    if (nextTab) onChange(nextTab.key);
  });

  return (
    <div
      className={styles.tabs}
      role="tablist"
      aria-label={t("magazine:pitchTracker.tabs.ariaLabel")}
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          {...tabProps(index, active === tab.key)}
          className={[styles.tab, active === tab.key && styles.tabActive]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(tab.key)}
        >
          {t(tab.labelKey)}{" "}
          <span className={styles.tabCount}>{counts[tab.key]}</span>
        </button>
      ))}
    </div>
  );
}
