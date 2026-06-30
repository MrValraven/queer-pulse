import { SkeletonAvatar, SkeletonLine } from "../../shared/components/ui";
import styles from "./FlatmatesPage.module.css";

// Mirrors FlatmateCard's shape so there's zero layout shift on swap.
export function FlatmateSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.cardTop}>
        <SkeletonAvatar size={52} />
        <div className={styles.identity}>
          <SkeletonLine width="60%" height={21} />
          <SkeletonLine width="40%" height={12} style={{ marginTop: 6 }} />
        </div>
        <SkeletonLine width={92} height={22} style={{ borderRadius: 7 }} />
      </div>
      <div className={styles.details}>
        <SkeletonLine width={104} height={24} style={{ borderRadius: 7 }} />
        <SkeletonLine width={88} height={24} style={{ borderRadius: 7 }} />
        <SkeletonLine width={76} height={24} style={{ borderRadius: 7 }} />
      </div>
      <div className={styles.note}>
        <SkeletonLine width="100%" height={14} />
        <SkeletonLine width="92%" height={14} style={{ marginTop: 7 }} />
        <SkeletonLine width="70%" height={14} style={{ marginTop: 7 }} />
      </div>
      <div className={styles.tags}>
        <SkeletonLine width={70} height={22} style={{ borderRadius: 6 }} />
        <SkeletonLine width={86} height={22} style={{ borderRadius: 6 }} />
        <SkeletonLine width={58} height={22} style={{ borderRadius: 6 }} />
      </div>
      <div className={styles.foot}>
        <SkeletonLine width={110} height={12} />
        <SkeletonLine width={96} height={36} style={{ borderRadius: 999 }} />
      </div>
    </div>
  );
}
