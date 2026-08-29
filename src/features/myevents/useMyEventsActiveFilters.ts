import { useMemo } from "react";
import type { ActiveFilter } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyEvents } from "./MyEventsContext";
import {
  DEFAULT_PILL,
  MY_EVENTS_PILLS,
  TOOLBAR_FILTERS,
} from "./myEvents.filters";

/**
 * Everything currently narrowing the agenda, as removable chips.
 *
 * The bucket pills and the secondary filters both live behind the "Refine"
 * toggle, so this row is what keeps a shut drawer from hiding what is applied.
 * The bucket leads, because it decides which events are in play at all before
 * any filter runs; taking its chip off returns to the default bucket rather
 * than to nothing. The search term is here too even though the field shows it,
 * so "Clear all" can drop every narrowing at once.
 *
 * The calendar day is deliberately absent: it is set from the calendar rather
 * than the drawer, and `DayFilterChip` already owns saying so and taking it
 * off.
 */
export function useMyEventsActiveFilters(): ActiveFilter[] {
  const { t } = useTranslation();
  const { pill, setPill, searchTerm, activeFilters, toggleFilter, setSearch } =
    useMyEvents();

  return useMemo(() => {
    const list: ActiveFilter[] = [];

    if (pill !== DEFAULT_PILL) {
      const entry = MY_EVENTS_PILLS.find((option) => option.key === pill);
      list.push({
        key: `pill:${pill}`,
        label: entry ? t(entry.labelKey) : pill,
        onRemove: () => setPill(DEFAULT_PILL),
      });
    }

    TOOLBAR_FILTERS.forEach((filter) => {
      if (!activeFilters[filter.key]) return;
      list.push({
        key: `filter:${filter.key}`,
        label: t(filter.labelKey),
        onRemove: () => toggleFilter(filter.key),
      });
    });

    if (searchTerm.trim()) {
      list.push({
        key: "q",
        label: `"${searchTerm.trim()}"`,
        onRemove: () => setSearch(""),
      });
    }

    return list;
  }, [pill, setPill, activeFilters, searchTerm, t, toggleFilter, setSearch]);
}
