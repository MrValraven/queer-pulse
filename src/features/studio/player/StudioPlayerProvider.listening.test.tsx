import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { toReleaseView } from "../api/studio.adapters";
import type { StudioReleaseDTO, StudioTrackDTO } from "../api/studio.types";
import type { FakeAudioEngine } from "../../../test/studioFakeAudioEngine";
import {
  playOrder,
  releaseFixture,
  renderPlayer,
  trackDetailFixture,
} from "../../../test/studioPlayerHarness";
import type { StudioQueueSource } from "./studioPlayerContext";
import { queueFromRelease, toQueueItems } from "./studioQueue";
import { EMPTY_QUEUE_STATE, studioQueueReducer } from "./studioQueueReducer";
import {
  readQueueSnapshot,
  studioQueueStorageKey,
  writeQueueSnapshot,
} from "./studioQueueStorage";

let loggedIn = true;
let access = {
  status: "granted",
  hasAccess: true,
  isPending: false,
  uploadablePersonas: [],
};
let streamVersion = 0;
let streamAnalysis = {
  waveformPeaks: null as number[] | null,
  loudnessLufs: null as number | null,
  peakDb: null as number | null,
};
/** Track id to the track it follows without a gap ("Play without gaps"). */
const gaplessAfterByTrackId = new Map<string, string>();
const fetchStudioStream = vi.fn(
  async (_demoMode: boolean, trackId: string, _previewToken?: string) => {
    streamVersion += 1;
    return {
      url: `https://stream.example/${trackId}?v=${streamVersion}`,
      expiresAt: new Date(Date.now() + 900_000).toISOString(),
      ...streamAnalysis,
      gaplessAfterTrackId: gaplessAfterByTrackId.get(trackId) ?? null,
    };
  },
);

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({
    loggedIn,
    checking: false,
    user: loggedIn ? { id: "user-1" } : null,
  }),
}));
vi.mock("../api/useStudioAccess", () => ({ useStudioAccess: () => access }));
// Open pages' server player settings (contract F.2), as plain test state.
let playbackSettings = {
  autoplayNext: true,
  hideExplicit: false,
  crossfadeSeconds: 0,
};
const savePreferences = vi.fn((patch: Partial<typeof playbackSettings>) => {
  playbackSettings = { ...playbackSettings, ...patch };
});
vi.mock("../api/useStudioPlaybackPreferences", () => ({
  useStudioPlaybackSettings: () => playbackSettings,
  useStudioPlaybackPreferences: () => ({
    preferences: playbackSettings,
    isLoading: false,
    savePreferences,
  }),
}));
vi.mock("../api/studioStream", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/studioStream")>()),
  fetchStudioStream: (
    demoMode: boolean,
    trackId: string,
    previewToken?: string,
  ) => fetchStudioStream(demoMode, trackId, previewToken),
}));
// Releases and tracks the cache does not hold are gone unless a test says otherwise.
const getStudioRelease = vi.fn((releaseId: string) =>
  Promise.reject<StudioReleaseDTO>(
    new ApiError(404, `No release ${releaseId}`, { statusCode: 404 }),
  ),
);
const getStudioTrack = vi.fn((trackId: string) =>
  Promise.reject<StudioTrackDTO>(
    new ApiError(404, `No track ${trackId}`, { statusCode: 404 }),
  ),
);
vi.mock("../api/studio.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/studio.api")>()),
  getStudioRelease: (releaseId: string) => getStudioRelease(releaseId),
  getStudioTrack: (trackId: string) => getStudioTrack(trackId),
}));

beforeEach(() => {
  loggedIn = true;
  access = {
    status: "granted",
    hasAccess: true,
    isPending: false,
    uploadablePersonas: [],
  };
  streamVersion = 0;
  streamAnalysis = { waveformPeaks: null, loudnessLufs: null, peakDb: null };
  gaplessAfterByTrackId.clear();
  playbackSettings = {
    autoplayNext: true,
    hideExplicit: false,
    crossfadeSeconds: 0,
  };
  savePreferences.mockClear();
  fetchStudioStream.mockClear();
  getStudioRelease.mockClear();
  getStudioTrack.mockClear();
  getStudioTrack.mockImplementation((trackId: string) =>
    Promise.reject<StudioTrackDTO>(
      new ApiError(404, `No track ${trackId}`, { statusCode: 404 }),
    ),
  );
});

