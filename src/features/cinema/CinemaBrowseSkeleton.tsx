import { SkeletonLine } from "../../shared/components/ui";
import styles from "./CinemaBrowsePage.module.css";

/** Mirrors FilmCard: 3/4 poster + eyebrow + title + meta + tag row. */
function FilmCardSkeleton() {
  return (
    <div className={styles.fc} aria-hidden>
      <div className={styles.fcPoster}>
        <SkeletonLine
          width="100%"
          height="100%"
          style={{ position: "absolute", inset: 0, borderRadius: 14 }}
        />
      </div>
      <SkeletonLine width="45%" height={11} />
      <SkeletonLine width="80%" height={18} />
      <SkeletonLine width="65%" height={12} />
      <div style={{ display: "flex", gap: 6 }}>
        <SkeletonLine width={54} height={20} style={{ borderRadius: 999 }} />
        <SkeletonLine width={68} height={20} style={{ borderRadius: 999 }} />
      </div>
      <SkeletonLine width="90%" height={12} />
    </div>
  );
}

export function CinemaBrowseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <FilmCardSkeleton key={i} />
      ))}
    </div>
  );
}
