import { useId } from "react";
import { ChipSelect } from "../../shared/components/ui";
import {
  FilterSection,
  FilterSidebarPanel,
} from "../../shared/components/filterPage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LIFESTYLE_TAGS, NEIGHBOURHOODS } from "./flatmates.data";
import type { FlatmatesOptionCounts } from "./flatmatesFacets";
import {
  FLATMATES_BUDGET_OPTIONS,
  FLATMATES_MOVE_IN_OPTIONS,
  FLATMATES_TYPE_OPTIONS,
  type FlatmatesFilterOption,
} from "./flatmatesFilterOptions.data";
import type { FlatmatesFilterSectionKey } from "./flatmatesFilterSections";
import { FlatmatesRadioSection } from "./FlatmatesRadioSection";
import type {
  FlatmatesFilterActions,
  FlatmatesFilterState,
} from "./useFlatmatesFilters";

/** The flatmates filters: profile type, neighbourhood, budget, move-in and
 *  lifestyle, in the shared filter-page sidebar. The same panel renders in
 *  the desktop column and, with `isInSheet`, in the mobile filters sheet.
 *  Every option shows how many profiles picking it would leave
 *  (`optionCounts`, from the read's facets). */
export function FlatmatesFilterSidebar({
  filters,
  actions,
  optionCounts,
  isCountStale,
  appliedCount,
  sectionsOpen,
  onToggleSection,
  isInSheet = false,
}: {
  filters: FlatmatesFilterState;
  actions: FlatmatesFilterActions;
  optionCounts: FlatmatesOptionCounts;
  /** The counts describe the previous filter run while a new one loads. */
  isCountStale: boolean;
  appliedCount: number;
  sectionsOpen: Record<FlatmatesFilterSectionKey, boolean>;
  onToggleSection: (key: FlatmatesFilterSectionKey) => void;
  isInSheet?: boolean;
}) {
  const { t } = useTranslation();
  const sidebarId = useId();
  const translated = <Value extends string>(
    options: readonly FlatmatesFilterOption<Value>[],
  ) => options.map((option) => ({ ...option, label: t(option.labelKey) }));
  // The neighbourhood names read the same in every language, so each row
  // carries its name as the label; only the "any" row is translated.
  const neighbourhoodOptions = [
    { value: "all", label: t("economy:flatmates.filter.anyNeighbourhood") },
    ...NEIGHBOURHOODS.map((name) => ({ value: name, label: name })),
  ];
  // A tag chip is dimmed by `ChipSelect` itself once its count is 0 (and
  // kept clickable while selected). An uncounted tag gets no number.
  const lifestyleOptions = LIFESTYLE_TAGS.map((tag) => {
    const count = optionCounts.tags?.[tag];
    return {
      value: tag,
      label: tag,
      count,
      ariaLabel:
        count === undefined
          ? tag
          : t("economy:flatmates.filter.withCount", { label: tag, count }),
    };
  });
  return (
    <FilterSidebarPanel
      isInSheet={isInSheet}
      appliedCount={appliedCount}
      onClearAll={actions.clearFilters}
    >
      <FlatmatesRadioSection
        title={t("economy:flatmates.filter.typeTitle")}
        name={`${sidebarId}-type`}
        options={translated(FLATMATES_TYPE_OPTIONS)}
        value={filters.type}
        open={sectionsOpen.type}
        onToggle={() => onToggleSection("type")}
        onChange={actions.setType}
        counts={optionCounts.type}
        isCountStale={isCountStale}
      />

      <FlatmatesRadioSection
        title={t("economy:housing.filterBar.area")}
        name={`${sidebarId}-neighbourhood`}
        options={neighbourhoodOptions}
        value={filters.neighbourhood}
        open={sectionsOpen.neighbourhood}
        onToggle={() => onToggleSection("neighbourhood")}
        onChange={actions.setNeighbourhood}
        counts={optionCounts.neighbourhood}
        isCountStale={isCountStale}
      />

      <FlatmatesRadioSection
        title={t("economy:flatmates.filter.budgetTitle")}
        name={`${sidebarId}-budget`}
        options={translated(FLATMATES_BUDGET_OPTIONS)}
        value={filters.budget}
        open={sectionsOpen.budget}
        onToggle={() => onToggleSection("budget")}
        onChange={actions.setBudget}
        counts={optionCounts.budget}
        isCountStale={isCountStale}
      />

      <FlatmatesRadioSection
        title={t("economy:flatmates.filter.moveInTitle")}
        name={`${sidebarId}-moveIn`}
        options={translated(FLATMATES_MOVE_IN_OPTIONS)}
        value={filters.moveIn}
        open={sectionsOpen.moveIn}
        onToggle={() => onToggleSection("moveIn")}
        onChange={actions.setMoveIn}
        counts={optionCounts.moveIn}
        isCountStale={isCountStale}
      />

      <FilterSection
        title={t("economy:flatmates.filter.lifestyle")}
        headingId={`${sidebarId}-lifestyle`}
        open={sectionsOpen.lifestyle}
        onToggle={() => onToggleSection("lifestyle")}
        activeCount={filters.tags.length}
      >
        <ChipSelect
          labelledBy={`${sidebarId}-lifestyle`}
          options={lifestyleOptions}
          selected={new Set(filters.tags)}
          onToggle={actions.toggleTag}
        />
      </FilterSection>
    </FilterSidebarPanel>
  );
}
