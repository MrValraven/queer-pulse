import { SkeletonLine } from "../../../../shared/components/ui";
import styles from "../../PitchTrackerPage.module.css";

/** One placeholder `PitchCard` while the Submissions tab's first read is in
 *  flight: title, meta line and the stage rail. */
export function SubmissionCardSkeleton() {
  return (
    <div className={styles.skeletonCard} aria-hidden>
      <SkeletonLine width="55%" height={20} />
      <SkeletonLine width="70%" height={13} style={{ marginTop: 12 }} />
      <SkeletonLine
        width="100%"
        height={5}
        style={{ marginTop: 18, borderRadius: 3 }}
      />
    </div>
  );
}
