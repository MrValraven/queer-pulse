import { useCallback, useId } from "react";
import { LuRows2, LuRows4 } from "react-icons/lu";
import {
  ActiveFilters,
  RefineGroup,
  RefinePanel,
  RefineSplit,
  RefineToggle,
  Select,
} from "../../shared/components/ui";
import { useRefineDrawer } from "../../shared/hooks";
import { sx } from "./myEvents.styles";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useMyEvents } from "./MyEventsContext";
import { EventPills } from "./EventPills";
import { EventFilterChips } from "./EventFilterChips";
import { DEFAULT_PILL, TOOLBAR_FILTERS } from "./myEvents.filters";
import { useMyEventsActiveFilters } from "./useMyEventsActiveFilters";
import type { SortBy } from "./myEvents.types";

/**
 * The agenda's search field and its "Refine" drawer, over the chip row saying
 * what is currently applied, over the display controls.
 *
 * The bucket pills, the five filter chips and the sort select all sit in the
 * drawer for the reason the communities grid's groups do: standing open they
 * cost two rows above the first event, for choices most members make once or
 * never. Density and Select stay out of it, because neither changes WHICH
 * events are listed, only how they are drawn and acted on.
 */
export function EventToolbar() {
  const { t } = useTranslation();
  const c = useMyEvents();
  const refine = useRefineDrawer("qp.myevents.refineOpen");
  const filtersLabelId = useId();
  const sortLabelId = useId();
  const activeFilters = useMyEventsActiveFilters();
  // The search term reads in the field itself, so the badge counts only what
  // the shut drawer is actually hiding: a non-default bucket, plus the filters.
  const hiddenFilterCount =
    (c.pill === DEFAULT_PILL ? 0 : 1) +
    TOOLBAR_FILTERS.filter((filter) => c.activeFilters[filter.key]).length;
  const isCompact = c.density === "compact";
  const densityLabel = isCompact
    ? t("myevents:toolbar.density.compact")
    : t("myevents:toolbar.density.comfortable");
  // "Clear all" answers the chip row, so it drops the bucket too. Kept out of
  // `clearSecondary` on purpose: that also backs the empty state's own "clear
  // filters" button, which must not move you out of the bucket you opened.
  const { clearSecondary, setPill } = c;
  const clearEveryFilter = useCallback(() => {
    clearSecondary();
    setPill(DEFAULT_PILL);
  }, [clearSecondary, setPill]);

  return (
    <div className={sx("ev-toolbar")}>
      <div className={sx("ev-search-row")}>
        <div className={sx("ev-search-wrap")}>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            aria-hidden
          >
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5 14 14" strokeLinecap="round" />
          </svg>
          <input
            className={sx("ev-search")}
            type="search"
            placeholder={t("myevents:toolbar.searchPlaceholder")}
            value={c.searchTerm}
            onChange={(e) => c.setSearch(e.target.value)}
            aria-label={t("myevents:toolbar.searchAria")}
          />
        </div>
        <RefineToggle
          {...refine.toggleProps}
          activeCount={hiddenFilterCount}
          className={sx("ev-refine")}
        />
      </div>

      <RefinePanel {...refine.panelProps}>
        <EventPills />

        <RefineSplit>
          <RefineGroup
            label={t("myevents:toolbar.sort.label")}
            labelId={sortLabelId}
          >
            <Select
              size="sm"
              labelledBy={sortLabelId}
              value={c.sortBy}
              onChange={(value) => c.setSort((value ?? "date") as SortBy)}
              options={[
                { value: "date", label: t("myevents:toolbar.sort.date") },
                {
                  value: "community",
                  label: t("myevents:toolbar.sort.community"),
                },
                { value: "status", label: t("myevents:toolbar.sort.status") },
              ]}
            />
          </RefineGroup>

          <RefineGroup
            label={t("myevents:toolbar.filter.groupLabel")}
            labelId={filtersLabelId}
            role="group"
            aria-labelledby={filtersLabelId}
          >
            <EventFilterChips />
          </RefineGroup>
        </RefineSplit>
      </RefinePanel>

      <ActiveFilters
        filters={activeFilters}
        onClearFilters={clearEveryFilter}
      />

      <div className={sx("ev-controls")}>
        <button
          type="button"
          className={sx(`ctrl-btn${isCompact ? " on" : ""}`)}
          title={densityLabel}
          onClick={c.toggleDensity}
        >
          {/* Boxed rows, so the icon-only phone button reads apart from the
              List tab's bare lines: two rows comfortable, four compact. */}
          {isCompact ? <LuRows4 aria-hidden /> : <LuRows2 aria-hidden />}
          {/* The label folds to an icon on a phone (CSS) and stays the
              button's accessible name. */}
          <span className={sx("ctrl-label")}>{densityLabel}</span>
        </button>
        <button
          type="button"
          className={sx(`ctrl-btn${c.selectMode ? " on" : ""}`)}
          onClick={c.toggleSelectMode}
        >
          <svg
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 7.5 6 10.5 11 4" />
          </svg>
          <span>
            {c.selectMode
              ? t("myevents:toolbar.select.done")
              : t("myevents:toolbar.select.select")}
          </span>
        </button>
        <span className={sx("ctrl-spacer")} />
        <span className={sx("tz-note")}>{t("myevents:toolbar.tzNote")}</span>
      </div>
    </div>
  );
}
