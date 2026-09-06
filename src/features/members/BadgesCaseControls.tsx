import { useRef, useState } from "react";
import { useOutsideDismiss } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { badgeCategoryLabelKeyFor } from "./badgeCatalog.data";
import styles from "./BadgesPage.module.css";

export type BadgeSortMode = "close" | "rare" | "xp" | "cat";

interface BadgesCaseControlsProps {
  categories: string[];
  countsByCategory: Record<string, number>;
  totalCount: number;
  categoryFilter: string;
  onCategoryFilterChange: (category: string) => void;
  mutedCategories: string[];
  isCategoryMuted: (category: string) => boolean;
  toggleCategory: (category: string) => void;
  showLocked: boolean;
  onToggleShowLocked: () => void;
  sortMode: BadgeSortMode;
  onSortModeChange: (mode: BadgeSortMode) => void;
}

/** The case's toolbar: category filter chips, the "mute a category" popover,
 *  the show-locked switch, and the sort select. */
export function BadgesCaseControls({
  categories,
  countsByCategory,
  totalCount,
  categoryFilter,
  onCategoryFilterChange,
  mutedCategories,
  isCategoryMuted,
  toggleCategory,
  showLocked,
  onToggleShowLocked,
  sortMode,
  onSortModeChange,
}: BadgesCaseControlsProps) {
  const { t } = useTranslation();
  // Categories arrive from the server catalogue as English display words
  // (`cat: 'Attendance'`). They are the chip labels AND the accessible name of
  // each mute switch, so an untranslated one is invisible to sighted testing.
  // `badgeCatalog.data.ts` owns the words; an unmapped category falls back to
  // the server's own, which is readable English rather than an identifier.
  const categoryLabel = (category: string): string => {
    const labelKey = badgeCategoryLabelKeyFor(category);
    return labelKey ? t(labelKey) : category;
  };
  const [mutePopoverOpen, setMutePopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const muteTriggerRef = useRef<HTMLButtonElement>(null);
  // `onEscape` is opt-in on this hook, so without it a keyboard user has no
  // way out of the popover. Escape closes it and returns focus to the trigger,
  // matching the menu-button contract used by AccountMenu and Select.
  useOutsideDismiss(
    mutePopoverOpen,
    popoverRef,
    () => setMutePopoverOpen(false),
    {
      onEscape: () => {
        setMutePopoverOpen(false);
        muteTriggerRef.current?.focus();
      },
    },
  );

  return (
    <div className={styles.tools}>
      <div className={styles.chipsRow}>
        <button
          type="button"
          className={`${styles.fchip} ${categoryFilter === "all" ? styles.fchipOn : ""}`}
          onClick={() => onCategoryFilterChange("all")}
          aria-pressed={categoryFilter === "all"}
        >
          {t("members:badges.case.filterAll")}{" "}
          <span className={styles.fchipCount}>{totalCount}</span>
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={[
              styles.fchip,
              categoryFilter === category ? styles.fchipOn : "",
              isCategoryMuted(category) ? styles.fchipMuted : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onCategoryFilterChange(category)}
            aria-pressed={categoryFilter === category}
          >
            {categoryLabel(category)}{" "}
            <span className={styles.fchipCount}>
              {countsByCategory[category] ?? 0}
            </span>
          </button>
        ))}
      </div>
      <div className={styles.toolRight}>
        <button
          type="button"
          className={styles.swSwitch}
          role="switch"
          aria-checked={showLocked}
          onClick={onToggleShowLocked}
        >
          {t("members:badges.case.showLocked")}
          <span className={styles.swTrack} />
        </button>
        <div className={styles.pop} ref={popoverRef}>
          <button
            ref={muteTriggerRef}
            type="button"
            className={styles.tbtn}
            aria-haspopup="true"
            aria-expanded={mutePopoverOpen}
            onClick={() => setMutePopoverOpen((open) => !open)}
          >
            {t("members:badges.case.notForMe")}
          </button>
          {mutePopoverOpen && (
            <div className={styles.popPanel}>
              <h5>{t("members:badges.case.muteTitle")}</h5>
              <p>{t("members:badges.case.muteDesc")}</p>
              {categories.map((category) => (
                <div key={category} className={styles.mrow}>
                  <span>{categoryLabel(category)}</span>
                  <button
                    type="button"
                    className={styles.swSwitch}
                    role="switch"
                    aria-checked={!isCategoryMuted(category)}
                    aria-label={t("members:badges.case.categoryToggleLabel", {
                      category: categoryLabel(category),
                    })}
                    onClick={() => toggleCategory(category)}
                  >
                    <span className={styles.swTrack} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <select
          className={styles.select}
          aria-label={t("members:badges.case.sortLabel")}
          value={sortMode}
          onChange={(event) =>
            onSortModeChange(event.target.value as BadgeSortMode)
          }
        >
          <option value="close">{t("members:badges.case.sortClosest")}</option>
          <option value="rare">{t("members:badges.case.sortRarest")}</option>
          <option value="xp">{t("members:badges.case.sortXp")}</option>
          <option value="cat">{t("members:badges.case.sortCategory")}</option>
        </select>
      </div>
      {mutedCategories.length > 0 && categoryFilter === "all" && (
        <div className={styles.mutedNote}>
          <span>
            {mutedCategories.length === 1
              ? t("members:badges.case.mutedNoteSingle", {
                  category: categoryLabel(mutedCategories[0]!),
                })
              : t("members:badges.case.mutedNotePlural", {
                  categories: mutedCategories.map(categoryLabel).join(", "),
                })}
          </span>
        </div>
      )}
    </div>
  );
}
