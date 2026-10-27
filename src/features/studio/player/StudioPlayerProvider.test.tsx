import { act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { toReleaseView } from "../api/studio.adapters";
import type { StudioReleaseDTO, StudioTrackDTO } from "../api/studio.types";
import {
  ME_KEY,
  playOrder,
  releaseFixture,
  renderPlayer,
} from "../../../test/studioPlayerHarness";
import { studioReleasePath } from "../studioPaths";
import type { StudioQueueSource } from "./studioPlayerContext";
import { queueFromRelease } from "./studioQueue";

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
const fetchStudioStream = vi.fn(
  async (_demoMode: boolean, trackId: string, _previewToken?: string) => {
    streamVersion += 1;
    return {
      url: `https://stream.example/${trackId}?v=${streamVersion}`,
      expiresAt: new Date(Date.now() + 900_000).toISOString(),
      ...streamAnalysis,
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
  useStudioPlaybackRow: () => playbackSettings,
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

const release = releaseFixture("r1", ["t1", "t2", "t3"], ["t3"]);
const tracksOf = (dto: StudioReleaseDTO) =>
  queueFromRelease(toReleaseView(dto));
const fadoRadio: StudioQueueSource = {
  kind: "radio",
  label: "Fado",
  href: null,
  radioFilter: { kind: "genre", value: "fado" },
};

function pendingStream() {
  let resolveStream: (url: string) => void = () => {};
  fetchStudioStream.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveStream = (url) =>
          resolve({
            url,
            expiresAt: new Date(Date.now() + 900_000).toISOString(),
            ...streamAnalysis,
          });
      }),
  );
  return (url: string) => resolveStream(url);
}

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
  playbackSettings = {
    autoplayNext: true,
    hideExplicit: false,
    crossfadeSeconds: 0,
  };
  savePreferences.mockClear();
  fetchStudioStream.mockClear();
  getStudioRelease.mockClear();
  getStudioTrack.mockClear();
});

