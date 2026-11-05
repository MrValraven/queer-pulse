import { FiCheck } from "react-icons/fi";
import { Select } from "../../../shared/components/ui";
import { RollingNumber } from "../../../shared/components/ui/RollingNumber";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  isFacetOptionUnavailable,
  type FacetOption,
} from "./useBrowseFacetOptions";
import styles from "./BrowseFilterBar.module.css";

/** The option's accessible name: the bare label until its count is known,
 *  then the label and how many events it would show. The drawn number is
 *  `aria-hidden`, so a screen reader never hears "Free 12" as a quantity. */
function useFacetOptionName() {
  const { t } = useTranslation();
  return (option: FacetOption<string>) =>
    option.count === undefined
      ? option.label
      : t("gatherings:hub.browse.withCount", {
          label: option.label,
          count: option.count,
        });
}

/**
 * One row of chips that behave as a single-choice group, each chip trailed
 * by its availability count the way `ChipSelect` draws one. A chip with
 * nothing under it is dimmed and disabled, unless it is the one picked.
 */
export function ChipRow<Value extends string>({
  options,
  active,
  onChange,
}: {
  options: readonly FacetOption<Value>[];
  active: Value;
  onChange: (value: Value) => void;
}) {
  const fmt = useFormat();
  const nameFor = useFacetOptionName();
  return (
    <div className={styles.group}>
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = active === option.value;
        const isUnavailable = isFacetOptionUnavailable(option, isSelected);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            aria-label={
              option.count === undefined ? undefined : nameFor(option)
            }
            disabled={isUnavailable}
            className={[styles.chip, isUnavailable && styles.chipEmpty]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onChange(option.value)}
          >
            {Icon && <Icon className={styles.chipIcon} aria-hidden />}
            {option.label}
            {option.count !== undefined && (
              <span className={styles.chipCount} aria-hidden>
                <RollingNumber
                  value={fmt.number(option.count)}
                  numericValue={option.count}
                />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * A compact select whose rows carry their availability counts. The label
 * stays a plain string, so the trigger shows the bare name and the
 * typeahead still matches it; the count is drawn in the row only. A row
 * with nothing under it is disabled, unless it is the one picked.
 */
export function FacetSelect({
  options,
  value,
  onChange,
  labelledBy,
}: {
  options: readonly FacetOption<string>[];
  value: string;
  onChange: (value: string) => void;
  labelledBy: string;
}) {
  const fmt = useFormat();
  const nameFor = useFacetOptionName();
  const optionByValue = new Map(
    options.map((option) => [option.value, option]),
  );
  return (
    <Select
      size="sm"
      labelledBy={labelledBy}
      options={options.map((option) => ({
        value: option.value,
        label: option.label,
        disabled: isFacetOptionUnavailable(option, option.value === value),
      }))}
      value={value}
      onChange={(next) => onChange(next ?? "")}
      renderOption={(selectOption, state) => {
        const option = optionByValue.get(selectOption.value);
        const count = option?.count;
        return (
          <>
            <span
              className={styles.optionLabel}
              aria-hidden={count === undefined ? undefined : true}
            >
              {selectOption.label}
            </span>
            {option && count !== undefined && (
              <>
                <span className={styles.optionCount} aria-hidden>
                  {fmt.number(count)}
                </span>
                <span className={styles.srOnly}>{nameFor(option)}</span>
              </>
            )}
            {state.selected && (
              <FiCheck className={styles.optionCheck} aria-hidden />
            )}
          </>
        );
      }}
    />
  );
}
