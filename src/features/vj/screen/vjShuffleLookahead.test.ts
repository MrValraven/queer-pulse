import { describe, expect, it } from "vitest";
import type { VjShuffle } from "../../../shared/contracts/vj";
import { EMPTY_VJ_SHUFFLE_BAG } from "../live/vjShuffleBag";
import {
  EMPTY_VJ_SHUFFLE_LOOKAHEAD,
  planVjNextClip,
  takeVjPlannedClip,
  vjShufflePool,
} from "./vjShuffleLookahead";

const POOL = ["clip-1", "clip-2", "clip-3", "clip-4"];
const PACK_SHUFFLE: VjShuffle = {
  isOn: true,
  intervalKind: "seconds",
  intervalValue: 8,
  source: "pack",
  excludedClipIds: [],
};

/** A small linear congruential generator, so every run picks the same order. */
function seededRandom(seed: number): () => number {
  let current = seed;
  return () => {
    current = (current * 1664525 + 1013904223) % 4294967296;
    return current / 4294967296;
  };
}

const isNoFavorite = (): boolean => false;

describe("vjShuffleLookahead", () => {
  it("reports the clip it will pick next and then picks it", () => {
    const random = seededRandom(3);
    const planned = planVjNextClip(
      EMPTY_VJ_SHUFFLE_LOOKAHEAD,
      EMPTY_VJ_SHUFFLE_BAG,
      POOL,
      random,
    );
    expect(POOL).toContain(planned.plannedClipId);
    // Planning again with the same pool keeps the same plan object.
    expect(planVjNextClip(planned, EMPTY_VJ_SHUFFLE_BAG, POOL, random)).toBe(
      planned,
    );

    const taken = takeVjPlannedClip(
      planned,
      EMPTY_VJ_SHUFFLE_BAG,
      POOL,
      random,
    );
    expect(taken.clipId).toBe(planned.plannedClipId);
    expect(taken.bag.lastPlayedClipId).toBe(planned.plannedClipId);
    expect(taken.lookahead.plannedClipId).not.toBeNull();
    expect(taken.lookahead.plannedClipId).not.toBe(taken.clipId);

    const takenAgain = takeVjPlannedClip(
      taken.lookahead,
      taken.bag,
      POOL,
      random,
    );
    expect(takenAgain.clipId).toBe(taken.lookahead.plannedClipId);
  });

  it("re-plans when the planned clip leaves the pool", () => {
    const random = seededRandom(5);
    const planned = planVjNextClip(
      EMPTY_VJ_SHUFFLE_LOOKAHEAD,
      EMPTY_VJ_SHUFFLE_BAG,
      POOL,
      random,
    );
    const smallerPool = POOL.filter(
      (clipId) => clipId !== planned.plannedClipId,
    );
    const replanned = planVjNextClip(
      planned,
      EMPTY_VJ_SHUFFLE_BAG,
      smallerPool,
      random,
    );
    expect(replanned.plannedClipId).not.toBe(planned.plannedClipId);
    expect(smallerPool).toContain(replanned.plannedClipId);

    // A clip joining the pool keeps a plan whose clip is still there.
    const largerPool = [...smallerPool, "clip-5"];
    const kept = planVjNextClip(
      replanned,
      EMPTY_VJ_SHUFFLE_BAG,
      largerPool,
      random,
    );
    expect(kept.plannedClipId).toBe(replanned.plannedClipId);
  });

  it("leaves excluded clips out of the pool", () => {
    const pool = vjShufflePool(
      POOL,
      { ...PACK_SHUFFLE, excludedClipIds: ["clip-2", "clip-4"] },
      isNoFavorite,
    );
    expect(pool).toEqual(["clip-1", "clip-3"]);
  });

  it("draws only favorites when the source is favorites", () => {
    const favoriteClipIds = new Set(["clip-2", "clip-3"]);
    const pool = vjShufflePool(
      POOL,
      {
        ...PACK_SHUFFLE,
        source: "favorites",
        excludedClipIds: ["clip-3"],
      },
      (clipId) => favoriteClipIds.has(clipId),
    );
    expect(pool).toEqual(["clip-2"]);
    expect(
      vjShufflePool(POOL, PACK_SHUFFLE, (clipId) =>
        favoriteClipIds.has(clipId),
      ),
    ).toEqual(POOL);
  });

  it("answers null for an empty pool", () => {
    const random = seededRandom(9);
    const planned = planVjNextClip(
      EMPTY_VJ_SHUFFLE_LOOKAHEAD,
      EMPTY_VJ_SHUFFLE_BAG,
      [],
      random,
    );
    expect(planned.plannedClipId).toBeNull();
    expect(planned.plannedBag).toBeNull();
    expect(planVjNextClip(planned, EMPTY_VJ_SHUFFLE_BAG, [], random)).toBe(
      planned,
    );

    const taken = takeVjPlannedClip(planned, EMPTY_VJ_SHUFFLE_BAG, [], random);
    expect(taken.clipId).toBeNull();
    expect(taken.bag).toBe(EMPTY_VJ_SHUFFLE_BAG);
  });
});