describe("StudioPlayerProvider", () => {
  it("queues only playable tracks and starts on the one asked for", async () => {
    const { engine, hook } = renderPlayer([release]);
    await act(() => hook.result.current.player.playRelease("r1", "t2"));
    const { player } = hook.result.current;
    expect(playOrder(player)).toEqual(["t2"]);
    expect(player.hasPrevious).toBe(true);
    expect(player.queue.source).toEqual({
      kind: "release",
      label: "Release r1",
      href: studioReleasePath("r1"),
    });
    expect(engine.unlock).toHaveBeenCalled();
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t2?v=1",
      0,
      0,
    );
  });

  it("starts at the second asked for", async () => {
    const { engine, hook } = renderPlayer([release]);
    await act(() => hook.result.current.player.playRelease("r1", "t2", 83));
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t2?v=1",
      83,
      0,
    );
    expect(hook.result.current.clock.currentTime).toBe(83);
  });

  it("keeps the second asked for through a silent refresh", async () => {
    const { engine, hook } = renderPlayer([release]);
    await act(() => hook.result.current.player.playRelease("r1", "t2", 83));
    await act(async () => engine.emit({ type: "failed" }));
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t2?v=2",
      83,
      0,
    );
  });

  it("moves forward, and Previous restarts a track past three seconds", async () => {
    const { engine, hook } = renderPlayer([release]);
    await act(() => hook.result.current.player.playRelease("r1"));
    await act(async () => hook.result.current.player.next());
    expect(hook.result.current.player.currentItem?.trackId).toBe("t2");
    act(() => engine.emit({ type: "time", seconds: 10 }));
    act(() => hook.result.current.player.previous());
    expect(engine.seek).toHaveBeenLastCalledWith(0);
    expect(hook.result.current.player.currentItem?.trackId).toBe("t2");
    act(() => engine.emit({ type: "time", seconds: 1 }));
    await act(async () => hook.result.current.player.previous());
    expect(hook.result.current.player.currentItem?.trackId).toBe("t1");
  });

  it("refreshes once, then retries on plain elements, then shows the error", async () => {
    const { engine, hook } = renderPlayer([release]);
    await act(() => hook.result.current.player.playRelease("r1"));
    act(() => engine.emit({ type: "playing" }));
    act(() => engine.emit({ type: "time", seconds: 42 }));
    await act(async () => engine.emit({ type: "failed" }));
    expect(fetchStudioStream).toHaveBeenCalledTimes(2);
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t1?v=2",
      42,
      0,
    );
    await act(async () => engine.emit({ type: "failed" }));
    expect(engine.enterPlainMode).toHaveBeenCalledTimes(1);
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t1?v=3",
      42,
      0,
    );
    await act(async () => engine.emit({ type: "failed" }));
    expect(fetchStudioStream).toHaveBeenCalledTimes(3);
    expect(hook.result.current.player.status).toBe("error");
    await act(async () => hook.result.current.player.retry());
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t1?v=4",
      42,
      0,
    );
  });

  it("reads plain mode from the engine once the fallback plays", async () => {
    const { engine, hook } = renderPlayer([release]);
    await act(() => hook.result.current.player.playRelease("r1"));
    act(() => engine.emit({ type: "playing" }));
    await act(async () => engine.emit({ type: "failed" }));
    await act(async () => engine.emit({ type: "failed" }));
    act(() => {
      engine.emit({ type: "plainMode" });
      engine.emit({ type: "playing" });
    });
    expect(hook.result.current.player.isPlainMode).toBe(true);
    expect(hook.result.current.player.status).toBe("playing");
  });

  it("shows the error after two failed stream reads without trying plain mode", async () => {
    const { engine, hook } = renderPlayer([release]);
    fetchStudioStream
      .mockImplementationOnce(() => Promise.reject(new Error("down")))
      .mockImplementationOnce(() => Promise.reject(new Error("down")));
    await act(() => hook.result.current.player.playRelease("r1"));
    await waitFor(() =>
      expect(hook.result.current.player.status).toBe("error"),
    );
    expect(engine.enterPlainMode).not.toHaveBeenCalled();
  });

  it("plays on through the queue and stops after the last track", async () => {
    const { hook, engine } = renderPlayer([release]);
    await act(() => hook.result.current.player.playRelease("r1"));
    await act(async () => engine.emit({ type: "ended" }));
    expect(hook.result.current.player.currentItem?.trackId).toBe("t2");
    await act(async () => engine.emit({ type: "ended" }));
    expect(hook.result.current.player.currentItem?.trackId).toBe("t2");
    expect(hook.result.current.player.status).toBe("paused");
  });

  it("passes the track's loudness gain and shows its waveform", async () => {
    streamAnalysis = {
      waveformPeaks: [0, 255],
      loudnessLufs: -7.8,
      peakDb: -0.1,
    };
    const { engine, hook } = renderPlayer([release]);
    await act(() => hook.result.current.player.playRelease("r1"));
    expect(engine.load.mock.lastCall?.[2]).toBeCloseTo(-6.2);
    await waitFor(() =>
      expect(hook.result.current.player.currentWaveform).toEqual([0, 1]),
    );
  });

  it("keeps the clock in its own context", async () => {
    const { hook, engine } = renderPlayer([release]);
    await act(() => hook.result.current.player.playRelease("r1"));
    act(() => engine.emit({ type: "time", seconds: 12 }));
    expect(hook.result.current.clock.currentTime).toBe(12);
  });
});

