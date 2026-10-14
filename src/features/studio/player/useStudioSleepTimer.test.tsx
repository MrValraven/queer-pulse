import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeAudioEngine } from "../../../test/studioFakeAudioEngine";
import type { StudioPlaybackStatus } from "./studioPlayerContext";
import { useStudioSleepTimer } from "./useStudioSleepTimer";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function setup(status: StudioPlaybackStatus = "playing") {
  const engine = createFakeAudioEngine();
  const live = { status };
  const pausePlayback = vi.fn();
  const hook = renderHook(() =>
    useStudioSleepTimer({
      engineRef: { current: engine },
      readStatus: () => live.status,
      pausePlayback,
    }),
  );
  return { engine, hook, live, pausePlayback };
}

describe("useStudioSleepTimer: minutes", () => {
  it("fades over the last ten seconds, then pauses and clears", async () => {
    const { engine, hook, pausePlayback } = setup();
    act(() =>
      hook.result.current.startSleepTimer({ kind: "minutes", minutes: 15 }),
    );
    expect(hook.result.current.sleepTimer).toMatchObject({ kind: "minutes" });
    act(() => {
      vi.advanceTimersByTime(15 * 60_000 - 10_001);
    });
    expect(engine.fadeOut).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(1);
      await Promise.resolve();
    });
    expect(engine.fadeOut).toHaveBeenCalledWith(10);
    expect(pausePlayback).toHaveBeenCalled();
    expect(hook.result.current.sleepTimer).toBeNull();
  });

  it("just clears when the player is already paused", () => {
    const { engine, hook, pausePlayback } = setup("paused");
    act(() =>
      hook.result.current.startSleepTimer({ kind: "minutes", minutes: 30 }),
    );
    act(() => {
      vi.advanceTimersByTime(30 * 60_000);
    });
    expect(engine.fadeOut).not.toHaveBeenCalled();
    expect(pausePlayback).not.toHaveBeenCalled();
    expect(hook.result.current.sleepTimer).toBeNull();
  });

  it("cancels during the fade, brings the level back and keeps playing", async () => {
    const { engine, hook, pausePlayback } = setup();
    let finishFade: (isComplete: boolean) => void = () => {};
    engine.fadeOut.mockImplementationOnce(
      () =>
        new Promise<boolean>((resolve) => {
          finishFade = resolve;
        }),
    );
    act(() =>
      hook.result.current.startSleepTimer({ kind: "minutes", minutes: 15 }),
    );
    act(() => {
      vi.advanceTimersByTime(15 * 60_000 - 10_000);
    });
    act(() => hook.result.current.cancelSleepTimer());
    expect(engine.cancelFadeOut).toHaveBeenCalled();
    await act(async () => {
      finishFade(true);
      await Promise.resolve();
    });
    expect(pausePlayback).not.toHaveBeenCalled();
    expect(hook.result.current.sleepTimer).toBeNull();
  });
});

describe("useStudioSleepTimer: end of track", () => {
  it("fades in the last ten seconds and stops at the end once", () => {
    const { engine, hook } = setup();
    act(() => hook.result.current.startSleepTimer({ kind: "endOfTrack" }));
    hook.result.current.onTime(240, 258);
    expect(engine.fadeOut).not.toHaveBeenCalled();
    hook.result.current.onTime(250, 258);
    expect(engine.fadeOut).toHaveBeenCalledWith(8);
    let isStopping = false;
    act(() => {
      isStopping = hook.result.current.consumeTrackEnd();
    });
    expect(isStopping).toBe(true);
    expect(hook.result.current.sleepTimer).toBeNull();
    expect(hook.result.current.consumeTrackEnd()).toBe(false);
  });

  it("undoes the fade after a seek back out of the last ten seconds", () => {
    const { engine, hook } = setup();
    act(() => hook.result.current.startSleepTimer({ kind: "endOfTrack" }));
    hook.result.current.onTime(252, 258);
    hook.result.current.onTime(100, 258);
    expect(engine.cancelFadeOut).toHaveBeenCalled();
  });
});

describe("useStudioSleepTimer: late and interrupted fades", () => {
  it("pauses at once when the timer fires after the end time", async () => {
    const { engine, hook, pausePlayback } = setup();
    act(() =>
      hook.result.current.startSleepTimer({ kind: "minutes", minutes: 15 }),
    );
    vi.setSystemTime(Date.now() + 20 * 60_000);
    await act(async () => {
      vi.advanceTimersByTime(15 * 60_000);
      await Promise.resolve();
    });
    expect(engine.fadeOut).not.toHaveBeenCalled();
    expect(pausePlayback).toHaveBeenCalled();
    expect(hook.result.current.sleepTimer).toBeNull();
  });

  it("clears the timer when the engine ends the fade itself", async () => {
    const { engine, hook, pausePlayback } = setup();
    engine.fadeOut.mockImplementationOnce(() => Promise.resolve(false));
    act(() =>
      hook.result.current.startSleepTimer({ kind: "minutes", minutes: 15 }),
    );
    await act(async () => {
      vi.advanceTimersByTime(15 * 60_000 - 10_000);
      await Promise.resolve();
    });
    expect(pausePlayback).not.toHaveBeenCalled();
    expect(hook.result.current.sleepTimer).toBeNull();
  });

  it("fades the next short track after an interrupted end-of-track fade", async () => {
    const { engine, hook } = setup();
    engine.fadeOut.mockImplementationOnce(() => Promise.resolve(false));
    act(() => hook.result.current.startSleepTimer({ kind: "endOfTrack" }));
    await act(async () => {
      hook.result.current.onTime(250, 258);
      await Promise.resolve();
    });
    hook.result.current.onTime(5, 12);
    expect(engine.fadeOut).toHaveBeenCalledTimes(2);
    expect(engine.fadeOut).toHaveBeenLastCalledWith(7);
  });
});
