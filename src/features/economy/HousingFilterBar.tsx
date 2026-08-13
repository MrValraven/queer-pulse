import { DatePicker, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  activeFilterCount,
  anyFilterActive,
  EMPTY_HOUSING_FILTERS,
  type HousingFilters,
} from "./housingFilters";
import { HousingNeighbourhoodPicker } from "./HousingNeighbourhoodPicker";
import { HousingSaveSearch } from "./HousingSaveSearch";
import s from "./HousingPage.module.css";

interface FilterBarProps {
  filters: HousingFilters;
  onChange: (next: HousingFilters) => void;
}

const BEDROOM_OPTIONS = [
  { value: "", labelKey: "economy:housing.filterBar.bedsAny" },
  { value: "0", labelKey: "economy:housing.filterBar.bedsStudio" },
  { value: "1", labelKey: "economy:housing.filterBar.beds1" },
  { value: "2", labelKey: "economy:housing.filterBar.beds2" },
  { value: "3", labelKey: "economy:housing.filterBar.beds3" },
];

/** The housing directory filter bar — builds the query the board runs (and a
 * saved search stores). The type chips stay in the board; this holds the richer
 * filters (price, area, beds, bills, accessibility, verified, move-in). */
export function HousingFilterBar({ filters, onChange }: FilterBarProps) {
  const { t } = useTranslation();

  const setNumber = (key: "priceMin" | "priceMax", raw: string) => {
    const value = raw.trim() === "" ? undefined : Number(raw);
    onChange({ ...filters, [key]: value });
  };
  const toggle = (key: "billsIncluded" | "hasAccessibilityInfo" | "verifiedOnly") =>
    onChange({ ...filters, [key]: filters[key] ? undefined : true });

  const clearAll = () =>
    onChange({ ...EMPTY_HOUSING_FILTERS, type: filters.type });

  return (
    <div className={s.filterBar}>
      <div className={s.filterRow}>
        <div className={s.filterField}>
          <label htmlFor="hf-area">{t("economy:housing.filterBar.area")}</label>
          <HousingNeighbourhoodPicker
            id="hf-area"
            selected={filters.areas ?? []}
            onChange={(next) =>
              onChange({ ...filters, areas: next.length ? next : undefined })
            }
          />
        </div>

        <div className={s.filterField}>
          <label htmlFor="hf-price-min">
            {t("economy:housing.filterBar.price")}
          </label>
          <div className={s.priceRange}>
            <input
              id="hf-price-min"
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
        </div>

        <div className={s.filterField}>
          <label htmlFor="hf-beds">{t("economy:housing.filterBar.beds")}</label>
          <Select
            id="hf-beds"
            size="sm"
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

        <div className={s.filterField}>
          <label id="hf-available-label">
            {t("economy:housing.filterBar.availableBy")}
          </label>
          <DatePicker
            mode="date"
            id="hf-available"
            size="sm"
            labelledBy="hf-available-label"
            value={filters.availableBy ?? null}
            onChange={(value) =>
              onChange({
                ...filters,
                availableBy: value ?? undefined,
              })
            }
          />
        </div>
      </div>

      <div className={s.toggleRow}>
        {(
          [
            ["billsIncluded", "economy:housing.filterBar.bills"],
            ["hasAccessibilityInfo", "economy:housing.filterBar.accessibility"],
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

      <div className={s.filterActions}>
        <button
          type="button"
          className={s.clearBtn}
          onClick={clearAll}
          disabled={activeFilterCount(filters) === 0}
        >
          {t("economy:housing.filterBar.clear")}
        </button>
        <HousingSaveSearch filters={filters} disabled={!anyFilterActive(filters)} />
      </div>
    </div>
  );
}
