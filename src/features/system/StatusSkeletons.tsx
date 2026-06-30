import { SkeletonLine } from "../../shared/components/ui";
import styles from "./StatusComponents.module.css";

/** Mirrors a real .svcCard: name + desc on the left, status pill on the right. */
export function ServiceCardSkeleton() {
  return (
    <div className={styles.svcCard}>
      <div style={{ flex: 1 }}>
        <SkeletonLine width="55%" height={14} />
        <SkeletonLine width="78%" height={11} style={{ marginTop: 6 }} />
      </div>
      <SkeletonLine
        width={84}
        height={22}
        style={{ borderRadius: 999, flex: "none" }}
      />
    </div>
  );
}

/** Mirrors a real .incItem: timeline dot + date/title/text/tag block. */
export function IncidentSkeleton() {
  return (
    <div className={styles.incItem}>
      <SkeletonLine
        width={37}
        height={37}
        style={{ borderRadius: "50%", flex: "none" }}
      />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="22%" height={11} style={{ marginBottom: 8 }} />
        <SkeletonLine width="45%" height={18} style={{ marginBottom: 10 }} />
        <SkeletonLine width="90%" height={13} style={{ marginBottom: 5 }} />
        <SkeletonLine width="80%" height={13} style={{ marginBottom: 12 }} />
        <SkeletonLine width={92} height={22} style={{ borderRadius: 999 }} />
      </div>
    </div>
  );
}