const albumOne = releaseFixture("r1", ["t1", "t2"]);
const albumTwo = releaseFixture("r2", ["u1", "u2"]);
const tracksOf = (dto: StudioReleaseDTO) =>
  queueFromRelease(toReleaseView(dto));
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

async function startPlaying(
  engine: FakeAudioEngine,
  start: () => Promise<void>,
) {
  await act(start);
  act(() => engine.emit({ type: "playing" }));
}

describe("gapless and crossfade", () => {
  it("swaps to the preloaded next track on ended", async () => {
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    act(() => engine.emit({ type: "time", seconds: 181 }));
    await settle();
    expect(engine.preload).toHaveBeenCalledWith(
      "https://stream.example/t2?v=2",
      0,
    );
    act(() => engine.emit({ type: "ended" }));
    expect(engine.handover).toHaveBeenCalledWith("gapless");
    expect(hook.result.current.player.currentItem?.trackId).toBe("t2");
    expect(fetchStudioStream).toHaveBeenCalledTimes(2);
  });

  it("swaps to the preloaded track when the element reports a pause before its end", async () => {
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    act(() => engine.emit({ type: "time", seconds: 181 }));
    await settle();
    act(() => {
      engine.emit({ type: "paused" });
      engine.emit({ type: "ended" });
    });
    expect(engine.handover).toHaveBeenCalledWith("gapless");
    expect(hook.result.current.player.currentItem?.trackId).toBe("t2");
    expect(fetchStudioStream).toHaveBeenCalledTimes(2);
  });

  it("loads the next track afresh when its preloaded URL is about to expire", async () => {
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    act(() => engine.emit({ type: "time", seconds: 181 }));
    await settle();
    const later = Date.now() + 890_000;
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(later);
    try {
      await act(async () => engine.emit({ type: "ended" }));
      expect(engine.handover).not.toHaveBeenCalled();
      expect(engine.cancelPreload).toHaveBeenCalled();
      expect(fetchStudioStream).toHaveBeenCalledTimes(3);
      expect(engine.load).toHaveBeenLastCalledWith(
        "https://stream.example/t2?v=3",
        0,
        0,
      );
    } finally {
      nowSpy.mockRestore();
    }
  });

  it("crossfades between releases at the crossfade length before the end", async () => {
    const { engine, hook } = renderPlayer([albumOne, albumTwo]);
    act(() => hook.result.current.player.setCrossfadeSeconds(6));
    expect(hook.result.current.player.preferences.crossfadeSeconds).toBe(6);
    const tracks = [...tracksOf(albumOne).slice(0, 1), ...tracksOf(albumTwo)];
    await startPlaying(engine, () =>
      hook.result.current.player.playTracks(tracks),
    );
    act(() => engine.emit({ type: "time", seconds: 181 }));
    await settle();
    act(() => engine.emit({ type: "time", seconds: 194 }));
    expect(engine.handover).toHaveBeenCalledWith({ crossfadeSeconds: 6 });
    expect(hook.result.current.player.currentItem?.trackId).toBe("u1");
  });

  it("crossfades between consecutive tracks of one release", async () => {
    const { engine, hook } = renderPlayer([albumOne]);
    act(() => hook.result.current.player.setCrossfadeSeconds(6));
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    act(() => engine.emit({ type: "time", seconds: 181 }));
    await settle();
    act(() => engine.emit({ type: "time", seconds: 194 }));
    expect(engine.handover).toHaveBeenCalledWith({ crossfadeSeconds: 6 });
    expect(hook.result.current.player.currentItem?.trackId).toBe("t2");
  });

  it("swaps gaplessly between tracks of a release marked to play without gaps", async () => {
    gaplessAfterByTrackId.set("t2", "t1");
    const { engine, hook } = renderPlayer([albumOne]);
    act(() => hook.result.current.player.setCrossfadeSeconds(6));
    expect(hook.result.current.player.preferences.crossfadeSeconds).toBe(6);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    act(() => engine.emit({ type: "time", seconds: 181 }));
    await settle();
    act(() => engine.emit({ type: "time", seconds: 196 }));
    expect(engine.handover).not.toHaveBeenCalled();
    act(() => engine.emit({ type: "ended" }));
    expect(engine.handover).toHaveBeenCalledWith("gapless");
  });

  it("keeps the swap gapless while the sleep timer waits for the end of the track", async () => {
    const { engine, hook } = renderPlayer([albumOne, albumTwo]);
    act(() => hook.result.current.player.setCrossfadeSeconds(6));
    const tracks = [...tracksOf(albumOne).slice(0, 1), ...tracksOf(albumTwo)];
    await startPlaying(engine, () =>
      hook.result.current.player.playTracks(tracks),
    );
    act(() =>
      hook.result.current.player.startSleepTimer({ kind: "endOfTrack" }),
    );
    act(() => engine.emit({ type: "time", seconds: 181 }));
    await settle();
    act(() => engine.emit({ type: "time", seconds: 194 }));
    expect(engine.handover).not.toHaveBeenCalled();
    expect(hook.result.current.player.currentItem?.trackId).toBe("t1");
  });

  it("removing the current entry during a crossfade loads the next one", async () => {
    const { engine, hook } = renderPlayer([albumOne, albumTwo]);
    act(() => hook.result.current.player.setCrossfadeSeconds(6));
    expect(hook.result.current.player.preferences.crossfadeSeconds).toBe(6);
    const tracks = [...tracksOf(albumOne).slice(0, 1), ...tracksOf(albumTwo)];
    await startPlaying(engine, () =>
      hook.result.current.player.playTracks(tracks),
    );
    act(() => engine.emit({ type: "time", seconds: 181 }));
    await settle();
    act(() => engine.emit({ type: "time", seconds: 194 }));
    const fading = hook.result.current.player.currentItem;
    expect(fading?.trackId).toBe("u1");
    await act(async () =>
      hook.result.current.player.removeEntry(fading?.queueEntryId ?? ""),
    );
    expect(hook.result.current.player.currentItem?.trackId).toBe("u2");
    expect(engine.load.mock.lastCall?.[0]).toContain("/u2?");
  });
});