describe("StudioPlayerProvider: loads that race", () => {
  it("spends one refresh on a failure the element reports twice", async () => {
    const { engine, hook, statuses } = renderPlayer([release]);
    await act(() => hook.result.current.player.playRelease("r1"));
    act(() => engine.emit({ type: "playing" }));
    act(() => engine.emit({ type: "time", seconds: 42 }));
    await act(async () => {
      engine.emit({ type: "failed" });
      engine.emit({ type: "failed" });
    });
    expect(fetchStudioStream).toHaveBeenCalledTimes(2);
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t1?v=2",
      42,
      0,
    );
    act(() => engine.emit({ type: "playing" }));
    expect(hook.result.current.player.status).toBe("playing");
    expect(statuses).not.toContain("error");
  });

  it("ignores the old source while the next track loads", async () => {
    const { engine, hook } = renderPlayer([release]);
    await act(() => hook.result.current.player.playRelease("r1"));
    act(() => engine.emit({ type: "playing" }));
    const resolveNextStream = pendingStream();
    act(() => hook.result.current.player.next());
    expect(engine.pause).toHaveBeenCalled();
    act(() => engine.emit({ type: "time", seconds: 150 }));
    act(() => engine.emit({ type: "ended" }));
    act(() => engine.emit({ type: "paused" }));
    expect(hook.result.current.player.currentItem?.trackId).toBe("t2");
    expect(hook.result.current.player.status).toBe("loading");
    expect(hook.result.current.clock.currentTime).toBe(0);
    await act(async () => resolveNextStream("https://stream.example/t2?v=9"));
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t2?v=9",
      0,
      0,
    );
  });

  it("leaves the engine paused when the next track cannot load", async () => {
    const { engine, hook } = renderPlayer([release]);
    await act(() => hook.result.current.player.playRelease("r1"));
    act(() => engine.emit({ type: "playing" }));
    const playCountBeforeNext = engine.play.mock.calls.length;
    fetchStudioStream
      .mockImplementationOnce(() => Promise.reject(new Error("expired")))
      .mockImplementationOnce(() => Promise.reject(new Error("expired")));
    await act(async () => hook.result.current.player.next());
    await waitFor(() =>
      expect(hook.result.current.player.status).toBe("error"),
    );
    expect(fetchStudioStream).toHaveBeenCalledTimes(3);
    expect(hook.result.current.player.currentItem?.trackId).toBe("t2");
    expect(engine.play).toHaveBeenCalledTimes(playCountBeforeNext);
  });

  it("ignores Play while a track is still loading", async () => {
    const { engine, hook } = renderPlayer([release]);
    await act(() => hook.result.current.player.playRelease("r1"));
    const loadCount = engine.load.mock.calls.length;
    const playCount = engine.play.mock.calls.length;
    act(() => hook.result.current.player.togglePlay());
    expect(hook.result.current.player.status).toBe("loading");
    expect(engine.load).toHaveBeenCalledTimes(loadCount);
    expect(engine.play).toHaveBeenCalledTimes(playCount);
    expect(engine.pause).toHaveBeenCalledTimes(1);
  });

  it("unlocks the engine inside the click on every control that can start sound", async () => {
    const { engine, hook } = renderPlayer([release]);
    await act(() => hook.result.current.player.playTracks(tracksOf(release)));
    const controls = [
      () => hook.result.current.player.togglePlay(),
      () => hook.result.current.player.next(),
      () => hook.result.current.player.previous(),
      () =>
        hook.result.current.player.playEntry(
          hook.result.current.player.queue.current?.queueEntryId ?? "",
        ),
      () => hook.result.current.player.retry(),
    ];
    for (const control of controls) {
      const unlockCount = engine.unlock.mock.calls.length;
      act(() => control());
      expect(engine.unlock).toHaveBeenCalledTimes(unlockCount + 1);
    }
  });
});

describe("StudioPlayerProvider with a withdrawn grant or a missing release", () => {
  it("stops and clears the queue on sign-out", async () => {
    const { hook, engine } = renderPlayer([release]);
    await act(() => hook.result.current.player.playRelease("r1"));
    loggedIn = false;
    hook.rerender();
    expect(hook.result.current.player.hasQueue).toBe(false);
    expect(engine.reset).toHaveBeenCalled();
  });

  it("stops when GET /studio/me says the grant is gone", async () => {
    const { hook } = renderPlayer([release]);
    await act(() => hook.result.current.player.playRelease("r1"));
    access = {
      status: "denied",
      hasAccess: false,
      isPending: false,
      uploadablePersonas: [],
    };
    hook.rerender();
    expect(hook.result.current.player.hasQueue).toBe(false);
  });

  it("re-reads GET /studio/me when a stream says the grant is gone", async () => {
    const { hook, queryClient } = renderPlayer([release]);
    const withdrawn = () =>
      Promise.reject(
        new ApiError(403, "refused", {
          statusCode: 403,
          code: "studio_access_required",
        }),
      );
    fetchStudioStream
      .mockImplementationOnce(withdrawn)
      .mockImplementationOnce(withdrawn);
    await act(() => hook.result.current.player.playRelease("r1"));
    await waitFor(() =>
      expect(queryClient.getQueryState(ME_KEY)?.isInvalidated).toBe(true),
    );
  });

  it("plays the rest of the queue when one release cannot be read", async () => {
    const { engine, hook } = renderPlayer([release]);
    await act(() => hook.result.current.player.playReleases(["gone", "r1"]));
    expect(getStudioRelease).toHaveBeenCalledWith("gone");
    expect(playOrder(hook.result.current.player)).toEqual(["t1", "t2"]);
    expect(hook.result.current.player.queue.source).toMatchObject({
      kind: "artist",
      label: "NIGHTFORM",
    });
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t1?v=1",
      0,
      0,
    );
  });

  it("drops a Play whose release arrives after sign-out", async () => {
    const { engine, hook } = renderPlayer([release]);
    let resolveRelease: (dto: StudioReleaseDTO) => void = () => {};
    getStudioRelease.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRelease = resolve;
        }),
    );
    let playing: Promise<void> = Promise.resolve();
    act(() => {
      playing = hook.result.current.player.playRelease("r2");
    });
    loggedIn = false;
    hook.rerender();
    await act(async () => {
      resolveRelease({ ...release, id: "r2" });
      await playing;
    });
    expect(fetchStudioStream).not.toHaveBeenCalled();
    expect(engine.load).not.toHaveBeenCalled();
    expect(hook.result.current.player.hasQueue).toBe(false);
  });
});

