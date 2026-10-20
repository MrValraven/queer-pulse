import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createFakeAudioEngine } from "../../../test/studioFakeAudioEngine";
import { studioKeys } from "../api/studioQueryKeys";
import type { StudioAudioEngine, StudioDeckRefs } from "./studioAudioEngine";
import type {
  StudioPlaybackStatus,
  StudioQueueItem,
} from "./studioPlayerContext";
import {
  EMPTY_QUEUE_STATE,
  peekNext,
  studioQueueReducer,
  type StudioQueueState,
} from "./studioQueueReducer";
import { useStudioDecks } from "./useStudioDecks";

/** Track id to the track it follows without a gap ("Play without gaps"). */
const gaplessAfterByTrackId = new Map<string, string>();
const fetchStudioStream = vi.fn((_demoMode: boolean, trackId: string) =>
  Promise.resolve({
    url: `https://stream.example/${trackId}`,
    expiresAt: new Date(Date.now() + 900_000).toISOString(),
    waveformPeaks: [0, 255],
    loudnessLufs: -20,
    peakDb: -10,
    gaplessAfterTrackId: gaplessAfterByTrackId.get(trackId) ?? null,
  }),
);
vi.mock("../api/studioStream", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/studioStream")>()),
  fetchStudioStream: (demoMode: boolean, trackId: string) =>
    fetchStudioStream(demoMode, trackId),
}));

const item = (trackId: string, releaseId: string): StudioQueueItem => ({
  trackId,
  title: trackId,
  durationSeconds: 200,
  trackHref: `/studio/track?id=${trackId}`,
  releaseId,
  releaseTitle: releaseId,
  coverUrl: null,
  tint: "coral",
  artistId: "p1",
  artistName: "Artist",
  artistHref: "/studio/artist?id=p1",
  queueEntryId: `entry-${trackId}`,
  isExplicit: false,
});

function queueOf(items: StudioQueueItem[]): StudioQueueState {
  return studioQueueReducer(EMPTY_QUEUE_STATE, {
    type: "playSource",
    source: null,
    items,
    startIndex: 0,
    shuffleSeed: 1,
  });
}

type StudioStreamReply = Awaited<ReturnType<typeof fetchStudioStream>>;

