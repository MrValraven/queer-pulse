import { useId, type ReactNode, type RefObject } from "react";
import {
  ActiveFilters,
  RefineGroup,
  RefinePanel,
  RefineSplit,
  RefineToggle,
  SearchInput,
} from "../../../shared/components/ui";
import type { useRefineDrawer } from "../../../shared/hooks";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { EventBrowseFacetsDTO } from "../api/events.api";
import { formatsForFamily, type GatheringFamily } from "../gatheringCatalog";
import { ChipRow, FacetSelect } from "./BrowseFacetControls";
import {
  EMPTY_BROWSE_FILTERS,
  type BrowseFilterState,
  type CostFilter,
  type WhenPreset,
} from "./browseFilters";
import { HiddenCommunitiesRefineGroup } from "./HiddenCommunitiesRefineGroup";
import {
  countHiddenBrowseFilters,
  useBrowseActiveFilters,
} from "./useBrowseActiveFilters";
import { useBrowseFacetOptions } from "./useBrowseFacetOptions";
import styles from "./BrowseFilterBar.module.css";

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
 *
 * Every option carries its availability count (`facets`): how many events
 * picking it would show, the other filters and the search applied. An option
 * at 0 is disabled unless it is the one picked; "Any" never is. While the
 * counts are unknown no number is drawn and every option stays open.
 */
export function BrowseFilterBar({
  filters,
  onChange,
  searchDraft,
  onSearchDraftChange,
  refine,
  communitiesSearchRef,
  notice,
  facets,
}: {
  filters: BrowseFilterState;
  onChange: (next: BrowseFilterState) => void;
  /** The search box's own value. It outruns the debounced `filters.query`. */
  searchDraft: string;
  onSearchDraftChange: (next: string) => void;
  /** The drawer's open state, owned by `BrowseView` so the hidden-communities
   *  notice under the bar can open it too. */
  refine: ReturnType<typeof useRefineDrawer>;
  /** The hidden-communities search field, focused by that notice. */
  communitiesSearchRef: RefObject<HTMLInputElement | null>;
  /** A line under the active-filter chips, inside the bar's own spacing so
   *  the board below keeps one gap whether it shows or not. */
  notice?: ReactNode;
  /** The board's availability counts. Undefined while they are unknown. */
  facets: EventBrowseFacetsDTO | undefined;
}) {
  const { t } = useTranslation();
  const familyLabelId = useId();
  const whenLabelId = useId();
  const hoodLabelId = useId();
  const typeLabelId = useId();
  const costLabelId = useId();
  const activeFilters = useBrowseActiveFilters({ filters, onChange });
  const { familyOptions, whenOptions, hoodOptions, typeOptions, costOptions } =
    useBrowseFacetOptions(filters, facets);

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
          className={styles.refineToggle}
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
            options={familyOptions}
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
            options={whenOptions}
            onChange={(when) => onChange({ ...filters, when })}
          />
        </RefineGroup>

        <RefineSplit>
          <RefineGroup
            label={t("gatherings:hub.browse.hoodLabel")}
            labelId={hoodLabelId}
          >
            <FacetSelect
              labelledBy={hoodLabelId}
              options={hoodOptions}
              value={filters.hood || ""}
              onChange={(hood) => onChange({ ...filters, hood })}
            />
          </RefineGroup>

          <RefineGroup
            label={t("gatherings:hub.browse.typeLabel")}
            labelId={typeLabelId}
          >
            <div className={styles.typeField}>
              {/* Narrowed to the chosen family (`useBrowseFacetOptions`). */}
              <FacetSelect
                labelledBy={typeLabelId}
                options={typeOptions}
                value={filters.type || ""}
                onChange={(type) => onChange({ ...filters, type })}
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
            options={costOptions}
            onChange={(cost) => onChange({ ...filters, cost })}
          />
        </RefineGroup>

        {/* A standing preference that outlasts any search, so the Refine
            badge and the active-filter chips leave it out. */}
        <HiddenCommunitiesRefineGroup searchInputRef={communitiesSearchRef} />
      </RefinePanel>

      {/* Clearing lives here, beside the chips it clears, rather than as a
          separate button next to controls the drawer may be hiding. */}
      <ActiveFilters
        filters={activeFilters}
        onClearFilters={() => onChange(EMPTY_BROWSE_FILTERS)}
      />
      {notice}
    </div>
  );
}