describe("queue actions", () => {
  it("puts Play next in front of Your queue, and refuses a track without audio", async () => {
    const extra = releaseFixture("r3", ["x1", "x2"], ["x2"]);
    getStudioTrack.mockImplementation((trackId: string) =>
      Promise.resolve(trackDetailFixture(extra, trackId)),
    );
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    let isQueued = false;
    await act(async () => {
      isQueued = await hook.result.current.player.playNext("x1");
    });
    expect(isQueued).toBe(true);
    expect(
      hook.result.current.player.queue.userItems.map((entry) => entry.trackId),
    ).toEqual(["x1"]);
    await act(async () => {
      isQueued = await hook.result.current.player.addToQueue("x2");
    });
    expect(isQueued).toBe(false);
  });

  it("drops a track whose read lands after the player stopped", async () => {
    const extra = releaseFixture("r3", ["x1"]);
    // Every track read waits; the test answers the one for x1.
    const pendingReads = new Map<string, (dto: StudioTrackDTO) => void>();
    getStudioTrack.mockImplementation(
      (trackId: string) =>
        new Promise<StudioTrackDTO>((resolve) => {
          pendingReads.set(trackId, resolve);
        }),
    );
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    let queuing: Promise<boolean> = Promise.resolve(true);
    act(() => {
      queuing = hook.result.current.player.addToQueue("x1");
    });
    act(() => hook.result.current.player.stop());
    let isQueued = true;
    await act(async () => {
      pendingReads.get("x1")?.(trackDetailFixture(extra, "x1"));
      isQueued = await queuing;
    });
    expect(isQueued).toBe(false);
    expect(hook.result.current.player.hasQueue).toBe(false);
  });

  it("starts playing a track added to an empty player", async () => {
    const extra = releaseFixture("r3", ["x1"]);
    getStudioTrack.mockImplementation((trackId: string) =>
      Promise.resolve(trackDetailFixture(extra, trackId)),
    );
    const { engine, hook } = renderPlayer([]);
    await act(async () => {
      await hook.result.current.player.addToQueue("x1");
    });
    expect(hook.result.current.player.currentItem?.trackId).toBe("x1");
    expect(engine.load.mock.lastCall?.[0]).toContain("/x1?");
  });

  it("replays the track with repeat one", async () => {
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    act(() => {
      hook.result.current.player.cycleRepeat();
      hook.result.current.player.cycleRepeat();
    });
    expect(hook.result.current.player.queue.repeat).toBe("one");
    const playCount = engine.play.mock.calls.length;
    act(() => engine.emit({ type: "ended" }));
    expect(engine.seek).toHaveBeenLastCalledWith(0);
    expect(engine.play.mock.calls.length).toBe(playCount + 1);
    expect(hook.result.current.player.currentItem?.trackId).toBe("t1");
  });

  it("shuffles the upcoming tracks and restores them", async () => {
    const { engine, hook } = renderPlayer([albumOne, albumTwo]);
    const tracks = [...tracksOf(albumOne), ...tracksOf(albumTwo)];
    await startPlaying(engine, () =>
      hook.result.current.player.playTracks(tracks),
    );
    act(() => hook.result.current.player.toggleShuffle());
    expect(hook.result.current.player.queue.isShuffled).toBe(true);
    expect([...playOrder(hook.result.current.player)].sort()).toEqual([
      "t1",
      "t2",
      "u1",
      "u2",
    ]);
    act(() => hook.result.current.player.toggleShuffle());
    expect(playOrder(hook.result.current.player)).toEqual([
      "t1",
      "t2",
      "u1",
      "u2",
    ]);
  });
});

