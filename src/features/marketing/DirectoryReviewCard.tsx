import { useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit2 } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useAuth } from "../../app/providers/authContext";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useEditReview } from "./api/useEditReview";
import type { Review } from "./directoryPlaces";
import { DirectoryReviewComposer } from "./DirectoryReviewComposer";
import { DirectoryReviewHelpful } from "./DirectoryReviewHelpful";
import { DirectoryReviewMeta } from "./DirectoryReviewMeta";
import { DirectoryReviewPhoto } from "./DirectoryReviewPhoto";
import { DirectoryReviewReply } from "./DirectoryReviewReply";
import { DirectoryReportControl } from "./DirectoryReportControl";
import { Stars } from "./DirectoryStars";
import s from "./DirectorySpacePage.module.css";

interface Props {
  review: Review;
  slug: string;
  placeName: string;
  /** Moderation preview: no compose affordances anywhere in the row. */
  preview: boolean;
  /** The viewer's own ref for this listing, present only when they own it. */
  ownerRef?: string;
}

/**
 * One review: who wrote it and when, their words and photo, the helpful vote,
 * the report control, the author's own edit affordance, and the owner's reply.
 * Extracted out of `DirectoryReviewsSection` so both stay well inside the
 * 200-line limit.
 */
export function DirectoryReviewCard({
  review,
  slug,
  placeName,
  preview,
  ownerRef,
}: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const editReview = useEditReview(slug);
  const [isEditing, setIsEditing] = useState(false);

  // The PATCH endpoint is author-gated and answers 403 for anyone else, so the
  // affordance appears only on the signed-in member's own review.
  const isOwnReview = Boolean(
    user?.profile.slug && review.authorSlug === user.profile.slug,
  );

  // The name label is visible beside the avatar, so `Avatar` gets no `name`
  // (that would be a redundant screen-reader announcement).
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
    <div className={s.rev}>
      <div className={s.revHead}>
        {review.authorSlug ? (
          <Link to={`/members/${review.authorSlug}`} className={s.revAuthor}>
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
      <DirectoryReviewMeta review={review} />

      {isEditing ? (
        <DirectoryReviewComposer
          title={t("marketing:directory.detail.review.editTitle")}
          initialStars={review.stars}
          initialText={review.text}
          initialPhotoUrl={review.photoUrl ?? null}
          submitLabel={t("marketing:directory.detail.review.saveEdit")}
          pendingLabel={t("marketing:directory.detail.review.savingEdit")}
          isPending={editReview.isPending}
          onCancel={() => setIsEditing(false)}
          onSubmit={(values) =>
            editReview.mutate(
              { reviewId: review.id, ...values },
              {
                onSuccess: () => {
                  setIsEditing(false);
                  showToast(
                    t("marketing:directory.detail.review.editSuccessToast"),
                    "success",
                  );
                },
                onError: () =>
                  showToast(
                    t("marketing:directory.detail.review.editErrorToast"),
                    "error",
                  ),
              },
            )
          }
        />
      ) : (
        <>
          <div className={s.revText}>{review.text}</div>
          {review.photoUrl && (
            <DirectoryReviewPhoto
              photoUrl={review.photoUrl}
              reviewerName={review.name}
              placeName={placeName}
            />
          )}
          <div className={s.revActions}>
            <DirectoryReviewHelpful
              review={review}
              slug={slug}
              isOwnReview={isOwnReview}
              isReadOnly={preview}
            />
            {/* Visible to every viewer, including people who do not own the
                listing. Hidden only in the moderation preview, same as the
                write-a-review form. */}
            {!preview && (
              <DirectoryReportControl
                subjectId={review.id}
                subjectKind="review"
                authorName={review.name}
              />
            )}
            {!preview && isOwnReview && (
              <Button
                variant="ghost"
                size="sm"
                className={s.revEditToggle}
                onClick={() => setIsEditing(true)}
              >
                <FiEdit2 aria-hidden />
                {t("marketing:directory.detail.review.editCta")}
              </Button>
            )}
          </div>
        </>
      )}

      <DirectoryReviewReply review={review} ownerRef={ownerRef} slug={slug} />
    </div>
  );
}
