import { useState } from "react";
import { FiAlertCircle, FiFlag, FiStar } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { initialsOf, tintForSlug } from "../../shared/api/refs";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { HousingReviewDTO } from "./api/housingReviews.api";
import { HousingReviewReply } from "./HousingReviewReply";
import { ReportListingModal } from "./ReportListingModal";
import styles from "./HousingReviewList.module.css";

/**
 * One revealed guest review of a home, with the lister's answer under it.
 *
 * REPORTING. The control reports the `review` subject, and the copy says out
 * loud that it covers the reply too. That is the taxonomy's own reading rather
 * than a shortcut: `ReportSubjectType.Review` states that a review's reply is
 * not separately takedown-able, because a reply read without the review it
 * answers is not the same statement. A moderator hiding the review takes the
 * reply with it, and neither then skews the home's average.
 */
export function HousingReviewCard({
  review,
  listingSlug,
  isViewerTheLister,
}: {
  review: HousingReviewDTO;
  listingSlug: string;
  isViewerTheLister: boolean;
}) {
  const { t } = useTranslation();
  const format = useFormat();
  const [isReporting, setIsReporting] = useState(false);

  // `author` is null once that member erased their account: the review survives
  // unattributed because the next tenant still needs to read it. Never reach for
  // a slug that is no longer there.
  const authorName = review.author
    ? `${review.author.firstName} ${review.author.lastName}`.trim()
    : t("economy:housingViewing.reviews.anonymous");
  const authorSlug = review.author?.slug ?? "member";

  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewTop}>
        <Avatar
          initials={
            review.author
              ? initialsOf(review.author.firstName, review.author.lastName)
              : // The removed-member label's own first letter, so the
                // placeholder follows the reader's language instead of a
                // hardcoded character.
                authorName.slice(0, 1).toUpperCase()
          }
          tint={tintForSlug(authorSlug)}
          size={32}
        />
        <span className={styles.reviewName}>{authorName}</span>
        <span
          className={styles.reviewStars}
          aria-label={t("economy:housingViewing.reviews.ratingAria", {
            count: review.rating,
          })}
        >
          {Array.from({ length: review.rating }).map((_unused, index) => (
            <FiStar key={index} aria-hidden />
          ))}
        </span>
      </div>

      <p className={styles.reviewText}>{review.text}</p>

      {review.editedAt && (
        <p className={styles.editedNote}>
          {t("economy:housingReview.editedOn", {
            date: format.date(new Date(review.editedAt), {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          })}
        </p>
      )}

      <HousingReviewReply
        review={review}
        listingSlug={listingSlug}
        isViewerTheLister={isViewerTheLister}
      />

      {/* Server-precomputed (`isEditedAfterListerReply`), never re-derived here
          from timestamps. Said in plain words next to the reply so a reader can
          weigh it without either side being blamed: the review moved after the
          lister answered it, so the answer above may be answering words that
          are no longer on the page.

          THIS SHOULD NEVER RENDER ON HOUSING NOW, and it is kept anyway. Edits
          close when a review goes public and replies open at that same moment,
          so the two can no longer overlap and the backend cannot produce the
          flag through the edit endpoint. It still derives the flag from the row
          rather than hardcoding false, so a row that somehow carries that
          ordering warns rather than rendering as an unqualified reply. Removing
          the render would be the version that fails quietly. */}
      {review.isEditedAfterListerReply && (
        <p className={styles.staleReplyNote}>
          <FiAlertCircle aria-hidden />
          {t("economy:housingReview.editedAfterReply")}
        </p>
      )}

      <div className={styles.reviewFoot}>
        <Button
          variant="ghost"
          className={styles.reportButton}
          onClick={() => setIsReporting(true)}
        >
          <FiFlag aria-hidden />
          {t("economy:housingReview.report.cta")}
        </Button>
      </div>

      {isReporting && (
        <ReportListingModal
          subjectType="review"
          subjectId={review.id}
          subjectName={t("economy:housingReview.report.subjectName", {
            name: authorName,
          })}
          onClose={() => setIsReporting(false)}
        />
      )}
    </div>
  );
}
