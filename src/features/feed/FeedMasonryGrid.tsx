import { useRef, type ReactNode } from "react";
import { useMasonryLayout } from "./useMasonryLayout";
import styles from "./FeedPage.module.css";

/**
 * The feed's card container, packed as a masonry by useMasonryLayout: two
 * columns at desktop feed width (three when the sidebar folds away under
 * `--wide`), one on a phone. Children keep feed order in the DOM; mark a
 * full-width row (empty/error panel, pager) with `data-masonry-full`.
 *
 * Its own component on purpose. React runs a child's layout effects before its
 * parent's, so the first masonry pass (which gives the container its height)
 * has already run when FeedPage's useSequencedTabSwap measures the list to ease
 * the tab viewport.
 */
export function FeedMasonryGrid({ children }: { children: ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const widthProbeRef = useRef<HTMLDivElement>(null);
  useMasonryLayout(gridRef, widthProbeRef);

  return (
    <>
      {/* Zero-height, full-width, in flow: tells the hook when the column
          width changes (see useMasonryLayout for why the grid itself is not
          observed for that). */}
      <div ref={widthProbeRef} aria-hidden />
      <div ref={gridRef} className={styles.grid}>
        {children}
      </div>
    </>
  );
}
