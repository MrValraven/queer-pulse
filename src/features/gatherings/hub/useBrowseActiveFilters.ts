import { useMemo } from "react";
import type { ActiveFilter } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { HOODS, TYPES } from "../createGathering.data";
import {
  COST_LABEL_KEYS,
  WHEN_LABEL_KEYS,
  type BrowseFilterState,
} from "./browseFilters";

/**
 * Everything currently narrowing the browse board, as removable chips.
 *
 * The four axes live behind the "Refine" toggle, so this row is what keeps a
 * shut drawer from hiding what is applied. Each chip removes its own axis back
 * to the neutral value the URL drops, never to nothing, which is why this
 * takes the whole state rather than a list of set keys. The search term is
 * here too even though the field shows it, so "Clear all" reads as dropping
 * everything on the row.
 *
 * A `hood` or `type` from a shared link may no longer be in the vocabulary;
 * it still shows, under its own raw value, so it can always be taken off.
 */
export function useBrowseActiveFilters({
  filters,
  onChange,
}: {
  filters: BrowseFilterState;
  onChange: (next: BrowseFilterState) => void;
}): ActiveFilter[] {
  const { t } = useTranslation();

  return useMemo(() => {
    const list: ActiveFilter[] = [];

    if (filters.when !== "any") {
      list.push({
        key: `when:${filters.when}`,
        label: t(WHEN_LABEL_KEYS[filters.when]),
        onRemove: () => onChange({ ...filters, when: "any" }),
      });
    }
    if (filters.hood) {
      const hood = HOODS.find((entry) => entry.value === filters.hood);
      list.push({
        key: `hood:${filters.hood}`,
        label: hood ? t(hood.labelKey) : filters.hood,
        onRemove: () => onChange({ ...filters, hood: "" }),
      });
    }
    if (filters.type) {
      const type = TYPES.find((entry) => entry.value === filters.type);
      list.push({
        key: `type:${filters.type}`,
        label: type ? t(type.nameKey) : filters.type,
        onRemove: () => onChange({ ...filters, type: "" }),
      });
    }
    if (filters.cost !== "any") {
      list.push({
        key: `cost:${filters.cost}`,
        label: t(COST_LABEL_KEYS[filters.cost]),
        onRemove: () => onChange({ ...filters, cost: "any" }),
      });
    }
    if (filters.query.trim()) {
      list.push({
        key: "q",
        label: `"${filters.query.trim()}"`,
        onRemove: () => onChange({ ...filters, query: "" }),
      });
    }

    return list;
  }, [filters, onChange, t]);
}

/** How many axes the shut drawer is hiding. The search term is excluded: it
 *  reads in the field beside the toggle, so counting it would double up. */
export function countHiddenBrowseFilters(filters: BrowseFilterState): number {
  return (
    (filters.when === "any" ? 0 : 1) +
    (filters.hood ? 1 : 0) +
    (filters.type ? 1 : 0) +
    (filters.cost === "any" ? 0 : 1)
  );
}
