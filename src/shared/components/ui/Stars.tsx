import { FiStar } from "react-icons/fi";
import { useTranslation } from "../../i18n/useTranslation";
import styles from "./Stars.module.css";

export interface StarsProps {
  /** The rating, rounded to the nearest whole star for display. */
  value: number;
  /** Total stars in the scale. Default 5. */
  max?: number;
  /** Icon size in px (the row scales to it). Default 15. */
  size?: number;
  /** Accessible label for the rating. Falls back to a translated default. */
  label?: string;
}

/**
 * Read-only star rating. Coral (`var(--accent)`) filled stars up to the rounded
 * value, outlined stars for the remainder — consolidates the per-feature `Stars`
 * copies (economy company reviews, landlord ratings). The group carries an
 * accessible label; the individual icons are decorative.
 */
export function Stars({ value, max = 5, size = 15, label }: StarsProps) {
  const { t } = useTranslation();
  const filled = Math.max(0, Math.min(max, Math.round(value)));
  return (
    <span
      className={styles.stars}
      style={{ fontSize: size }}
      role="img"
      aria-label={label ?? t("shared:stars.ariaLabel", { value: filled, max })}
    >
      {Array.from({ length: max }, (_, starIndex) => (
        <FiStar
          key={starIndex}
          aria-hidden
          fill={starIndex < filled ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}
