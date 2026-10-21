import { m } from "motion/react";
import { useId, type ReactNode } from "react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { tabIds, useTablistKeys } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { STUDIO_SPRING } from "./studioMotion";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";
import own from "./StudioTablist.module.css";

/** The APG tablist for Studio's detail pages: role="tab", aria-selected,
 *  aria-controls, roving tabindex and arrow, Home and End keys. With
 *  `indicator` (the default) the accent underline slides to the chosen tab;
 *  under reduced motion it jumps there. Its layoutId is unique to this
 *  tablist, so two on one page never trade underlines. */
export function StudioTablist<TabId extends string>({
  tabs,
  activeId,
  onChange,
  idPrefix,
  label,
  indicator = true,
}: {
  tabs: readonly { id: TabId; labelKey: string; badge?: ReactNode }[];
  activeId: TabId;
  onChange: (tabId: TabId) => void;
  idPrefix: string;
  label: string;
  /** The sliding underline. `false` keeps the plain border underline. */
  indicator?: boolean;
}) {
  const { t } = useTranslation();
  const { reducedMotion } = useMotionPrefs();
  const indicatorId = useId();
  const { tabProps } = useTablistKeys(tabs.length, (index) => {
    const tab = tabs[index];
    if (tab) onChange(tab.id);
  });
  return (
    <div className={styles.tabs} role="tablist" aria-label={label}>
      {tabs.map((tab, index) => {
        const ids = tabIds(idPrefix, tab.id);
        const isActive = tab.id === activeId;
        return (
          // raw <button>: an APG role="tab" whose keys useTablistKeys drives
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={ids.tab}
            aria-selected={isActive}
            aria-controls={ids.panel}
            className={[
              styles.tab,
              kit.tab,
              isActive && styles.tabOn,
              indicator && own.indicated,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(tab.id)}
            {...tabProps(index, isActive)}
          >
            {t(tab.labelKey)}
            {tab.badge}
            {indicator && isActive && (
              <m.span
                layoutId={`studio-tab-indicator-${indicatorId}`}
                className={own.indicator}
                aria-hidden
                transition={reducedMotion ? { duration: 0 } : STUDIO_SPRING}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
