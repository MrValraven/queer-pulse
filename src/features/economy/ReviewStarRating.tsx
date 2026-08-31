import {
  useState,
  type FocusEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { FiStar } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useRovingRadioGroup } from "../../shared/hooks";
import styles from "./WriteReviewModal.module.css";

const STAR_VALUES = [1, 2, 3, 4, 5];

/** Star rating picker, 1–5. Shared across the company-review modals. */
export function ReviewStarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const { t } = useTranslation();
  const [hoveredRating, setHoveredRating] = useState(0);
  // Roving tabindex + arrow/Home/End movement, shared with every other
  // radiogroup on the platform. The picker keeps its own hover/focus preview:
  // the hook only supplies `ref`, `tabIndex` and `onKeyDown`.
  const { getRadioProps } = useRovingRadioGroup({
    optionCount: STAR_VALUES.length,
    checkedIndex: STAR_VALUES.indexOf(value),
    onSelect: (index) => {
      const nextRating = STAR_VALUES[index];
      if (nextRating !== undefined) onChange(nextRating);
    },
  });
  /* What the row draws: the rating under the cursor while one is being
     considered, the committed one otherwise. `aria-checked` stays on the
     committed value - a preview is not a choice. */
  const shownRating = hoveredRating || value;

  /* The preview is dropped only when the pointer or focus leaves the whole
     row. Clearing on each button's own exit fires before the next button's
     enter, so sweeping across the picker flashed empty between every pair. */
  const handleStarExit = (
    event: ReactMouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>,
  ) => {
    const next = event.relatedTarget;
    if (
      next instanceof Node &&
      event.currentTarget.parentElement?.contains(next)
    )
      return;
    setHoveredRating(0);
  };

  return (
    <div
      className={styles.stars}
      role="radiogroup"
      aria-label={t("economy:companyReview.overallRatingAriaLabel")}
    >
      {STAR_VALUES.map((starValue, index) => (
        <button
          key={starValue}
          {...getRadioProps(index)}
          type="button"
          role="radio"
          aria-checked={value === starValue}
          aria-label={t("economy:companyReview.starAriaLabel", {
            count: starValue,
          })}
          className={[styles.star, starValue <= shownRating && styles.starOn]
            .filter(Boolean)
            .join(" ")}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={handleStarExit}
          onFocus={() => setHoveredRating(starValue)}
          onBlur={handleStarExit}
          onClick={() => onChange(starValue)}
        >
          <FiStar size={26} aria-hidden />
        </button>
      ))}
    </div>
  );
}
