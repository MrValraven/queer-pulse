import { useId } from "react";
import { DatePicker } from "../../shared/components/ui";
import {
  FilterSection,
  FilterSidebarPanel,
  FiltersSheet,
} from "../../shared/components/filterPage";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { HousingBoardFacets } from "./api/housingListing.api";
import { BEDROOM_OPTIONS, FILTERS } from "./housing.data";
import type { HousingFilters } from "./housingFilters";
import {
  housingSectionActiveCounts,
  type HousingFilterSectionKey,
} from "./housingFilterSections";
import {
  HousingAreaRows,
  HousingDepositField,
  HousingMustHaveRows,
  HousingPriceFields,
  HousingRadioRows,
} from "./HousingFilterFields";
import styles from "./HousingPage.module.css";

export interface HousingFilterSidebarProps {
  /** Rendered inside the mobile filters sheet. */
  isInSheet?: boolean;
  filters: HousingFilters;
  onChange: (next: HousingFilters) => void;
  /** How many chips are applied, for the closing clear-all row. */
  appliedCount: number;
  onClearAll: () => void;
  sectionsOpen: Record<HousingFilterSectionKey, boolean>;
  onToggleSection: (key: HousingFilterSectionKey) => void;
  /** The listings each pick-list row would leave. Undefined while nothing is
   *  counted, which draws no number and disables no row. */
  facets?: HousingBoardFacets;
  /** The counts describe the previous filter run while a new one loads. */
  areFacetsStale?: boolean;
}

/** The housing board's filters as the members-style sidebar: listing type,
 *  neighbourhood, price, bedrooms, move-in date, deposit and the yes/no
 *  "Must have" flags, each a collapsible section. Every control writes
 *  straight to the URL-backed filters, so the same panel serves the desktop
 *  sidebar and the mobile sheet. Pick-lists are radio or checkbox rows
 *  because the sidebar clips absolutely positioned popovers; each list sits
 *  in a radiogroup or group named by its section title. */
