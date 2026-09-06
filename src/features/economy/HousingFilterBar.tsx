import { useId, type ReactNode } from "react";
import {
  ActiveFilters,
  DatePicker,
  RefineGroup,
  RefinePanel,
  RefineSplit,
  RefineToggle,
  Select,
} from "../../shared/components/ui";
import { useRefineDrawer } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { BEDROOM_OPTIONS } from "./housing.data";
import {
  activeFilterCount,
  anyFilterActive,
  EMPTY_HOUSING_FILTERS,
  type HousingFilters,
} from "./housingFilters";
import { HousingNeighbourhoodPicker } from "./HousingNeighbourhoodPicker";
import { HousingSaveSearch } from "./HousingSaveSearch";
import { useHousingActiveFilters } from "./useHousingActiveFilters";
import s from "./HousingPage.module.css";

interface FilterBarProps {
  filters: HousingFilters;
  onChange: (next: HousingFilters) => void;
  /** The List/Map switcher, riding at the far end of the control row. It stays
   *  OUTSIDE the drawer: it picks how the results are shown, not which results
   *  there are, so it must not disappear behind a collapsed panel. */
  viewSlot?: ReactNode;
}

/**
 * The housing directory's whole control block: one always-visible row with the
 * "Refine" toggle and the List/Map switcher, the richer filters (area, price,
 * beds, move-in, deposit, bills, furnished, pets, accessibility, verified) as
 * bands in the drawer below,
 * and the chip row saying which are currently on. The type chips stay in the
 * board above, as the board's top-level cut.
 *
 * The filters used to stand open in a paper card roughly 230px tall, above the
 * fold on every visit, for choices most visitors make once or never. Behind
 * the toggle they cost one row, and because what is applied reads on the chip
 * row instead of in the controls, a shut drawer hides the controls without
 * hiding their state.
 *
 * Clearing lives on that chip row rather than as its own button, so it sits
 * beside the chips it clears instead of next to controls the drawer may be
 * hiding; saving the search rides at the end of the same row, where it appears
 * exactly when there is a refinement worth saving.
 */
