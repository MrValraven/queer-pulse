import type { JSX } from "react";
import { FiStar } from "react-icons/fi";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import styles from "./VjGrid.module.css";

interface VjFavoriteStarProps {
  clipId: string;
  title: string;
  isFavorite: boolean;
  tabIndex: 0 | -1;
  onToggleFavorite: (clipId: string, isFavorite: boolean) => void;
}

/**
 * The favorite toggle in a tile's top-right corner: a 24px star in a 44px
 * hit area, a sibling of the tile's main button so a press on it never
 * reaches the tile. Filled with the accent while on.
 */
export function VjFavoriteStar({
  clipId,
  title,
  isFavorite,
  tabIndex,
  onToggleFavorite,
}: VjFavoriteStarProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className={styles.star}
      aria-pressed={isFavorite}
      aria-label={t(isFavorite ? "vj:grid.unfavorite" : "vj:grid.favorite", {
        title,
      })}
      tabIndex={tabIndex}
      data-vj-favorite-star=""
      onClick={() => onToggleFavorite(clipId, !isFavorite)}
    >
      <span className={styles.starDisc} aria-hidden="true">
        {/* An undefined fill paints a Feather icon black: both branches are explicit. */}
        <FiStar
          className={styles.starIcon}
          fill={isFavorite ? "currentColor" : "none"}
        />
      </span>
    </button>
  );
}
