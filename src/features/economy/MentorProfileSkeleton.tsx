import { SkeletonLine } from "../../shared/components/ui";
import styles from "./MentorProfilePage.module.css";

/** Mirrors MentorProfilePage's header + 2-col grid (sections + sidebar) so there's zero shift on swap. */
export function MentorProfileSkeleton() {
  return (
    <>
      <header className={styles.head}>
        <SkeletonLine
          width="100%"
          height="auto"
          style={{ aspectRatio: "4 / 5", borderRadius: 18 }}
        />
        <div>
          <SkeletonLine width="35%" height={11} style={{ marginBottom: 12 }} />
          <SkeletonLine width="60%" height={42} style={{ marginBottom: 6 }} />
          <SkeletonLine width="45%" height={14} style={{ marginBottom: 18 }} />
          <SkeletonLine width="90%" height={18} style={{ marginBottom: 8 }} />
          <SkeletonLine width="75%" height={18} style={{ marginBottom: 18 }} />
          <div className={styles.pills}>
            {[100, 120, 90].map((w, i) => (
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
              width={220}
              height={42}
              style={{ borderRadius: 999 }}
            />
            <SkeletonLine
              width={170}
              height={42}
              style={{ borderRadius: 999 }}
            />
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        <main>
          {[0, 1, 2, 3].map((s) => (
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
        </main>

        <aside className={styles.side}>
          <div className={styles.sideCard}>
            <SkeletonLine
              width="50%"
              height={20}
              style={{ marginBottom: 16 }}
            />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={styles.row}>
                <SkeletonLine width={80} height={13} />
                <SkeletonLine width={70} height={13} />
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
