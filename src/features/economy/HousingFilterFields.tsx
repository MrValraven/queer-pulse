import { useRef, useState, type ReactNode } from "react";
import { FilterOptionRow } from "../../shared/components/filterPage";
import { Collapse, SearchInput } from "../../shared/components/ui";
import { foldForSearch } from "../../shared/lib/foldForSearch";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { HousingBoardFacets } from "./api/housingListing.api";
import {
  housingAreaFacetKey,
  housingFacetRowState,
} from "./api/housingListingFacets";
import type { HousingFilters } from "./housingFilters";
import { HOUSING_MUST_HAVE_OPTIONS } from "./housingFilterSections";
import { LISBON_HOUSING_NEIGHBOURHOODS } from "./housingNeighbourhoods";
import styles from "./HousingPage.module.css";

const NEIGHBOURHOOD_NAMES = LISBON_HOUSING_NEIGHBOURHOODS.map(
  (entry) => entry.name,
);
const NEIGHBOURHOOD_NAME_SET = new Set(NEIGHBOURHOOD_NAMES);

/** A typed number field's text as a filter value: blank clears it. */
function numberOrUndefined(raw: string): number | undefined {
  return raw.trim() === "" ? undefined : Number(raw);
}

interface HousingFieldProps {
  filters: HousingFilters;
  onChange: (next: HousingFilters) => void;
}

/** The sidebar's availability counts, for the pick-list rows. Both optional:
 *  without facets a row draws no number and stays enabled. */
interface HousingFacetProps {
  facets?: HousingBoardFacets;
  /** The counts describe the previous filter run while a new one loads. */
  areFacetsStale?: boolean;
}

/** The spoken "Furnished, 4 listings" phrase for a counted row. */
function useDescribeWithCount() {
  const { t } = useTranslation();
  return (label: string, count: number) =>
    t("economy:housing.filterBar.withCount", { label, count });
}

/** A pick-one section body (listing type, bedrooms): one radio row per
 *  option, each with the count picking it would leave. `liftValue` is the
 *  "All" or "Any" option, which only lifts the filter and is never
 *  disabled. */
export function HousingRadioRows({
  headingId,
  name,
  options,
  checkedValue,
  liftValue,
  countFor,
  areFacetsStale = false,
  onSelect,
}: {
  headingId: string;
  name: string;
  options: readonly { value: string; labelKey: string }[];
  checkedValue: string;
  liftValue: string;
  /** The option's count, undefined while nothing is counted. */
  countFor: (value: string) => number | undefined;
  areFacetsStale?: boolean;
  onSelect: (value: string) => void;
}) {
  const { t } = useTranslation();
  const describeWithCount = useDescribeWithCount();
  return (
    <div role="radiogroup" aria-labelledby={headingId}>
      {options.map((option) => {
        const label = t(option.labelKey);
        const isChecked = checkedValue === option.value;
        return (
          <FilterOptionRow
            key={option.value}
            type="radio"
            name={name}
            value={option.value}
            label={label}
            isChecked={isChecked}
            {...housingFacetRowState({
              label,
              count: countFor(option.value),
              isChecked,
              isLiftOption: option.value === liftValue,
              areFacetsStale,
              describeWithCount,
            })}
            onChange={() => onSelect(option.value)}
          />
        );
      })}
    </div>
  );
}

/** The "Price" section body: a minimum and a maximum monthly rent. Each end
 *  names itself, so neither leans on the section title: two inputs under one
 *  heading would otherwise share one name. */
export function HousingPriceFields({ filters, onChange }: HousingFieldProps) {
  const { t } = useTranslation();
  return (
    <div className={styles.priceRange}>
      <input
        type="number"
        min={0}
        className={styles.filterInput}
        value={filters.priceMin ?? ""}
        onChange={(event) =>
          onChange({
            ...filters,
            priceMin: numberOrUndefined(event.target.value),
          })
        }
        placeholder={t("economy:housing.filterBar.min")}
        aria-label={t("economy:housing.filterBar.priceMin")}
      />
      <span className={styles.priceDash} aria-hidden>
        –
      </span>
      <input
        type="number"
        min={0}
        className={styles.filterInput}
        value={filters.priceMax ?? ""}
        onChange={(event) =>
          onChange({
            ...filters,
            priceMax: numberOrUndefined(event.target.value),
          })
        }
        placeholder={t("economy:housing.filterBar.max")}
        aria-label={t("economy:housing.filterBar.priceMax")}
      />
    </div>
  );
}

/** The "Deposit" section body: a cap on the up-front deposit, the other
 *  money a renter has to find. A listing whose lister stated no deposit is
 *  left out while this is set: an unstated deposit is unknown, and showing it
 *  under a cap would read as a promise nobody made. */
export function HousingDepositField({ filters, onChange }: HousingFieldProps) {
  const { t } = useTranslation();
  return (
    <input
      type="number"
      min={0}
      className={styles.filterInput}
      value={filters.depositMax ?? ""}
      onChange={(event) =>
        onChange({
          ...filters,
          depositMax: numberOrUndefined(event.target.value),
        })
      }
      placeholder={t("economy:housing.filterBar.max")}
      aria-label={t("economy:housing.filterBar.depositMax")}
    />
  );
}

/** The "Must have" section body: one checkbox row per yes/no narrowing. A
 *  ticked row sets its flag; unticking drops it from the URL. The flags AND
 *  together, so each row counts the listings left with it ticked on top of
 *  the others. */
