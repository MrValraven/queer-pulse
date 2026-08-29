import { useId } from "react";
import {
  ActiveFilters,
  RefineGroup,
  RefinePanel,
  RefineSplit,
  RefineToggle,
  SearchInput,
  Select,
} from "../../../shared/components/ui";
import { useRefineDrawer } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { HOODS, TYPES } from "../createGathering.data";
import {
  COST_FILTERS,
  COST_LABEL_KEYS,
  EMPTY_BROWSE_FILTERS,
  WHEN_LABEL_KEYS,
  WHEN_PRESETS,
  type BrowseFilterState,
  type CostFilter,
  type WhenPreset,
} from "./browseFilters";
import {
  countHiddenBrowseFilters,
  useBrowseActiveFilters,
} from "./useBrowseActiveFilters";
import styles from "./BrowseFilterBar.module.css";

/** One row of chips that behave as a single-choice group. */
function ChipRow<Value extends string>({
  options,
  active,
  onChange,
}: {
  options: readonly { value: Value; label: string }[];
  active: Value;
  onChange: (value: Value) => void;
}) {
  return (
    <div className={styles.group}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={active === option.value}
          className={styles.chip}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * The browse board's whole control block: a search field and one "Refine"
 * toggle on a single row, the four filter axes (when, where in Lisbon, what
 * kind, what it costs) as bands in the drawer below, and the chip row saying
 * which are currently on.
 *
 * The axes live behind the toggle for the reason the communities grid's and
 * My events' do: five when-chips, three cost-chips and two selects standing
 * open pushed the first poster row most of the way down the fold, for choices
 * most visitors make once or never. What stays on screen is what is applied,
 * so a shut drawer hides the controls without hiding their state.
 *
 * All four axes are real columns the server narrows on. They used to be three
 * chips keyed off `orgColor`, a colour the demo registry assigns, which meant
 * a live board's chips filtered on a value the API never sends.
 */
export function BrowseFilterBar({
  filters,
  onChange,
  searchDraft,
  onSearchDraftChange,
}: {
  filters: BrowseFilterState;
  onChange: (next: BrowseFilterState) => void;
  /** The search box's own value — it outruns the debounced `filters.query`. */
  searchDraft: string;
  onSearchDraftChange: (next: string) => void;
}) {
  const { t } = useTranslation();
  const refine = useRefineDrawer("qp.events.browse.refineOpen");
  const whenLabelId = useId();
  const hoodLabelId = useId();
  const typeLabelId = useId();
  const costLabelId = useId();
  const activeFilters = useBrowseActiveFilters({ filters, onChange });

  return (
    <div className={styles.bar}>
      <div className={styles.searchRow}>
        <SearchInput
          className={styles.search}
          value={searchDraft}
          onChange={onSearchDraftChange}
          placeholder={t("gatherings:hub.browse.searchPlaceholder")}
          ariaLabel={t("gatherings:hub.browse.searchLabel")}
        />
        <RefineToggle
          {...refine.toggleProps}
          activeCount={countHiddenBrowseFilters(filters)}
        />
      </div>

      <RefinePanel {...refine.panelProps}>
        <RefineGroup
          label={t("gatherings:hub.browse.when.groupLabel")}
          labelId={whenLabelId}
          role="group"
          aria-labelledby={whenLabelId}
        >
          <ChipRow<WhenPreset>
            active={filters.when}
            options={WHEN_PRESETS.map((preset) => ({
              value: preset,
              label: t(WHEN_LABEL_KEYS[preset]),
            }))}
            onChange={(when) => onChange({ ...filters, when })}
          />
        </RefineGroup>

        <RefineSplit>
          <RefineGroup
            label={t("gatherings:hub.browse.hoodLabel")}
            labelId={hoodLabelId}
          >
            <Select
              size="sm"
              labelledBy={hoodLabelId}
              options={[
                { value: "", label: t("gatherings:hub.browse.hoodAny") },
                ...HOODS.map((hood) => ({
                  value: hood.value,
                  label: t(hood.labelKey),
                })),
              ]}
              value={filters.hood || ""}
              onChange={(hood) => onChange({ ...filters, hood: hood ?? "" })}
            />
          </RefineGroup>

          <RefineGroup
            label={t("gatherings:hub.browse.typeLabel")}
            labelId={typeLabelId}
          >
            <div className={styles.typeField}>
              <Select
                size="sm"
                labelledBy={typeLabelId}
                options={[
                  { value: "", label: t("gatherings:hub.browse.typeAny") },
                  ...TYPES.map((type) => ({
                    value: type.value,
                    label: t(type.nameKey),
                  })),
                ]}
                value={filters.type || ""}
                onChange={(type) => onChange({ ...filters, type: type ?? "" })}
              />
            </div>
          </RefineGroup>
        </RefineSplit>

        <RefineGroup
          label={t("gatherings:hub.browse.cost.groupLabel")}
          labelId={costLabelId}
          role="group"
          aria-labelledby={costLabelId}
        >
          <ChipRow<CostFilter>
            active={filters.cost}
            options={COST_FILTERS.map((cost) => ({
              value: cost,
              label: t(COST_LABEL_KEYS[cost]),
            }))}
            onChange={(cost) => onChange({ ...filters, cost })}
          />
        </RefineGroup>
      </RefinePanel>

      {/* Clearing lives here, beside the chips it clears, rather than as a
          separate button next to controls the drawer may be hiding. */}
      <ActiveFilters
        filters={activeFilters}
        onClearFilters={() => onChange(EMPTY_BROWSE_FILTERS)}
      />
    </div>
  );
}
