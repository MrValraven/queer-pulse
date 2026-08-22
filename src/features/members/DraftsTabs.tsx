import { useEffect, useRef } from "react";
import { useTablistKeys } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { DRAFT_TABS, type DraftCategory } from "./drafts.data";
import styles from "./DraftsPage.module.css";

/** Category tablist plus the select-all bar above the drafts list. */
export function DraftsTabs({
  category,
  onCategory,
  counts,
  allSelected,
  someSelected,
  onToggleAll,
  visibleCount,
  totalCount,
}: {
  category: "all" | DraftCategory;
  onCategory: (category: "all" | DraftCategory) => void;
  counts: Record<"all" | DraftCategory, number>;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: (checked: boolean) => void;
  visibleCount: number;
  totalCount: number;
}) {
  const { t } = useTranslation();
  // Arrow/Home/End across the category strip, with a roving tabIndex so Tab
  // enters and leaves it in one press (APG tablist contract).
  const { tabProps } = useTablistKeys(DRAFT_TABS.length, (index) => {
    const nextTab = DRAFT_TABS[index];
    if (nextTab) onCategory(nextTab.key);
  });
  const selectAllRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected]);

  return (
    <>
      <div
        className={styles.tabs}
        role="tablist"
        aria-label={t("members:drafts.tabsAriaLabel")}
      >
        {DRAFT_TABS.map((tab, index) => (
          <button
            type="button"
            key={tab.key}
            role="tab"
            aria-selected={category === tab.key}
            className={`${styles.tab} ${category === tab.key ? styles.active : ""}`}
            onClick={() => onCategory(tab.key)}
            {...tabProps(index, category === tab.key)}
          >
            {t(tab.labelKey)}{" "}
            <span className={styles.tabCount}>{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      <div className={styles.selectAll}>
        <input
          ref={selectAllRef}
          type="checkbox"
          className={styles.cbx}
          checked={allSelected}
          onChange={(e) => onToggleAll(e.target.checked)}
          aria-label={t("members:drafts.selectAllAriaLabel")}
        />
        <span>{t("members:drafts.selectAll")}</span>
        <span className={styles.visCount}>
          {t("members:drafts.visibleCount", {
            visible: visibleCount,
            count: totalCount,
          })}
        </span>
      </div>
    </>
  );
}
