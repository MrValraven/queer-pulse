import { LoadErrorState, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useListingReviews } from "./api/useHousingReviews";
import { HousingReviewCard } from "./HousingReviewCard";
import styles from "./HousingReviewList.module.css";

/**
 * The public reviews block on a housing listing: the average computed over
 * revealed reviews, the revealed guest reviews themselves, and the lister's
 * right of reply under each one (PRD-47).
 *
 * BLIND REVIEWS THAT HAVE NOT UNLOCKED ARE SIMPLY NOT HERE. The server decides
 * that, so nothing is ever shown early and this component has no reveal logic
 * of its own to get wrong.
 *
 * A FAILED FETCH IS NEVER AN EMPTY STATE. This block previously rendered
 * "no reviews yet" whenever `data` was missing, which told a reader that nobody
 * had reviewed a home when the truth was that the request had failed. On a
 * housing surface that is the difference between "this home has no history" and
 * "we could not load this home's history", and a reader deciding whether to
 * view a flat is entitled to know which. Now an outage says so and offers a
 * retry.
 */
export function HousingReviewList({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useListingReviews(slug);

  if (isLoading) {
    return (
      <div className={styles.reviews} aria-hidden>
        <SkeletonLine width="40%" height={22} />
        <SkeletonLine width="100%" height={78} />
        <SkeletonLine width="100%" height={78} />
      </div>
    );
  }

  if (isError) {
    return (
      <LoadErrorState
        compact
        onRetry={() => void refetch()}
        title={t("economy:housingReview.loadError.title")}
        description={t("economy:housingReview.loadError.body")}
      />
    );
  }

  if (!data || data.count === 0) {
    return (
      <p className={styles.emptyLine}>
        {t("economy:housingViewing.reviews.empty")}
      </p>
    );
  }

  return (
    <div className={styles.reviews}>
      <div className={styles.reviewsHead}>
        <span className={styles.average}>{data.averageRating?.toFixed(1)}</span>
        <span className={styles.averageOutOf}>
          {t("economy:housingViewing.reviews.outOf")}
        </span>
        <span className={styles.averageCount}>
          {t("economy:housingViewing.reviews.count", { count: data.count })}
        </span>
      </div>
      {data.reviews.map((review) => (
        <HousingReviewCard
          key={review.id}
          review={review}
          listingSlug={slug}
          // Server-decided (`HousingListingReviewsDTO.isViewerTheLister`), never
          // guessed here by comparing profile slugs: the compose affordance must
          // not render for anybody the endpoint would refuse. Absent (demo
          // fixtures, an older server) reads as false.
          isViewerTheLister={data.isViewerTheLister === true}
        />
      ))}
    </div>
  );
}
