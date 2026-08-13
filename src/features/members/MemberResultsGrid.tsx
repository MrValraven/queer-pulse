import { useEffect, useMemo, useState } from "react";
import { FadeIn } from "../../shared/components/ui";
import { usePrefersReducedMotion } from "../../shared/hooks";
import { MemberResultCard } from "./MemberFilterCards";
import type { MemberCard } from "./memberDirectoryFilter.data";
import { useMemberDirectoryVirtualizer } from "./useMemberDirectoryVirtualizer";
import styles from "./MemberDirectoryFilterPage.module.css";

/** Keep in sync with `--dur-fast` (`src/styles/tokens/effects.css`): how long the
 *  old results fade out before the new set swaps in. Short on purpose, long
 *  enough to read as a deliberate "results updated" beat rather than a wait. */
const FILTER_CROSSFADE_MS = 150;

/**
 * When the filtered result set changes, cross-fade rather than hard-swap: dip
 * the whole grid to transparent, swap the members underneath (which also hides
 * the virtualizer's height/measurement reflow), then re-run the staggered
 * `FadeIn` entrance on the incoming cards via a bumped `generation`.
 *
 * Without this the grid pops: `FadeIn` is a mount-only entrance with no exit, so
 * removed cards vanish instantly and cards that survive a filter keep their key
 * and never re-animate. Rapid toggles always settle on the latest set (each
 * change restarts the fade); toggling back to the current set cancels cleanly
 * via the effect cleanup. Reduced motion skips the delay and swaps immediately
 * (FadeIn already no-ops there).
 */
function useCrossfadedMembers(members: MemberCard[]) {
  const signature = useMemo(
    () => members.map((member) => member.slug).join("|"),
    [members],
  );
  const prefersReducedMotion = usePrefersReducedMotion();
  const [displayed, setDisplayed] = useState({
    members,
    signature,
    generation: 0,
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Steady state (or a toggle that landed back on the current set): nothing to
    // animate. No setState on this path, so unrelated re-renders stay cheap.
    if (signature === displayed.signature) return;

    const swap = () =>
      setDisplayed((prev) => ({
        members,
        signature,
        generation: prev.generation + 1,
      }));

    if (prefersReducedMotion) {
      swap();
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional exit-animation sync: dim the always-mounted grid the moment the result set changes, then the setTimeout below defers the swap + un-dim by one FILTER_CROSSFADE_MS beat. The timed cross-fade cannot be derived during render.
    setFading(true);
    const timer = window.setTimeout(() => {
      swap();
      setFading(false);
    }, FILTER_CROSSFADE_MS);
    // Runs on the next real change, on unmount, and crucially on a toggle-back
    // mid-fade: cancel the pending swap and un-dim so we are never left dimmed.
    return () => {
      window.clearTimeout(timer);
      setFading(false);
    };
  }, [signature, displayed.signature, members, prefersReducedMotion]);

  return { members: displayed.members, generation: displayed.generation, fading };
}

/**
 * The virtualized member-results grid: only the rows near the viewport
 * mount, however long `members` is (see `useMemberDirectoryVirtualizer`).
 * Extracted from `MemberDirectorySections.tsx` so that file stays under the
 * 200-line single-component limit and the virtualizer's row-measurement
 * plumbing lives in one small, focused place.
 */
export function MemberResultsGrid({ members: incoming }: { members: MemberCard[] }) {
  const { members, generation, fading } = useCrossfadedMembers(incoming);
  const { containerRef, columnCount, rows, rowVirtualizer } =
    useMemberDirectoryVirtualizer(members);

  return (
    <div
      ref={containerRef}
      className={[styles.mGridSizer, fading && styles.mGridFading]
        .filter(Boolean)
        .join(" ")}
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
              // `generation` in the key forces every visible card to replay its
              // entrance after a filter change, so the whole grid re-staggers in
              // together rather than only the rows whose membership changed.
              <FadeIn key={`${generation}:${member.slug}`} delay={columnIndex * 85}>
                <MemberResultCard member={member} />
              </FadeIn>
            ))}
          </div>
        );
      })}
    </div>
  );
}
