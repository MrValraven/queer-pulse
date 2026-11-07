import { describe, expect, it } from "vitest";
import {
  VJ_EFFECT_CATALOG,
  VJ_EFFECT_IDS,
  VJ_TRANSITION_CATALOG,
  VJ_TRANSITION_IDS,
} from "../../../../shared/contracts/vj";
import {
  EMPTY_VJ_FLASH_BUDGET,
  VJ_FLASH_BUDGET_PER_SECOND,
  VJ_FLASH_HOLD_MS,
  VJ_FLASH_KINDS,
  VJ_FLASH_KIND_SOURCES,
  VJ_FLASH_WINDOW_MS,
  VJ_SUB_FLASH_GAIN,
  governedVjGain,
  isVjFlashCapableEffect,
  requestVjFlash,
  setVjStrobeRunning,
  vjTransitionFlashKind,
  type VjFlashBudget,
  type VjFlashKind,
} from "./vjFlashGovernor";

interface VjFlashRequest {
  kind: VjFlashKind;
  atMs: number;
}

/** Runs requests in order through one budget and answers the granted times. */
function grantedTimesOf(
  requests: readonly VjFlashRequest[],
  startBudget: VjFlashBudget = EMPTY_VJ_FLASH_BUDGET,
): number[] {
  let budget = startBudget;
  const grantedTimesMs: number[] = [];
  for (const request of requests) {
    const answer = requestVjFlash(budget, request.kind, request.atMs);
    budget = answer.budget;
    if (answer.isGranted) grantedTimesMs.push(request.atMs);
  }
  return grantedTimesMs;
}

/** Most grants inside any closed window of windowMs (both ends included). */
function mostGrantsInAnyWindow(
  grantedTimesMs: readonly number[],
  windowMs: number,
): number {
  let mostGrants = 0;
  for (const windowStartMs of grantedTimesMs) {
    const grantsInside = grantedTimesMs.filter(
      (grantedAtMs) =>
        grantedAtMs >= windowStartMs && grantedAtMs - windowStartMs <= windowMs,
    ).length;
    mostGrants = Math.max(mostGrants, grantsInside);
  }
  return mostGrants;
}

/** A small seeded generator so the fuzz case is the same on every run. */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

