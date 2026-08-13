import { useId, useState } from "react";
import { FiStar } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { ModalShell } from "./ModalKit";
import { useSubmitHousingReview } from "./api/useHousingReviews";
import styles from "./housingModals.module.css";

const Check = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/** Blind review after a completed viewing. The copy is explicit that neither
 * side sees the other's words until both have written — the anti-retaliation
 * design that keeps reviews honest. */
export function ReviewViewingModal({
  viewingId,
  counterpartyName,
  onClose,
}: {
  viewingId: string;
  counterpartyName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fieldId = useId();
  const { showToast } = useToast();
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const submitReview = useSubmitHousingReview(viewingId);
  const canSubmit = text.trim().length >= 20 && !submitReview.isPending;
  const remaining = 20 - text.trim().length;

  const submit = () => {
    if (text.trim().length < 20) return;
    submitReview.mutate(
      { viewingId, rating: stars, text: text.trim() },
      {
        onSuccess: () => setDone(true),
        onError: () =>
          showToast(t("economy:housingViewing.review.error"), "error"),
      },
    );
  };

  return (
    <ModalShell
      onClose={onClose}
      ariaLabel={t("economy:housingViewing.review.ariaLabel")}
    >
      {done ? (
        <div className={styles.success}>
          <div className={styles.successIcon}>
            <Check />
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
      ) : (
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
          <p className={styles.sub}>
            {t("economy:housingViewing.review.body")}
          </p>

          <div className={styles.label}>
            {t("economy:housingViewing.review.ratingLabel")}
          </div>
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((starValue) => (
              <button
                key={starValue}
                type="button"
                className={[styles.star, starValue <= stars && styles.starOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setStars(starValue)}
                aria-label={t("economy:housingModal.recommend.starAriaLabel", {
                  count: starValue,
                })}
              >
                <FiStar />
              </button>
            ))}
          </div>

          <label className={styles.label} htmlFor={`${fieldId}-review`}>
            {t("economy:housingViewing.review.whatWasItLike")}
          </label>
          <textarea
            id={`${fieldId}-review`}
            className={styles.textarea}
            placeholder={t("economy:housingViewing.review.placeholder")}
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <div className={styles.counter}>
            {remaining > 0
              ? t("economy:housingModal.charsToSubmit", { count: remaining })
              : t("economy:housingModal.charsCount", {
                  count: text.trim().length,
                })}
          </div>
          <div className={styles.note}>
            {t("economy:housingViewing.review.blindNote")}
          </div>
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
      )}
    </ModalShell>
  );
}
