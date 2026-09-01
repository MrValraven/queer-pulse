import { FiStar } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { HOUSING_REVIEW_MIN_LENGTH } from "./ReviewViewingRules";
import styles from "./housingModals.module.css";

export interface ReviewViewingFormProps {
  /** Unique per instance, so the label and the textarea stay paired when two
   * of these ever render on one page. */
  fieldId: string;
  rating: number;
  onRatingChange: (rating: number) => void;
  text: string;
  onTextChange: (text: string) => void;
  /** True while a write is in flight. The fields stay readable and stop taking
   * keystrokes the request has already left behind. */
  isDisabled?: boolean;
}

/**
 * The stars, the words, the counter and the blind note: everything a member
 * fills in about a viewing, shared by the first submission and by a correction.
 *
 * ONE FORM ON PURPOSE. A separate edit form is how the two stop agreeing about
 * what a review may contain: the minimum length, the placeholder that tells
 * somebody what is useful to write, and the note about when it goes public all
 * have to say the same thing in both places, and the cheapest way to guarantee
 * that is for there to be one of each.
 *
 * The note is where the deadline is stated, once, at the point of writing:
 * a member who learns only at the moment they want to fix a typo that the
 * window shut has been told too late to act on it.
 */
export function ReviewViewingForm({
  fieldId,
  rating,
  onRatingChange,
  text,
  onTextChange,
  isDisabled = false,
}: ReviewViewingFormProps) {
  const { t } = useTranslation();
  const trimmedLength = text.trim().length;
  const remaining = HOUSING_REVIEW_MIN_LENGTH - trimmedLength;

  return (
    <>
      <div className={styles.label}>
        {t("economy:housingViewing.review.ratingLabel")}
      </div>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((starValue) => (
          <button
            key={starValue}
            type="button"
            className={[styles.star, starValue <= rating && styles.starOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => onRatingChange(starValue)}
            disabled={isDisabled}
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
        disabled={isDisabled}
        onChange={(event) => onTextChange(event.target.value)}
      />
      <div className={styles.counter}>
        {remaining > 0
          ? t("economy:housingModal.charsToSubmit", { count: remaining })
          : t("economy:housingModal.charsCount", { count: trimmedLength })}
      </div>
      <div className={styles.note}>
        <span>
          {t("economy:housingViewing.review.blindNote")}{" "}
          {t("economy:housingViewing.review.editableUntilPublic")}
        </span>
      </div>
    </>
  );
}
