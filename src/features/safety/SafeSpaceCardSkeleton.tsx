import { SkeletonLine } from "../../shared/components/ui";
import styles from "./SafeSpacesPage.module.css";

// Mirrors SafeSpaceCard's shape exactly (same .card container → same padding,
// border, radius and 12px gap rhythm) so there's zero layout shift on swap.
export function SafeSpaceCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.cardHead}>
        <SkeletonLine width={84} height={20} style={{ borderRadius: 6 }} />
        <SkeletonLine width={78} height={24} style={{ borderRadius: 999 }} />
      </div>
      <SkeletonLine width="65%" height={24} />
      <SkeletonLine width="45%" height={14} />
      <SkeletonLine width="100%" height={14} style={{ flex: 1 }} />
      <SkeletonLine width="80%" height={14} />
      <div className={styles.tags}>
        <SkeletonLine width={68} height={26} style={{ borderRadius: 7 }} />
        <SkeletonLine width={92} height={26} style={{ borderRadius: 7 }} />
      </div>
      <div className={styles.cardFoot}>
        <SkeletonLine width={96} height={14} />
        <SkeletonLine width={48} height={14} />
      </div>
    </div>
  );
}
