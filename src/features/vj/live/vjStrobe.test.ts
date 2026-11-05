import { describe, expect, it } from "vitest";
import { VJ_LIMITS } from "../../../shared/contracts/vj";
import {
  VJ_STROBE_FLASH_MS,
  VJ_STROBE_MIN_PERIOD_MS,
  vjStrobeFlashStartsMs,
  vjStrobePeriodMs,
} from "./vjStrobe";

const ONE_SECOND_MS = 1000;
/** A flash shows on the next painted frame: up to one 60 Hz frame after its start. */
const FRAME_JITTER_MS = 17;
const SHOW_LENGTH_MS = VJ_LIMITS.strobeMaxDurationMs;

/** Every tempo the test sweeps: 60 to 200 in 0.1 steps, plus values outside the range. */
function sweptTempos(): number[] {
  const tempos: number[] = [];
  for (let tenthsOfBpm = 600; tenthsOfBpm <= 2000; tenthsOfBpm += 1) {
    tempos.push(tenthsOfBpm / 10);
  }
  return [...tempos, 400, 0, -120, NaN, Infinity, -Infinity];
}

/**
 * Most flashes that can become visible inside one closed second, when each
 * flash may show anywhere from its start to jitterMs later. A flash counts for
 * a window when any moment it could show falls inside that window, so this is
 * the worst case over every possible frame delay.
 */
function mostVisibleFlashesInOneSecond(
  flashStartsMs: readonly number[],
  jitterMs: number,
): number {
  const windowStartsMs = flashStartsMs.flatMap((flashStartMs) => [
    flashStartMs,
    flashStartMs + jitterMs,
  ]);
  let mostFlashes = 0;
  for (const windowStartMs of windowStartsMs) {
    const windowEndMs = windowStartMs + ONE_SECOND_MS;
    const flashesInWindow = flashStartsMs.filter(
      (flashStartMs) =>
        flashStartMs + jitterMs >= windowStartMs && flashStartMs <= windowEndMs,
    ).length;
    mostFlashes = Math.max(mostFlashes, flashesInWindow);
  }
  return mostFlashes;
}

/** Starts every periodMs from 0, for checking the window counter itself. */
function evenStarts(periodMs: number, durationMs: number): number[] {
  const flashStartsMs: number[] = [];
  for (let startMs = 0; startMs < durationMs; startMs += periodMs) {
    flashStartsMs.push(startMs);
  }
  return flashStartsMs;
}

describe("vjStrobe", () => {
  it("never shows more than 3 flash starts in any one-second window at any tempo, with a frame of delay", () => {
    for (const bpm of sweptTempos()) {
      const flashStartsMs = vjStrobeFlashStartsMs(bpm, SHOW_LENGTH_MS);
      expect(flashStartsMs.length).toBeGreaterThan(0);
      expect(
        mostVisibleFlashesInOneSecond(flashStartsMs, FRAME_JITTER_MS),
      ).toBeLessThanOrEqual(3);
      expect(vjStrobePeriodMs(bpm)).toBeGreaterThanOrEqual(
        VJ_STROBE_MIN_PERIOD_MS,
      );
    }
  });

  it("counts a fourth start that a frame of delay pushes into the window", () => {
    // The old 334 ms floor: four starts span 1002 ms, so a first flash shown a
    // frame late puts all four inside one second.
    expect(mostVisibleFlashesInOneSecond(evenStarts(334, 2000), 0)).toBe(3);
    expect(
      mostVisibleFlashesInOneSecond(evenStarts(334, 2000), FRAME_JITTER_MS),
    ).toBe(4);
    expect(
      mostVisibleFlashesInOneSecond(
        evenStarts(VJ_STROBE_MIN_PERIOD_MS, 4000),
        FRAME_JITTER_MS,
      ),
    ).toBe(3);
    expect(3 * VJ_STROBE_MIN_PERIOD_MS - FRAME_JITTER_MS).toBeGreaterThan(
      ONE_SECOND_MS,
    );
  });

  it("keeps every flash start inside the 10 second strobe", () => {
    const flashStartsMs = vjStrobeFlashStartsMs(400, SHOW_LENGTH_MS);
    expect(flashStartsMs[0]).toBe(0);
    expect(Math.max(...flashStartsMs)).toBeLessThan(SHOW_LENGTH_MS);
    expect(flashStartsMs.length).toBeLessThanOrEqual(25);
    expect(vjStrobeFlashStartsMs(120, 0)).toEqual([]);
    expect(vjStrobeFlashStartsMs(120, NaN)).toEqual([]);
  });

  it("flashes once a beat below 150 BPM", () => {
    expect(vjStrobePeriodMs(120)).toBe(500);
    expect(vjStrobePeriodMs(60)).toBe(1000);
    expect(vjStrobePeriodMs(149)).toBe(403);
    expect(vjStrobeFlashStartsMs(120, 2000)).toEqual([0, 500, 1000, 1500]);
  });

  it("caps the rate at 2.5 flashes a second from 150 BPM up", () => {
    expect(VJ_STROBE_MIN_PERIOD_MS).toBe(400);
    expect(vjStrobePeriodMs(150)).toBe(VJ_STROBE_MIN_PERIOD_MS);
    expect(vjStrobePeriodMs(180)).toBe(VJ_STROBE_MIN_PERIOD_MS);
    expect(vjStrobePeriodMs(200)).toBe(VJ_STROBE_MIN_PERIOD_MS);
    expect(vjStrobePeriodMs(400)).toBe(VJ_STROBE_MIN_PERIOD_MS);
  });

  it("reads a tempo that is not a positive number as the default tempo", () => {
    const defaultPeriodMs = vjStrobePeriodMs(VJ_LIMITS.bpmDefault);
    expect(vjStrobePeriodMs(NaN)).toBe(defaultPeriodMs);
    expect(vjStrobePeriodMs(Infinity)).toBe(defaultPeriodMs);
    expect(vjStrobePeriodMs(0)).toBe(defaultPeriodMs);
    expect(vjStrobePeriodMs(-60)).toBe(defaultPeriodMs);
  });

  it("keeps each flash shorter than the gap between flashes", () => {
    for (const bpm of sweptTempos()) {
      const gapBetweenFlashesMs = vjStrobePeriodMs(bpm) - VJ_STROBE_FLASH_MS;
      expect(VJ_STROBE_FLASH_MS).toBeLessThan(gapBetweenFlashesMs);
    }
  });
});