describe("StudioPlayerProvider: a list of tracks", () => {
  it("plays the items in the order given, from the chosen track, reading no release", async () => {
    const { engine, hook } = renderPlayer([release]);
    const tracks = [...tracksOf(release)].reverse();
    await act(() => hook.result.current.player.playTracks(tracks, "t1"));
    const { player } = hook.result.current;
    expect(player.currentItem?.trackId).toBe("t1");
    expect(player.hasPrevious).toBe(true);
    expect(player.queue.source).toEqual({
      kind: "tracks",
      label: "",
      href: null,
    });
    expect(getStudioRelease).not.toHaveBeenCalled();
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t1?v=1",
      0,
      0,
    );
  });

  it("keeps the source it is given", async () => {
    const { hook } = renderPlayer([release]);
    const source = {
      kind: "playlist" as const,
      label: "Kitchen tapes",
      href: "/studio/collection?id=p1",
    };
    await act(() =>
      hook.result.current.player.playTracks(
        tracksOf(release),
        undefined,
        source,
      ),
    );
    expect(hook.result.current.player.queue.source).toEqual(source);
  });

  it("leaves the player as it was for an empty list", async () => {
    const { hook } = renderPlayer([release]);
    await act(() => hook.result.current.player.playTracks([]));
    expect(hook.result.current.player.hasQueue).toBe(false);
    expect(fetchStudioStream).not.toHaveBeenCalled();
  });

  it("reads every stream of a preview through its preview link", async () => {
    const { engine, hook } = renderPlayer([release]);
    const preview = queueFromRelease(toReleaseView(release), "preview-1");
    await act(() => hook.result.current.player.playTracks(preview));
    expect(fetchStudioStream).toHaveBeenLastCalledWith(
      false,
      "t1",
      "preview-1",
    );
    act(() => engine.emit({ type: "playing" }));
    act(() => engine.emit({ type: "time", seconds: 181 }));
    await waitFor(() => expect(engine.preload).toHaveBeenCalled());
    expect(fetchStudioStream).toHaveBeenLastCalledWith(
      false,
      "t2",
      "preview-1",
    );
    await act(async () => engine.emit({ type: "failed" }));
    expect(fetchStudioStream).toHaveBeenLastCalledWith(
      false,
      "t1",
      "preview-1",
    );
  });
});

