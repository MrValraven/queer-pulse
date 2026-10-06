import { useId } from "react";
import type { IconType } from "react-icons";
import { FiGrid } from "react-icons/fi";
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
import { HOODS } from "../createGathering.data";
import {
  formatsForFamily,
  GATHERING_FAMILIES,
  GATHERING_FORMATS,
  type GatheringFamily,
} from "../gatheringCatalog";
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

interface ChipOption<Value extends string> {
  value: Value;
  label: string;
  /** Drawn before the label, decorative. Only the family row carries one. */
  icon?: IconType;
}

/** One row of chips that behave as a single-choice group. */
function ChipRow<Value extends string>({
  options,
  active,
  onChange,
}: {
  options: readonly ChipOption<Value>[];
  active: Value;
  onChange: (value: Value) => void;
}) {
  return (
    <div className={styles.group}>
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active === option.value}
            className={styles.chip}
            onClick={() => onChange(option.value)}
          >
            {Icon && <Icon className={styles.chipIcon} aria-hidden />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * The browse board's whole control block: a search field and one "Refine"
 * toggle on a single row, all five filter axes (kind of gathering, when, where
 * in Lisbon, which format, what it costs) as bands in the drawer below, and
 * the chip row saying which are currently on.
 *
 * Family is the drawer's first band because it is the coarse question a
 * member answers first, and answering it narrows the format select from the
 * whole fifty-six-entry catalog to the six or seven formats inside that family.
 * "Any kind" carries `FiGrid`: a grid of tiles reads as "every category",
 * where a star would suggest a curated or favourite pick the board does not
 * make.
 *
 * The axes live behind the toggle for the reason the communities grid's and
 * My events' do: ten family chips, five when-chips, three cost-chips and two
 * selects standing open pushed the first poster row most of the way down the
 * fold, for choices most visitors make once or never. What stays on screen is
 * what is applied, so a shut drawer hides the controls and keeps their state
 * in view.
 *
 * All five axes are real columns the server narrows on. They used to be three
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
  /** The search box's own value. It outruns the debounced `filters.query`. */
  searchDraft: string;
  onSearchDraftChange: (next: string) => void;
}) {
  const { t } = useTranslation();
  const refine = useRefineDrawer("qp.events.browse.refineOpen");
  const familyLabelId = useId();
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
        {/* Family leads the drawer: it is the first question a member answers,
            and the format select further down narrows to its answer. */}
        <RefineGroup
          label={t("gatherings:hub.browse.familyLabel")}
          labelId={familyLabelId}
          role="group"
          aria-labelledby={familyLabelId}
        >
          <ChipRow<GatheringFamily | "">
            active={filters.family}
            options={[
              {
                value: "",
                label: t("gatherings:hub.browse.familyAny"),
                icon: FiGrid,
              },
              ...GATHERING_FAMILIES.map((family) => ({
                value: family.key,
                label: t(family.nameKey),
                icon: family.icon,
              })),
            ]}
            onChange={(family) => {
              // A format only means something inside its own family. A family
              // change that orphans the chosen format clears it, which keeps
              // the board from narrowing to nothing.
              const shouldKeepFormat =
                !family ||
                formatsForFamily(family).some(
                  (format) => format.key === filters.type,
                );
              onChange({
                ...filters,
                family,
                type: shouldKeepFormat ? filters.type : "",
              });
            }}
          />
        </RefineGroup>

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
                  // Narrowed to the chosen family, so the list is six or seven
                  // rows rather than fifty-six. With no family chosen it is the
                  // whole catalog, which is still the right answer for a member
                  // who knows the word but not the kind.
                  ...(filters.family
                    ? formatsForFamily(filters.family)
                    : GATHERING_FORMATS
                  ).map((format) => ({
                    value: format.key,
                    label: t(format.nameKey),
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
