import { FiStar } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./WriteReviewModal.module.css";

/** Star rating picker, 1–5. Shared across the company-review modals. */
export function ReviewStarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.stars}
      role="radiogroup"
      aria-label={t("economy:companyReview.overallRatingAriaLabel")}
    >
      {[1, 2, 3, 4, 5].map((starValue) => (
        <button
          key={starValue}
          type="button"
          role="radio"
          aria-checked={value === starValue}
          aria-label={t("economy:companyReview.starAriaLabel", {
            count: starValue,
          })}
          className={[styles.star, starValue <= value && styles.starOn]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(starValue)}
        >
          <FiStar size={26} aria-hidden />
        </button>
      ))}
    </div>
  );
}
