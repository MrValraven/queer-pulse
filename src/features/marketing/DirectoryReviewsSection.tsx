import { useMemo, useState } from "react";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DirectoryPlace } from "./directoryPlaces";
import { DirectoryRatingDistribution } from "./DirectoryRatingDistribution";
import { DirectoryReviewCard } from "./DirectoryReviewCard";
import { DirectoryReviewControls } from "./DirectoryReviewControls";
import { DirectoryReviewForm } from "./DirectoryReviewForm";
import type { ReviewSort, ReviewStarFilter } from "./reviewSort";
import { countByStar, sortAndFilterReviews } from "./reviewSort";
import s from "./DirectorySpacePage.module.css";

/** Below this many reviews, sort/filter controls would sit over a couple of
 *  cards and add clutter rather than value — keep the plain backend-ordered
 *  list instead. Chosen as a small, reasonable floor; adjust if it ever feels
 *  off in practice. */
const MIN_REVIEWS_FOR_CONTROLS = 4;

/** Full-sentence sub-line per active sort mode, so the line above the list
 *  always describes the order actually on screen. The default mode's line is
 *  also the one shown when the list is too short for the controls, since that
 *  short list is in the same newest-first order. */
const SORTED_BY_KEYS: Record<ReviewSort, string> = {
  newest: "marketing:directory.detail.reviews.sortedByNewest",
  highest: "marketing:directory.detail.reviews.sortedByHighest",
  lowest: "marketing:directory.detail.reviews.sortedByLowest",
  helpful: "marketing:directory.detail.reviews.sortedByHelpful",
};

interface Props {
  place: DirectoryPlace;
  /** Moderation preview: hide the interactive review form (read-only view). */
  preview?: boolean;
  /** The viewer's own ref for this listing, present only when they own it —
   * see `DirectorySpacePage`. Threaded down to show owner-reply compose
   * controls; undefined (non-owner, or preview) keeps reviews read-only. */
  ownerRef?: string;
}

/**
 * The directory detail page's "Member reviews" section: the rating
 * distribution, the write-a-review form, and every review row (each rendered
 * by `DirectoryReviewCard`, which owns the review's own dates, photo, helpful
 * vote, report control, author edit and owner reply).
 */
export function DirectoryReviewsSection({
  place,
  preview = false,
  ownerRef,
}: Props) {
  const { t } = useTranslation();
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [starFilter, setStarFilter] = useState<ReviewStarFilter>("all");

  // Below the threshold, skip the controls (and the filter/sort work) entirely
  // and render place.reviews in the backend's own order, unchanged.
  const showControls = place.reviews.length >= MIN_REVIEWS_FOR_CONTROLS;

  const displayedReviews = useMemo(
    () =>
      showControls
        ? sortAndFilterReviews(place.reviews, sort, starFilter)
        : place.reviews,
    [place.reviews, sort, starFilter, showControls],
  );

  const starCounts = useMemo(() => countByStar(place.reviews), [place.reviews]);

  return (
    <section className={s.sec}>
      <h2>
        <Translation
          i18nKey="marketing:directory.detail.reviewsTitle"
          components={{ em: <em /> }}
          values={{ count: place.rating.count }}
        />
      </h2>
      <p className={s.subLine}>
        {t(
          place.reviews.length === 0
            ? "marketing:directory.detail.reviews.emptySub"
            : showControls
              ? SORTED_BY_KEYS[sort]
              : SORTED_BY_KEYS.newest,
        )}
      </p>
      {place.reviews.length > 0 && (
        <DirectoryRatingDistribution
          reviews={place.reviews}
          rating={place.rating}
        />
      )}
      {!preview && <DirectoryReviewForm slug={place.slug} />}
      {showControls && (
        <DirectoryReviewControls
          sort={sort}
          onSortChange={setSort}
          starFilter={starFilter}
          onStarFilterChange={setStarFilter}
          starCounts={starCounts}
        />
      )}
      {showControls && displayedReviews.length === 0 ? (
        <p className={s.revEmpty}>
          {t("marketing:directory.detail.reviews.noStarReviews", {
            count: Number(starFilter),
          })}{" "}
          <button
            type="button"
            className={s.revEmptyReset}
            onClick={() => setStarFilter("all")}
          >
            {t("marketing:directory.detail.reviews.filterAll")}
          </button>
        </p>
      ) : (
        displayedReviews.map((review) => (
          <DirectoryReviewCard
            key={review.id}
            review={review}
            slug={place.slug}
            placeName={place.name}
            preview={preview}
            ownerRef={ownerRef}
          />
        ))
      )}
    </section>
  );
}
