import { useId, type Dispatch, type SetStateAction } from "react";
import {
  FilterOptionRow,
  FilterSection,
} from "../../shared/components/filterPage";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityType } from "../homepage/data/types";
import type { DiscoverCategoryCounts } from "./discoverCategoryCounts";
import { FILTERS } from "./communitiesDiscover.data";

/**
 * The "Category" section of the communities filter sidebar: one radio row per
 * community type, "All communities" first, each carrying its own total.
 *
 * Each total is a live facet off the browse response (`facets.types`, and
 * `facets.allTypes` for "All communities"): how many communities that row
 * would show under the search, the quick filters and the tags already
 * applied. A count the server did not send (first page in flight, a failed
 * read, an older server) is left off entirely and the row stays enabled.
 *
 * A row that lands on 0 is disabled: picking it could only ever empty the
 * grid. Two rows never are: the one currently applied, so a member can always
 * see what is on, and "All communities", which is the way back out of any
 * other row.
 */
export function CommunitiesCategoryFilter({
  filter,
  setFilter,
  categoryCounts,
  isOpen,
  onToggle,
}: {
  filter: "all" | CommunityType;
  setFilter: Dispatch<SetStateAction<"all" | CommunityType>>;
  /** Per-type totals; a row missing from the map has no count yet. */
  categoryCounts: DiscoverCategoryCounts;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  const radioGroupName = useId();
  const headingId = useId();

  return (
    <FilterSection
      title={t("communities:discover.filter.categoryLabel")}
      headingId={headingId}
      open={isOpen}
      onToggle={onToggle}
      activeCount={filter === "all" ? 0 : 1}
    >
      <div role="radiogroup" aria-labelledby={headingId}>
        {FILTERS.map((option) => {
          const label = t(option.labelKey);
          // Missing means "not counted", which must never be drawn as a 0.
          const count = categoryCounts[option.value];
          const isChecked = filter === option.value;
          const isEmpty = count === 0 && !isChecked && option.value !== "all";
          return (
            <FilterOptionRow
              key={option.value}
              type="radio"
              name={radioGroupName}
              value={option.value}
              label={label}
              isChecked={isChecked}
              isDisabled={isEmpty}
              count={count}
              // The visible count is decorative for assistive tech; the input
              // carries the whole phrase, "Arts, 4 communities".
              ariaLabel={
                count === undefined
                  ? label
                  : t("communities:discover.toggle.withCount", { label, count })
              }
              onChange={() => setFilter(option.value)}
            />
          );
        })}
      </div>
    </FilterSection>
  );
}
