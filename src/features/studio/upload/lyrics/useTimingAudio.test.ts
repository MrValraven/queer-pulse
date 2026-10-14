import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTimingAudio } from "./useTimingAudio";

const demo = vi.hoisted(() => ({ demoMode: true }));
vi.mock("../../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: demo.demoMode }),
}));
vi.mock("../../player/studioPlayerContext", () => ({
  useStudioPlayer: () => ({ status: "idle", togglePlay: vi.fn() }),
}));
const stream = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock("../../api/studioStream", () => ({
  fetchStudioStream: (...args: unknown[]): Promise<unknown> =>
    stream.fetch(...args) as Promise<unknown>,
}));

class FakeAudio extends EventTarget {
  static instances: FakeAudio[] = [];
  preload = "";
  currentTime = 0;
  pause = vi.fn();
  load = vi.fn();
  removeAttribute = vi.fn();
  play = vi.fn(() => Promise.resolve());
  url: string;
  constructor(url: string) {
    super();
    this.url = url;
    FakeAudio.instances.push(this);
  }
}

async function renderSilentClock(durationSeconds: number) {
  const view = renderHook(() =>
    useTimingAudio({ kind: "track", trackId: "t1", durationSeconds }),
  );
  await act(async () => {
    await Promise.resolve();
  });
  return view;
}

beforeEach(() => {
  vi.useFakeTimers();
  FakeAudio.instances = [];
  demo.demoMode = true;
  stream.fetch.mockReset();
  stream.fetch.mockResolvedValue({ url: "" });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useTimingAudio", () => {
  it("runs a silent clock in demo", async () => {
    const { result } = await renderSilentClock(200);
    expect(result.current.isSilentClock).toBe(true);
    expect(result.current.isReady).toBe(true);
    act(() => result.current.play());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.currentTimeNow()).toBeCloseTo(1, 1);
  });

  it("stops the silent clock at the duration", async () => {
    const { result } = await renderSilentClock(2);
    act(() => result.current.play());
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTime).toBe(2);
    expect(result.current.currentTimeNow()).toBe(2);
  });

  it("restarts the silent clock from zero after it ran to the end", async () => {
    const { result } = await renderSilentClock(2);
    act(() => result.current.play());
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.isPlaying).toBe(false);
    act(() => result.current.play());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.currentTimeNow()).toBeCloseTo(1, 1);
  });

  it("starts the silent clock from zero on a new source", async () => {
    const { result, rerender } = await renderSilentClock(200);
    act(() => result.current.play());
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.currentTimeNow()).toBeGreaterThan(0.5);
    demo.demoMode = false;
    await act(async () => {
      rerender();
      await Promise.resolve();
    });
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.currentTime).toBe(0);
    expect(result.current.currentTimeNow()).toBe(0);
  });

  it("revokes the object URL on unmount", () => {
    const revoke = vi.fn();
    vi.stubGlobal("URL", {
      createObjectURL: () => "blob:timing",
      revokeObjectURL: revoke,
    });
    vi.stubGlobal("Audio", FakeAudio);
    const file = new File(["x"], "song.mp3", { type: "audio/mpeg" });
    const { unmount } = renderHook(() =>
      useTimingAudio({ kind: "file", file }),
    );
    unmount();
    expect(revoke).toHaveBeenCalledWith("blob:timing");
  });
});

async function startOnRealAudio() {
  stream.fetch.mockResolvedValueOnce({ url: "https://cdn/one" });
  stream.fetch.mockResolvedValueOnce({ url: "https://cdn/two" });
  vi.stubGlobal("Audio", FakeAudio);
  const view = renderHook(() =>
    useTimingAudio({ kind: "track", trackId: "t1", durationSeconds: 200 }),
  );
  await act(async () => {
    await Promise.resolve();
  });
  const first = FakeAudio.instances[0] as FakeAudio;
  act(() => {
    first.dispatchEvent(new Event("canplay"));
  });
  await act(async () => {
    act(() => view.result.current.play());
    await Promise.resolve();
  });
  return { view, first };
}

async function failFirst(first: FakeAudio) {
  first.currentTime = 12;
  await act(async () => {
    first.dispatchEvent(new Event("error"));
    await Promise.resolve();
  });
}

/** Holds the retry's stream read open until the test resolves it. */
function holdRetryFetch() {
  let resolveRetry: (streamResult: { url: string }) => void = () => {};
  stream.fetch.mockReset();
  stream.fetch.mockReturnValueOnce(
    new Promise<{ url: string }>((resolve) => {
      resolveRetry = resolve;
    }),
  );
  return async (url: string) => {
    await act(async () => {
      resolveRetry({ url });
      await Promise.resolve();
    });
  };
}

async function fireCanPlay(audio: FakeAudio) {
  await act(async () => {
    audio.dispatchEvent(new Event("canplay"));
    await Promise.resolve();
  });
}

