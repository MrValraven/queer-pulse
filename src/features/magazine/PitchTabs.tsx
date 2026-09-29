import type { Ref } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { PitchTab } from "./pitchTracker.data";
import styles from "./PitchTrackerPage.module.css";

/**
 * The Submissions tab's status filter: a labelled group of toggle chips, one
 * per `PITCH_TABS` entry, each with its live count. The chips filter one list
 * in place and own no panels, so they are `aria-pressed` buttons in plain Tab
 * order. The look follows `.chip[aria-pressed]` in `desk/pieceTabs.module.css`.
 */
export function PitchTabs({
  tabs,
  active,
  counts,
  onChange,
  groupRef,
}: {
  tabs: PitchTab[];
  active: string;
  counts: Record<string, number>;
  onChange: (key: string) => void;
  /** Lets the tab move focus back onto a chip after resetting the filter. */
  groupRef?: Ref<HTMLDivElement>;
}) {
  const { t } = useTranslation();

  return (
    <div
      ref={groupRef}
      className={styles.filters}
      role="group"
      aria-label={t("magazine:pitchTracker.tabs.ariaLabel")}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          aria-pressed={active === tab.key}
          className={styles.filterChip}
          onClick={() => onChange(tab.key)}
        >
          {t(tab.labelKey)}{" "}
          <span className={styles.filterCount}>{counts[tab.key] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
