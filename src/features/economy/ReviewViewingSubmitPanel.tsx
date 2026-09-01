import { useId, useState } from "react";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ReviewViewingForm } from "./ReviewViewingForm";
import { isHousingReviewLongEnough } from "./ReviewViewingRules";
import { useSubmitHousingReview } from "./api/useHousingReviews";
import styles from "./housingModals.module.css";

const CheckMark = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/**
 * Writing the review for the first time. The copy is explicit that neither side
 * sees the other's words until both have written: the anti-retaliation design
 * that keeps reviews honest.
 *
 * Fields come from `ReviewViewingForm`, shared with the correction path, so the
 * two cannot drift about what a review may contain.
 *
 * `isSubmitted` is owned by the modal rather than by this panel: submitting
 * invalidates the review pair, and the modal has to keep choosing this panel
 * afterwards instead of swapping the thank-you out for the edit form.
 */
export function ReviewViewingSubmitPanel({
  viewingId,
  counterpartyName,
  isSubmitted,
  onSubmitted,
  onClose,
}: {
  viewingId: string;
  counterpartyName: string;
  isSubmitted: boolean;
  onSubmitted: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const submitReview = useSubmitHousingReview(viewingId);
  const canSubmit = isHousingReviewLongEnough(text) && !submitReview.isPending;

  const submit = () => {
    if (!canSubmit) return;
    submitReview.mutate(
      { viewingId, rating, text: text.trim() },
      {
        onSuccess: onSubmitted,
        onError: () =>
          showToast(t("economy:housingViewing.review.error"), "error"),
      },
    );
  };

  if (isSubmitted) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>
          <CheckMark />
        </div>
        <div className={styles.title}>
          <Translation
            i18nKey="economy:housingViewing.review.successTitle"
            components={{ em: <em /> }}
          />
        </div>
        <p className={styles.sub}>
          <Translation
            i18nKey="economy:housingViewing.review.successBody"
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

  return (
    <div>
      <div className={styles.eye}>
        {t("economy:housingViewing.review.eyebrow")}
      </div>
      <div className={styles.title}>
        <Translation
          i18nKey="economy:housingViewing.review.title"
          values={{ name: counterpartyName }}
          components={{ em: <em /> }}
        />
      </div>
      <p className={styles.sub}>{t("economy:housingViewing.review.body")}</p>

      <ReviewViewingForm
        fieldId={fieldId}
        rating={rating}
        onRatingChange={setRating}
        text={text}
        onTextChange={setText}
        isDisabled={submitReview.isPending}
      />

      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>
          {t("economy:housingModal.cancel")}
        </Button>
        <Button
          variant="primary"
          className={styles.full}
          onClick={submit}
          disabled={!canSubmit}
        >
          {t("economy:housingViewing.review.submit")}
        </Button>
      </div>
    </div>
  );
}
