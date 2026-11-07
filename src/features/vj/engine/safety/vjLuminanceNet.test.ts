import { describe, expect, it } from "vitest";
import {
  EMPTY_VJ_FLASH_BUDGET,
  requestVjFlash,
  type VjFlashBudget,
} from "./vjFlashGovernor";
import {
  VJ_RGBA8_STEP,
  VJ_SLEW_HOLD_LIMIT,
  VJ_SMOOTHING_MS,
  createVjLuminanceNet,
  isVjLuminanceNetSmoothing,
  observeVjProbe,
  vjOutputSlewLimit,
  vjSlewLimitPerFrame,
} from "./vjLuminanceNet";
import {
  VJ_PROBE_GRID,
  VJ_WINDOW_COUNT,
  VJ_WINDOW_STEPS_ACROSS,
  measureVjWindows,
  vjRedMeasure,
  vjRelativeLuminance,
} from "./vjLuminanceWindows";

type Rgb = readonly [number, number, number];

const BLACK: Rgb = [0, 0, 0];
const WHITE: Rgb = [255, 255, 255];
const RED: Rgb = [255, 0, 0];
/** A grey with about the relative luminance of pure red (0.2126). */
const RED_LUMINANCE_GREY: Rgb = [127, 127, 127];
/** 60 Hz frames, counted in whole frames so beat maths stays exact. */
const FRAME_MS = 1000 / 60;

/** A 16x16 RGBA probe reading painted cell by cell. */
function probeOf(colourAt: (column: number, row: number) => Rgb): Uint8Array {
  const pixels = new Uint8Array(VJ_PROBE_GRID * VJ_PROBE_GRID * 4);
  for (let row = 0; row < VJ_PROBE_GRID; row += 1) {
    for (let column = 0; column < VJ_PROBE_GRID; column += 1) {
      const [red, green, blue] = colourAt(column, row);
      const byteIndex = (row * VJ_PROBE_GRID + column) * 4;
      pixels[byteIndex] = red;
      pixels[byteIndex + 1] = green;
      pixels[byteIndex + 2] = blue;
      pixels[byteIndex + 3] = 255;
    }
  }
  return pixels;
}

function fullScreen(colour: Rgb): Uint8Array {
  return probeOf(() => colour);
}

interface NetReading {
  atMs: number;
  generalFlashesLastSecond: number;
  redFlashesLastSecond: number;
  isSmoothing: boolean;
}

/** Feeds frameCount 60 Hz readings; probeAtFrame paints each one. */
function runNet(
  frameCount: number,
  probeAtFrame: (frame: number) => Uint8Array,
): NetReading[] {
  const net = createVjLuminanceNet();
  const readings: NetReading[] = [];
  for (let frame = 0; frame < frameCount; frame += 1) {
    const atMs = frame * FRAME_MS;
    const answer = observeVjProbe(net, probeAtFrame(frame), atMs);
    readings.push({ atMs, ...answer });
  }
  return readings;
}

/** Alternates two probes, holding each for halfPeriodMs. */
function alternating(
  first: Uint8Array,
  second: Uint8Array,
  halfPeriodMs: number,
): (frame: number) => Uint8Array {
  return (frame) =>
    Math.floor((frame * FRAME_MS) / halfPeriodMs) % 2 === 0 ? first : second;
}

function mostGeneral(readings: readonly NetReading[]): number {
  return Math.max(
    ...readings.map((reading) => reading.generalFlashesLastSecond),
  );
}

function mostRed(readings: readonly NetReading[]): number {
  return Math.max(...readings.map((reading) => reading.redFlashesLastSecond));
}