describe("useTimingAudio on an expired stream URL", () => {
  it("refetches once, waits for the new element, then resumes", async () => {
    const { view, first } = await startOnRealAudio();
    expect(view.result.current.isPlaying).toBe(true);
    await failFirst(first);
    expect(stream.fetch).toHaveBeenCalledTimes(2);
    expect(view.result.current.isReady).toBe(false);
    const second = FakeAudio.instances[1] as FakeAudio;
    expect(second.url).toBe("https://cdn/two");
    second.dispatchEvent(new Event("loadedmetadata"));
    expect(second.currentTime).toBe(12);
    await fireCanPlay(second);
    expect(view.result.current.isReady).toBe(true);
    expect(view.result.current.hasError).toBe(false);
    expect(second.play).toHaveBeenCalledTimes(1);
    expect(view.result.current.isPlaying).toBe(true);
  });

  it("keeps the play intent when the first play is still pending at error time", async () => {
    stream.fetch.mockResolvedValueOnce({ url: "https://cdn/one" });
    stream.fetch.mockResolvedValueOnce({ url: "https://cdn/two" });
    vi.stubGlobal("Audio", FakeAudio);
    const view = renderHook(() =>
      useTimingAudio({ kind: "track", trackId: "t1", durationSeconds: 200 }),
    );
    await act(async () => {
      await Promise.resolve();
    });
    const first = FakeAudio.instances[0] as FakeAudio;
    let rejectFirstPlay: (reason: unknown) => void = () => {};
    first.play.mockReturnValue(
      new Promise<void>((_resolve, reject) => {
        rejectFirstPlay = reject;
      }),
    );
    act(() => {
      first.dispatchEvent(new Event("canplay"));
    });
    act(() => view.result.current.play());
    await failFirst(first);
    await act(async () => {
      rejectFirstPlay(new DOMException("dead", "NotSupportedError"));
      await Promise.resolve();
    });
    expect(view.result.current.hasError).toBe(false);
    const second = FakeAudio.instances[1] as FakeAudio;
    await fireCanPlay(second);
    expect(second.play).toHaveBeenCalledTimes(1);
    expect(view.result.current.isPlaying).toBe(true);
  });

  it("reports an error on a second failure without a third fetch", async () => {
    const { view, first } = await startOnRealAudio();
    await failFirst(first);
    const second = FakeAudio.instances[1] as FakeAudio;
    await act(async () => {
      second.dispatchEvent(new Event("error"));
      await Promise.resolve();
    });
    expect(view.result.current.hasError).toBe(true);
    expect(view.result.current.isPlaying).toBe(false);
    expect(stream.fetch).toHaveBeenCalledTimes(2);
  });

  it("ignores play during the gap and clears nothing falsely", async () => {
    const { view, first } = await startOnRealAudio();
    await failFirst(first);
    first.play.mockClear();
    first.play.mockRejectedValue(new Error("dead element"));
    await act(async () => {
      view.result.current.play();
      await Promise.resolve();
    });
    expect(first.play).not.toHaveBeenCalled();
    expect(view.result.current.hasError).toBe(false);
    await fireCanPlay(FakeAudio.instances[1] as FakeAudio);
    expect(view.result.current.hasError).toBe(false);
  });

  it("plays a new source that replaces the element mid-retry before its canplay", async () => {
    const { view, first } = await startOnRealAudio();
    await failFirst(first);
    stream.fetch.mockResolvedValueOnce({ url: "https://cdn/three" });
    demo.demoMode = false;
    await act(async () => {
      view.rerender();
      await Promise.resolve();
    });
    const third = FakeAudio.instances[2] as FakeAudio;
    expect(third.url).toBe("https://cdn/three");
    await act(async () => {
      view.result.current.play();
      await Promise.resolve();
    });
    expect(third.play).toHaveBeenCalledTimes(1);
    expect(view.result.current.isPlaying).toBe(true);
  });

  it("ignores a second error from the old element while the stream is read again", async () => {
    const { view, first } = await startOnRealAudio();
    const resolveRetry = holdRetryFetch();
    await failFirst(first);
    expect(FakeAudio.instances).toHaveLength(1);
    expect(view.result.current.hasError).toBe(false);
    await act(async () => {
      first.dispatchEvent(new Event("error"));
      await Promise.resolve();
    });
    expect(view.result.current.hasError).toBe(false);
    await resolveRetry("https://cdn/two");
    expect(view.result.current.hasError).toBe(false);
    await fireCanPlay(FakeAudio.instances[1] as FakeAudio);
    expect(view.result.current.hasError).toBe(false);
    expect(view.result.current.isReady).toBe(true);
  });

  it("holds the clock at the failure time until the new element has its metadata", async () => {
    const { view, first } = await startOnRealAudio();
    await failFirst(first);
    const second = FakeAudio.instances[1] as FakeAudio;
    expect(second.currentTime).toBe(0);
    expect(view.result.current.currentTimeNow()).toBe(12);
  });

  it("stays paused when paused during the gap", async () => {
    const { view, first } = await startOnRealAudio();
    await failFirst(first);
    const second = FakeAudio.instances[1] as FakeAudio;
    await act(async () => {
      view.result.current.pause();
      second.dispatchEvent(new Event("canplay"));
      await Promise.resolve();
    });
    expect(second.play).not.toHaveBeenCalled();
    expect(view.result.current.isPlaying).toBe(false);
    expect(view.result.current.isReady).toBe(true);
  });

  it("moves the new element to a seek made during the gap", async () => {
    const { view, first } = await startOnRealAudio();
    const resolveRetry = holdRetryFetch();
    await failFirst(first);
    act(() => view.result.current.seek(30));
    expect(view.result.current.currentTimeNow()).toBe(30);
    await resolveRetry("https://cdn/two");
    const second = FakeAudio.instances[1] as FakeAudio;
    second.dispatchEvent(new Event("loadedmetadata"));
    expect(second.currentTime).toBe(30);
  });
});
