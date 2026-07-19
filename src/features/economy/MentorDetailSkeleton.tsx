import { SkeletonLine } from "../../shared/components/ui";
import styles from "./MentorDetailPage.module.css";

/** Mirrors MentorDetailPage's portrait header + 2-col grid so there's zero shift on swap. */
export function MentorDetailSkeleton() {
  return (
    <>
      <header className={styles.head}>
        <SkeletonLine
          width="100%"
          height="auto"
          style={{ aspectRatio: "4 / 5", borderRadius: 18 }}
        />
        <div>
          <SkeletonLine width="40%" height={11} style={{ marginBottom: 12 }} />
          <SkeletonLine width="55%" height={42} style={{ marginBottom: 8 }} />
          <SkeletonLine width="45%" height={14} style={{ marginBottom: 16 }} />
          <SkeletonLine width="90%" height={18} style={{ marginBottom: 8 }} />
          <SkeletonLine width="70%" height={18} style={{ marginBottom: 18 }} />
          <div className={styles.pills}>
            {[110, 70, 120, 100].map((w, i) => (
              <SkeletonLine
                key={i}
                width={w}
                height={26}
                style={{ borderRadius: 8 }}
              />
            ))}
          </div>
          <div className={styles.cta}>
            <SkeletonLine
              width={150}
              height={42}
              style={{ borderRadius: 999 }}
            />
            <SkeletonLine
              width={140}
              height={42}
              style={{ borderRadius: 999 }}
            />
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        <div>
          {[0, 1, 2].map((s) => (
            <section key={s} className={styles.sec}>
              <SkeletonLine
                width="45%"
                height={24}
                style={{ marginBottom: 14 }}
              />
              <SkeletonLine
                width="100%"
                height={16}
                style={{ marginBottom: 8 }}
              />
              <SkeletonLine
                width="95%"
                height={16}
                style={{ marginBottom: 8 }}
              />
              <SkeletonLine width="80%" height={16} />
            </section>
          ))}
        </div>

        <aside className={styles.side}>
          <div className={styles.sideCard}>
            <SkeletonLine
              width="50%"
              height={20}
              style={{ marginBottom: 16 }}
            />
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.row}>
                <SkeletonLine width={80} height={13} />
                <SkeletonLine width={90} height={13} />
              </div>
            ))}
            <div className={styles.sideBtnWrap}>
              <SkeletonLine
                width="100%"
                height={42}
                style={{ borderRadius: 999 }}
              />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
