import { useLayoutEffect, useRef } from "react";
import {
  LayoutGroup,
  m,
  visualElementStore,
  type Transition,
} from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { MemberResultCard } from "./MemberFilterCards";
import type { MemberCard } from "./memberDirectoryFilter.data";
import { useMemberDirectoryVirtualizer } from "./useMemberDirectoryVirtualizer";
import {
  useShuffledMembers,
  type EnterFrom,
  type MemberGhost,
} from "./useShuffledMembers";
import { SHUFFLE_SPRING } from "./shuffleMotion";
import styles from "./MemberDirectoryFilterPage.module.css";

/** Outside a shuffle window any layout move snaps into place, so a virtualizer
 *  correction or content shifting above the grid never starts a glide. */
const INSTANT_LAYOUT: Transition = { duration: 0 };
/** Leavers clear out quickly on an ease-in while survivors are still gliding. */
const GHOST_TRANSITION: Transition = { duration: 0.18, ease: [0.4, 0, 1, 1] };
/** First load only: each column starts this many seconds after the one to
 *  its left. Later result-set changes run with no delay. */
const FIRST_LOAD_COLUMN_DELAY_SECONDS = 0.06;
const SETTLED = { opacity: 1, scale: 1 };
const GHOST_EXIT = { opacity: 0, scale: 0.96 };

/**
 * Leaving cards, fading out where they stood (measured by
 * `useShuffledMembers` just before the swap). Rendered before the rows in DOM
 * order, so gliding survivors paint over the ghosts with no z-index. Each
 * ghost is removed once its fade completes, or as soon as its member
 * re-enters (the new card then starts from the ghost's current look).
 */
function MemberGhostLayer({
  ghosts,
  onGhostFaded,
}: {
  ghosts: MemberGhost[];
  onGhostFaded: (ghostKey: string) => void;
}) {
  return (
    <div className={styles.mGridGhostLayer}>
      {ghosts.map((ghost) => (
        <m.div
          key={ghost.key}
          data-ghost-slug={ghost.member.slug}
          aria-hidden
          inert
          className={styles.mGridGhost}
          style={{
            left: ghost.left,
            top: ghost.top,
            width: ghost.width,
            height: ghost.height,
          }}
          initial={{ opacity: ghost.opacity, scale: ghost.scale }}
          animate={GHOST_EXIT}
          transition={GHOST_TRANSITION}
          onAnimationComplete={() => onGhostFaded(ghost.key)}
        >
          <MemberResultCard member={ghost.member} />
        </m.div>
      ))}
    </div>
  );
}

/**
 * One grid item, in two motion layers so the `.mCard` inside keeps its own
 * CSS hover lift and `transform` transition.
 *
 * The outer wrapper only glides. Its shared `layoutId` lets a survivor that
 * lands in a different row element glide from its old box.
 * `layoutDependency` limits layout measuring to result-set changes, and the
 * layout transition springs only inside the shuffle window.
 *
 * Motion 11.18 has no `layoutCrossfade` prop, and every projection node
 * defaults to `crossfade: true`. When a remounted card's layout stack still
 * holds another member, that makes the new node's opacity restart from 0
 * (`mixValues`: `mix(0, lead, easeCrossfadeIn)`). The layout effect turns
 * `crossfade` off on this node through motion's public `visualElementStore`.
 *
 * Opacity and scale live on the inner fade layer, which the handoff never
 * touches. Entering cards grow in from `enterFrom`, and every other card
 * mounts settled.
 */
function ShuffleCard({
  member,
  enterFrom,
  delaySeconds,
  changeId,
  isShuffleWindowOpen,
  shouldReduceMotion,
}: {
  member: MemberCard;
  enterFrom: EnterFrom | undefined;
  delaySeconds: number;
  changeId: number;
  isShuffleWindowOpen: boolean;
  shouldReduceMotion: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const projection = wrapper
      ? visualElementStore.get(wrapper)?.projection
      : undefined;
    projection?.setOptions({ crossfade: false });
  }, []);

  return (
    <m.div
      ref={wrapperRef}
      data-member-slug={member.slug}
      className={styles.mGridCard}
      layoutId={shouldReduceMotion ? undefined : member.slug}
      layout={shouldReduceMotion ? false : "position"}
      layoutDependency={changeId}
      transition={{
        layout: isShuffleWindowOpen ? SHUFFLE_SPRING : INSTANT_LAYOUT,
      }}
    >
      <m.div
        className={styles.mGridCardFade}
        initial={enterFrom && !shouldReduceMotion ? enterFrom : false}
        animate={SETTLED}
        transition={{ ...SHUFFLE_SPRING, delay: delaySeconds }}
      >
        <MemberResultCard member={member} />
      </m.div>
    </m.div>
  );
}

/**
 * The virtualized member-results grid: only the rows near the viewport
 * mount, however long `members` is (see `useMemberDirectoryVirtualizer`).
 * Extracted from `MemberDirectorySections.tsx` so that file stays under the
 * 200-line single-component limit and the virtualizer's row-measurement
 * plumbing lives in one small, focused place.
 *
 * A result-set change shuffles the grid in the same frame (see
 * `useShuffledMembers`): survivors glide, newcomers grow in, leavers fade as
 * ghosts. The component owns the container ref so the shuffle hook and the
 * virtualizer both read the same node.
 */
export function MemberResultsGrid({
  members: incoming,
}: {
  members: MemberCard[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotionPrefs();
  const {
    members,
    enteringFrom,
    changeId,
    isShuffleWindowOpen,
    shouldSuspendScrollAdjustment,
    ghosts,
    removeGhost,
    isFirstLoad,
  } = useShuffledMembers(incoming, containerRef);
  const { columnCount, rows, rowVirtualizer } = useMemberDirectoryVirtualizer(
    members,
    containerRef,
    shouldSuspendScrollAdjustment,
  );

  return (
    <LayoutGroup id="member-results">
      <div
        ref={containerRef}
        className={[
          styles.mGridSizer,
          isShuffleWindowOpen && styles.mGridSizerShuffling,
        ]
          .filter(Boolean)
          .join(" ")}
        style={{ height: rowVirtualizer.getTotalSize() }}
      >
        <MemberGhostLayer ghosts={ghosts} onGhostFaded={removeGhost} />
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
                // The first-load cascade staggers within the row only. The
                // reduced-motion flag is in the key so flipping it remounts
                // the card (motion registers a layoutId only on mount).
                <ShuffleCard
                  key={`${member.slug}:${String(reducedMotion)}`}
                  member={member}
                  enterFrom={enteringFrom.get(member.slug)}
                  delaySeconds={
                    isFirstLoad
                      ? columnIndex * FIRST_LOAD_COLUMN_DELAY_SECONDS
                      : 0
                  }
                  changeId={changeId}
                  isShuffleWindowOpen={isShuffleWindowOpen}
                  shouldReduceMotion={reducedMotion}
                />
              ))}
            </div>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
