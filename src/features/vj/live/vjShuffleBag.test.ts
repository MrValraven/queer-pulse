import { describe, expect, it } from "vitest";
import {
  EMPTY_VJ_SHUFFLE_BAG,
  markVjClipPlayed,
  nextVjShuffleClip,
  type VjShuffleBag,
} from "./vjShuffleBag";

/** Mulberry32: a small seeded generator so every run picks the same order. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function poolOf(size: number): string[] {
  return Array.from({ length: size }, (_, clipIndex) => `clip-${clipIndex}`);
}

function drawMany(
  startBag: VjShuffleBag,
  pool: readonly string[],
  drawCount: number,
  random: () => number,
): { clipIds: (string | null)[]; bag: VjShuffleBag } {
  let bag = startBag;
  const clipIds: (string | null)[] = [];
  for (let drawIndex = 0; drawIndex < drawCount; drawIndex += 1) {
    const result = nextVjShuffleClip(bag, pool, random);
    clipIds.push(result.clipId);
    bag = result.bag;
  }
  return { clipIds, bag };
}

describe("vjShuffleBag", () => {
  it("plays every clip once before any repeats", () => {
    const random = seededRandom(7);
    const pool = poolOf(6);
    let bag = EMPTY_VJ_SHUFFLE_BAG;
    for (let roundIndex = 0; roundIndex < 50; roundIndex += 1) {
      const round = drawMany(bag, pool, pool.length, random);
      bag = round.bag;
      expect([...round.clipIds].sort()).toEqual([...pool].sort());
    }
  });

  it("never starts a new round with the clip that ended the last one", () => {
    const random = seededRandom(42);
    for (let poolSize = 2; poolSize <= 7; poolSize += 1) {
      const pool = poolOf(poolSize);
      let bag = EMPTY_VJ_SHUFFLE_BAG;
      let lastClipOfRound: string | null = null;
      for (let roundIndex = 0; roundIndex < 2000; roundIndex += 1) {
        const round = drawMany(bag, pool, poolSize, random);
        bag = round.bag;
        if (lastClipOfRound !== null) {
          expect(round.clipIds[0]).not.toBe(lastClipOfRound);
        }
        expect(new Set(round.clipIds).size).toBe(poolSize);
        lastClipOfRound = round.clipIds[poolSize - 1] ?? null;
      }
    }
  });

  it("keeps the last clip off the front when the pool comes back after emptying", () => {
    const random = seededRandom(23);
    const pool = poolOf(3);
    for (let attemptIndex = 0; attemptIndex < 500; attemptIndex += 1) {
      const lastDraw = nextVjShuffleClip(EMPTY_VJ_SHUFFLE_BAG, pool, random);
      const emptiedPool = nextVjShuffleClip(lastDraw.bag, [], random);
      expect(emptiedPool.clipId).toBeNull();
      const backAgain = nextVjShuffleClip(emptiedPool.bag, pool, random);
      expect(backAgain.clipId).not.toBe(lastDraw.clipId);
    }
  });

  it("counts a manual tap as played this round", () => {
    const random = seededRandom(3);
    const pool = poolOf(5);
    const firstDraw = nextVjShuffleClip(EMPTY_VJ_SHUFFLE_BAG, pool, random);
    const tappedClipId = firstDraw.bag.remainingClipIds[0];
    expect(tappedClipId).toBeDefined();
    const tappedBag = markVjClipPlayed(firstDraw.bag, tappedClipId ?? "");
    expect(tappedBag.lastPlayedClipId).toBe(tappedClipId);

    const restOfRound = drawMany(tappedBag, pool, 3, random);
    expect(restOfRound.clipIds).not.toContain(tappedClipId);
    expect(restOfRound.clipIds).not.toContain(firstDraw.clipId);
    expect(
      new Set([firstDraw.clipId, tappedClipId, ...restOfRound.clipIds]).size,
    ).toBe(pool.length);
  });

  it("counts a tap on a fresh bag as played this round", () => {
    const random = seededRandom(11);
    const pool = poolOf(4);
    const tappedBag = markVjClipPlayed(EMPTY_VJ_SHUFFLE_BAG, "clip-2");
    const restOfRound = drawMany(tappedBag, pool, 3, random);
    expect(restOfRound.clipIds).not.toContain("clip-2");
    expect([...restOfRound.clipIds].sort()).toEqual([
      "clip-0",
      "clip-1",
      "clip-3",
    ]);
  });

  it("drops clips that left the pool and adds new ones to this round", () => {
    const random = seededRandom(19);
    const firstPool = ["clip-a", "clip-b", "clip-c", "clip-d"];
    const firstDraw = nextVjShuffleClip(
      EMPTY_VJ_SHUFFLE_BAG,
      firstPool,
      random,
    );
    const playedClipId = firstDraw.clipId;
    const leavingClipId =
      firstPool.find((clipId) => clipId !== playedClipId) ?? "";
    const secondPool = [
      ...firstPool.filter((clipId) => clipId !== leavingClipId),
      "clip-e",
    ];

    const restOfRound = drawMany(firstDraw.bag, secondPool, 3, random);
    expect(restOfRound.clipIds).not.toContain(leavingClipId);
    expect(restOfRound.clipIds).not.toContain(playedClipId);
    expect(restOfRound.clipIds).toContain("clip-e");
    expect(new Set([playedClipId, ...restOfRound.clipIds])).toEqual(
      new Set(secondPool),
    );
  });

  it("returns the only clip of a one-clip pool", () => {
    const random = seededRandom(5);
    const draws = drawMany(EMPTY_VJ_SHUFFLE_BAG, ["clip-solo"], 4, random);
    expect(draws.clipIds).toEqual([
      "clip-solo",
      "clip-solo",
      "clip-solo",
      "clip-solo",
    ]);
  });

  it("returns null for an empty pool", () => {
    const random = seededRandom(1);
    const draw = nextVjShuffleClip(EMPTY_VJ_SHUFFLE_BAG, [], random);
    expect(draw.clipId).toBeNull();
    expect(draw.bag.remainingClipIds).toEqual([]);
  });
});
