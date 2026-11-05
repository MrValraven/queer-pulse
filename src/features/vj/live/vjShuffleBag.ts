/**
 * The shuffle bag: every clip of the pool plays once per round, in a random
 * order, and a new round never opens with the clip that closed the last one.
 * Pure: the caller passes `random` (Math.random in the app, a seeded one in tests).
 */

export interface VjShuffleBag {
  /** Clips still to play this round, in play order. */
  remainingClipIds: readonly string[];
  lastPlayedClipId: string | null;
  /**
   * Clips already played this round. Optional so a bag written as
   * `{ remainingClipIds, lastPlayedClipId }` stays valid; absent reads as none.
   * It lets a clip that joins the pool mid-round join this round.
   */
  playedClipIds?: readonly string[];
}

export const EMPTY_VJ_SHUFFLE_BAG: VjShuffleBag = {
  remainingClipIds: [],
  lastPlayedClipId: null,
  playedClipIds: [],
};

/** An index in `[0, length)` from `random`, safe against a `random` that returns 1. */
function randomIndexBelow(length: number, random: () => number): number {
  const index = Math.floor(random() * length);
  return Math.min(Math.max(index, 0), length - 1);
}

/** Swaps two positions in place; both indexes must be inside the list. */
function swapClipIds(
  clipIds: string[],
  firstIndex: number,
  secondIndex: number,
): void {
  const firstClipId = clipIds[firstIndex];
  const secondClipId = clipIds[secondIndex];
  if (firstClipId === undefined || secondClipId === undefined) return;
  clipIds[firstIndex] = secondClipId;
  clipIds[secondIndex] = firstClipId;
}

function uniqueIds(clipIds: readonly string[]): string[] {
  return [...new Set(clipIds)];
}

/** A clip went live by any cause (a tap, an echo, a local pick): it counts as played this round. */
export function markVjClipPlayed(
  bag: VjShuffleBag,
  clipId: string,
): VjShuffleBag {
  const playedClipIds = bag.playedClipIds ?? [];
  return {
    remainingClipIds: bag.remainingClipIds.filter(
      (remainingClipId) => remainingClipId !== clipId,
    ),
    lastPlayedClipId: clipId,
    playedClipIds: playedClipIds.includes(clipId)
      ? playedClipIds
      : [...playedClipIds, clipId],
  };
}

/** A round may not open with the clip that ended the last one: swap it with a random later position. */
function moveRepeatOffFront(
  round: string[],
  lastPlayedClipId: string | null,
  random: () => number,
): void {
  if (round.length >= 2 && round[0] === lastPlayedClipId) {
    const laterIndex = 1 + randomIndexBelow(round.length - 1, random);
    swapClipIds(round, 0, laterIndex);
  }
}

/** Fisher-Yates over the pool; the first id moves later when it repeats the last played clip. */
function shuffleNewRound(
  poolClipIds: readonly string[],
  lastPlayedClipId: string | null,
  random: () => number,
): string[] {
  const round = [...poolClipIds];
  for (let swapIndex = round.length - 1; swapIndex > 0; swapIndex -= 1) {
    const pickIndex = randomIndexBelow(swapIndex + 1, random);
    swapClipIds(round, swapIndex, pickIndex);
  }
  moveRepeatOffFront(round, lastPlayedClipId, random);
  return round;
}

/**
 * Keeps this round's order for clips still in the pool, drops the ones that
 * left, and slots clips new to the pool into a random place of this round.
 */
function continueRound(
  bag: VjShuffleBag,
  poolClipIds: readonly string[],
  random: () => number,
): { remainingClipIds: string[]; playedClipIds: string[] } {
  const poolClipIdSet = new Set(poolClipIds);
  const playedClipIds = uniqueIds(bag.playedClipIds ?? []).filter((clipId) =>
    poolClipIdSet.has(clipId),
  );
  const playedClipIdSet = new Set(playedClipIds);
  const remainingClipIds = uniqueIds(bag.remainingClipIds).filter(
    (clipId) => poolClipIdSet.has(clipId) && !playedClipIdSet.has(clipId),
  );
  const knownClipIdSet = new Set([...remainingClipIds, ...playedClipIds]);
  for (const clipId of poolClipIds) {
    if (knownClipIdSet.has(clipId)) continue;
    knownClipIdSet.add(clipId);
    const insertIndex = randomIndexBelow(remainingClipIds.length + 1, random);
    remainingClipIds.splice(insertIndex, 0, clipId);
  }
  return { remainingClipIds, playedClipIds };
}

/** Next clip from the pool (ready clips of the active pack, pack order). Null for an empty pool. */
export function nextVjShuffleClip(
  bag: VjShuffleBag,
  poolClipIds: readonly string[],
  random: () => number,
): { clipId: string | null; bag: VjShuffleBag } {
  const pool = uniqueIds(poolClipIds);
  if (pool.length === 0) {
    return {
      clipId: null,
      bag: {
        remainingClipIds: [],
        lastPlayedClipId: bag.lastPlayedClipId,
        playedClipIds: [],
      },
    };
  }
  let { remainingClipIds, playedClipIds } = continueRound(bag, pool, random);
  if (remainingClipIds.length === 0) {
    remainingClipIds = shuffleNewRound(pool, bag.lastPlayedClipId, random);
    playedClipIds = [];
  } else if (playedClipIds.length === 0) {
    moveRepeatOffFront(remainingClipIds, bag.lastPlayedClipId, random);
  }
  const [clipId, ...restOfRound] = remainingClipIds;
  if (clipId === undefined) {
    return { clipId: null, bag };
  }
  return {
    clipId,
    bag: {
      remainingClipIds: restOfRound,
      lastPlayedClipId: clipId,
      playedClipIds: [...playedClipIds, clipId],
    },
  };
}
