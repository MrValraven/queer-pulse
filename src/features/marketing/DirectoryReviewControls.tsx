import { FilterChips, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ReviewSort, ReviewStarFilter } from "./reviewSort";
import s from "./DirectorySpacePage.module.css";

const SORT_OPTIONS: ReviewSort[] = ["helpful", "highest", "lowest"];
const SORT_LABEL_KEYS: Record<ReviewSort, string> = {
  helpful: "marketing:directory.detail.reviews.sortHelpful",
  highest: "marketing:directory.detail.reviews.sortHighest",
  lowest: "marketing:directory.detail.reviews.sortLowest",
};
const STAR_VALUES = [5, 4, 3, 2, 1];

interface Props {
  sort: ReviewSort;
  onSortChange: (sort: ReviewSort) => void;
  starFilter: ReviewStarFilter;
  onStarFilterChange: (value: ReviewStarFilter) => void;
  /** Per-star review counts (unfiltered), keyed 1–5 — shown next to each chip. */
  starCounts: Record<number, number>;
}

/**
 * Sort + star-rating filter for the review list — client-side over the
 * already-loaded `place.reviews`. Rendered by `DirectoryReviewsSection` only
 * once a listing has enough reviews to make the controls worth showing (see
 * `MIN_REVIEWS_FOR_CONTROLS`); small listings keep the plain backend-ordered
 * list with no controls at all.
 */
export function DirectoryReviewControls({
  sort,
  onSortChange,
  starFilter,
  onStarFilterChange,
  starCounts,
}: Props) {
  const { t } = useTranslation();

  const starOptions = [
    {
      value: "all",
      label: t("marketing:directory.detail.reviews.filterAll"),
    },
    ...STAR_VALUES.map((stars) => ({
      value: String(stars),
      label: (
        <>
          {t("marketing:directory.detail.reviews.filterStars", {
            count: stars,
          })}
          <span className={s.revFilterCount} aria-hidden>
            {starCounts[stars] ?? 0}
          </span>
        </>
      ),
    })),
  ];

  return (
    <div className={s.revControls}>
      <label className={s.revSort}>
        <span className={s.revSortLabel}>
          {t("marketing:directory.detail.reviews.sortLabel")}
        </span>
        <Select
          size="sm"
          options={SORT_OPTIONS.map((option) => ({
            value: option,
            label: t(SORT_LABEL_KEYS[option]),
          }))}
          value={sort}
          onChange={(value) => onSortChange(value as ReviewSort)}
        />
      </label>

      <FilterChips
        label={t("marketing:directory.detail.reviews.filterAria")}
        options={starOptions}
        value={starFilter}
        onChange={onStarFilterChange}
      />
    </div>
  );
}