export function HousingMustHaveRows({
  filters,
  onChange,
  facets,
  areFacetsStale = false,
}: HousingFieldProps & HousingFacetProps) {
  const { t } = useTranslation();
  const describeWithCount = useDescribeWithCount();
  return (
    <>
      {HOUSING_MUST_HAVE_OPTIONS.map(([key, labelKey]) => {
        const label = t(labelKey);
        const isChecked = !!filters[key];
        return (
          <FilterOptionRow
            key={key}
            type="checkbox"
            label={label}
            isChecked={isChecked}
            {...housingFacetRowState({
              label,
              count: facets?.mustHave[key],
              isChecked,
              areFacetsStale,
              describeWithCount,
            })}
            onChange={() =>
              onChange({ ...filters, [key]: isChecked ? undefined : true })
            }
          />
        );
      })}
    </>
  );
}

/** The "Neighbourhood" section body: a search over the neighbourhood
 *  checkbox rows, a "Clear neighbourhoods" action while any is ticked, and
 *  the rows themselves, ticked ones first. A ticked name this build no longer
 *  offers, and the old free-text `area` from a hand-written link, get a row
 *  of their own at the top, so every neighbourhood the section counts can be
 *  unticked here. */
export function HousingAreaRows({
  filters,
  onChange,
  isOpen,
  headingId,
  facets,
  areFacetsStale = false,
}: HousingFieldProps &
  HousingFacetProps & {
    /** Whether the section is open; opening it brings ticked rows to the top. */
    isOpen: boolean;
    /** The section title's id, which names the checkbox group. */
    headingId: string;
  }) {
  const { t } = useTranslation();
  const describeWithCount = useDescribeWithCount();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const selectedAreas = filters.areas ?? [];
  const legacyArea = filters.area;
  // Ticked rows lead the list. Their order is taken when the section opens and
  // whenever the search changes, so a row ticked partway down the list stays
  // where it is under the pointer. Adjusted during render, the pattern React
  // documents for state derived from props.
  const [pinned, setPinned] = useState({ isOpen, query, names: selectedAreas });
  if (pinned.isOpen !== isOpen || pinned.query !== query) {
    setPinned({ isOpen, query, names: selectedAreas });
  }
  const unofferedAreas = selectedAreas.filter(
    (name) => !NEIGHBOURHOOD_NAME_SET.has(name),
  );
  const leadingNames = new Set([...pinned.names, ...unofferedAreas]);
  const orderedNames = [
    ...leadingNames,
    ...NEIGHBOURHOOD_NAMES.filter((name) => !leadingNames.has(name)),
  ];
  const foldedQuery = foldForSearch(query.trim());
  const isMatch = (name: string) =>
    foldedQuery === "" || foldForSearch(name).includes(foldedQuery);
  const hasNoMatch =
    foldedQuery !== "" &&
    !orderedNames.some(isMatch) &&
    !(legacyArea && isMatch(legacyArea));
  const hasSelection = selectedAreas.length > 0 || Boolean(legacyArea);

  const toggleArea = (name: string) => {
    const next = selectedAreas.includes(name)
      ? selectedAreas.filter((area) => area !== name)
      : [...selectedAreas, name];
    onChange({ ...filters, areas: next.length ? next : undefined });
  };
  // The action folds away once nothing is ticked, so focus moves on to the
  // search field.
  const clearAreas = () => {
    onChange({ ...filters, areas: undefined, area: undefined });
    setQuery("");
    setPinned({ isOpen, query: "", names: [] });
    searchInputRef.current?.focus();
  };

  return (
    <>
      <SearchInput
        className={styles.areaSearch}
        inputRef={searchInputRef}
        value={query}
        onChange={setQuery}
        placeholder={t("economy:housing.filterBar.areaSearch")}
        ariaLabel={t("economy:housing.filterBar.areaSearch")}
      />
      <Collapse isOpen={hasSelection}>
        <div className={styles.areaClearRow}>
          <button
            type="button"
            className={styles.areaClear}
            onClick={clearAreas}
          >
            {t("economy:housing.filterBar.areaClear")}
          </button>
        </div>
      </Collapse>
      <div role="group" aria-labelledby={headingId}>
        {/* The old free-text `area` draws no count: the facets count the
            offered neighbourhoods. It is always ticked, so it stays
            enabled either way. */}
        <Collapse isOpen={Boolean(legacyArea)}>
          <HousingAreaRow isShown={!legacyArea || isMatch(legacyArea)}>
            <FilterOptionRow
              type="checkbox"
              label={legacyArea}
              isChecked
              onChange={() => onChange({ ...filters, area: undefined })}
            />
          </HousingAreaRow>
        </Collapse>
        {orderedNames.map((name) => {
          const isChecked = selectedAreas.includes(name);
          return (
            <HousingAreaRow key={name} isShown={isMatch(name)}>
              <FilterOptionRow
                type="checkbox"
                label={name}
                isChecked={isChecked}
                // Counted with the neighbourhood filter lifted; a name with
                // no listing has no key, which is a counted zero.
                {...housingFacetRowState({
                  label: name,
                  count: facets
                    ? (facets.areas[housingAreaFacetKey(name)] ?? 0)
                    : undefined,
                  isChecked,
                  areFacetsStale,
                  describeWithCount,
                })}
                onChange={() => toggleArea(name)}
              />
            </HousingAreaRow>
          );
        })}
      </div>
      <Collapse isOpen={hasNoMatch}>
        <p className={styles.areaEmpty}>{t("shared:select.noResults")}</p>
      </Collapse>
    </>
  );
}

/** One neighbourhood row that folds shut while the search leaves it out.
 *  Every row stays mounted, so typing eases rows away and back; a folded row
 *  is inert. */
function HousingAreaRow({
  isShown,
  children,
}: {
  isShown: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={[styles.areaRow, isShown && styles.areaRowShown]
        .filter(Boolean)
        .join(" ")}
      inert={!isShown || undefined}
    >
      <div className={styles.areaRowInner}>{children}</div>
    </div>
  );
}
