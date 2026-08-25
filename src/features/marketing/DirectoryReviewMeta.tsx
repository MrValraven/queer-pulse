import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Review } from "./directoryPlaces";
import s from "./DirectorySpacePage.module.css";

/**
 * When a review was written, and whether it has been rewritten since.
 *
 * Both fields are optional on the frontend `Review` type: live payloads always
 * carry `createdAt`, the demo fixture carries none, so an undated review simply
 * renders nothing here rather than an Invalid Date. The "edited" marker is
 * plain words, never a colour-only or icon-only signal.
 */
export function DirectoryReviewMeta({ review }: { review: Review }) {
  const { t } = useTranslation();
  const fmt = useFormat();

  const postedAt = review.createdAt ? new Date(review.createdAt) : null;
  const hasDate = postedAt !== null && !Number.isNaN(postedAt.getTime());
  const isEdited = Boolean(review.editedAt);
  if (!hasDate && !isEdited) return null;

  return (
    <div className={s.revMeta}>
      {hasDate && (
        <time dateTime={review.createdAt}>
          {fmt.date(postedAt, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </time>
      )}
      {isEdited && (
        <span className={s.revEdited}>
          {t("marketing:directory.detail.reviews.edited")}
        </span>
      )}
    </div>
  );
}
