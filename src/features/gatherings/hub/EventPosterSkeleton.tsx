import { SkeletonLine } from "../../../shared/components/ui";
import styles from "./EventPosterCard.module.css";

interface EventPosterSkeletonProps {
  variant: "featured" | "list" | "compact";
}

/**
 * Loading placeholder that mirrors each `EventPosterCard` variant's real
 * footprint 1:1 (reuses the same `.frame`/`.thumb`/`.list`/`.compact` layout
 * classes as the live card, same aspect ratios, same text-line rhythm) so
 * swapping in real content causes no layout shift. The shimmer itself comes
 * from `SkeletonLine`, which already honours `prefers-reduced-motion`.
 */
export function EventPosterSkeleton({ variant }: EventPosterSkeletonProps) {
  if (variant === "list") {
    return (
      <div className={styles.list} aria-hidden>
        <div className={styles.thumb}>
          <SkeletonLine width="100%" height="100%" style={{ borderRadius: 0 }} />
        </div>
        <div className={styles.listBody}>
          <SkeletonLine width={64} height={18} style={{ borderRadius: 999 }} />
          <SkeletonLine width="82%" height={20} style={{ marginBlockStart: 4 }} />
          <SkeletonLine width="45%" height={13} style={{ marginBlockStart: 4 }} />
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={styles.compact} aria-hidden>
        <div className={styles.thumb}>
          <SkeletonLine width="100%" height="100%" style={{ borderRadius: 0 }} />
        </div>
        <div className={styles.compactBody}>
          <SkeletonLine width="70%" height={14} />
          <SkeletonLine width={44} height={11} style={{ marginBlockStart: 3 }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.featured} aria-hidden>
      <div className={styles.frame}>
        <SkeletonLine width="100%" height="100%" style={{ borderRadius: 0 }} />
        {/* Mirrors `.overlay`'s absolute position — the real card's text sits
            on top of the frame and adds zero flow height, so the skeleton
            must too, or swapping loading→loaded jumps the layout (CLS). */}
        <div className={styles.overlay}>
          <SkeletonLine width={72} height={18} style={{ borderRadius: 999 }} />
          <SkeletonLine width="88%" height={22} style={{ marginBlockStart: 8 }} />
          <SkeletonLine width="40%" height={13} style={{ marginBlockStart: 6 }} />
        </div>
      </div>
    </div>
  );
}
