import { Button, Select } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { HOODS, TYPES } from "../createGathering.data";
import {
  COST_FILTERS,
  COST_LABEL_KEYS,
  WHEN_LABEL_KEYS,
  WHEN_PRESETS,
  type BrowseFilterState,
  type CostFilter,
  type WhenPreset,
} from "./browseFilters";
import styles from "./BrowseFilterBar.module.css";

/** One row of chips that behave as a single-choice group. */
function ChipRow<Value extends string>({
  label,
  options,
  active,
  onChange,
}: {
  label: string;
  options: readonly { value: Value; label: string }[];
  active: Value;
  onChange: (value: Value) => void;
}) {
  return (
    <div className={styles.group} role="group" aria-label={label}>
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
 * The browse board's filters (LOC-17): when, where in Lisbon, what kind, and
 * what it costs.
 *
 * These used to be three chips keyed off `orgColor`, a colour the demo
 * registry assigns, which meant a live board's chips filtered on a value the
 * API never sends. All four axes here are real columns the server narrows on.
 */
export function BrowseFilterBar({
  filters,
  onChange,
  onClear,
  hasActiveFilters,
}: {
  filters: BrowseFilterState;
  onChange: (next: BrowseFilterState) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.bar}>
      <ChipRow<WhenPreset>
        label={t("gatherings:hub.browse.when.groupLabel")}
        active={filters.when}
        options={WHEN_PRESETS.map((preset) => ({
          value: preset,
          label: t(WHEN_LABEL_KEYS[preset]),
        }))}
        onChange={(when) => onChange({ ...filters, when })}
      />

      <div className={styles.selects}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            {t("gatherings:hub.browse.hoodLabel")}
          </span>
          <Select
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
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>
            {t("gatherings:hub.browse.typeLabel")}
          </span>
          <Select
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
        </label>
      </div>

      <div className={styles.trailing}>
        <ChipRow<CostFilter>
          label={t("gatherings:hub.browse.cost.groupLabel")}
          active={filters.cost}
          options={COST_FILTERS.map((cost) => ({
            value: cost,
            label: t(COST_LABEL_KEYS[cost]),
          }))}
          onChange={(cost) => onChange({ ...filters, cost })}
        />
        {hasActiveFilters && (
          <Button variant="ghost" size="md" onClick={onClear}>
            {t("gatherings:hub.browse.clearFilters")}
          </Button>
        )}
      </div>
    </div>
  );
}