describe("server player settings (contract F.2)", () => {
  it("pauses at the end of a track while autoplay next is off", async () => {
    playbackSettings = { ...playbackSettings, autoplayNext: false };
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    act(() => engine.emit({ type: "time", seconds: 190 }));
    await settle();
    expect(engine.preload).not.toHaveBeenCalled();
    act(() => engine.emit({ type: "ended" }));
    expect(hook.result.current.player.currentItem?.trackId).toBe("t1");
    expect(hook.result.current.player.status).toBe("paused");
    expect(hook.result.current.player.playbackSettings).toEqual({
      autoplayNext: false,
      hideExplicit: false,
      askBeforeWarnings: true,
    });
    act(() => hook.result.current.player.next());
    expect(hook.result.current.player.currentItem?.trackId).toBe("t2");
  });

  it("still replays with repeat one while autoplay next is off", async () => {
    playbackSettings = { ...playbackSettings, autoplayNext: false };
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    act(() => {
      hook.result.current.player.cycleRepeat();
      hook.result.current.player.cycleRepeat();
    });
    act(() => engine.emit({ type: "ended" }));
    expect(engine.seek).toHaveBeenLastCalledWith(0);
  });

  it("leaves explicit tracks out of a new queue and refuses them while hidden", async () => {
    playbackSettings = { ...playbackSettings, hideExplicit: true };
    const mixed = releaseFixture("r4", ["c1", "e1", "c2"], [], ["e1"]);
    getStudioTrack.mockImplementation((trackId: string) =>
      Promise.resolve(trackDetailFixture(mixed, trackId)),
    );
    const { engine, hook } = renderPlayer([mixed]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r4"),
    );
    expect(playOrder(hook.result.current.player)).toEqual(["c1", "c2"]);
    let isQueued = true;
    await act(async () => {
      isQueued = await hook.result.current.player.addToQueue("e1");
    });
    expect(isQueued).toBe(false);
  });

  it("keeps a radio going past its last track", async () => {
    const { engine, hook } = renderPlayer([albumOne]);
    const radio = { kind: "radio" as const, label: "Radio", href: null };
    await startPlaying(engine, () =>
      hook.result.current.player.playTracks(tracksOf(albumOne), "t2", radio),
    );
    expect(hook.result.current.player.hasNext).toBe(true);
    expect(
      hook.result.current.player.queue.upcomingSourceItems[0]?.trackId,
    ).toBe("t1");
  });
});

