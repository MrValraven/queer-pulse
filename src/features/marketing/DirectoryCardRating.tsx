import { FiStar } from "react-icons/fi";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { DirectoryPlace } from "./directoryPlaces";
import s from "./DirectoryPage.module.css";

/** The top of the scale the score is out of. */
const RATING_MAX = 5;

/**
 * The directory card's compact rating: one filled star, the score to one
 * decimal and the review count beside it.
 *
 * A single star keeps the rating to a narrow chip, so a long place name keeps
 * most of a narrow grid column's width for itself. The star and score carry
 * the accessible name; the count stays readable text beside them, as it was
 * when this was a five-star row.
 *
 * Renders nothing for a place without reviews: five empty stars, or a "0.0",
 * would read as a place members rated zero.
 */
export function DirectoryCardRating({ place }: { place: DirectoryPlace }) {
  const { t } = useTranslation();
  const format = useFormat();
  const score = Number(place.rating.score);
  if (place.rating.count <= 0 || !Number.isFinite(score)) return null;

  const formattedScore = format.number(score, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <div className={s.rating} data-preview-region="chrome">
      <span
        className={s.ratingScore}
        role="img"
        aria-label={t("shared:stars.ariaLabel", {
          value: formattedScore,
          max: RATING_MAX,
        })}
      >
        <FiStar className={s.ratingStar} aria-hidden fill="currentColor" />
        {formattedScore}
      </span>
      <span className={s.ratingCount}>
        ({format.number(place.rating.count)})
      </span>
    </div>
  );
}
