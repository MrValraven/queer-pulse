import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DirectoryPlace } from "./directoryPlaces";
import { DirectoryRatingDistribution } from "./DirectoryRatingDistribution";
import { DirectoryReviewControls } from "./DirectoryReviewControls";
import { DirectoryReviewForm } from "./DirectoryReviewForm";
import { DirectoryReviewReply } from "./DirectoryReviewReply";
import { DirectoryReviewReportControl } from "./DirectoryReviewReportControl";
import type { ReviewSort, ReviewStarFilter } from "./reviewSort";
import { countByStar, sortAndFilterReviews } from "./reviewSort";
import { Stars } from "./DirectoryStars";
import s from "./DirectorySpacePage.module.css";

/** Below this many reviews, sort/filter controls would sit over a couple of
 *  cards and add clutter rather than value — keep the plain backend-ordered
 *  list instead. Chosen as a small, reasonable floor; adjust if it ever feels
 *  off in practice. */
const MIN_REVIEWS_FOR_CONTROLS = 4;

/** Full-sentence sub-line per active sort mode, shown instead of the static
 *  `reviewsSub` copy once the controls are visible — otherwise picking
 *  "Highest rated" left the line reading "Sorted by most helpful", which
 *  contradicted the list below it. */
const SORTED_BY_KEYS: Record<ReviewSort, string> = {
  helpful: "marketing:directory.detail.reviews.sortedByHelpful",
  highest: "marketing:directory.detail.reviews.sortedByHighest",
  lowest: "marketing:directory.detail.reviews.sortedByLowest",
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
 * distribution, the write-a-review form, and every review row (each with its
 * owner-reply block/composer via `DirectoryReviewReply`). Extracted out of
 * `DirectorySpaceMain` to keep that component under the 200-line limit.
 */
export function DirectoryReviewsSection({
  place,
  preview = false,
  ownerRef,
}: Props) {
  const { t } = useTranslation();
  const [sort, setSort] = useState<ReviewSort>("helpful");
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

  const starCounts = useMemo(
    () => countByStar(place.reviews),
    [place.reviews],
  );

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
              : "marketing:directory.detail.reviewsSub",
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
        displayedReviews.map((review) => {
          // Avatar + name/byline. The name label is visible beside the avatar,
          // so `Avatar` gets no `name` (avoids a redundant SR announcement).
          const author = (
            <>
              <Avatar
                initials={review.initials}
                tint={review.tint}
                src={review.avatarUrl ?? undefined}
                size={36}
              />
              <div>
                <div className={s.revName}>{review.name}</div>
                <div className={s.revByline}>{review.byline}</div>
              </div>
            </>
          );
          return (
            <div key={review.id} className={s.rev}>
              <div className={s.revHead}>
                {review.authorSlug ? (
                  <Link
                    to={`/members/${review.authorSlug}`}
                    className={s.revAuthor}
                  >
                    {author}
                  </Link>
                ) : (
                  <div className={s.revAuthor}>{author}</div>
                )}
                <Stars
                  score={review.stars}
                  className={s.revStars}
                  label={t("marketing:directory.detail.reviews.ratingAria", {
                    count: review.stars,
                  })}
                />
              </div>
              <div className={s.revText}>{review.text}</div>
              <div className={s.revHelpful}>
                <Translation
                  i18nKey="marketing:directory.detail.helpful"
                  components={{ b: <b /> }}
                  values={{ count: review.helpful }}
                />
              </div>
              {/* Visible to any viewer, not just the owner (unlike the reply
                  composer below) — hidden only in the moderation preview,
                  same as the write-a-review form above. */}
              {!preview && (
                <DirectoryReviewReportControl
                  reviewId={review.id}
                  reviewerName={review.name}
                />
              )}
              <DirectoryReviewReply
                review={review}
                ownerRef={ownerRef}
                slug={place.slug}
              />
            </div>
          );
        })
      )}
    </section>
  );
}
