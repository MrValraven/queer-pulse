import { useRef, type KeyboardEvent } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TopTab } from "./useCommunitiesTopTab";
import { useCommunitiesTabCounts } from "./useCommunitiesTabCounts";
import styles from "./CommunitiesTopTabs.module.css";

const TOP_TABS: { key: TopTab; labelKey: string }[] = [
  { key: "mine", labelKey: "communities:topTabs.mine" },
  { key: "discover", labelKey: "communities:topTabs.discover" },
];

/**
 * APG tablist for the merged `/communities` page: "My communities" · "Discover",
 * each with its own live count.
 * Roving tabindex + Left/Right/Home/End move focus and selection; Enter/Space
 * fire natively because these are real `<button>`s. The parent sets
 * `id="communities-top-panel-<tab>"` on whichever body it renders so
 * `aria-controls` resolves.
 */
export function CommunitiesTopTabs({
  active,
  onChange,
}: {
  active: TopTab;
  onChange: (next: TopTab) => void;
}) {
  const { t } = useTranslation();
  const counts = useCommunitiesTabCounts();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const moveTo = (index: number) => {
    const nextIndex = (index + TOP_TABS.length) % TOP_TABS.length;
    const nextTab = TOP_TABS[nextIndex];
    if (!nextTab) return;
    onChange(nextTab.key);
    tabRefs.current[nextIndex]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        moveTo(index + 1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        moveTo(index - 1);
        break;
      case "Home":
        event.preventDefault();
        moveTo(0);
        break;
      case "End":
        event.preventDefault();
        moveTo(TOP_TABS.length - 1);
        break;
    }
  };

  return (
    <div
      className={styles.list}
      role="tablist"
      aria-label={t("communities:topTabs.ariaLabel")}
    >
      {TOP_TABS.map((tab, index) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            ref={(node) => {
              tabRefs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`communities-top-tab-${tab.key}`}
            aria-selected={isActive}
            aria-controls={`communities-top-panel-${tab.key}`}
            tabIndex={isActive ? 0 : -1}
            className={[styles.tab, isActive && styles.tabOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(tab.key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {t(tab.labelKey)}
            {counts[tab.key] !== null && (
              // aria-hidden: the count is decoration on an already-labelled
              // tab, and screen readers announce the panel's own result line.
              <span className={styles.tabCount} aria-hidden>
                {counts[tab.key]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
