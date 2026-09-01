import { useId, useState } from "react";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ReviewViewingForm } from "./ReviewViewingForm";
import { isHousingReviewLongEnough } from "./ReviewViewingRules";
import { ReviewViewingPublicNotice } from "./ReviewViewingPublicNotice";
import {
  housingReviewEditRefusal,
  useUpdateHousingReview,
  type HousingReviewEditRefusal,
} from "./api/useHousingReviews";
import type { HousingReviewDTO } from "./api/housingReviews.api";
import styles from "./housingModals.module.css";
import panel from "./ReviewViewingModal.module.css";

const CheckMark = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/**
 * Correcting a review that has not gone public yet.
 *
 * The product rule is one sentence: a review can be corrected up until the
 * moment it goes public, and not after. Housing reviews are blind and mutual,
 * so an edit allowed after reveal would let somebody settle their rating only
 * once they had read what the other person wrote about them, which is the
 * retaliation the blind design exists to prevent.
 *
 * TWO GUARDS, AND THE SECOND IS NOT REDUNDANT. `hasRevealed` keeps the save
 * button away from a member whose review the server already says is public. It
 * comes from the pair's `isYourReviewRevealed`, read through
 * `hasHousingReviewGonePublic`, and it is the same predicate the PATCH gates
 * on, so what this panel offers and what the endpoint accepts are one answer.
 *
 * The 409 stays because that answer is only true at the instant it was fetched.
 * The counterparty can submit theirs while this form sits open, which reveals
 * both reviews underneath the member, and an older backend sends no field at
 * all. Neither is a mistake anybody made, and both land on the same panel. See
 * the note on `updateHousingReview` in `housingReviews.api.ts`.
 */
export function ReviewViewingEditPanel({
  viewingId,
  review,
  counterpartyName,
  hasRevealed,
  onClose,
}: {
  viewingId: string;
  review: HousingReviewDTO;
  counterpartyName: string;
  /** True once the server says this member's own review has gone public
   * (`isYourReviewRevealed`, read through `hasHousingReviewGonePublic`). Live,
   * so a refetch while this panel is open closes the window without waiting for
   * a 409. */
  hasRevealed: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const [rating, setRating] = useState(review.rating);
  const [text, setText] = useState(review.text);
  const [isSaved, setIsSaved] = useState(false);
  const [refusal, setRefusal] = useState<HousingReviewEditRefusal | null>(null);
  const updateReview = useUpdateHousingReview(viewingId);

  // 403 and 404 are dead ends: the review is not this member's to change, or it
  // is not there any more. Retrying the same call cannot turn either around, so
  // the save button goes away rather than inviting a second refusal.
  const isTerminalRefusal = refusal === "notYours" || refusal === "missing";
  const hasChanged =
    rating !== review.rating || text.trim() !== review.text.trim();
  const canSave =
    hasChanged &&
    isHousingReviewLongEnough(text) &&
    !updateReview.isPending &&
    !isTerminalRefusal;

  const save = () => {
    if (!canSave) return;
    updateReview.mutate(
      { reviewId: review.id, rating, text: text.trim() },
      {
        onSuccess: () => setIsSaved(true),
        onError: (error) => setRefusal(housingReviewEditRefusal(error)),
      },
    );
  };

  if (isSaved) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>
          <CheckMark />
        </div>
        <div className={styles.title}>
          <Translation
            i18nKey="economy:housingViewing.review.editSavedTitle"
            components={{ em: <em /> }}
          />
        </div>
        <p className={styles.sub}>
          <Translation
            i18nKey="economy:housingViewing.review.editSavedBody"
            values={{ name: counterpartyName }}
            components={{ strong: <strong /> }}
          />
        </p>
        <div className={styles.actions}>
          <Button variant="ghost" className={styles.full} onClick={onClose}>
            {t("economy:housingModal.done")}
          </Button>
        </div>
      </div>
    );
  }

  if (hasRevealed || refusal === "gonePublic") {
    return <ReviewViewingPublicNotice review={review} onClose={onClose} />;
  }

  return (
    <div>
      <div className={styles.eye}>
        {t("economy:housingViewing.review.editEyebrow")}
      </div>
      <div className={styles.title}>
        <Translation
          i18nKey="economy:housingViewing.review.editTitle"
          values={{ name: counterpartyName }}
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.sub}>
        {t("economy:housingViewing.review.editBody")}
      </p>

      <ReviewViewingForm
        fieldId={fieldId}
        rating={rating}
        onRatingChange={setRating}
        text={text}
        onTextChange={setText}
        isDisabled={updateReview.isPending || isTerminalRefusal}
      />

      {refusal !== null && (
        <p className={panel.saveError} role="alert">
          {t(
            refusal === "notYours"
              ? "economy:housingViewing.review.editNotYours"
              : refusal === "missing"
                ? "economy:housingViewing.review.editMissing"
                : "economy:housingViewing.review.editError",
          )}
        </p>
      )}

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>
          {t("economy:housingModal.cancel")}
        </Button>
        {!isTerminalRefusal && (
          <Button
            variant="primary"
            className={styles.full}
            onClick={save}
            disabled={!canSave}
          >
            {updateReview.isPending
              ? t("economy:housingViewing.review.saving")
              : t("economy:housingViewing.review.saveChanges")}
          </Button>
        )}
      </div>
    </div>
  );
}
