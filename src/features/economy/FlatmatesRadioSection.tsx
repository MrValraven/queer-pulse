import { useId } from "react";
import {
  FilterOptionRow,
  FilterSection,
} from "../../shared/components/filterPage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { FlatmatesGroupCounts } from "./flatmatesFacets";

/** One radio row, its label already resolved (neighbourhood names read the
 *  same in every language, so only the other groups translate theirs). */
export interface FlatmatesRadioOption<Value extends string> {
  value: Value;
  label: string;
}

/**
 * A pick-one section: one radio row per option, "any" (`"all"`) first. Every
 * row shares `name` and sits in a radiogroup named by the section title, so
 * the group reads as one labelled radio group.
 *
 * Each row carries the count the facets give it. A count is undefined while
 * the first page is in flight, after it failed, and on a server that predates
 * the facets: that draws no number and never disables the row, since only a
 * counted 0 may take a choice away from a member.
 */
export function FlatmatesRadioSection<Value extends string>({
  title,
  name,
  options,
  value,
  open,
  onToggle,
  onChange,
  counts,
  isCountStale,
}: {
  title: string;
  name: string;
  options: readonly FlatmatesRadioOption<Value>[];
  value: Value;
  open: boolean;
  onToggle: () => void;
  onChange: (value: Value) => void;
  counts: FlatmatesGroupCounts | undefined;
  isCountStale: boolean;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <FilterSection
      title={title}
      headingId={headingId}
      open={open}
      onToggle={onToggle}
      activeCount={value === "all" ? 0 : 1}
    >
      <div role="radiogroup" aria-labelledby={headingId}>
        {options.map((option) => {
          const count = counts?.[option.value];
          const isChecked = value === option.value;
          return (
            <FilterOptionRow
              key={option.value}
              type="radio"
              name={name}
              value={option.value}
              label={option.label}
              isChecked={isChecked}
              // Nobody is left under this option, so picking it could only
              // empty the board. Never while checked, or the member could not
              // leave it, and never for "any", which only lifts a filter.
              isDisabled={count === 0 && !isChecked && option.value !== "all"}
              count={count}
              isCountStale={isCountStale}
              ariaLabel={
                count === undefined
                  ? option.label
                  : t("economy:flatmates.filter.withCount", {
                      label: option.label,
                      count,
                    })
              }
              onChange={() => onChange(option.value)}
            />
          );
        })}
      </div>
    </FilterSection>
  );
}
