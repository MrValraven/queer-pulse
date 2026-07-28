import { SkeletonLine } from "../../shared/components/ui";
import type { Grant } from "./microGrants.data";
import styles from "./MicroGrantsPage.module.css";

export function GrantSkeleton() {
  // Mirrors the .gc row: amount column, body (name + desc + tag foot), status.
  return (
    <div className={styles.gc}>
      <SkeletonLine width={52} height={22} />
      <div className={styles.gcBody}>
        <SkeletonLine width="45%" height={14} />
        <SkeletonLine width="95%" height={13} style={{ marginTop: 6 }} />
        <div className={styles.gcFoot}>
          <SkeletonLine width={64} height={16} />
          <SkeletonLine width={54} height={16} />
        </div>
      </div>
      <SkeletonLine width={70} height={18} />
    </div>
  );
}

export function GrantCard({ g }: { g: Grant }) {
  return (
    <div className={styles.gc}>
      <div className={styles.gcAmount}>{g.amount}</div>
      <div className={styles.gcBody}>
        <div className={styles.gcName}>{g.name}</div>
        <div className={styles.gcDesc}>{g.description}</div>
        <div className={styles.gcFoot}>
          {g.tags.map((t) => (
            <span key={t} className={styles.gtag}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <span
        className={[
          styles.gcStatus,
          g.status === "awarded" ? styles.gsAwarded : styles.gsInProgress,
        ].join(" ")}
      >
        {g.statusLabel}
      </span>
    </div>
  );
}
