import { SkeletonLine } from "../../shared/components/ui";
import styles from "./SubprofilePortraitCard.module.css";

/** The credits row draws up to three faces, so the placeholder shows three. */
const SKELETON_FACE_COUNT = 3;

/**
 * A portrait card's silhouette while the directory loads: the 4:5 picture,
 * the profession, name and tagline lines, the credits row with its faces, an
 * optional note line, and the two action buttons (dropped in compact mode,
 * where the card has no actions row). It takes the same container and surface
 * as the real card, and the credits row and note take the real `.credits` and
 * `.note` classes, so their sizes and spacing follow the card in both modes
 * and the grid moves as little as possible when data lands. Decorative: the
 * grid around it carries the busy state.
 */
export function SubprofilePortraitCardSkeleton({
  hasNote = false,
}: {
  /** True where the real cards carry a note line, as on the You follow tab. */
  hasNote?: boolean;
}) {
  return (
    <div className={styles.card} aria-hidden>
      <div className={styles.surface} data-skeleton>
        <SkeletonLine
          width="100%"
          height="auto"
          style={{ aspectRatio: "4 / 5", borderRadius: 0 }}
        />
        <div className={styles.body}>
          <SkeletonLine width="45%" height={12} />
          <SkeletonLine width="75%" height={22} />
          <SkeletonLine width="95%" height={14} />
          <SkeletonLine width="60%" height={14} />
          <div className={styles.credits}>
            <span className={styles.faces}>
              {Array.from({ length: SKELETON_FACE_COUNT }, (_, index) => (
                <span key={index} className={styles.skeletonFace}>
                  <SkeletonLine width="100%" height="100%" />
                </span>
              ))}
            </span>
            <SkeletonLine width="55%" height={12} />
          </div>
          {hasNote && (
            // `1lh` is the note's own line box, 13px text on a wide card and
            // 11px in compact mode.
            <div className={styles.note}>
              <SkeletonLine width="55%" height="1lh" />
            </div>
          )}
          <div className={styles.skeletonActions}>
            <SkeletonLine height={44} />
            <SkeletonLine height={44} />
          </div>
        </div>
      </div>
    </div>
  );
}
