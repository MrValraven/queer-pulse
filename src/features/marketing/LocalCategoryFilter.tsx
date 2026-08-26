import { useId } from "react";
import { FilterChips } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LOCAL_CATEGORIES, LOCAL_CATEGORY_LABEL_KEYS } from "./localCategories";
import { CATEGORY_ICON } from "./map.data";
import s from "./LocalFilterBar.module.css";

/**
 * The place-type chips.
 *
 * Each chip leads with a colour swatch that mirrors its map pin (category fill
 * plus a white icon), so the filter group doubles as a live legend for the map
 * view, and carries the live count of how many of the LOADED places it would
 * surface right now.
 */
export function LocalCategoryFilter({
  category,
  onCategoryChange,
  categoryCounts,
}: {
  category: string;
  onCategoryChange: (value: string) => void;
  /** Live count per category id (+ "all"), reflecting the other active filters. */
  categoryCounts: Record<string, number>;
}) {
  const { t } = useTranslation();
  const categoryLabelId = useId();

  const count = (value: string) => (
    <span className={s.count} aria-hidden>
      {categoryCounts[value] ?? 0}
    </span>
  );

  const categoryChip = (categoryId: string, label: string) => {
    const Icon = CATEGORY_ICON[categoryId];
    return {
      value: categoryId,
      label: (
        <>
          {Icon && (
            <span
              className={s.catSwatch}
              data-category={categoryId}
              aria-hidden
            >
              <Icon />
            </span>
          )}
          {label}
          {count(categoryId)}
        </>
      ),
    };
  };

  const categoryOptions = [
    {
      value: "all",
      label: (
        <>
          {t("marketing:directory.cat.all")}
          {count("all")}
        </>
      ),
    },
    ...LOCAL_CATEGORIES.map((categoryId) =>
      categoryChip(categoryId, t(LOCAL_CATEGORY_LABEL_KEYS[categoryId]!)),
    ),
  ];

  return (
    <div className={s.group}>
      <span className={s.groupLabel} id={categoryLabelId}>
        {t("marketing:local.filter.categoryLabel")}
      </span>
      <FilterChips
        labelledBy={categoryLabelId}
        options={categoryOptions}
        value={category}
        onChange={onCategoryChange}
      />
    </div>
  );
}
