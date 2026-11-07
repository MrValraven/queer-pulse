import { describe, expect, it } from "vitest";
import { VJ_LIMITS } from "../../../../shared/contracts/vj";
import {
  VJ_STROBE_FLASH_MS,
  VJ_STROBE_MIN_PERIOD_MS,
} from "../../live/vjStrobe";
import {
  createVjStrobeClock,
  tickVjStrobe,
  vjStrobeBeatsPerFlash,
  type VjStrobeClock,
  type VjStrobeTick,
} from "./vjStrobeClock";

const ONE_SECOND_MS = 1000;
/** A flash shows on the next painted frame: up to one 60 Hz frame after its start. */
const FRAME_JITTER_MS = 17;
const SIXTY_HZ_MS = 1000 / 60;
const RUN_MS = VJ_LIMITS.strobeMaxDurationMs;

interface StrobeRunOptions {
  bpm: number;
  frameMs?: number;
  fromMs?: number;
  untilMs: number;
  isStrobingAt?: (atMs: number) => boolean;
  isEnabledAt?: (atMs: number) => boolean;
}

interface StrobeFrame extends VjStrobeTick {
  atMs: number;
  beatIndex: number;
}

/** Ticks one clock frame by frame on a steady tempo with its downbeat at 0. */
function runStrobe(
  options: StrobeRunOptions,
  clock: VjStrobeClock = createVjStrobeClock(),
): StrobeFrame[] {
  const frameMs = options.frameMs ?? SIXTY_HZ_MS;
  const fromMs = options.fromMs ?? 0;
  const beatPeriodMs = 60_000 / options.bpm;
  const frames: StrobeFrame[] = [];
  for (let frame = 0; fromMs + frame * frameMs < options.untilMs; frame += 1) {
    const atMs = fromMs + frame * frameMs;
    const beatIndex = Math.floor(atMs / beatPeriodMs);
    const tick = tickVjStrobe(clock, {
      isStrobing: options.isStrobingAt?.(atMs) ?? true,
      isEnabled: options.isEnabledAt?.(atMs) ?? true,
      nowMs: atMs,
      beatIndex,
      beatPeriodMs,
    });
    frames.push({ atMs, beatIndex, ...tick });
  }
  return frames;
}

function flashStartsOf(frames: readonly StrobeFrame[]): StrobeFrame[] {
  return frames.filter((frame) => frame.didStartFlash);
}

/** Most starts that can show inside one closed second, each up to jitterMs late. */
function mostFlashesInOneSecond(startsMs: readonly number[]): number {
  let mostFlashes = 0;
  for (const windowStartMs of startsMs) {
    const windowEndMs = windowStartMs + ONE_SECOND_MS + FRAME_JITTER_MS;
    const inside = startsMs.filter(
      (startMs) => startMs >= windowStartMs && startMs <= windowEndMs,
    ).length;
    mostFlashes = Math.max(mostFlashes, inside);
  }
  return mostFlashes;
}

/** 60 to 200 BPM in half steps, at 60 Hz and 144 Hz. */
function sweptRuns(): { bpm: number; frameMs: number }[] {
  const runs: { bpm: number; frameMs: number }[] = [];
  for (let doubledBpm = 120; doubledBpm <= 400; doubledBpm += 1) {
    runs.push({ bpm: doubledBpm / 2, frameMs: SIXTY_HZ_MS });
    runs.push({ bpm: doubledBpm / 2, frameMs: 1000 / 144 });
  }
  return runs;
}

