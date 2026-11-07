import { describe, expect, it } from "vitest";
import { VJ_FRAME_STATS_WINDOW_MS, VjFrameStats } from "./vjFrameStats";

const SIXTY_HZ_MS = 1000 / 60;

/** Records `frameCount` frames at a steady interval; answers the last timestamp. */
function recordSteadyFrames(
  stats: VjFrameStats,
  startMs: number,
  frameCount: number,
  intervalMs: number,
): number {
  let frameTimeMs = startMs;
  for (let frameIndex = 0; frameIndex < frameCount; frameIndex += 1) {
    frameTimeMs = startMs + frameIndex * intervalMs;
    stats.record(frameTimeMs);
  }
  return frameTimeMs;
}

describe("VjFrameStats", () => {
  it("reads 60 fps from 300 frames over 5 s", () => {
    const stats = new VjFrameStats();
    const lastFrameMs = recordSteadyFrames(stats, 0, 300, SIXTY_HZ_MS);

    const reading = stats.read(lastFrameMs);

    expect(reading.fps).toBe(60);
    expect(reading.droppedFrames).toBe(0);
    expect(reading.refreshIntervalMs).toBeCloseTo(SIXTY_HZ_MS, 6);
  });

  it("counts a 50 ms gap at 60 Hz as two dropped frames", () => {
    const stats = new VjFrameStats();
    const beforeGapMs = recordSteadyFrames(stats, 0, 120, SIXTY_HZ_MS);
    const lastFrameMs = recordSteadyFrames(
      stats,
      beforeGapMs + 50,
      120,
      SIXTY_HZ_MS,
    );

    const reading = stats.read(lastFrameMs);

    expect(reading.droppedFrames).toBe(2);
    expect(reading.refreshIntervalMs).toBeCloseTo(SIXTY_HZ_MS, 6);
  });

  it("counts drops for a page running mostly at half a 120 Hz display's rate", () => {
    const stats = new VjFrameStats();
    const oneTwentyHzMs = 1000 / 120;
    // Half a second at the display's rate, then 4.5 s at every second refresh.
    const fullRateLastMs = recordSteadyFrames(stats, 0, 60, oneTwentyHzMs);
    const lastFrameMs = recordSteadyFrames(
      stats,
      fullRateLastMs + SIXTY_HZ_MS,
      270,
      SIXTY_HZ_MS,
    );

    const reading = stats.read(lastFrameMs);

    expect(reading.refreshIntervalMs).toBeCloseTo(oneTwentyHzMs, 6);
    // Every one of the 270 half-rate intervals hides one refresh.
    expect(reading.droppedFrames).toBe(270);
  });

  it("forgets frames older than 5 s", () => {
    const stats = new VjFrameStats();
    const lastFrameMs = recordSteadyFrames(stats, 0, 300, SIXTY_HZ_MS);

    expect(stats.read(lastFrameMs + VJ_FRAME_STATS_WINDOW_MS + 1)).toEqual({
      fps: 0,
      droppedFrames: 0,
      refreshIntervalMs: 0,
    });

    // A 30 Hz stretch recorded later is read on its own.
    const laterStartMs = lastFrameMs + 20_000;
    const laterLastMs = recordSteadyFrames(stats, laterStartMs, 151, 1000 / 30);
    const reading = stats.read(laterLastMs);
    expect(reading.fps).toBe(30);
    expect(reading.droppedFrames).toBe(0);
  });

  it("rounds fps to one decimal", () => {
    const stats = new VjFrameStats();
    // 100 intervals of 17 ms: 100 / 1.7 s is 58.82 fps.
    const lastFrameMs = recordSteadyFrames(stats, 0, 101, 17);

    expect(stats.read(lastFrameMs).fps).toBe(58.8);
  });

  it("drops what it held on reset", () => {
    const stats = new VjFrameStats();
    const lastFrameMs = recordSteadyFrames(stats, 0, 60, SIXTY_HZ_MS);

    stats.reset();

    expect(stats.read(lastFrameMs).fps).toBe(0);
  });
});