export function HousingFilterBar({
  filters,
  onChange,
  viewSlot,
}: FilterBarProps) {
  const { t } = useTranslation();
  const refine = useRefineDrawer("qp.housing.refineOpen");
  const areaLabelId = useId();
  const priceLabelId = useId();
  const bedsLabelId = useId();
  const availableLabelId = useId();
  const depositLabelId = useId();
  const flagsLabelId = useId();
  const activeFilters = useHousingActiveFilters({ filters, onChange });

  const setNumber = (
    key: "priceMin" | "priceMax" | "depositMax",
    raw: string,
  ) => {
    const value = raw.trim() === "" ? undefined : Number(raw);
    onChange({ ...filters, [key]: value });
  };
  const toggle = (
    key:
      | "billsIncluded"
      | "hasAccessibilityInfo"
      | "furnished"
      | "petsWelcome"
      | "verifiedOnly",
  ) => onChange({ ...filters, [key]: filters[key] ? undefined : true });

  return (
    <div className={s.refineBar}>
      <div className={s.refineRow}>
        <RefineToggle
          {...refine.toggleProps}
          activeCount={activeFilterCount(filters)}
        />
        {viewSlot}
      </div>

      <RefinePanel {...refine.panelProps}>
        <RefineSplit>
          <RefineGroup
            label={t("economy:housing.filterBar.area")}
            labelId={areaLabelId}
          >
            <HousingNeighbourhoodPicker
              id="hf-area"
              labelledBy={areaLabelId}
              selected={filters.areas ?? []}
              onChange={(next) =>
                onChange({ ...filters, areas: next.length ? next : undefined })
              }
            />
          </RefineGroup>

          <RefineGroup
            label={t("economy:housing.filterBar.beds")}
            labelId={bedsLabelId}
          >
            <div className={s.narrowField}>
              <Select
                size="sm"
                labelledBy={bedsLabelId}
                options={BEDROOM_OPTIONS.map((option) => ({
                  value: option.value,
                  label: t(option.labelKey),
                }))}
                value={filters.bedroomsMin?.toString() ?? ""}
                onChange={(value) =>
                  onChange({
                    ...filters,
                    bedroomsMin: value ? Number(value) : undefined,
                  })
                }
              />
            </div>
          </RefineGroup>
        </RefineSplit>

        <RefineSplit>
          <RefineGroup
            label={t("economy:housing.filterBar.price")}
            labelId={priceLabelId}
          >
            {/* Each end names itself, so neither leans on the band label: two
                inputs under one heading would otherwise share one name. */}
            <div className={s.priceRange}>
              <input
                type="number"
                min={0}
                className={s.filterInput}
                value={filters.priceMin ?? ""}
                onChange={(event) => setNumber("priceMin", event.target.value)}
                placeholder={t("economy:housing.filterBar.min")}
                aria-label={t("economy:housing.filterBar.priceMin")}
              />
              <span className={s.priceDash} aria-hidden>
                –
              </span>
              <input
                type="number"
                min={0}
                className={s.filterInput}
                value={filters.priceMax ?? ""}
                onChange={(event) => setNumber("priceMax", event.target.value)}
                placeholder={t("economy:housing.filterBar.max")}
                aria-label={t("economy:housing.filterBar.priceMax")}
              />
            </div>
          </RefineGroup>

          <RefineGroup
            label={t("economy:housing.filterBar.availableBy")}
            labelId={availableLabelId}
          >
            <div className={s.narrowField}>
              <DatePicker
                mode="date"
                id="hf-available"
                size="sm"
                labelledBy={availableLabelId}
                value={filters.availableBy ?? null}
                onChange={(value) =>
                  onChange({
                    ...filters,
                    availableBy: value ?? undefined,
                  })
                }
              />
            </div>
          </RefineGroup>
        </RefineSplit>

        <RefineSplit>
          {/* A cap on the up-front deposit, the other money a renter has to
              find. A listing whose lister stated no deposit is left out while
              this is set: an unstated deposit is unknown, and showing it under
              a cap would read as a promise nobody made. */}
          <RefineGroup
            label={t("economy:housing.filterBar.deposit")}
            labelId={depositLabelId}
          >
            <div className={s.narrowField}>
              <input
                type="number"
                min={0}
                className={s.filterInput}
                value={filters.depositMax ?? ""}
                onChange={(event) =>
                  setNumber("depositMax", event.target.value)
                }
                placeholder={t("economy:housing.filterBar.max")}
                aria-label={t("economy:housing.filterBar.depositMax")}
              />
            </div>
          </RefineGroup>
        </RefineSplit>

        <RefineGroup
          label={t("economy:housing.filterBar.flagsLabel")}
          labelId={flagsLabelId}
          role="group"
          aria-labelledby={flagsLabelId}
        >
          <div className={s.toggleRow}>
            {(
              [
                ["billsIncluded", "economy:housing.filterBar.bills"],
                ["furnished", "economy:housing.filterBar.furnished"],
                ["petsWelcome", "economy:housing.filterBar.pets"],
                [
                  "hasAccessibilityInfo",
                  "economy:housing.filterBar.accessibility",
                ],
                ["verifiedOnly", "economy:housing.filterBar.verified"],
              ] as const
            ).map(([key, labelKey]) => (
              <button
                key={key}
                type="button"
                className={[s.chip, filters[key] && s.chipActive]
                  .filter(Boolean)
                  .join(" ")}
                aria-pressed={!!filters[key]}
                onClick={() => toggle(key)}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </RefineGroup>
      </RefinePanel>

      <ActiveFilters
        filters={activeFilters}
        onClearFilters={() => onChange(EMPTY_HOUSING_FILTERS)}
        trailing={
          <HousingSaveSearch
            filters={filters}
            disabled={!anyFilterActive(filters)}
          />
        }
      />
    </div>
  );
}
