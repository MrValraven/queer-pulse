import { describe, expect, it } from "vitest";
import {
  VJ_OPTIMISTIC_TTL_MS,
  vjOptimisticAcked,
  vjOptimisticFailed,
  vjOptimisticReconcile,
  vjOptimisticSet,
  vjOptimisticValueOf,
  type VjOptimisticMap,
} from "./vjOptimistic";

const emptyMap: VjOptimisticMap<boolean> = new Map();

describe("vjOptimistic", () => {
  it("shows the optimistic value until the state reaches the acked revision", () => {
    const sentMap = vjOptimisticSet(emptyMap, "pad:invert", true, 1_000);
    expect(vjOptimisticValueOf(sentMap, "pad:invert", false)).toBe(true);

    const ackedMap = vjOptimisticAcked(sentMap, "pad:invert", 12);
    expect(ackedMap.get("pad:invert")?.awaitedRevision).toBe(12);

    const behindMap = vjOptimisticReconcile(ackedMap, 11, 1_200);
    expect(behindMap).toBe(ackedMap);
    expect(vjOptimisticValueOf(behindMap, "pad:invert", false)).toBe(true);

    const reachedMap = vjOptimisticReconcile(ackedMap, 12, 1_300);
    expect(reachedMap.has("pad:invert")).toBe(false);
    expect(vjOptimisticValueOf(reachedMap, "pad:invert", false)).toBe(false);
  });

  it("keeps an unacked entry through a reconcile inside the TTL", () => {
    const sentMap = vjOptimisticSet(emptyMap, "pad:invert", true, 1_000);
    expect(vjOptimisticReconcile(sentMap, 99, 2_000)).toBe(sentMap);
  });

  it("rolls back on failure", () => {
    const sentMap = vjOptimisticSet(emptyMap, "pad:glitch", true, 1_000);
    const failedMap = vjOptimisticFailed(sentMap, "pad:glitch");
    expect(failedMap.has("pad:glitch")).toBe(false);
    expect(vjOptimisticValueOf(failedMap, "pad:glitch", false)).toBe(false);
  });

  it("drops an entry older than 6 s", () => {
    const sentMap = vjOptimisticSet(emptyMap, "pad:mirror", true, 1_000);
    const ackedMap = vjOptimisticAcked(sentMap, "pad:mirror", 40);
    const freshMap = vjOptimisticReconcile(
      ackedMap,
      10,
      1_000 + VJ_OPTIMISTIC_TTL_MS,
    );
    expect(freshMap.has("pad:mirror")).toBe(true);
    const staleMap = vjOptimisticReconcile(
      ackedMap,
      10,
      1_000 + VJ_OPTIMISTIC_TTL_MS + 1,
    );
    expect(staleMap.has("pad:mirror")).toBe(false);
  });

  it("returns the same map when nothing changes", () => {
    const sentMap = vjOptimisticSet(emptyMap, "pad:invert", true, 1_000);
    const ackedMap = vjOptimisticAcked(sentMap, "pad:invert", 5);
    expect(vjOptimisticAcked(ackedMap, "pad:invert", 5)).toBe(ackedMap);
    expect(vjOptimisticAcked(ackedMap, "pad:other", 6)).toBe(ackedMap);
    expect(vjOptimisticFailed(ackedMap, "pad:other")).toBe(ackedMap);
    expect(vjOptimisticReconcile(ackedMap, 4, 1_100)).toBe(ackedMap);
    expect(vjOptimisticReconcile(emptyMap, 4, 1_100)).toBe(emptyMap);
  });

  it("keeps the larger revision when acks arrive out of order", () => {
    const sentMap = vjOptimisticSet(emptyMap, "fader", true, 1_000);
    const laterAckMap = vjOptimisticAcked(sentMap, "fader", 9);
    const earlierAckMap = vjOptimisticAcked(laterAckMap, "fader", 7);
    expect(earlierAckMap).toBe(laterAckMap);
    expect(earlierAckMap.get("fader")?.awaitedRevision).toBe(9);
  });

  it("leaves the input map untouched", () => {
    const sentMap = vjOptimisticSet(emptyMap, "pad:invert", true, 1_000);
    expect(emptyMap.size).toBe(0);
    vjOptimisticFailed(sentMap, "pad:invert");
    expect(sentMap.has("pad:invert")).toBe(true);
  });
});
