import { SkeletonLine } from "../../shared/components/ui";
import styles from "./AdminMembersPage.module.css";

/**
 * Live mode's `useAdminMember` fetches over the network, so the body/footer
 * sections that read `detail.*` need a placeholder for the gap between the
 * drawer opening and the detail arriving. Demo mode never renders this — its
 * `initialData` resolves instantly.
 *
 * Colocated with `AdminMemberDrawer`, which is its only caller, and kept in its
 * own file so that component stays inside the repo's 200-line limit.
 */
export function AdminMemberDrawerSkeleton() {
  return (
    <div aria-busy="true">
      <div className={styles.dSection}>
        <SkeletonLine width="40%" height={18} />
        <div className={styles.glanceGrid} style={{ marginTop: 10 }}>
          <SkeletonLine height={64} style={{ borderRadius: 14 }} />
          <SkeletonLine height={64} style={{ borderRadius: 14 }} />
          <SkeletonLine height={64} style={{ borderRadius: 14 }} />
        </div>
      </div>
      <div className={styles.dSection}>
        <SkeletonLine width="55%" height={18} />
        <SkeletonLine height={200} style={{ marginTop: 10, borderRadius: 16 }} />
      </div>
      <div className={styles.dSection}>
        <SkeletonLine width="70%" />
        <SkeletonLine width="90%" style={{ marginTop: 8 }} />
      </div>
    </div>
  );
}