describe("the saved queue", () => {
  const savedState = (source: StudioQueueSource | null) =>
    studioQueueReducer(EMPTY_QUEUE_STATE, {
      type: "playSource",
      source,
      items: toQueueItems(tracksOf(albumOne)),
      startIndex: 1,
      shuffleSeed: 1,
    });

  it("restores paused at the saved second and fetches the stream on play", async () => {
    writeQueueSnapshot("user-1", {
      state: savedState(null),
      positionSeconds: 30,
    });
    const { engine, hook } = renderPlayer([albumOne]);
    expect(hook.result.current.player.currentItem?.trackId).toBe("t2");
    expect(hook.result.current.player.status).toBe("paused");
    expect(hook.result.current.clock.currentTime).toBe(30);
    expect(fetchStudioStream).not.toHaveBeenCalled();
    await act(async () => hook.result.current.player.togglePlay());
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t2?v=1",
      30,
      0,
    );
  });

  it("forgets the saved queue when the member stops the player", async () => {
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    expect(readQueueSnapshot("user-1")).not.toBeNull();
    act(() => hook.result.current.player.stop());
    expect(readQueueSnapshot("user-1")).toBeNull();
  });

  it("restores nothing after the member removes the only entry", async () => {
    const { engine, hook } = renderPlayer([albumOne]);
    const [onlyTrack] = tracksOf(albumOne);
    if (!onlyTrack) throw new Error("the release has a playable track");
    await startPlaying(engine, () =>
      hook.result.current.player.playTracks([onlyTrack]),
    );
    expect(readQueueSnapshot("user-1")).not.toBeNull();
    const entryId = hook.result.current.player.currentItem?.queueEntryId ?? "";
    act(() => hook.result.current.player.removeEntry(entryId));
    hook.rerender();
    expect(hook.result.current.player.hasQueue).toBe(false);
    expect(readQueueSnapshot("user-1")).toBeNull();
  });

  it("restores a saved radio with its filter", () => {
    const radio: StudioQueueSource = {
      kind: "radio",
      label: "Fado",
      href: null,
      radioFilter: { kind: "genre", value: "fado" },
    };
    writeQueueSnapshot("user-1", {
      state: savedState(radio),
      positionSeconds: 0,
    });
    const { hook } = renderPlayer([albumOne]);
    expect(hook.result.current.player.radio?.filter).toEqual({
      kind: "genre",
      value: "fado",
    });
    expect(hook.result.current.player.hasNext).toBe(true);
  });

  it("plays a radio saved without its filter as a finite queue", () => {
    const radio: StudioQueueSource = {
      kind: "radio",
      label: "Fado",
      href: null,
    };
    writeQueueSnapshot("user-1", {
      state: savedState(null),
      positionSeconds: 0,
    });
    const key = studioQueueStorageKey("user-1");
    const saved = JSON.parse(window.sessionStorage.getItem(key) ?? "{}") as {
      state: { source: unknown };
    };
    saved.state.source = radio;
    window.sessionStorage.setItem(key, JSON.stringify(saved));
    const { hook } = renderPlayer([albumOne]);
    expect(hook.result.current.player.radio).toBeNull();
    expect(hook.result.current.player.queue.source?.kind).toBe("tracks");
    expect(hook.result.current.player.hasNext).toBe(false);
  });
});

describe("sleep timer and shortcuts", () => {
  it("stops at the end of the track and cues the next one", async () => {
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    act(() =>
      hook.result.current.player.startSleepTimer({ kind: "endOfTrack" }),
    );
    await act(async () => engine.emit({ type: "ended" }));
    expect(hook.result.current.player.currentItem?.trackId).toBe("t2");
    expect(hook.result.current.player.status).toBe("paused");
    expect(hook.result.current.player.sleepTimer).toBeNull();
    expect(fetchStudioStream).toHaveBeenCalledTimes(1);
  });

  it("cancels the sleep timer when the member stops the player", async () => {
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    act(() =>
      hook.result.current.player.startSleepTimer({
        kind: "minutes",
        minutes: 30,
      }),
    );
    expect(hook.result.current.player.sleepTimer?.kind).toBe("minutes");
    act(() => hook.result.current.player.stop());
    expect(hook.result.current.player.sleepTimer).toBeNull();
  });

  it("toggles play with Space while something is queued", async () => {
    const { engine, hook } = renderPlayer([albumOne]);
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: " ", cancelable: true }),
    );
    expect(engine.pause).not.toHaveBeenCalled();
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    const pauseCount = engine.pause.mock.calls.length;
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: " ", cancelable: true }),
      );
    });
    expect(engine.pause.mock.calls.length).toBe(pauseCount + 1);
  });

  it("clamps a seek to the track's length", async () => {
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    act(() => hook.result.current.player.seek(250));
    expect(engine.seek).toHaveBeenLastCalledWith(200);
    expect(hook.result.current.clock.currentTime).toBe(200);
  });

  it("swaps gaplessly at the end after a seek into the crossfade window", async () => {
    const { engine, hook } = renderPlayer([albumOne, albumTwo]);
    act(() => hook.result.current.player.setCrossfadeSeconds(6));
    const tracks = [...tracksOf(albumOne).slice(0, 1), ...tracksOf(albumTwo)];
    await startPlaying(engine, () =>
      hook.result.current.player.playTracks(tracks),
    );
    act(() => engine.emit({ type: "time", seconds: 181 }));
    await settle();
    act(() => hook.result.current.player.seek(195));
    act(() => engine.emit({ type: "time", seconds: 196 }));
    expect(engine.handover).not.toHaveBeenCalled();
    act(() => engine.emit({ type: "ended" }));
    expect(engine.handover).toHaveBeenCalledWith("gapless");
  });
});