describe("StudioPlayerProvider: a radio", () => {
  it("plays a radio source and reports its filter and pool", async () => {
    const { hook } = renderPlayer([release]);
    const pool = tracksOf(release);
    await act(() =>
      hook.result.current.player.playTracks(pool, undefined, fadoRadio),
    );
    const { radio, queue } = hook.result.current.player;
    expect(radio?.filter).toEqual({ kind: "genre", value: "fado" });
    expect(radio?.pool.map((item) => item.trackId)).toEqual(["t1", "t2"]);
    expect(queue.source).toEqual(fadoRadio);
  });

  it("refills a radio at its last track and never starts the refill on the same track", async () => {
    const { hook } = renderPlayer([release]);
    await act(() =>
      hook.result.current.player.playTracks(
        tracksOf(release),
        undefined,
        fadoRadio,
      ),
    );
    expect(playOrder(hook.result.current.player)).toEqual(["t1", "t2"]);
    await act(async () => hook.result.current.player.next());
    const { queue, hasNext, radio } = hook.result.current.player;
    expect(queue.current?.trackId).toBe("t2");
    expect(queue.upcomingSourceItems.map((item) => item.trackId)).toEqual([
      "t1",
      "t2",
    ]);
    expect(hasNext).toBe(true);
    // The pool stays the list the radio started with.
    expect(radio?.pool).toHaveLength(2);
  });

  it("ends a one-track radio after its track", async () => {
    const { hook, engine } = renderPlayer([release]);
    const [onlyTrack] = tracksOf(release);
    if (!onlyTrack) throw new Error("the release has a playable track");
    await act(() =>
      hook.result.current.player.playTracks([onlyTrack], undefined, fadoRadio),
    );
    expect(hook.result.current.player.hasNext).toBe(false);
    act(() => engine.emit({ type: "playing" }));
    await act(async () => engine.emit({ type: "ended" }));
    expect(playOrder(hook.result.current.player)).toEqual(["t1"]);
    expect(hook.result.current.player.status).toBe("paused");
  });

  it("clears the radio when a release plays", async () => {
    const { hook } = renderPlayer([release]);
    await act(() =>
      hook.result.current.player.playTracks(
        tracksOf(release),
        undefined,
        fadoRadio,
      ),
    );
    await act(() => hook.result.current.player.playRelease("r1"));
    expect(hook.result.current.player.radio).toBeNull();
  });
});

describe("StudioPlayerProvider: a radio while explicit tracks are hidden", () => {
  const mixed = releaseFixture("r5", ["c1", "c2", "e1"], [], ["e1"]);

  it("leaves explicit tracks out of the radio's pool", async () => {
    playbackSettings = { ...playbackSettings, hideExplicit: true };
    const { hook } = renderPlayer([mixed]);
    await act(() =>
      hook.result.current.player.playTracks(
        tracksOf(mixed),
        undefined,
        fadoRadio,
      ),
    );
    const { radio } = hook.result.current.player;
    expect(radio?.pool.map((item) => item.trackId)).toEqual(["c1", "c2"]);
  });

  it("keeps an explicit entry that plays in place when shuffle turns off", async () => {
    const withTwoExplicit = releaseFixture(
      "r6",
      ["c1", "e1", "c2", "e2"],
      [],
      ["e1", "e2"],
    );
    const { hook } = renderPlayer([withTwoExplicit]);
    await act(() =>
      hook.result.current.player.playTracks(
        tracksOf(withTwoExplicit),
        "e1",
        fadoRadio,
      ),
    );
    act(() => hook.result.current.player.toggleShuffle());
    playbackSettings = { ...playbackSettings, hideExplicit: true };
    hook.rerender();
    act(() => hook.result.current.player.toggleShuffle());
    const { player } = hook.result.current;
    expect(player.currentItem?.trackId).toBe("e1");
    expect(player.queue.upcomingSourceItems[0]?.trackId).toBe("c2");
    expect(playOrder(player)).not.toContain("e2");
  });

  it("drops explicit entries from a playing radio when hide explicit turns on", async () => {
    const { hook } = renderPlayer([mixed]);
    await act(() =>
      hook.result.current.player.playTracks(tracksOf(mixed), "c2", fadoRadio),
    );
    expect(playOrder(hook.result.current.player)).toEqual(["c2", "e1"]);
    playbackSettings = { ...playbackSettings, hideExplicit: true };
    hook.rerender();
    const { player } = hook.result.current;
    expect(player.currentItem?.trackId).toBe("c2");
    expect(playOrder(player)).not.toContain("e1");
    expect(player.queue.upcomingSourceItems[0]?.trackId).toBe("c1");
    expect(player.hasNext).toBe(true);
    expect(player.radio?.pool.map((item) => item.trackId)).toEqual([
      "c1",
      "c2",
    ]);
  });
});
