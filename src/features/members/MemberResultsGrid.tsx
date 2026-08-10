import { FadeIn } from "../../shared/components/ui";
import { MemberResultCard } from "./MemberFilterCards";
import type { MemberCard } from "./memberDirectoryFilter.data";
import { useMemberDirectoryVirtualizer } from "./useMemberDirectoryVirtualizer";
import styles from "./MemberDirectoryFilterPage.module.css";

/**
 * The virtualized member-results grid: only the rows near the viewport
 * mount, however long `members` is (see `useMemberDirectoryVirtualizer`).
 * Extracted from `MemberDirectorySections.tsx` so that file stays under the
 * 200-line single-component limit and the virtualizer's row-measurement
 * plumbing lives in one small, focused place.
 */
export function MemberResultsGrid({ members }: { members: MemberCard[] }) {
  const { containerRef, columnCount, rows, rowVirtualizer } =
    useMemberDirectoryVirtualizer(members);

  return (
    <div
      ref={containerRef}
      className={styles.mGridSizer}
      style={{ height: rowVirtualizer.getTotalSize() }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const row = rows[virtualRow.index];
        if (!row) return null;
        return (
          <div
            key={virtualRow.key}
            ref={rowVirtualizer.measureElement}
            data-index={virtualRow.index}
            className={styles.mGridRow}
            style={{
              gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
              transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
            }}
          >
            {row.map((member, columnIndex) => (
              // Stagger within the row only (not the row's absolute position
              // in the full result set) — a freshly-mounted row scrolled into
              // view should read as its own small reveal, not replay a huge
              // index-based delay accumulated from every row above it.
              <FadeIn key={member.slug} delay={columnIndex * 85}>
                <MemberResultCard member={member} />
              </FadeIn>
            ))}
          </div>
        );
      })}
    </div>
  );
}
