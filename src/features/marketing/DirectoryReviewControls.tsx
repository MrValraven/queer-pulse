import { ChipSelect, FilterChips, Select } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type {
  ReviewContentFilter,
  ReviewSort,
  ReviewStarFilter,
} from "./reviewSort";
import s from "./DirectorySpacePage.module.css";

const SORT_OPTIONS: ReviewSort[] = [
  "newest",
  "oldest",
  "helpful",
  "highest",
  "lowest",
];
const SORT_LABEL_KEYS: Record<ReviewSort, string> = {
  newest: "marketing:directory.detail.reviews.sortNewest",
  oldest: "marketing:directory.detail.reviews.sortOldest",
  helpful: "marketing:directory.detail.reviews.sortHelpful",
  highest: "marketing:directory.detail.reviews.sortHighest",
  lowest: "marketing:directory.detail.reviews.sortLowest",
};
const STAR_VALUES = [5, 4, 3, 2, 1];

/** The content chips, in display order. Multi-select, so `<ChipSelect>` marks
 *  an active one with its leading tick rather than colour alone. */
const CONTENT_OPTIONS: { value: ReviewContentFilter; labelKey: string }[] = [
  {
    value: "photos",
    labelKey: "marketing:directory.detail.reviews.filterPhotos",
  },
  {
    value: "reply",
    labelKey: "marketing:directory.detail.reviews.filterReply",
  },
];

interface Props {
  sort: ReviewSort;
  onSortChange: (sort: ReviewSort) => void;
  starFilter: ReviewStarFilter;
  onStarFilterChange: (value: ReviewStarFilter) => void;
  /** Per-star review counts (unfiltered), keyed 1–5 — shown next to each chip. */
  starCounts: Record<number, number>;
  /** Active content filters, ANDed with each other and with the star filter. */
  contentFilters: Set<string>;
  onContentFilterToggle: (value: string) => void;
  /** Per-content-filter counts (unfiltered) — label each chip and hide the
   *  ones that would match nothing. */
  contentCounts: Record<ReviewContentFilter, number>;
}

/**
 * Sort + star-rating + content filters for the review list — client-side over
 * the already-loaded `place.reviews`. Rendered by `DirectoryReviewsSection`
 * only once a listing has enough reviews to make the controls worth showing
 * (see `MIN_REVIEWS_FOR_CONTROLS`); a listing below that keeps the plain
 * backend-ordered list with no controls at all.
 */
export function DirectoryReviewControls({
  sort,
  onSortChange,
  starFilter,
  onStarFilterChange,
  starCounts,
  contentFilters,
  onContentFilterToggle,
  contentCounts,
}: Props) {
  const { t } = useTranslation();

  // Ratings nobody has given lead nowhere, and the distribution bars right
  // above already account for every empty bucket. The one exception is the
  // rating currently being filtered on: if its last review is edited away
  // mid-session, keep the chip so the active filter stays visible and
  // switchable instead of silently vanishing with the list still narrowed.
  const starValues = STAR_VALUES.filter(
    (stars) => (starCounts[stars] ?? 0) > 0 || String(stars) === starFilter,
  );

  const starOptions = [
    {
      value: "all",
      label: t("marketing:directory.detail.reviews.filterAll"),
    },
    ...starValues.map((stars) => ({
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

  // With every review on the same rating there is nothing to narrow to, so the
  // whole star group would be a control that cannot change what is on screen.
  // An active filter always keeps the group up, whatever the counts do, so the
  // narrowing on screen is never left without the control that caused it.
  const showStarFilter = starValues.length > 1 || starFilter !== "all";

  // A chip nobody can satisfy would only ever blank the list, so drop it.
  const contentOptions = CONTENT_OPTIONS.filter(
    ({ value }) => contentCounts[value] > 0,
  ).map(({ value, labelKey }) => ({
    value,
    label: (
      <>
        {t(labelKey)}
        <span className={s.revFilterCount} aria-hidden>
          {contentCounts[value]}
        </span>
      </>
    ),
  }));

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

      {showStarFilter && (
        <FilterChips
          label={t("marketing:directory.detail.reviews.filterAria")}
          options={starOptions}
          value={starFilter}
          onChange={onStarFilterChange}
        />
      )}

      {contentOptions.length > 0 && (
        <ChipSelect
          label={t("marketing:directory.detail.reviews.filterContentAria")}
          options={contentOptions}
          selected={contentFilters}
          onToggle={onContentFilterToggle}
        />
      )}
    </div>
  );
}
