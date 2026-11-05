import { SkeletonLine } from "../../shared/components/ui";
import styles from "./SubprofilePortraitCard.module.css";

/**
 * A portrait card's silhouette while the directory loads: the 4:5 picture,
 * the profession, name, tagline and credit lines, and the two action buttons
 * (dropped in compact mode, where the card has no actions row). It takes the
 * same container and surface as the real card, so the grid does not jump
 * when data lands. Decorative: the grid around it carries the busy state.
 */
export function SubprofilePortraitCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.surface} data-skeleton>
        <SkeletonLine
          width="100%"
          height="auto"
          style={{ aspectRatio: "4 / 5", borderRadius: 0 }}
        />
        <div className={styles.body}>
          <SkeletonLine width="45%" height={12} />
          <SkeletonLine width="75%" height={22} />
          <SkeletonLine width="95%" height={14} />
          <SkeletonLine width="60%" height={14} />
          <div className={styles.skeletonActions}>
            <SkeletonLine height={44} />
            <SkeletonLine height={44} />
          </div>
        </div>
      </div>
    </div>
  );
}
