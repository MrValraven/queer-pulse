import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { cancelFrame, frame } from "motion/react";
import { useMotionPrefs } from "../../app/providers/motionPrefs";
import { bringShrunkGridIntoView } from "./gridScrollBack";
import type { MemberCard } from "./memberDirectoryFilter.data";

/** How long after a result-set change the shuffle counts as running: the
 *  0.4s spring plus a small buffer. Layout glides, the entering set, the
 *  virtualizer's suspended scroll adjustment and the grid's bottom-edge clip
 *  (`.mGridSizerShuffling`) all live inside this window. */
const SHUFFLE_WINDOW_MS = 500;

/** Where an entering card starts before it settles at opacity 1, scale 1.
 *  A type alias, so it carries the implicit index signature motion's
 *  `initial` target type requires. */
export type EnterFrom = {
  opacity: number;
  scale: number;
};

/** The default grow-in start for a card that appears in the grid. */
const ENTER_FROM: EnterFrom = { opacity: 0, scale: 0.96 };

const NO_ENTERING: ReadonlyMap<string, EnterFrom> = new Map();

/** A snapshot of a card that just left the result set, rendered in the grid's
 *  ghost layer so it can fade out where it stood while the new set is
 *  already live. Positions are relative to the grid container. */
export interface MemberGhost {
  /** `${slug}:${changeId}`: unique even when rapid toggles stack two ghosts
   *  of the same member. */
  key: string;
  member: MemberCard;
  left: number;
  top: number;
  width: number;
  height: number;
  /** The card's opacity and scale at the moment it left (1 and 1 unless it
   *  was still growing in), so the fade starts from what was on screen. */
  opacity: number;
  scale: number;
}

interface ShuffleState {
  members: MemberCard[];
  signature: string;
  /** Cards that grow in when they mount, with their start values. Cleared
   *  when the shuffle window closes, so a row mounting later on scroll
   *  shows its cards settled. */
  enteringFrom: ReadonlyMap<string, EnterFrom>;
  /** 0 until the first result-set change; bumps once per change. */
  changeId: number;
  isShuffleWindowOpen: boolean;
  ghosts: MemberGhost[];
}

interface SwapMeasurement {
  /** Slugs with a mounted card wrapper at swap time. */
  mountedSlugs: ReadonlySet<string>;
  leavers: Omit<MemberGhost, "key">[];
  /** The current look of each ghost still fading, by slug. */
  ghostLookBySlug: ReadonlyMap<string, EnterFrom>;
  /** Survivors caught mid-entrance, by slug, so one that remounts in another
   *  row continues its grow-in from what was on screen. */
  midEntranceLookBySlug: ReadonlyMap<string, EnterFrom>;
}

function slugSignature(members: MemberCard[]) {
  return members.map((member) => member.slug).join("|");
}

/** An element's painted opacity and scale: size comes from
 *  `offsetWidth`/`offsetHeight` (a scaled element's bounding rect is smaller
 *  than its layout box), and the position keeps the rect's centre so a
 *  scaled card's ghost lands exactly over it. */
function measurePainted(element: HTMLElement, containerRect: DOMRect) {
  const rect = element.getBoundingClientRect();
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  return {
    rect,
    left: rect.left + (rect.width - width) / 2 - containerRect.left,
    top: rect.top + (rect.height - height) / 2 - containerRect.top,
    width,
    height,
    opacity: Number(getComputedStyle(element).opacity) || 0,
    scale: width > 0 ? rect.width / width : 1,
  };
}

/**
 * Reads the committed grid just before a swap: which cards are mounted,
 * every mounted leaver that is at least partly inside the viewport (those
 * become ghosts; overscanned or unmounted cards get none), survivors still
 * growing in, and the current look of ghosts still fading from an earlier
 * change. A card's look is read from its fade layer (the wrapper's first
 * child), which carries the opacity and scale.
 */