describe("vjFlashGovernor", () => {
  it("grants at most 3 flashes in any rolling second across mixed kinds", () => {
    const requests: VjFlashRequest[] = [];
    for (let atMs = 0; atMs < 10_000; atMs += 50) {
      const kind =
        VJ_FLASH_KINDS.filter((each) => each !== "strobe")[
          (atMs / 50) % (VJ_FLASH_KINDS.length - 1)
        ] ?? "beatPulse";
      requests.push({ kind, atMs });
    }
    const grantedTimesMs = grantedTimesOf(requests);
    expect(grantedTimesMs.length).toBeGreaterThan(20);
    expect(
      mostGrantsInAnyWindow(grantedTimesMs, VJ_FLASH_WINDOW_MS),
    ).toBeLessThanOrEqual(VJ_FLASH_BUDGET_PER_SECOND);
  });

  it("grants only 3 when every kind asks at the same moment, over and over", () => {
    const requests: VjFlashRequest[] = [];
    for (let repeat = 0; repeat < 20; repeat += 1) {
      for (const kind of VJ_FLASH_KINDS) requests.push({ kind, atMs: 500 });
    }
    expect(grantedTimesOf(requests)).toEqual([500, 500, 500]);
  });

  it("keeps 4 events at exactly 333 ms spacing out of one second", () => {
    const requests: VjFlashRequest[] = [];
    for (let atMs = 0; atMs <= 6000; atMs += 333) {
      requests.push({ kind: "beatPulse", atMs });
    }
    const grantedTimesMs = grantedTimesOf(requests);
    expect(grantedTimesMs.slice(0, 4)).toEqual([0, 333, 666, 1332]);
    expect(
      mostGrantsInAnyWindow(grantedTimesMs, VJ_FLASH_WINDOW_MS),
    ).toBeLessThanOrEqual(3);
    // The margin holds: four grants never fit in one second plus a frame margin.
    expect(
      mostGrantsInAnyWindow(grantedTimesMs, VJ_FLASH_HOLD_MS),
    ).toBeLessThanOrEqual(3);
  });

  it("denies the fourth event at exactly 1000 ms after the first", () => {
    const grantedTimesMs = grantedTimesOf([
      { kind: "dipWhiteTransition", atMs: 0 },
      { kind: "glitchBurst", atMs: 100 },
      { kind: "invertToggle", atMs: 200 },
      { kind: "beatPulse", atMs: 1000 },
      { kind: "beatPulse", atMs: VJ_FLASH_HOLD_MS },
      { kind: "beatPulse", atMs: VJ_FLASH_HOLD_MS + 1 },
    ]);
    expect(grantedTimesMs).toEqual([0, 100, 200, VJ_FLASH_HOLD_MS + 1]);
  });

  it("skips beats of an invert alternating at 200 BPM so no second holds 4", () => {
    const beatPeriodMs = 60_000 / 200;
    const requests: VjFlashRequest[] = [];
    for (let beatIndex = 0; beatIndex < 200; beatIndex += 1) {
      requests.push({ kind: "invertBeat", atMs: beatIndex * beatPeriodMs });
    }
    const grantedTimesMs = grantedTimesOf(requests);
    expect(grantedTimesMs.length).toBeLessThan(requests.length);
    expect(grantedTimesMs.length).toBeGreaterThan(100);
    expect(
      mostGrantsInAnyWindow(grantedTimesMs, VJ_FLASH_HOLD_MS),
    ).toBeLessThanOrEqual(3);
  });

  it("denies every other kind while the strobe runs", () => {
    let budget = setVjStrobeRunning(EMPTY_VJ_FLASH_BUDGET, true);
    for (const kind of VJ_FLASH_KINDS) {
      if (kind === "strobe") continue;
      const answer = requestVjFlash(budget, kind, 0);
      expect(answer.isGranted).toBe(false);
      budget = answer.budget;
    }
    expect(budget.grantedAtMs).toEqual([]);
    const strobeAnswer = requestVjFlash(budget, "strobe", 0);
    expect(strobeAnswer.isGranted).toBe(true);
    const afterStop = setVjStrobeRunning(strobeAnswer.budget, false);
    expect(requestVjFlash(afterStop, "beatPulse", 10).isGranted).toBe(true);
  });

  it("holds strobe, beat pulse and glitch together to 3 a second for a whole run", () => {
    let budget = EMPTY_VJ_FLASH_BUDGET;
    const grantedTimesMs: number[] = [];
    const grantedKinds = new Set<VjFlashKind>();
    // Three beat pulses fill the budget just before the strobe starts.
    for (const atMs of [0, 300, 600]) {
      const answer = requestVjFlash(budget, "beatPulse", atMs);
      budget = answer.budget;
      if (answer.isGranted) grantedTimesMs.push(atMs);
    }
    budget = setVjStrobeRunning(budget, true);
    for (let atMs = 700; atMs < 11_000; atMs += 100) {
      for (const kind of ["strobe", "beatPulse", "glitchBurst"] as const) {
        if (kind === "strobe" && atMs % 400 !== 300) continue;
        const answer = requestVjFlash(budget, kind, atMs);
        budget = answer.budget;
        if (answer.isGranted) {
          grantedTimesMs.push(atMs);
          grantedKinds.add(kind);
        }
      }
    }
    expect([...grantedKinds]).toEqual(["strobe"]);
    expect(
      mostGrantsInAnyWindow(grantedTimesMs, VJ_FLASH_HOLD_MS),
    ).toBeLessThanOrEqual(3);
  });

  it("never lets a seeded random storm of requests past 3 a second", () => {
    const random = seededRandom(20261106);
    const requests: VjFlashRequest[] = [];
    let atMs = 0;
    for (let index = 0; index < 5000; index += 1) {
      atMs += Math.floor(random() * 120);
      const kind =
        VJ_FLASH_KINDS[Math.floor(random() * VJ_FLASH_KINDS.length)] ??
        "strobe";
      requests.push({ kind, atMs });
    }
    const grantedTimesMs = grantedTimesOf(requests);
    expect(
      mostGrantsInAnyWindow(grantedTimesMs, VJ_FLASH_HOLD_MS),
    ).toBeLessThanOrEqual(3);
  });

  it("frees budget as grants age past one second", () => {
    let budget = EMPTY_VJ_FLASH_BUDGET;
    for (const atMs of [0, 10, 20]) {
      budget = requestVjFlash(budget, "glitchBurst", atMs).budget;
    }
    const denied = requestVjFlash(budget, "glitchBurst", 500);
    expect(denied.isGranted).toBe(false);
    expect(denied.budget.grantedAtMs).toEqual([0, 10, 20]);
    const granted = requestVjFlash(denied.budget, "glitchBurst", 1100);
    expect(granted.isGranted).toBe(true);
    expect(granted.budget.grantedAtMs).toEqual([1100]);
  });

  it("denies a time that is not a finite number", () => {
    expect(
      requestVjFlash(EMPTY_VJ_FLASH_BUDGET, "strobe", Number.NaN).isGranted,
    ).toBe(false);
  });

  it("restamps grants from a clock that jumped back so the budget still holds", () => {
    let budget = EMPTY_VJ_FLASH_BUDGET;
    for (const atMs of [100_000, 100_010, 100_020]) {
      budget = requestVjFlash(budget, "beatPulse", atMs).budget;
    }
    const afterJump = requestVjFlash(budget, "beatPulse", 0);
    expect(afterJump.isGranted).toBe(false);
    expect(afterJump.budget.grantedAtMs).toEqual([0, 0, 0]);
    expect(
      requestVjFlash(afterJump.budget, "beatPulse", VJ_FLASH_HOLD_MS + 1)
        .isGranted,
    ).toBe(true);
  });

  it("clamps a denied brightness gain within 8 percent", () => {
    expect(governedVjGain(1.5, false)).toBeCloseTo(1 + VJ_SUB_FLASH_GAIN, 10);
    expect(governedVjGain(0.2, false)).toBeCloseTo(1 - VJ_SUB_FLASH_GAIN, 10);
    expect(governedVjGain(1.05, false)).toBe(1.05);
    expect(governedVjGain(Number.NaN, false)).toBe(1);
    expect(governedVjGain(Number.POSITIVE_INFINITY, true)).toBe(1);
  });

  it("passes a granted gain through", () => {
    expect(governedVjGain(1.5, true)).toBe(1.5);
    expect(governedVjGain(1, true)).toBe(1);
  });

  it("maps every kind to a flash-capable catalog entry", () => {
    for (const kind of VJ_FLASH_KINDS) {
      const source = VJ_FLASH_KIND_SOURCES[kind];
      if (source.catalog === "effect") {
        expect(VJ_EFFECT_CATALOG[source.id].isFlashCapable).toBe(true);
      } else if (source.catalog === "transition") {
        expect(VJ_TRANSITION_CATALOG[source.id].isFlashCapable).toBe(true);
      } else {
        expect(kind).toBe("strobe");
      }
    }
  });

  it("covers every flash-capable effect and transition of the catalog", () => {
    const coveredEffects = new Set(
      VJ_FLASH_KINDS.map((kind) => VJ_FLASH_KIND_SOURCES[kind]).flatMap(
        (source) => (source.catalog === "effect" ? [source.id] : []),
      ),
    );
    for (const effectId of VJ_EFFECT_IDS) {
      expect(isVjFlashCapableEffect(effectId)).toBe(
        VJ_EFFECT_CATALOG[effectId].isFlashCapable,
      );
      if (VJ_EFFECT_CATALOG[effectId].isFlashCapable) {
        expect(coveredEffects.has(effectId)).toBe(true);
      }
    }
    for (const mode of VJ_TRANSITION_IDS) {
      expect(vjTransitionFlashKind(mode) !== null).toBe(
        VJ_TRANSITION_CATALOG[mode].isFlashCapable,
      );
    }
    expect(vjTransitionFlashKind("dipWhite")).toBe("dipWhiteTransition");
    expect(vjTransitionFlashKind("glitch")).toBe("glitchTransition");
    expect(vjTransitionFlashKind("fade")).toBeNull();
  });
});
