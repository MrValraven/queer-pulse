import { FiStar } from "react-icons/fi";
import { Avatar } from "../../shared/components/ui";
import { initialsOf, tintForSlug } from "../../shared/api/refs";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useListingReviews } from "./api/useHousingReviews";
import type { HousingReviewDTO } from "./api/housingReviews.api";
import v from "./housingViewings.module.css";

/** Public reviews block for a listing — the average (computed on read over
 * revealed reviews only) plus the revealed guest reviews. Blind reviews that
 * haven't unlocked yet simply aren't here, so nothing is ever shown early. */
export function ListingReviews({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { data } = useListingReviews(slug);
  const reviews = data?.reviews ?? [];

  if (!data || data.count === 0) {
    return (
      <p className={v.noteLine}>{t("economy:housingViewing.reviews.empty")}</p>
    );
  }

  return (
    <div className={v.reviews}>
      <div className={v.reviewsHead}>
        <span className={v.avg}>{data.averageRating?.toFixed(1)}</span>
        <span className={v.avgOutOf}>{t("economy:housingViewing.reviews.outOf")}</span>
        <span className={v.avgCount}>
          {t("economy:housingViewing.reviews.count", { count: data.count })}
        </span>
      </div>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: HousingReviewDTO }) {
  const { t } = useTranslation();
  const name = review.author
    ? `${review.author.firstName} ${review.author.lastName}`.trim()
    : t("economy:housingViewing.reviews.anonymous");
  const slug = review.author?.slug ?? "member";
  return (
    <div className={v.reviewCard}>
      <div className={v.reviewTop}>
        <Avatar
          initials={
            review.author
              ? initialsOf(review.author.firstName, review.author.lastName)
              : "·"
          }
          tint={tintForSlug(slug)}
          size={32}
        />
        <span className={v.reviewName}>{name}</span>
        <span
          className={v.reviewStars}
          aria-label={t("economy:housingViewing.reviews.ratingAria", {
            count: review.rating,
          })}
        >
          {Array.from({ length: review.rating }).map((_unused, index) => (
            <FiStar key={index} aria-hidden />
          ))}
        </span>
      </div>
      <p className={v.reviewText}>{review.text}</p>
    </div>
  );
}
