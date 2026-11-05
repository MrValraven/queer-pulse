import { SubprofilePortraitCardSkeleton } from "./SubprofilePortraitCardSkeleton";
import styles from "./SubprofileDirectoryPage.module.css";

/** How many placeholder cards the loading grid renders by default: two rows
 *  of three on the Everyone tab's results column, three rows of two on a
 *  phone. */
const DIRECTORY_SKELETON_COUNT = 6;

/**
 * Portrait-card skeletons shown while a hub tab's personas load. They render
 * into the SAME `.grid` the real cards use and share the card's container and
 * surface, so the real data lands with no layout jump. The skeletons are
 * aria-hidden; this one `aria-busy` region carries the announcement, in the
 * tab's own words.
 */
export function SubprofileDirectoryLoadingGrid({
  label,
  count = DIRECTORY_SKELETON_COUNT,
  hasNote = false,
}: {
  /** What is loading, read out by the busy region. */
  label: string;
  /** How many placeholder cards to draw; a tab whose grid has more columns
   *  passes enough to fill whole rows. */
  count?: number;
  /** True when the real cards carry a note line, so each placeholder draws
   *  one too. */
  hasNote?: boolean;
}) {
  return (
    <div
      className={styles.grid}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      {Array.from({ length: count }, (_, index) => (
        <SubprofilePortraitCardSkeleton key={index} hasNote={hasNote} />
      ))}
    </div>
  );
}