describe("vjLuminanceWindows", () => {
  it("computes WCAG relative luminance for black, white and mid grey", () => {
    expect(vjRelativeLuminance(0, 0, 0)).toBe(0);
    expect(vjRelativeLuminance(255, 255, 255)).toBeCloseTo(1, 10);
    expect(vjRelativeLuminance(128, 128, 128)).toBeCloseTo(0.2159, 4);
    expect(vjRelativeLuminance(255, 0, 0)).toBeCloseTo(0.2126, 4);
    expect(vjRelativeLuminance(Number.NaN, 300, -5)).toBeCloseTo(0.7152, 4);
  });

  it("measures saturated red per WCAG", () => {
    expect(vjRedMeasure(255, 0, 0)).toEqual({
      isSaturatedRed: true,
      redValue: 320,
    });
    expect(vjRedMeasure(0, 0, 0)).toEqual({
      isSaturatedRed: false,
      redValue: 0,
    });
    const grey = vjRedMeasure(128, 128, 128);
    expect(grey.isSaturatedRed).toBe(false);
    expect(grey.redValue).toBe(0);
  });

  it("averages each 5x4 window of the 16x16 grid", () => {
    const luminance = new Float32Array(VJ_WINDOW_COUNT);
    const red = new Float32Array(VJ_WINDOW_COUNT);
    const saturatedRed = new Uint8Array(VJ_WINDOW_COUNT);
    // One white cell in the top-left corner, one red cell in the bottom-right.
    const pixels = probeOf((column, row) => {
      if (column === 0 && row === 0) return WHITE;
      if (column === 15 && row === 15) return RED;
      return BLACK;
    });
    measureVjWindows(pixels, luminance, red, saturatedRed);
    expect(VJ_WINDOW_COUNT).toBe(12 * 13);
    expect(luminance[0]).toBeCloseTo(1 / 20, 5);
    expect(luminance[1]).toBe(0);
    const lastWindow = VJ_WINDOW_COUNT - 1;
    expect(lastWindow).toBe(12 * VJ_WINDOW_STEPS_ACROSS + 11);
    expect(red[lastWindow]).toBeCloseTo(320 / 20, 3);
    expect(saturatedRed[lastWindow]).toBe(1);
    expect(saturatedRed[0]).toBe(0);
  });
});

