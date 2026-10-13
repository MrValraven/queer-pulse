import { tabIds, useTablistKeys } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./studio.module.css";
import kit from "./studioKit.module.css";

/** The APG tablist for Studio's detail pages: role="tab", aria-selected,
 *  aria-controls, roving tabindex and arrow, Home and End keys. */
export function StudioTablist<TabId extends string>({
  tabs,
  activeId,
  onChange,
  idPrefix,
  label,
}: {
  tabs: readonly { id: TabId; labelKey: string }[];
  activeId: TabId;
  onChange: (tabId: TabId) => void;
  idPrefix: string;
  label: string;
}) {
  const { t } = useTranslation();
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
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={ids.tab}
            aria-selected={isActive}
            aria-controls={ids.panel}
            className={[styles.tab, kit.tab, isActive && styles.tabOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(tab.id)}
            {...tabProps(index, isActive)}
          >
            {t(tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
