import { sx } from "./myEvents.styles";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyEvents } from "./MyEventsContext";
import { TOOLBAR_FILTERS } from "./myEvents.filters";

/**
 * The five secondary filter chips in the "Refine" drawer, each with the
 * events it would list inside the agenda as it stands.
 *
 * In person and Online widen each other, as do Free and Paid, so a chip is
 * counted with its own pair switched off. No number is drawn until the whole
 * list is in, and a chip that would list nothing is held off unless it is on,
 * so the member can always take it back off.
 */
export function EventFilterChips() {
  const { t } = useTranslation();
  const { activeFilters, filterCounts, toggleFilter } = useMyEvents();

  return (
    <div className={sx("ev-filters")}>
      {TOOLBAR_FILTERS.map((filter) => {
        const count = filterCounts?.[filter.key];
        const isOn = activeFilters[filter.key];
        return (
          <button
            key={filter.key}
            type="button"
            className={sx(`fchip${isOn ? " on" : ""}`)}
            aria-pressed={isOn}
            disabled={count === 0 && !isOn}
            onClick={() => toggleFilter(filter.key)}
          >
            {t(filter.labelKey)}{" "}
            {count !== undefined && <span className={sx("fc")}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