describe("vjLuminanceNet", () => {
  it("counts a full-screen black and white swap at 4 Hz as 4 flashes a second", () => {
    const readings = runNet(
      180,
      alternating(fullScreen(WHITE), fullScreen(BLACK), 125),
    );
    const settled = readings.filter((reading) => reading.atMs >= 1200);
    expect(settled.length).toBeGreaterThan(0);
    for (const reading of settled) {
      expect(reading.generalFlashesLastSecond).toBe(4);
      expect(reading.isSmoothing).toBe(true);
    }
  });

  it("ignores a swing that stays above 0.8 luminance", () => {
    expect(vjRelativeLuminance(240, 240, 240)).toBeGreaterThan(0.8);
    expect(
      vjRelativeLuminance(255, 255, 255) - vjRelativeLuminance(240, 240, 240),
    ).toBeGreaterThan(0.1);
    const readings = runNet(
      180,
      alternating(fullScreen(WHITE), fullScreen([240, 240, 240]), 125),
    );
    expect(mostGeneral(readings)).toBe(0);
    expect(readings.some((reading) => reading.isSmoothing)).toBe(false);
  });

  it("ignores a change under 0.1", () => {
    const darker: Rgb = [124, 124, 124];
    const lighter: Rgb = [145, 145, 145];
    expect(
      vjRelativeLuminance(...lighter) - vjRelativeLuminance(...darker),
    ).toBeLessThan(0.1);
    const readings = runNet(
      180,
      alternating(fullScreen(darker), fullScreen(lighter), 125),
    );
    expect(mostGeneral(readings)).toBe(0);
    expect(readings.some((reading) => reading.isSmoothing)).toBe(false);
  });

  it("counts saturated red alternation as red flashes", () => {
    // Red against a grey of the same luminance: no general flash at all, so
    // only the red rule can catch it.
    expect(
      Math.abs(
        vjRelativeLuminance(...RED) -
          vjRelativeLuminance(...RED_LUMINANCE_GREY),
      ),
    ).toBeLessThan(0.01);
    const readings = runNet(
      180,
      alternating(fullScreen(RED), fullScreen(RED_LUMINANCE_GREY), 125),
    );
    expect(mostGeneral(readings)).toBe(0);
    expect(mostRed(readings)).toBe(4);
    expect(readings.at(-1)?.isSmoothing).toBe(true);
  });

  it("counts a single saturated red flash on black as one red flash", () => {
    const readings = runNet(60, (frame) =>
      frame >= 10 && frame < 14 ? fullScreen(RED) : fullScreen(BLACK),
    );
    expect(mostRed(readings)).toBe(1);
    expect(readings.some((reading) => reading.isSmoothing)).toBe(false);
  });

  it("starts smoothing when a window reaches 3 flashes in a second and holds it for 1000 ms", () => {
    const flashing = alternating(fullScreen(WHITE), fullScreen(BLACK), 500 / 3);
    const net = createVjLuminanceNet();
    let lastMetAtMs: number | null = null;
    let hasSmoothed = false;
    for (let frame = 0; frame < 210; frame += 1) {
      const atMs = frame * FRAME_MS;
      const pixels = frame < 90 ? flashing(frame) : fullScreen(BLACK);
      const answer = observeVjProbe(net, pixels, atMs);
      if (
        answer.generalFlashesLastSecond >= 3 ||
        answer.redFlashesLastSecond >= 3
      ) {
        lastMetAtMs = atMs;
      }
      const isExpected =
        lastMetAtMs !== null && atMs < lastMetAtMs + VJ_SMOOTHING_MS;
      expect(answer.isSmoothing).toBe(isExpected);
      hasSmoothed = hasSmoothed || answer.isSmoothing;
      if (lastMetAtMs !== null) {
        expect(isVjLuminanceNetSmoothing(net, lastMetAtMs + 999)).toBe(true);
        expect(
          isVjLuminanceNetSmoothing(net, lastMetAtMs + VJ_SMOOTHING_MS),
        ).toBe(false);
      }
    }
    expect(hasSmoothed).toBe(true);
    expect(lastMetAtMs).not.toBeNull();
    expect(isVjLuminanceNetSmoothing(net, 210 * FRAME_MS)).toBe(false);
  });

  it("ignores a flashing area smaller than one 5x4 window", () => {
    const oneCell = (colour: Rgb): Uint8Array =>
      probeOf((column, row) => (column === 7 && row === 7 ? colour : BLACK));
    const general = runNet(
      180,
      alternating(oneCell(WHITE), oneCell(BLACK), 125),
    );
    expect(mostGeneral(general)).toBe(0);
    const red = runNet(180, alternating(oneCell(RED), oneCell(BLACK), 125));
    expect(mostRed(red)).toBe(0);
    expect([...general, ...red].some((reading) => reading.isSmoothing)).toBe(
      false,
    );
  });

  it("counts a flashing area the size of one 5x4 window", () => {
    const oneWindow = (colour: Rgb): Uint8Array =>
      probeOf((column, row) =>
        column >= 4 && column < 9 && row >= 6 && row < 10 ? colour : BLACK,
      );
    const readings = runNet(
      180,
      alternating(oneWindow(WHITE), oneWindow(BLACK), 125),
    );
    expect(mostGeneral(readings)).toBe(4);
  });

  it("keeps a 2 Hz full-screen pulse under the smoothing trigger", () => {
    const readings = runNet(
      300,
      alternating(fullScreen(WHITE), fullScreen(BLACK), 250),
    );
    expect(mostGeneral(readings)).toBe(2);
    expect(readings.some((reading) => reading.isSmoothing)).toBe(false);
  });

  it("smooths an ungoverned invert at 200 BPM", () => {
    // A beat is 18 frames at 60 Hz; the beat variant inverts the first half,
    // 3.3 flashes a second. The trigger at 3 catches it one flash early.
    const image = fullScreen([40, 40, 40]);
    const inverted = fullScreen([215, 215, 215]);
    const readings = runNet(300, (frame) =>
      frame % 18 < 9 ? inverted : image,
    );
    expect(mostGeneral(readings)).toBe(3);
    expect(
      readings
        .filter((reading) => reading.atMs >= 1000)
        .every((reading) => reading.isSmoothing),
    ).toBe(true);
  });

  it("keeps a governed invert at 200 BPM at 3 flashes a second or fewer", () => {
    const image = fullScreen([40, 40, 40]);
    const inverted = fullScreen([215, 215, 215]);
    let budget: VjFlashBudget = EMPTY_VJ_FLASH_BUDGET;
    let isBeatGranted = false;
    const readings = runNet(600, (frame) => {
      if (frame % 18 === 0) {
        const answer = requestVjFlash(budget, "invertBeat", frame * FRAME_MS);
        budget = answer.budget;
        isBeatGranted = answer.isGranted;
      }
      return isBeatGranted && frame % 18 < 9 ? inverted : image;
    });
    expect(mostGeneral(readings)).toBeLessThanOrEqual(3);
    expect(mostGeneral(readings)).toBeGreaterThan(0);
  });

  it("forgets transitions and smooths for a second when the clock goes back", () => {
    const net = createVjLuminanceNet();
    observeVjProbe(net, fullScreen(BLACK), 5000);
    observeVjProbe(net, fullScreen(WHITE), 5100);
    const answer = observeVjProbe(net, fullScreen(BLACK), 100);
    expect(answer.generalFlashesLastSecond).toBe(0);
    expect(answer.isSmoothing).toBe(true);
    expect(isVjLuminanceNetSmoothing(net, 1099)).toBe(true);
    expect(isVjLuminanceNetSmoothing(net, 1100)).toBe(false);
  });

  it("changes nothing for a short reading or a time that is not finite", () => {
    const net = createVjLuminanceNet();
    const answer = observeVjProbe(net, new Uint8Array(16), 0);
    expect(answer).toEqual({
      generalFlashesLastSecond: 0,
      redFlashesLastSecond: 0,
      isSmoothing: false,
    });
    observeVjProbe(net, fullScreen(BLACK), Number.NaN);
    expect(net.hasObserved).toBe(false);
  });

  it("slews 0.2 sRGB units a second and never turns the limit off", () => {
    expect(vjSlewLimitPerFrame(1000 / 60)).toBeCloseTo(0.2 / 60, 10);
    expect(vjSlewLimitPerFrame(40)).toBeCloseTo(0.008, 10);
    expect(vjSlewLimitPerFrame(5000)).toBeCloseTo(0.01, 10);
    for (const badDelta of [0, -10, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(vjSlewLimitPerFrame(badDelta)).toBeGreaterThan(0);
    }
  });
});

describe("vjOutputSlewLimit", () => {
  /** One channel through the output shader's slew and an RGBA8 store, from 0 toward 1. */
  function slewOneSecond(refreshHz: number): number[] {
    const net = createVjLuminanceNet();
    net.smoothingUntilMs = 2000;
    const frameMs = 1000 / refreshHz;
    const stored: number[] = [];
    let previous = 0;
    for (let frame = 1; frame * frameMs <= 1000 + 1e-6; frame += 1) {
      const limit = vjOutputSlewLimit(net, frame * frameMs, frameMs);
      expect(limit).toBeGreaterThan(0);
      const moved = previous + Math.min(1 - previous, limit);
      previous = Math.round(moved * 255) / 255;
      stored.push(previous);
    }
    return stored;
  }

  for (const refreshHz of [60, 100, 120, 144]) {
    it(`moves 0.2 a second through RGBA8 at ${refreshHz} Hz`, () => {
      const stored = slewOneSecond(refreshHz);
      expect(stored.at(-1)).toBeGreaterThanOrEqual(0.2 - VJ_RGBA8_STEP);
      expect(stored.at(-1)).toBeLessThanOrEqual(0.2 + VJ_RGBA8_STEP);
      const halfway = stored[Math.floor(stored.length / 2) - 1] ?? 0;
      expect(halfway).toBeGreaterThan(0.1 - 2 * VJ_RGBA8_STEP);
      expect(halfway).toBeLessThan(0.1 + 2 * VJ_RGBA8_STEP);
      // Never frozen for more than three frames in a row.
      let heldFrames = 0;
      for (let index = 1; index < stored.length; index += 1) {
        heldFrames = stored[index] === stored[index - 1] ? heldFrames + 1 : 0;
        expect(heldFrames).toBeLessThan(3);
      }
    });
  }

  it("sends only whole steps or the hold limit", () => {
    const net = createVjLuminanceNet();
    net.smoothingUntilMs = 1000;
    for (let frame = 1; frame <= 120; frame += 1) {
      const limit = vjOutputSlewLimit(net, frame * (1000 / 120), 1000 / 120);
      if (limit === VJ_SLEW_HOLD_LIMIT) continue;
      expect(limit / VJ_RGBA8_STEP).toBeCloseTo(
        Math.round(limit / VJ_RGBA8_STEP),
        6,
      );
    }
  });

  it("answers 0 and drops the allowance once smoothing ends", () => {
    const net = createVjLuminanceNet();
    net.smoothingUntilMs = 100;
    vjOutputSlewLimit(net, 50, 1000 / 144);
    expect(net.slewAllowance).toBeGreaterThan(0);
    expect(vjOutputSlewLimit(net, 100, 1000 / 144)).toBe(0);
    expect(net.slewAllowance).toBe(0);
  });
});
