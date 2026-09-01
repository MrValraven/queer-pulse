import { useId, type Dispatch, type SetStateAction } from "react";
import { Button, RefineGroup } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { CommunityType } from "../homepage/data/types";
import type { DiscoverCategoryCounts } from "./useDiscoverCategoryCounts";
import { FILTERS } from "./communitiesDiscover.data";
import styles from "./CommunitiesPage.module.css";

/**
 * The category chips, one band of the communities grid's "Refine" drawer.
 *
 * Each chip carries its own total. Those counts are stable across the search,
 * the sort and the toggles (see `CommunitiesPage`'s `allForCounts`) so
 * switching one chip never makes the others' numbers jump, and a count is
 * omitted rather than shown as "0" until its pool has fully loaded.
 *
 * A chip that lands on 0 goes inert: picking it could only ever empty the
 * grid, and a dead end the viewer has to back out of is worse than a chip that
 * says up front there is nothing there.
 */
export function CommunitiesCategoryFilter({
  filter,
  setFilter,
  categoryCounts,
}: {
  filter: "all" | CommunityType;
  setFilter: Dispatch<SetStateAction<"all" | CommunityType>>;
  /** Per-type totals, `null` for a chip whose count hasn't landed yet. */
  categoryCounts: DiscoverCategoryCounts;
}) {
  const { t } = useTranslation();
  const labelId = useId();

  return (
    <RefineGroup
      label={t("communities:discover.filter.categoryLabel")}
      labelId={labelId}
      role="group"
      aria-labelledby={labelId}
    >
      <div className={styles.filters}>
        {FILTERS.map((option) => {
          const count = categoryCounts[option.value];
          const isSelected = filter === option.value;
          // A chip whose pool is empty would filter the grid down to nothing,
          // so it goes inert. Three chips never do: one still loading (`null`,
          // no number shown yet), the one currently applied (otherwise the
          // active chip greys out under the viewer), and "All communities",
          // which stays the way back out of any other chip.
          const isEmpty = count === 0 && !isSelected && option.value !== "all";
          return (
            <Button
              variant="ghost"
              size="sm"
              key={option.value}
              // The chips are a single-select filter, so each one announces
              // whether it is the one currently applied.
              aria-pressed={isSelected}
              // `aria-disabled` rather than the `disabled` attribute: an empty
              // category is worth hearing ("Sports, 0, dimmed") while tabbing
              // the row, and a real `disabled` would drop it out of the tab
              // order and say nothing at all. Same pixels (Button.module.css
              // dims both identically), the click is refused below.
              aria-disabled={isEmpty || undefined}
              className={[styles.chip, isSelected && styles.chipActive]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                if (isEmpty) return;
                setFilter(option.value);
              }}
            >
              {t(option.labelKey)}
              {count !== null && (
                <span className={styles.chipCount}>{count}</span>
              )}
            </Button>
          );
        })}
      </div>
    </RefineGroup>
  );
}
