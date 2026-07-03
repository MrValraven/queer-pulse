import { SkeletonLine } from "../../shared/components/ui";
import styles from "./CinemaCuratorPage.module.css";

function ProgSkeleton() {
  return (
    <div className={styles.progItem}>
      <SkeletonLine width={60} height={12} />
      <div className={styles.piPoster}>
        <SkeletonLine
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0, borderRadius: 10 }}
        />
      </div>
      <div className={styles.piText} style={{ display: "grid", gap: 8 }}>
        <SkeletonLine width="40%" height={11} />
        <SkeletonLine width="70%" height={20} />
        <SkeletonLine width="55%" height={12} />
        <SkeletonLine width="100%" height={54} style={{ borderRadius: 10 }} />
      </div>
    </div>
  );
}

function CollTileSkeleton() {
  return (
    <div className={styles.collTile} style={{ display: "grid", gap: 8 }}>
      <SkeletonLine width="40%" height={11} />
      <SkeletonLine width="70%" height={18} />
      <SkeletonLine width="50%" height={12} />
    </div>
  );
}

function NbSkeleton() {
  return (
    <div className={styles.nb} style={{ display: "grid", gap: 8 }}>
      <SkeletonLine width="30%" height={11} />
      <SkeletonLine width="100%" height={16} />
      <SkeletonLine width="80%" height={16} />
      <SkeletonLine width="45%" height={12} />
    </div>
  );
}

export function CinemaCuratorSkeleton() {
  return (
    <section className={styles.body} aria-hidden>
      <div className={`wrap ${styles.bodyGrid}`}>
        <div className={styles.main}>
          {/* Programmes skeleton */}
          <div>
            <div className={styles.s3}>
              <SkeletonLine width={220} height={26} />
            </div>
            <div className={styles.progList}>
              <ProgSkeleton />
              <ProgSkeleton />
              <ProgSkeleton />
            </div>
          </div>

          {/* Collections skeleton */}
          <div>
            <div className={styles.s3}>
              <SkeletonLine width={200} height={26} />
            </div>
            <div className={styles.collsList}>
              <CollTileSkeleton />
              <CollTileSkeleton />
            </div>
          </div>

          {/* Notebook skeleton */}
          <div>
            <div className={styles.s3}>
              <SkeletonLine width={180} height={26} />
            </div>
            <div className={styles.notebookList}>
              <NbSkeleton />
              <NbSkeleton />
            </div>
          </div>
        </div>
        <div className={styles.aside}>
          <div className={styles.ca} style={{ display: "grid", gap: 14 }}>
            <SkeletonLine width="60%" height={12} />
            <SkeletonLine width="100%" height={38} />
            <SkeletonLine width="100%" height={38} />
            <SkeletonLine width="100%" height={38} />
          </div>
        </div>
      </div>
    </section>
  );
}