describe("vjStrobeClock", () => {
  it("never starts flashes closer than 400 ms at any tempo from 60 to 200 BPM", () => {
    for (const { bpm, frameMs } of sweptRuns()) {
      const startsMs = flashStartsOf(
        runStrobe({ bpm, frameMs, untilMs: RUN_MS + 2000 }),
      ).map((frame) => frame.atMs);
      // 60 BPM flashes once a second: 10 starts in the 10 s run.
      expect(startsMs.length).toBeGreaterThanOrEqual(9);
      for (let index = 1; index < startsMs.length; index += 1) {
        expect(
          (startsMs[index] ?? 0) - (startsMs[index - 1] ?? 0),
        ).toBeGreaterThanOrEqual(VJ_STROBE_MIN_PERIOD_MS);
      }
    }
  });

  it("never starts more than 3 flashes in any one-second window at any tempo", () => {
    for (const { bpm, frameMs } of sweptRuns()) {
      const startsMs = flashStartsOf(
        runStrobe({ bpm, frameMs, untilMs: RUN_MS }),
      ).map((frame) => frame.atMs);
      expect(mostFlashesInOneSecond(startsMs)).toBeLessThanOrEqual(3);
    }
  });

  it("flashes on every beat at 124 BPM and every second beat at 180 BPM", () => {
    expect(vjStrobeBeatsPerFlash(60_000 / 124)).toBe(1);
    expect(vjStrobeBeatsPerFlash(60_000 / 180)).toBe(2);
    expect(vjStrobeBeatsPerFlash(60_000 / 200)).toBe(2);
    const beatSteps = (bpm: number): number[] => {
      const beats = flashStartsOf(runStrobe({ bpm, untilMs: RUN_MS })).map(
        (frame) => frame.beatIndex,
      );
      return beats.slice(1).map((beat, index) => beat - (beats[index] ?? 0));
    };
    const stepsAt124 = beatSteps(124);
    expect(stepsAt124.length).toBeGreaterThan(15);
    expect(new Set(stepsAt124)).toEqual(new Set([1]));
    const stepsAt180 = beatSteps(180);
    expect(stepsAt180.length).toBeGreaterThan(10);
    expect(new Set(stepsAt180)).toEqual(new Set([2]));
  });

  it("keeps each flash up for VJ_STROBE_FLASH_MS", () => {
    const frames = runStrobe({ bpm: 124, untilMs: 2000 });
    const firstStart = flashStartsOf(frames)[0];
    expect(firstStart?.atMs).toBe(0);
    for (const frame of frames.filter((each) => each.atMs < 400)) {
      expect(frame.isFlashUp).toBe(frame.atMs < VJ_STROBE_FLASH_MS);
    }
  });

  it("stops 10 s after it applied strobe on", () => {
    const appliedAtMs = 1000;
    const frames = runStrobe({
      bpm: 124,
      fromMs: appliedAtMs,
      untilMs: appliedAtMs + RUN_MS + 2000,
    });
    for (const frame of frames) {
      const isOver = frame.atMs - appliedAtMs >= RUN_MS;
      expect(frame.isRunOver).toBe(isOver);
      if (isOver) {
        expect(frame.didStartFlash).toBe(false);
        expect(frame.isFlashUp).toBe(false);
      }
    }
    expect(flashStartsOf(frames).length).toBeGreaterThan(15);
  });

  it("keeps the original 10 s when strobe is sent on again", () => {
    // The remote sends strobe on a second time at 6 s; the input stays true.
    const frames = runStrobe({ bpm: 124, untilMs: RUN_MS + 3000 });
    const lastStart = flashStartsOf(frames).at(-1);
    expect(lastStart?.atMs).toBeLessThan(RUN_MS);
    const firstOver = frames.find((frame) => frame.isRunOver);
    expect(firstOver?.atMs).toBeGreaterThanOrEqual(RUN_MS);
    expect(firstOver?.atMs).toBeLessThan(RUN_MS + SIXTY_HZ_MS);
  });

  it("opens a new 10 s run after the strobe went off and on again", () => {
    const clock = createVjStrobeClock();
    runStrobe({ bpm: 124, untilMs: RUN_MS + 500 }, clock);
    const restarted = runStrobe(
      {
        bpm: 124,
        fromMs: RUN_MS + 500,
        untilMs: 2 * RUN_MS + 2000,
        isStrobingAt: (atMs) => atMs >= RUN_MS + 1000,
      },
      clock,
    );
    const starts = flashStartsOf(restarted);
    expect(starts[0]?.atMs).toBeGreaterThanOrEqual(RUN_MS + 1000);
    expect(starts.at(-1)?.atMs).toBeLessThan(2 * RUN_MS + 1000 + SIXTY_HZ_MS);
  });

  it("never flashes on a follower screen", () => {
    const frames = runStrobe({
      bpm: 124,
      untilMs: RUN_MS + 1000,
      isEnabledAt: () => false,
    });
    expect(frames.some((frame) => frame.didStartFlash)).toBe(false);
    expect(frames.some((frame) => frame.isFlashUp)).toBe(false);
    // The 10 s run counts on a follower too.
    expect(
      frames.find((frame) => frame.isRunOver)?.atMs,
    ).toBeGreaterThanOrEqual(RUN_MS);
  });

  it("waits a full period after becoming the lead mid-run", () => {
    const leadFromMs = 3000;
    const frames = runStrobe({
      bpm: 124,
      untilMs: RUN_MS,
      isEnabledAt: (atMs) => atMs >= leadFromMs,
    });
    const becameLeadAt = frames.find((frame) => frame.atMs >= leadFromMs);
    const starts = flashStartsOf(frames);
    expect(starts.length).toBeGreaterThan(5);
    expect(starts[0]?.atMs).toBeGreaterThanOrEqual(
      (becameLeadAt?.atMs ?? leadFromMs) + VJ_STROBE_MIN_PERIOD_MS,
    );
    // The run still ends 10 s after the strobe applied on this screen.
    expect(starts.at(-1)?.atMs).toBeLessThan(RUN_MS);
  });

  it("falls back to time-based flashes when the beat is not a usable number", () => {
    const clock = createVjStrobeClock();
    const startsMs: number[] = [];
    for (let frame = 0; frame * SIXTY_HZ_MS < 5000; frame += 1) {
      const atMs = frame * SIXTY_HZ_MS;
      const tick = tickVjStrobe(clock, {
        isStrobing: true,
        isEnabled: true,
        nowMs: atMs,
        beatIndex: Number.NaN,
        beatPeriodMs: frame % 2 === 0 ? 0 : Number.POSITIVE_INFINITY,
      });
      if (tick.didStartFlash) startsMs.push(atMs);
    }
    expect(startsMs.length).toBeGreaterThan(8);
    expect(mostFlashesInOneSecond(startsMs)).toBeLessThanOrEqual(3);
    for (let index = 1; index < startsMs.length; index += 1) {
      expect(
        (startsMs[index] ?? 0) - (startsMs[index - 1] ?? 0),
      ).toBeGreaterThanOrEqual(VJ_STROBE_MIN_PERIOD_MS);
    }
  });

  it("holds the 400 ms floor while the tempo jumps on every frame", () => {
    const clock = createVjStrobeClock();
    const startsMs: number[] = [];
    let state = 7;
    for (let frame = 0; frame * SIXTY_HZ_MS < RUN_MS; frame += 1) {
      state = (Math.imul(state, 1_103_515_245) + 12_345) >>> 0;
      const beatPeriodMs = 60_000 / (60 + (state % 141));
      const tick = tickVjStrobe(clock, {
        isStrobing: true,
        isEnabled: true,
        nowMs: frame * SIXTY_HZ_MS,
        // Every frame lands on a new beat index.
        beatIndex: frame * 6,
        beatPeriodMs,
      });
      if (tick.didStartFlash) startsMs.push(frame * SIXTY_HZ_MS);
    }
    expect(startsMs.length).toBeGreaterThan(10);
    expect(mostFlashesInOneSecond(startsMs)).toBeLessThanOrEqual(3);
  });

  it("flashes on a steady every second beat near 150 BPM with jittery frame times", () => {
    expect(vjStrobeBeatsPerFlash(400)).toBe(2);
    expect(vjStrobeBeatsPerFlash(410)).toBe(2);
    expect(vjStrobeBeatsPerFlash(420)).toBe(1);
    for (const bpm of [146, 148, 150]) {
      const beatPeriodMs = 60_000 / bpm;
      const clock = createVjStrobeClock();
      const flashBeats: number[] = [];
      let state = 11;
      for (let frame = 0; frame * SIXTY_HZ_MS < RUN_MS - 100; frame += 1) {
        state = (Math.imul(state, 1_103_515_245) + 12_345) >>> 0;
        // Each frame paints up to 15 ms late, so frame times stay in order.
        const atMs = frame * SIXTY_HZ_MS + (state % 16);
        const beatIndex = Math.floor(atMs / beatPeriodMs);
        const tick = tickVjStrobe(clock, {
          isStrobing: true,
          isEnabled: true,
          nowMs: atMs,
          beatIndex,
          beatPeriodMs,
        });
        if (tick.didStartFlash) flashBeats.push(beatIndex);
      }
      const beatSteps = flashBeats
        .slice(1)
        .map((beat, index) => beat - (flashBeats[index] ?? 0));
      expect(beatSteps.length).toBeGreaterThan(10);
      expect(new Set(beatSteps)).toEqual(new Set([2]));
    }
  });

  it("shows nothing for a time that is not a finite number", () => {
    const tick = tickVjStrobe(createVjStrobeClock(), {
      isStrobing: true,
      isEnabled: true,
      nowMs: Number.NaN,
      beatIndex: 0,
      beatPeriodMs: 500,
    });
    expect(tick).toEqual({
      isFlashUp: false,
      isRunOver: false,
      didStartFlash: false,
    });
  });
});