export function HousingFilterSidebar({
  isInSheet = false,
  filters,
  onChange,
  appliedCount,
  onClearAll,
  sectionsOpen,
  onToggleSection,
  facets,
  areFacetsStale = false,
}: HousingFilterSidebarProps) {
  const { t } = useTranslation();
  const sidebarId = useId();
  const typeGroupName = `${sidebarId}-type`;
  const typeHeadingId = `${sidebarId}-typeHeading`;
  const areaHeadingId = `${sidebarId}-areaHeading`;
  const bedsGroupName = `${sidebarId}-beds`;
  const bedsHeadingId = `${sidebarId}-bedsHeading`;
  const availableHeadingId = `${sidebarId}-availableHeading`;
  const availablePickerId = `${sidebarId}-availablePicker`;
  const mustHaveHeadingId = `${sidebarId}-mustHaveHeading`;
  const activeCounts = housingSectionActiveCounts(filters);
  const bedsValue = filters.bedroomsMin?.toString() ?? "";

  return (
    <FilterSidebarPanel
      isInSheet={isInSheet}
      appliedCount={appliedCount}
      onClearAll={onClearAll}
    >
      <FilterSection
        title={t("economy:housing.filterBar.typeTitle")}
        headingId={typeHeadingId}
        open={sectionsOpen.type}
        onToggle={() => onToggleSection("type")}
        activeCount={activeCounts.type}
      >
        <HousingRadioRows
          headingId={typeHeadingId}
          name={typeGroupName}
          options={FILTERS}
          checkedValue={filters.type ?? "all"}
          liftValue="all"
          countFor={(value) =>
            value === "all"
              ? facets?.allTypes
              : facets?.type[value as keyof HousingBoardFacets["type"]]
          }
          areFacetsStale={areFacetsStale}
          onSelect={(value) => onChange({ ...filters, type: value })}
        />
      </FilterSection>

      <FilterSection
        title={t("economy:housing.filterBar.area")}
        headingId={areaHeadingId}
        open={sectionsOpen.area}
        onToggle={() => onToggleSection("area")}
        activeCount={activeCounts.area}
      >
        <HousingAreaRows
          filters={filters}
          onChange={onChange}
          isOpen={sectionsOpen.area}
          headingId={areaHeadingId}
          facets={facets}
          areFacetsStale={areFacetsStale}
        />
      </FilterSection>

      <FilterSection
        title={t("economy:housing.filterBar.price")}
        open={sectionsOpen.price}
        onToggle={() => onToggleSection("price")}
        activeCount={activeCounts.price}
      >
        <HousingPriceFields filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection
        title={t("economy:housing.filterBar.beds")}
        headingId={bedsHeadingId}
        open={sectionsOpen.beds}
        onToggle={() => onToggleSection("beds")}
        activeCount={activeCounts.beds}
      >
        {/* Each threshold is a "N or more" count, so they nest; "Any" is
            its own total. */}
        <HousingRadioRows
          headingId={bedsHeadingId}
          name={bedsGroupName}
          options={BEDROOM_OPTIONS}
          checkedValue={bedsValue}
          liftValue=""
          countFor={(value) =>
            value === "" ? facets?.allBedrooms : facets?.bedroomsMin[value]
          }
          areFacetsStale={areFacetsStale}
          onSelect={(value) =>
            onChange({
              ...filters,
              bedroomsMin: value ? Number(value) : undefined,
            })
          }
        />
      </FilterSection>

      <FilterSection
        title={t("economy:housing.filterBar.availableBy")}
        headingId={availableHeadingId}
        open={sectionsOpen.availableBy}
        onToggle={() => onToggleSection("availableBy")}
        activeCount={activeCounts.availableBy}
      >
        {/* The calendar renders through a portal, so the clipping sidebar
            leaves it whole. */}
        <DatePicker
          mode="date"
          id={availablePickerId}
          size="sm"
          className={styles.availablePicker}
          labelledBy={availableHeadingId}
          value={filters.availableBy ?? null}
          onChange={(value) =>
            onChange({ ...filters, availableBy: value ?? undefined })
          }
        />
      </FilterSection>

      <FilterSection
        title={t("economy:housing.filterBar.deposit")}
        open={sectionsOpen.deposit}
        onToggle={() => onToggleSection("deposit")}
        activeCount={activeCounts.deposit}
      >
        <HousingDepositField filters={filters} onChange={onChange} />
      </FilterSection>

      <FilterSection
        title={t("economy:housing.filterBar.flagsLabel")}
        headingId={mustHaveHeadingId}
        open={sectionsOpen.mustHave}
        onToggle={() => onToggleSection("mustHave")}
        activeCount={activeCounts.mustHave}
      >
        <div role="group" aria-labelledby={mustHaveHeadingId}>
          <HousingMustHaveRows
            filters={filters}
            onChange={onChange}
            facets={facets}
            areFacetsStale={areFacetsStale}
          />
        </div>
      </FilterSection>
    </FilterSidebarPanel>
  );
}

/** The mobile bottom sheet holding the same sidebar, closed by a "Show N
 *  listings" button. The board mounts it as `isMobile && isSheetOpen`. */
export function HousingFiltersSheet({
  resultCount,
  onClose,
  ...sidebarProps
}: Omit<HousingFilterSidebarProps, "isInSheet"> & {
  resultCount: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <FiltersSheet
      title={t("economy:housing.filtersSheetLabel")}
      showResultsLabel={
        <Translation
          i18nKey="economy:housing.showResultsCta"
          values={{ count: resultCount }}
          slots={{
            count: (
              <RollingNumber
                value={fmt.number(resultCount)}
                numericValue={resultCount}
              />
            ),
          }}
        />
      }
      onClose={onClose}
    >
      <HousingFilterSidebar isInSheet {...sidebarProps} />
    </FiltersSheet>
  );
}
