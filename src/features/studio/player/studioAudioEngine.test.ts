import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSimulatedAudioEngine,
  type StudioAudioEvent,
} from "./studioAudioEngine";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function setup(duration = 10) {
  const engine = createSimulatedAudioEngine(() => duration);
  const events: StudioAudioEvent[] = [];
  engine.subscribe((event) => events.push(event));
  return { engine, events };
}

describe("createSimulatedAudioEngine", () => {
  it("runs a clock while playing and ends on time", async () => {
    const { engine, events } = setup(1);
    engine.load("", 0, 0);
    await engine.play();
    vi.advanceTimersByTime(1250);
    expect(events.some((event) => event.type === "ended")).toBe(true);
  });

  it("swaps to the preloaded track from zero and keeps playing", async () => {
    const { engine, events } = setup(10);
    engine.load("", 5, 0);
    await engine.play();
    engine.preload("", 0);
    expect(engine.hasPreload()).toBe(true);
    engine.handover("gapless");
    expect(engine.hasPreload()).toBe(false);
    expect(events.at(-1)).toEqual({ type: "time", seconds: 0 });
    vi.advanceTimersByTime(500);
    expect(events.at(-1)).toEqual({ type: "time", seconds: 0.5 });
  });

  it("moves the clock at the playback rate it is given", async () => {
    const { engine, events } = setup(100);
    engine.setPlaybackRate?.(2);
    engine.load("", 0, 0);
    await engine.play();
    vi.advanceTimersByTime(500);
    expect(events.at(-1)).toEqual({ type: "time", seconds: 1 });
    engine.setPlaybackRate?.(1);
    vi.advanceTimersByTime(500);
    expect(events.at(-1)).toEqual({ type: "time", seconds: 1.5 });
  });

  it("finishes a fade on time and reports a cancelled one", async () => {
    const { engine } = setup(100);
    const finished = engine.fadeOut(10);
    vi.advanceTimersByTime(10_000);
    await expect(finished).resolves.toBe(true);
    const cancelled = engine.fadeOut(10);
    engine.cancelFadeOut();
    await expect(cancelled).resolves.toBe(false);
  });

  it("works every control in demo and never enters plain mode", () => {
    const { engine } = setup();
    engine.unlock();
    engine.setVolume(0.3);
    engine.setMuted(true);
    engine.setLoudnessEven(false);
    expect(engine.enterPlainMode()).toBe(false);
    expect(engine.isPlainMode()).toBe(false);
    expect(engine.remote).toBeNull();
  });
});
