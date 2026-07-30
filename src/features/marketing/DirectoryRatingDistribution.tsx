import { FiStar } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { Review } from "./directoryPlaces";
import { STAR_SLOTS } from "./directorySpace.data";
import { countByStar } from "./reviewSort";
import s from "./DirectorySpacePage.module.css";

interface Props {
  reviews: Review[];
  rating: { score: string; count: number };
}

export function DirectoryRatingDistribution({ reviews, rating }: Props) {
  const { t } = useTranslation();
  const counts = countByStar(reviews);
  const total = reviews.length;
  const roundedScore = Math.round(Number(rating.score));

  return (
    <div className={s.ratingDist}>
      <div className={s.ratingDistSummary}>
        <b className={s.ratingDistScore}>{rating.score}</b>
        <span className={s.starRow}>
          {STAR_SLOTS.map((slot) => (
            <FiStar
              key={slot}
              className={slot <= roundedScore ? s.starOn : undefined}
            />
          ))}
        </span>
        <span className={s.ratingDistCount}>
          {t("marketing:directory.detail.reviewsCount", { count: rating.count })}
        </span>
      </div>

      <ul
        className={s.ratingDistBars}
        aria-label={t("marketing:directory.detail.ratingBreakdown")}
      >
        {STAR_SLOTS.slice()
          .reverse()
          .map((stars) => {
            const count = counts[stars] ?? 0;
            const width = total > 0 ? (count / total) * 100 : 0;
            return (
              <li key={stars} className={s.ratingDistRow}>
                <span className={s.ratingDistLabel} aria-hidden="true">
                  {stars}
                  <FiStar className={s.starOn} />
                </span>
                <div
                  className={s.ratingDistTrack}
                  role="meter"
                  aria-valuenow={count}
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-label={t("marketing:directory.detail.starsCount", {
                    stars,
                    count,
                  })}
                >
                  <div
                    className={s.ratingDistFill}
                    style={{ transform: `scaleX(${width / 100})` }}
                  />
                </div>
                <span className={s.ratingDistTotal} aria-hidden="true">
                  {count}
                </span>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
