import { describe, expect, it } from "vitest";
import type { QuizshowWheelSpin } from "../../../shared/contracts/quizshow";
import { wheelAngleModulo, wheelSpinEndAngle } from "../quizshowWheel";
import { wheelPegCount, wheelRotationAt } from "./quizshowWheelMotion";

const spin: QuizshowWheelSpin = {
  landedSliceIndex: 2,
  startedAt: 1_000_000,
  durationMs: 5500,
  turns: 5,
  jitterSeed: 500,
  startAngle: 40,
};

describe("wheelRotationAt", () => {
  it("starts at startAngle in both modes", () => {
    expect(wheelRotationAt(spin, 7, spin.startedAt, false)).toBe(40);
    expect(wheelRotationAt(spin, 7, spin.startedAt, true)).toBe(40);
  });

  it("ends on the end angle in both modes and stays there", () => {
    const end = wheelSpinEndAngle(spin, 7);
    for (const isReduced of [false, true]) {
      expect(
        wheelRotationAt(spin, 7, spin.startedAt + 5500, isReduced),
      ).toBeCloseTo(end, 6);
      expect(
        wheelRotationAt(spin, 7, spin.startedAt + 60_000, isReduced),
      ).toBeCloseTo(end, 6);
    }
  });

  it("eases out quartically", () => {
    const end = wheelSpinEndAngle(spin, 7);
    expect(wheelRotationAt(spin, 7, spin.startedAt + 2750, false)).toBeCloseTo(
      40 + (end - 40) * (1 - 0.5 ** 4),
      6,
    );
  });

  it("holds under reduced motion until the last 1200 ms", () => {
    const landsAt = spin.startedAt + 5500;
    expect(wheelRotationAt(spin, 7, landsAt - 1201, true)).toBe(40);
    const midway = wheelRotationAt(spin, 7, landsAt - 600, true);
    expect(midway).toBeGreaterThan(40);
    expect(midway).toBeLessThan(wheelSpinEndAngle(spin, 7));
  });

  it("turns under one full turn under reduced motion, from an angle that matches the held one", () => {
    const landsAt = spin.startedAt + 5500;
    const end = wheelSpinEndAngle(spin, 7);
    expect(end - 40).toBeGreaterThan(360);
    const turnStart = wheelRotationAt(spin, 7, landsAt - 1200 + 1e-6, true);
    expect(wheelAngleModulo(turnStart, 360)).toBeCloseTo(40, 3);
    expect(end - turnStart).toBeGreaterThanOrEqual(0);
    expect(end - turnStart).toBeLessThan(360);
    let previous = turnStart;
    for (let elapsedMs = 100; elapsedMs <= 1200; elapsedMs += 100) {
      const rotation = wheelRotationAt(
        spin,
        7,
        landsAt - 1200 + elapsedMs,
        true,
      );
      expect(rotation).toBeGreaterThanOrEqual(previous);
      expect(rotation).toBeLessThanOrEqual(end + 1e-9);
      previous = rotation;
    }
    expect(previous).toBeCloseTo(end, 6);
  });

  it("shows the end angle for a spin with no duration in both modes", () => {
    for (const durationMs of [0, -10]) {
      const instant = { ...spin, durationMs };
      const end = wheelSpinEndAngle(instant, 7);
      for (const isReduced of [false, true]) {
        const rotation = wheelRotationAt(
          instant,
          7,
          instant.startedAt,
          isReduced,
        );
        expect(Number.isFinite(rotation)).toBe(true);
        expect(rotation).toBe(end);
      }
    }
  });
});

describe("wheelPegCount", () => {
  it("counts pegs at the pointer", () => {
    expect(wheelPegCount(270, 4)).toBe(0);
    expect(wheelPegCount(359.9, 4)).toBe(0);
    expect(wheelPegCount(360, 4)).toBe(1);
    expect(wheelPegCount(269.9, 4)).toBe(-1);
  });
});

describe("the landing angle", () => {
  it("lands the middle of every slice under the pointer", () => {
    for (let drawnCount = 1; drawnCount <= 8; drawnCount += 1) {
      for (
        let landedSliceIndex = 0;
        landedSliceIndex < drawnCount;
        landedSliceIndex += 1
      ) {
        const centred = { ...spin, landedSliceIndex, jitterSeed: 500 };
        const middle = (landedSliceIndex + 0.5) * (360 / drawnCount);
        const atPointer =
          (((wheelSpinEndAngle(centred, drawnCount) + middle) % 360) + 360) %
          360;
        expect(atPointer).toBeCloseTo(270, 6);
      }
    }
  });

  it("keeps the jitter inside the landed slice", () => {
    for (const jitterSeed of [0, 1000]) {
      const drifted = { ...spin, jitterSeed };
      const middle = 2.5 * (360 / 7);
      const atPointer =
        (((wheelSpinEndAngle(drifted, 7) + middle) % 360) + 360) % 360;
      expect(Math.abs(atPointer - 270)).toBeLessThanOrEqual(
        0.35 * (360 / 7) + 1e-6,
      );
    }
  });
});
