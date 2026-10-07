import { useId } from "react";
import { ChipSelect } from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LOCAL_CATEGORIES, LOCAL_CATEGORY_LABEL_KEYS } from "./localCategories";
import { CATEGORY_ICON } from "./map.data";
import s from "./LocalFilterBar.module.css";

/**
 * The category chips, multi-select: the place types on the list and the map,
 * and what businesses sell on the Online tab (`categoryIds`).
 *
 * Several types can be on at once and combine as an OR: picking "Food" and
 * "Nightlife" shows both kinds of place. "All" is on while none is chosen, and
 * tapping it clears the choice.
 *
 * Each chip leads with a colour swatch that mirrors its map pin (category fill
 * plus a white icon), so the filter group doubles as a live legend for the map
 * view, and carries the live count of how many of the LOADED places it would
 * add right now. The online categories have no map pin, so their chips carry
 * no swatch (`hasSwatches`).
 */
export function LocalCategoryFilter({
  categories,
  onToggleCategory,
  onClearCategories,
  categoryCounts,
  isLoadedSetComplete,
  categoryIds = LOCAL_CATEGORIES,
  labelKey = "marketing:local.filter.categoryLabel",
  hasSwatches = true,
}: {
  /** The chosen place types. Empty means every type. */
  categories: string[];
  onToggleCategory: (categoryId: string) => void;
  onClearCategories: () => void;
  /** Live count per category id (+ "all"), reflecting the other active filters. */
  categoryCounts: Record<string, number>;
  /** True once every page of places has loaded, so a zero count is final. */
  isLoadedSetComplete: boolean;
  /** The category ids offered as chips, in chip order. Defaults to the place
   *  types. */
  categoryIds?: readonly string[];
  /** The catalog key of the group's label. */
  labelKey?: string;
  /** Leads each chip with its map-pin swatch. Off for the online categories,
   *  which have no pin on the map. */
  hasSwatches?: boolean;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const categoryLabelId = useId();

  const count = (value: string) => {
    const categoryCount = categoryCounts[value] ?? 0;
    return (
      <span className={s.count} aria-hidden>
        <RollingNumber
          value={fmt.number(categoryCount)}
          numericValue={categoryCount}
        />
      </span>
    );
  };

  const categoryChip = (categoryId: string, label: string) => {
    const Icon = hasSwatches ? CATEGORY_ICON[categoryId] : undefined;
    return {
      value: categoryId,
      isUnavailable:
        isLoadedSetComplete && (categoryCounts[categoryId] ?? 0) === 0,
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
    ...categoryIds.map((categoryId) =>
      categoryChip(
        categoryId,
        t(LOCAL_CATEGORY_LABEL_KEYS[categoryId] ?? categoryId),
      ),
    ),
  ];

  const selected = new Set(categories.length === 0 ? ["all"] : categories);
  const toggleChip = (value: string) => {
    if (value === "all") onClearCategories();
    else onToggleCategory(value);
  };

  // The counts ride inside each label, next to the swatch, so they stay off
  // ChipSelect's `count`. A type goes unpickable through `isUnavailable` only
  // when it has no matches AND every page of places has loaded: before that, a
  // zero may only mean the match sits on a page the browser has yet to fetch.
  // A chosen type always stays clickable (ChipSelect keeps selected chips
  // live), and "All" carries no flag, so it is always pickable.
  return (
    <div className={s.group}>
      <span className={s.groupLabel} id={categoryLabelId}>
        {t(labelKey)}
      </span>
      <ChipSelect
        labelledBy={categoryLabelId}
        options={categoryOptions}
        selected={selected}
        onToggle={toggleChip}
        tick={false}
      />
    </div>
  );
}
