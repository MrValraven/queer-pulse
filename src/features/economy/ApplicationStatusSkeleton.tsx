import { SkeletonLine } from "../../shared/components/ui";
import styles from "./ApplicationStatusPage.module.css";

/** Placeholder mirroring a real AppCard row so there is zero layout shift on swap. */
export function AppCardSkeleton() {
  return (
    <div className={styles.app} aria-hidden>
      <SkeletonLine width={56} height={56} style={{ borderRadius: 14 }} />
      <div className={styles.appMid}>
        <SkeletonLine width="48%" height={20} />
        <SkeletonLine width="32%" height={13} style={{ marginTop: 6 }} />
        <div className={styles.appMeta}>
          <SkeletonLine width={72} height={20} style={{ borderRadius: 6 }} />
          <SkeletonLine width={96} height={20} style={{ borderRadius: 6 }} />
          <SkeletonLine width={60} height={20} style={{ borderRadius: 6 }} />
        </div>
        <div className={styles.stages} style={{ marginTop: 16 }}>
          <SkeletonLine width="100%" height={5} style={{ borderRadius: 3 }} />
          <SkeletonLine width="100%" height={5} style={{ borderRadius: 3 }} />
          <SkeletonLine width="100%" height={5} style={{ borderRadius: 3 }} />
        </div>
        <SkeletonLine width="80%" height={13} style={{ marginTop: 12 }} />
      </div>
      <div className={styles.appRight}>
        <SkeletonLine width={96} height={22} style={{ borderRadius: 6 }} />
        <SkeletonLine width={120} height={38} style={{ borderRadius: 10 }} />
      </div>
    </div>
  );
}