function setup(
  items = [item("ta", "r1"), item("tb", "r2")],
  settings = { autoplayNext: true, hideExplicit: false },
) {
  const engine = createFakeAudioEngine();
  const engineFactory = () => engine;
  const engineRef = { current: null as StudioAudioEngine | null };
  const deckRefs: StudioDeckRefs = [{ current: null }, { current: null }];
  const live = {
    queue: queueOf(items),
    status: "playing" as StudioPlaybackStatus,
    duration: 200 as number | null,
    crossfadeSeconds: 0,
    settings,
    isCrossfadeHeld: false,
  };
  const onCrossfadeStart = vi.fn();
  const onEvent = vi.fn();
  const queryClient = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const hook = renderHook(
    ({ nextEntryId }: { nextEntryId: string | null }) =>
      useStudioDecks({
        engineRef,
        engineFactory,
        deckRefs,
        demoMode: false,
        nextEntryId,
        durationFor: () => live.duration,
        readQueue: () => live.queue,
        readStatus: () => live.status,
        readCrossfadeSeconds: () => live.crossfadeSeconds,
        readPlaybackSettings: () => live.settings,
        shouldHoldCrossfade: () => live.isCrossfadeHeld,
        onEvent,
        onEngineReady: vi.fn(),
        onEngineGone: vi.fn(),
        onCrossfadeStart,
      }),
    {
      wrapper,
      initialProps: {
        nextEntryId:
          peekNext(live.queue, false, live.settings.hideExplicit)
            ?.queueEntryId ?? null,
      },
    },
  );
  // Emits a time event and lets a preload's stream read settle.
  const time = async (seconds: number) => {
    await act(async () => {
      engine.emit({ type: "time", seconds });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  };
  return { engine, hook, live, time, onCrossfadeStart, onEvent, queryClient };
}

afterEach(() => {
  fetchStudioStream.mockClear();
  gaplessAfterByTrackId.clear();
  vi.restoreAllMocks();
});

describe("useStudioDecks: preload timing", () => {
  it("preloads the next item once the time passes max(duration - 20, half)", async () => {
    const { engine, time, queryClient } = setup();
    await time(179);
    expect(fetchStudioStream).not.toHaveBeenCalled();
    await time(180);
    await time(185);
    expect(fetchStudioStream).toHaveBeenCalledTimes(1);
    expect(fetchStudioStream).toHaveBeenCalledWith(false, "tb");
    // -20 LUFS with a -10 dB peak: the full +6 dB boost toward -14 LUFS.
    expect(engine.preload).toHaveBeenCalledWith("https://stream.example/tb", 6);
    expect(
      queryClient.getQueryData(studioKeys.streamAnalysis(false, "tb")),
    ).toEqual({
      waveformPeaks: [0, 255],
      loudnessLufs: -20,
      peakDb: -10,
    });
  });

  it("preloads a short track from its middle", async () => {
    const { live, time } = setup();
    live.duration = 30;
    await time(14);
    expect(fetchStudioStream).not.toHaveBeenCalled();
    await time(15);
    expect(fetchStudioStream).toHaveBeenCalledTimes(1);
  });

  it("holds the preload for repeat one, while paused and while casting", async () => {
    const { live, time, engine } = setup();
    live.queue = { ...live.queue, repeat: "one" };
    await time(190);
    live.queue = { ...live.queue, repeat: "off" };
    live.status = "paused";
    await time(190);
    live.status = "playing";
    act(() => {
      engine.emit({
        type: "remote",
        state: { isAvailable: true, isConnected: true },
      });
    });
    await time(190);
    expect(fetchStudioStream).not.toHaveBeenCalled();
  });

  it("holds the preload while autoplay next is off", async () => {
    const { live, time } = setup();
    live.settings = { autoplayNext: false, hideExplicit: false };
    await time(190);
    expect(fetchStudioStream).not.toHaveBeenCalled();
  });

  it("preloads past a hidden explicit track", async () => {
    const { time } = setup(
      [
        item("ta", "r1"),
        { ...item("tx", "r1"), isExplicit: true },
        item("tc", "r2"),
      ],
      { autoplayNext: true, hideExplicit: true },
    );
    await time(181);
    expect(fetchStudioStream).toHaveBeenCalledWith(false, "tc");
  });

  it("lets go of a loaded preload when autoplay next turns off", async () => {
    const { hook, live, time, engine } = setup();
    await time(181);
    live.settings = { autoplayNext: false, hideExplicit: false };
    await time(182);
    expect(engine.cancelPreload).toHaveBeenCalled();
    expect(hook.result.current.takePreload("entry-tb")).toBeNull();
  });

  it("skips the preload when the next entry changes while its stream loads", async () => {
    const { live, time, engine } = setup();
    let settleStream: (reply: StudioStreamReply) => void = () => {};
    fetchStudioStream.mockImplementationOnce(
      () =>
        new Promise<StudioStreamReply>((resolve) => {
          settleStream = resolve;
        }),
    );
    await time(181);
    expect(fetchStudioStream).toHaveBeenCalledWith(false, "tb");
    live.queue = queueOf([item("ta", "r1"), item("tc", "r2")]);
    await act(async () => {
      settleStream({
        url: "https://stream.example/tb",
        expiresAt: new Date(Date.now() + 900_000).toISOString(),
        waveformPeaks: [0, 255],
        loudnessLufs: -20,
        peakDb: -10,
        gaplessAfterTrackId: null,
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(engine.preload).not.toHaveBeenCalled();
  });

  it("tries a failed preload once per entry", async () => {
    const { time } = setup();
    fetchStudioStream.mockImplementationOnce(() =>
      Promise.reject(new Error("gone")),
    );
    await time(181);
    await time(182);
    expect(fetchStudioStream).toHaveBeenCalledTimes(1);
  });

  it("forwards engine events", async () => {
    const { time, onEvent } = setup();
    await time(3);
    expect(onEvent).toHaveBeenCalledWith({ type: "time", seconds: 3 });
  });
});

describe("useStudioDecks: using and dropping a preload", () => {
  it("hands over a fresh preload for the right entry", async () => {
    const { hook, time } = setup();
    await time(181);
    expect(hook.result.current.takePreload("entry-tb")).toMatchObject({
      queueEntryId: "entry-tb",
      gainDb: 6,
    });
  });

  it("cancels the preload when the next item changes", async () => {
    const { hook, time, engine } = setup();
    await time(181);
    hook.rerender({ nextEntryId: "entry-other" });
    expect(engine.cancelPreload).toHaveBeenCalled();
    expect(hook.result.current.takePreload("entry-tb")).toBeNull();
  });

  it("drops a preload whose URL is about to expire", async () => {
    const { hook, time, engine } = setup();
    const startedAt = Date.now();
    await time(181);
    vi.spyOn(Date, "now").mockReturnValue(startedAt + 900_000 - 20_000);
    expect(hook.result.current.takePreload("entry-tb")).toBeNull();
    expect(engine.cancelPreload).toHaveBeenCalled();
  });
});

describe("useStudioDecks: crossfade", () => {
  it("starts once, its length before the end, across releases", async () => {
    const { live, time, onCrossfadeStart } = setup();
    live.crossfadeSeconds = 6;
    await time(181);
    await time(193);
    expect(onCrossfadeStart).not.toHaveBeenCalled();
    await time(194);
    await time(195);
    expect(onCrossfadeStart).toHaveBeenCalledTimes(1);
    const [next, preload, seconds] = onCrossfadeStart.mock.calls[0] as [
      StudioQueueItem,
      { queueEntryId: string },
      number,
    ];
    expect(next.queueEntryId).toBe("entry-tb");
    expect(preload.queueEntryId).toBe("entry-tb");
    expect(seconds).toBe(6);
  });

  it("crossfades between consecutive tracks of one release", async () => {
    const { live, time, onCrossfadeStart } = setup([
      item("ta", "r1"),
      item("tb", "r1"),
    ]);
    live.crossfadeSeconds = 6;
    await time(181);
    await time(195);
    expect(onCrossfadeStart).toHaveBeenCalledTimes(1);
  });

  it("swaps gaplessly into a track that follows the current one without a gap", async () => {
    gaplessAfterByTrackId.set("tb", "ta");
    const { hook, live, time, onCrossfadeStart } = setup([
      item("ta", "r1"),
      item("tb", "r1"),
    ]);
    live.crossfadeSeconds = 6;
    await time(181);
    await time(195);
    expect(onCrossfadeStart).not.toHaveBeenCalled();
    // The preload stays for the gapless swap at the end.
    expect(hook.result.current.takePreload("entry-tb")).toMatchObject({
      queueEntryId: "entry-tb",
      gaplessAfterTrackId: "ta",
    });
  });

  it("holds the crossfade while the sleep timer owns the fade", async () => {
    const { hook, live, time, onCrossfadeStart } = setup();
    live.crossfadeSeconds = 6;
    live.isCrossfadeHeld = true;
    await time(181);
    await time(195);
    expect(onCrossfadeStart).not.toHaveBeenCalled();
    // The preload stays for the gapless swap at the end.
    expect(hook.result.current.takePreload("entry-tb")).toMatchObject({
      queueEntryId: "entry-tb",
    });
  });

  it("keeps a crossfade setting above 12 seconds at 12", async () => {
    const { live, time, onCrossfadeStart } = setup();
    live.crossfadeSeconds = 30;
    await time(181);
    await time(187);
    expect(onCrossfadeStart).not.toHaveBeenCalled();
    await time(188);
    expect(onCrossfadeStart).toHaveBeenCalledTimes(1);
    expect(onCrossfadeStart.mock.calls[0]?.[2]).toBe(12);
  });

  it("skips the crossfade after a seek into its window", async () => {
    const { hook, live, time, onCrossfadeStart } = setup();
    live.crossfadeSeconds = 6;
    await time(181);
    act(() => hook.result.current.noteSeek(196));
    await time(197);
    expect(onCrossfadeStart).not.toHaveBeenCalled();
  });
});
