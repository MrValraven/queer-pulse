import { useMemo } from "react";
import type { ActiveFilter } from "../../shared/components/ui";
import { formatDate } from "../../shared/lib/date";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { BEDROOM_OPTIONS, FILTERS } from "./housing.data";
import type { HousingFilters } from "./housingFilters";
import { HOUSING_MUST_HAVE_OPTIONS } from "./housingFilterSections";

/**
 * Everything currently narrowing the housing board, as removable chips.
 *
 * The filters sidebar folds its sections shut and can be hidden altogether,
 * so this row is what keeps every applied filter in view above the results.
 * Every narrowing gets a chip, the listing type included, so the row reads
 * as the whole set of filters on the board.
 *
 * Each chip removes only its own filter, back to the neutral value the URL
 * drops. A neighbourhood carried in from a shared link may no longer be one
 * this build offers; it still shows, under its own raw value, so it can always
 * be taken off.
 */
export function useHousingActiveFilters({
  filters,
  onChange,
}: {
  filters: HousingFilters;
  onChange: (next: HousingFilters) => void;
}): ActiveFilter[] {
  const { t, language } = useTranslation();

  return useMemo(() => {
    const list: ActiveFilter[] = [];

    if (filters.type && filters.type !== "all") {
      const type = FILTERS.find((option) => option.value === filters.type);
      list.push({
        key: `type:${filters.type}`,
        label: type ? t(type.labelKey) : filters.type,
        onRemove: () => onChange({ ...filters, type: "all" }),
      });
    }

    for (const area of filters.areas ?? []) {
      list.push({
        key: `area:${area}`,
        label: area,
        onRemove: () => {
          const next = (filters.areas ?? []).filter((name) => name !== area);
          onChange({ ...filters, areas: next.length ? next : undefined });
        },
      });
    }

    // The single free-text `area` predates the neighbourhood checkboxes and is
    // only reachable through a hand-written link, but it still narrows the
    // board, so it still needs a way off.
    if (filters.area) {
      list.push({
        key: `areaText:${filters.area}`,
        label: filters.area,
        onRemove: () => onChange({ ...filters, area: undefined }),
      });
    }

    // One chip for the range, however many of its two ends are set: removing
    // "€500 to €900" in two goes would read as two filters where the sidebar
    // shows one.
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const removePrice = () =>
        onChange({ ...filters, priceMin: undefined, priceMax: undefined });
      if (filters.priceMin !== undefined && filters.priceMax !== undefined) {
        list.push({
          key: "price",
          label: t("economy:housing.filterBar.chip.priceRange", {
            min: filters.priceMin,
            max: filters.priceMax,
          }),
          onRemove: removePrice,
        });
      } else if (filters.priceMin !== undefined) {
        list.push({
          key: "price",
          label: t("economy:housing.filterBar.chip.priceFrom", {
            min: filters.priceMin,
          }),
          onRemove: removePrice,
        });
      } else {
        list.push({
          key: "price",
          label: t("economy:housing.filterBar.chip.priceUpTo", {
            max: filters.priceMax,
          }),
          onRemove: removePrice,
        });
      }
    }

    if (filters.bedroomsMin !== undefined) {
      const beds = BEDROOM_OPTIONS.find(
        (option) => option.value === String(filters.bedroomsMin),
      );
      // A minimum of zero bedrooms is the studio option, which already reads as
      // a whole label; every other value is a count that needs the noun.
      list.push({
        key: `beds:${filters.bedroomsMin}`,
        label:
          filters.bedroomsMin === 0
            ? t("economy:housing.filterBar.bedsStudio")
            : t("economy:housing.filterBar.chip.beds", {
                beds: beds ? t(beds.labelKey) : String(filters.bedroomsMin),
              }),
        onRemove: () => onChange({ ...filters, bedroomsMin: undefined }),
      });
    }

    if (filters.depositMax !== undefined) {
      list.push({
        key: "depositMax",
        label: t("economy:housing.filterBar.chip.depositUpTo", {
          max: filters.depositMax,
        }),
        onRemove: () => onChange({ ...filters, depositMax: undefined }),
      });
    }

    if (filters.availableBy) {
      list.push({
        key: `availableBy:${filters.availableBy}`,
        label: t("economy:housing.filterBar.chip.availableBy", {
          date: formatDate(filters.availableBy, language, {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        }),
        onRemove: () => onChange({ ...filters, availableBy: undefined }),
      });
    }

    // Same order as the "Must have" checkbox rows, so a chip reads where its
    // checkbox does.
    for (const [key, labelKey] of HOUSING_MUST_HAVE_OPTIONS) {
      if (!filters[key]) continue;
      list.push({
        key,
        label: t(labelKey),
        onRemove: () => onChange({ ...filters, [key]: undefined }),
      });
    }

    return list;
  }, [filters, language, onChange, t]);
}