function measureBeforeSwap(
  container: HTMLElement,
  displayedMembers: MemberCard[],
  nextSlugs: ReadonlySet<string>,
): SwapMeasurement {
  const containerRect = container.getBoundingClientRect();
  const leavingBySlug = new Map(
    displayedMembers
      .filter((member) => !nextSlugs.has(member.slug))
      .map((member) => [member.slug, member]),
  );
  const mountedSlugs = new Set<string>();
  const leavers: Omit<MemberGhost, "key">[] = [];
  const midEntranceLookBySlug = new Map<string, EnterFrom>();
  const cardElements = Array.from(
    container.querySelectorAll<HTMLElement>("[data-member-slug]"),
  );
  for (const element of cardElements) {
    const slug = element.dataset.memberSlug;
    if (!slug) continue;
    mountedSlugs.add(slug);
    const fadeLayer =
      element.firstElementChild instanceof HTMLElement
        ? element.firstElementChild
        : element;
    const { rect, ...painted } = measurePainted(fadeLayer, containerRect);
    const member = leavingBySlug.get(slug);
    if (!member) {
      // The scale tolerance absorbs `offsetWidth` rounding: a settled card in
      // a fractional-width column reads about 0.999.
      const isMidEntrance =
        painted.opacity < 0.999 || Math.abs(painted.scale - 1) > 0.005;
      if (isMidEntrance) {
        midEntranceLookBySlug.set(slug, {
          opacity: painted.opacity,
          scale: painted.scale,
        });
      }
      continue;
    }
    const isInViewport =
      rect.bottom > 0 &&
      rect.top < window.innerHeight &&
      rect.right > 0 &&
      rect.left < window.innerWidth;
    if (isInViewport) leavers.push({ member, ...painted });
  }
  const ghostLookBySlug = new Map<string, EnterFrom>();
  const ghostElements = Array.from(
    container.querySelectorAll<HTMLElement>("[data-ghost-slug]"),
  );
  for (const element of ghostElements) {
    const slug = element.dataset.ghostSlug;
    if (!slug || !nextSlugs.has(slug)) continue;
    const { opacity, scale } = measurePainted(element, containerRect);
    ghostLookBySlug.set(slug, { opacity, scale });
  }
  return { mountedSlugs, leavers, ghostLookBySlug, midEntranceLookBySlug };
}

/**
 * Drives the results grid's "shuffle" on a result-set change (replaces the
 * old grid-wide cross-fade). The new set shows in the same frame: survivors
 * glide to their new slots (motion shared layout, wired in
 * `MemberResultsGrid`), cards that were unmounted or absent grow in, and
 * leavers fade in place as ghosts measured here just before the swap.
 *
 * The swap runs in a layout effect: the render where `incoming` first differs
 * still commits the previous set, the effect measures it, and its setState
 * re-renders before the browser paints, so the old set never paints again.
 * Reduced motion swaps with no ghosts and no entrances.
 */
