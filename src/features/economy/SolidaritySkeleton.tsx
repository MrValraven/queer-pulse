import { SkeletonLine } from "../../shared/components/ui";
import styles from "./SolidarityPage.module.css";

/** Mirrors the practitioner card (.pc) shape so there's no shift on load. */
export function SolidaritySkeleton() {
  return (
    <article className={styles.pc} aria-hidden>
      <div className={styles.pcTop}>
        <SkeletonLine
          width={46}
          height={46}
          style={{ borderRadius: 12, flex: "none" }}
        />
        <div className={styles.pcMeta}>
          <SkeletonLine width="70%" height={15} />
          <SkeletonLine width="50%" height={11} style={{ marginTop: 6 }} />
        </div>
        <SkeletonLine
          width={62}
          height={18}
          style={{ borderRadius: 6, flex: "none" }}
        />
      </div>
      <div className={styles.pcPricing}>
        <SkeletonLine width="40%" height={10} />
        <SkeletonLine width="60%" height={16} style={{ marginTop: 6 }} />
        <SkeletonLine width="80%" height={11} style={{ marginTop: 6 }} />
      </div>
      <div>
        <SkeletonLine width="100%" height={12} />
        <SkeletonLine width="92%" height={12} style={{ marginTop: 6 }} />
        <SkeletonLine width="60%" height={12} style={{ marginTop: 6 }} />
      </div>
      <div className={styles.pcFoot}>
        <SkeletonLine width={90} height={12} />
        <SkeletonLine width={64} height={12} />
      </div>
    </article>
  );
}
