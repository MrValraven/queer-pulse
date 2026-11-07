/**
 * The shuffle's lookahead (contract 3.8, 7.5 `screen:advance`): the lead
 * plans its next pick ahead of the clock fire, reports it as `nextClipId`,
 * and the fire takes exactly that clip. The plan holds while the planned clip
 * stays in the pool; a tap that replaces the bag clears it (the caller resets
 * the lookahead whenever it replaces the bag), so the next plan starts from
 * the bag that marks the tapped clip played. Pure: the caller passes `random`.
 */
import type { VjShuffle } from "../../../shared/contracts/vj";
import { nextVjShuffleClip, type VjShuffleBag } from "../live/vjShuffleBag";

export interface VjShuffleLookahead {
  /** The clip the next clock fire takes; null for an empty pool or before the first plan. */
  plannedClipId: string | null;
  /** The bag once the planned clip is taken; null with no plan. */
  plannedBag: VjShuffleBag | null;
  /** The pool this plan was made for (`vjShufflePoolKey`). */
  poolKey: string;
}

/** No plan yet: its pool key matches no pool, so the first plan always runs. */
export const EMPTY_VJ_SHUFFLE_LOOKAHEAD: VjShuffleLookahead = {
  plannedClipId: null,
  plannedBag: null,
  poolKey: "",
};

/** The pool's identity: its length and its ids in order (an empty pool reads "0:"). */
export function vjShufflePoolKey(pool: readonly string[]): string {
  return `${pool.length}:${pool.join(",")}`;
}

/**
 * The shuffle's pool: ready clips of the active pack, pack order, without the
 * clips the remote skipped, and only favorites when the source is
 * "favorites". The server refuses anything else (`vj_clip_excluded`,
 * `vj_clip_not_favorite`), so the pool never offers it.
 */
export function vjShufflePool(
  readyClipIds: readonly string[],
  shuffle: VjShuffle,
  isFavorite: (clipId: string) => boolean,
): string[] {
  const excludedClipIdSet = new Set(
    shuffle.excludedClipIds.map((clipId) => clipId.toLowerCase()),
  );
  const isFavoritesOnly = shuffle.source === "favorites";
  return readyClipIds.filter(
    (clipId) =>
      !excludedClipIdSet.has(clipId.toLowerCase()) &&
      (!isFavoritesOnly || isFavorite(clipId)),
  );
}

/**
 * Keeps the plan while its clip is still in the pool (the same object when
 * the pool is unchanged, so a render-time reconcile settles); otherwise plans
 * afresh from `bag`.
 */
export function planVjNextClip(
  lookahead: VjShuffleLookahead,
  bag: VjShuffleBag,
  pool: readonly string[],
  random: () => number,
): VjShuffleLookahead {
  const poolKey = vjShufflePoolKey(pool);
  if (lookahead.poolKey === poolKey) return lookahead;
  const { plannedClipId } = lookahead;
  if (plannedClipId !== null && pool.includes(plannedClipId)) {
    return { ...lookahead, poolKey };
  }
  const pick = nextVjShuffleClip(bag, pool, random);
  return {
    plannedClipId: pick.clipId,
    plannedBag: pick.clipId === null ? null : pick.bag,
    poolKey,
  };
}

/**
 * The clock fire: takes the planned clip (planning first when the plan is
 * stale) and plans the one after it from the bag that marks it played. A null
 * clip leaves the bag as it was.
 */
export function takeVjPlannedClip(
  lookahead: VjShuffleLookahead,
  bag: VjShuffleBag,
  pool: readonly string[],
  random: () => number,
): { clipId: string | null; bag: VjShuffleBag; lookahead: VjShuffleLookahead } {
  const current = planVjNextClip(lookahead, bag, pool, random);
  if (current.plannedClipId === null || current.plannedBag === null) {
    return { clipId: null, bag, lookahead: current };
  }
  const takenBag = current.plannedBag;
  return {
    clipId: current.plannedClipId,
    bag: takenBag,
    lookahead: planVjNextClip(
      EMPTY_VJ_SHUFFLE_LOOKAHEAD,
      takenBag,
      pool,
      random,
    ),
  };
}