export function useShuffledMembers(
  incoming: MemberCard[],
  containerRef: RefObject<HTMLDivElement | null>,
) {
  const { reducedMotion } = useMotionPrefs();
  const signature = useMemo(() => slugSignature(incoming), [incoming]);
  const [state, setState] = useState<ShuffleState>(() => ({
    members: incoming,
    signature,
    // First load: every card is entering (the grid swapped in for the
    // skeleton), and the grid adds a light column cascade for this set only.
    enteringFrom: new Map(incoming.map((member) => [member.slug, ENTER_FROM])),
    changeId: 0,
    isShuffleWindowOpen: false,
    ghosts: [],
  }));

  /** The sizer's height just before a shrinking swap; null when no
   *  scroll-back check is pending. */
  const heightBeforeShrinkRef = useRef<number | null>(null);

  // Reduced motion switched on mid-fade: drop the ghosts now (an adjustment
  // during render, so no commit ever shows them).
  if (reducedMotion && state.ghosts.length > 0) {
    setState((previous) => ({ ...previous, ghosts: [] }));
  }

  useLayoutEffect(() => {
    // Same slugs in the same order: nothing to shuffle, no setState.
    if (signature === state.signature) return;

    const container = containerRef.current;
    const nextSlugs = new Set(incoming.map((member) => member.slug));
    const measurement: SwapMeasurement | null =
      container && !reducedMotion
        ? measureBeforeSwap(container, state.members, nextSlugs)
        : null;
    // Only a shrinking set can strand the reader below the results; the
    // check itself runs once the shorter grid has committed (see below).
    heightBeforeShrinkRef.current =
      container && incoming.length < state.members.length
        ? container.offsetHeight
        : null;

    // Intentional pre-paint swap: the old set can only be measured from the
    // committed DOM, and a setState here re-renders before the browser paints.
    setState((previous) => {
      const changeId = previous.changeId + 1;
      const previousSlugs = new Set(
        previous.members.map((member) => member.slug),
      );
      const enteringFrom = new Map<string, EnterFrom>();
      for (const member of measurement ? incoming : []) {
        const ghostLook = measurement?.ghostLookBySlug.get(member.slug);
        const midEntranceLook = measurement?.midEntranceLookBySlug.get(
          member.slug,
        );
        const hasMountedCard = measurement?.mountedSlugs.has(member.slug);
        if (ghostLook && !previousSlugs.has(member.slug)) {
          // Re-entering while its ghost still fades: continue from the ghost.
          enteringFrom.set(member.slug, ghostLook);
        } else if (!previousSlugs.has(member.slug) || !hasMountedCard) {
          enteringFrom.set(member.slug, ENTER_FROM);
        } else if (midEntranceLook) {
          // Still growing in: a remount in another row picks up from here.
          enteringFrom.set(member.slug, midEntranceLook);
        }
      }
      const newGhosts = (measurement?.leavers ?? []).map((leaver) => ({
        ...leaver,
        key: `${leaver.member.slug}:${changeId}`,
      }));
      return {
        members: incoming,
        signature,
        enteringFrom,
        changeId,
        isShuffleWindowOpen: !reducedMotion,
        ghosts: [
          ...previous.ghosts.filter(
            (ghost) => !enteringFrom.has(ghost.member.slug),
          ),
          ...newGhosts,
        ],
      };
    });
  }, [signature, incoming, state, reducedMotion, containerRef]);

  // Armed by a shrinking swap. The check must read the grid's committed new
  // geometry, and the sizer's shorter height can land a frame after the swap
  // (seen under reduced motion), so a ResizeObserver waits until the sizer is
  // shorter than it was before the swap. Its first delivery covers the case
  // where the swap commit already has the new height. The check then waits
  // for motion's postRender step: the chip row's height spring measures
  // `height: auto` earlier in a frame and restores the scroll with its own
  // `scrollTo`, which must land before the scroll-back starts. The chip row
  // may still be springing after that, so the scroll-back follows the grid's
  // live position every frame. Cleanup (the next change, or unmount) stops
  // observing, cancels a pending check and stops a running scroll-back.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const heightBeforeShrink = heightBeforeShrinkRef.current;
    if (heightBeforeShrink === null || !container) return;
    heightBeforeShrinkRef.current = null;
    let stopScrollBack: (() => void) | undefined;
    const checkScrollBack = () => {
      stopScrollBack = bringShrunkGridIntoView(container, reducedMotion);
    };
    const heightObserver = new ResizeObserver(() => {
      if (container.offsetHeight >= heightBeforeShrink) return;
      heightObserver.disconnect();
      frame.postRender(checkScrollBack);
    });
    heightObserver.observe(container);
    return () => {
      heightObserver.disconnect();
      cancelFrame(checkScrollBack);
      stopScrollBack?.();
    };
  }, [state.changeId, containerRef, reducedMotion]);

  // Close the shuffle window (and clear the entering set) once the spring
  // has settled. Each new change restarts the timer.
  const hasOpenWindow =
    state.isShuffleWindowOpen || state.enteringFrom.size > 0;
  useEffect(() => {
    if (!hasOpenWindow) return;
    const timer = window.setTimeout(() => {
      setState((previous) => ({
        ...previous,
        isShuffleWindowOpen: false,
        enteringFrom: NO_ENTERING,
      }));
    }, SHUFFLE_WINDOW_MS);
    return () => window.clearTimeout(timer);
  }, [state.changeId, hasOpenWindow]);

  const removeGhost = useCallback((ghostKey: string) => {
    setState((previous) => ({
      ...previous,
      ghosts: previous.ghosts.filter((ghost) => ghost.key !== ghostKey),
    }));
  }, []);

  return {
    // While the slugs match, render the fresh objects so a refetch that only
    // updates card data (counts, tags) shows without waiting for a reshuffle.
    members: signature === state.signature ? incoming : state.members,
    enteringFrom: state.enteringFrom,
    changeId: state.changeId,
    isShuffleWindowOpen: state.isShuffleWindowOpen,
    // True from the render that first sees a new set (the commit before the
    // swap) until the window closes, so rows the swap commit mounts are
    // already measured without a scroll correction.
    shouldSuspendScrollAdjustment:
      !reducedMotion &&
      (signature !== state.signature || state.isShuffleWindowOpen),
    ghosts: reducedMotion ? [] : state.ghosts,
    removeGhost,
    isFirstLoad: state.changeId === 0,
  };
}
