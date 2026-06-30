import { SkeletonLine } from "../../shared/components/ui";
import styles from "./MentorDetailPage.module.css";

/** Mirrors MentorDetailPage's header + section blocks so there's zero shift on swap. */
export function MentorDetailSkeleton() {
  return (
    <>
      <header className={styles.header}>
        <SkeletonLine width={84} height={84} style={{ borderRadius: "50%" }} />
        <div>
          <SkeletonLine width="55%" height={42} style={{ marginBottom: 8 }} />
          <SkeletonLine width="40%" height={14} style={{ marginBottom: 16 }} />
          <SkeletonLine width="90%" height={18} style={{ marginBottom: 8 }} />
          <SkeletonLine width="70%" height={18} style={{ marginBottom: 18 }} />
          <div className={styles.pills}>
            {[90, 110, 80].map((w, i) => (
              <SkeletonLine
                key={i}
                width={w}
                height={26}
                style={{ borderRadius: 8 }}
              />
            ))}
          </div>
        </div>
      </header>

      <section className={styles.sec}>
        <SkeletonLine width="50%" height={24} style={{ marginBottom: 14 }} />
        <SkeletonLine width="100%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonLine width="95%" height={16} style={{ marginBottom: 8 }} />
        <SkeletonLine width="80%" height={16} />
      </section>

      <section className={styles.sec}>
        <SkeletonLine width="35%" height={24} style={{ marginBottom: 14 }} />
        <div className={styles.chargeCard}>
          <SkeletonLine width={50} height={11} style={{ marginBottom: 8 }} />
          <SkeletonLine width="100%" height={15} style={{ marginBottom: 6 }} />
          <SkeletonLine width="70%" height={15} />
        </div>
      </section>

      <section className={styles.sec}>
        <SkeletonLine width="40%" height={24} style={{ marginBottom: 14 }} />
        <div className={styles.fitGrid}>
          {[0, 1].map((c) => (
            <div key={c} className={styles.fit}>
              <SkeletonLine
                width="60%"
                height={17}
                style={{ marginBottom: 12 }}
              />
              {[0, 1, 2].map((i) => (
                <SkeletonLine
                  key={i}
                  width="90%"
                  height={13}
                  style={{ marginBottom: 8 }}
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.sec}>
        <div className={styles.reachCard}>
          <SkeletonLine width="50%" height={24} style={{ marginBottom: 12 }} />
          <SkeletonLine width="100%" height={15} style={{ marginBottom: 8 }} />
          <SkeletonLine width="80%" height={15} style={{ marginBottom: 20 }} />
          <div className={styles.reachActions}>
            <SkeletonLine
              width={160}
              height={42}
              style={{ borderRadius: 999 }}
            />
            <SkeletonLine
              width={130}
              height={42}
              style={{ borderRadius: 999 }}
            />
          </div>
        </div>
      </section>
    </>
  );
}