describe("chapters, casting, volume", () => {
  it("reads the current chapter from the track's detail", async () => {
    getStudioTrack.mockImplementation((trackId: string) =>
      Promise.resolve(
        trackDetailFixture(albumOne, trackId, {
          chapters: [
            { startSeconds: 0, title: "Open", artist: null },
            { startSeconds: 100, title: "Close", artist: null },
          ],
        }),
      ),
    );
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    await waitFor(() =>
      expect(hook.result.current.player.currentChapters).toHaveLength(2),
    );
    act(() => engine.emit({ type: "time", seconds: 150 }));
    expect(hook.result.current.clock.currentChapterIndex).toBe(1);
  });

  it("follows casting and applies the volume", async () => {
    const { engine, hook } = renderPlayer([albumOne]);
    act(() =>
      engine.emit({
        type: "remote",
        state: { isAvailable: true, isConnected: false },
      }),
    );
    expect(hook.result.current.player.remote).toEqual({
      isAvailable: true,
      isConnected: false,
    });
    act(() => hook.result.current.player.setVolume(0.3));
    expect(engine.setVolume).toHaveBeenLastCalledWith(0.3);
    expect(hook.result.current.player.preferences.volume).toBe(0.3);
  });
});

describe("tracks that end with nothing next, and Plays that wait", () => {
  it("brings the level back after an end-of-track sleep on the last track", async () => {
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1", "t2"),
    );
    act(() =>
      hook.result.current.player.startSleepTimer({ kind: "endOfTrack" }),
    );
    const pauseCount = engine.pause.mock.calls.length;
    act(() => engine.emit({ type: "ended" }));
    expect(engine.pause.mock.calls.length).toBe(pauseCount + 1);
    expect(hook.result.current.player.status).toBe("paused");
    expect(hook.result.current.player.sleepTimer).toBeNull();
    const playCount = engine.play.mock.calls.length;
    act(() => hook.result.current.player.togglePlay());
    expect(engine.play.mock.calls.length).toBe(playCount + 1);
  });

  it("starts again at 0 when the URL expired after a track ended paused", async () => {
    playbackSettings = { ...playbackSettings, autoplayNext: false };
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    act(() => engine.emit({ type: "time", seconds: 199 }));
    const pauseCount = engine.pause.mock.calls.length;
    act(() => engine.emit({ type: "ended" }));
    expect(engine.pause.mock.calls.length).toBe(pauseCount + 1);
    const later = Date.now() + 900_000;
    const nowSpy = vi.spyOn(Date, "now").mockReturnValue(later);
    try {
      await act(async () => hook.result.current.player.togglePlay());
      expect(engine.load).toHaveBeenLastCalledWith(
        "https://stream.example/t1?v=2",
        0,
        0,
      );
    } finally {
      nowSpy.mockRestore();
    }
  });

  it("keeps a Play whose release loads across a natural swap", async () => {
    const { engine, hook } = renderPlayer([albumOne]);
    await startPlaying(engine, () =>
      hook.result.current.player.playRelease("r1"),
    );
    act(() => engine.emit({ type: "time", seconds: 181 }));
    await settle();
    let resolveRelease: (dto: StudioReleaseDTO) => void = () => {};
    getStudioRelease.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRelease = resolve;
        }),
    );
    let playing: Promise<void> = Promise.resolve();
    act(() => {
      playing = hook.result.current.player.playRelease("r9");
    });
    act(() => engine.emit({ type: "ended" }));
    expect(engine.handover).toHaveBeenCalledWith("gapless");
    await act(async () => {
      resolveRelease(releaseFixture("r9", ["v1"]));
      await playing;
    });
    expect(hook.result.current.player.currentItem?.trackId).toBe("v1");
    expect(engine.load.mock.lastCall?.[0]).toContain("/v1?");
  });
});
