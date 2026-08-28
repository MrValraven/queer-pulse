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
          return (
            <Button
              variant="ghost"
              size="sm"
              key={option.value}
              // The chips are a single-select filter, so each one announces
              // whether it is the one currently applied.
              aria-pressed={filter === option.value}
              className={[
                styles.chip,
                filter === option.value && styles.chipActive,
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setFilter(option.value)}
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
