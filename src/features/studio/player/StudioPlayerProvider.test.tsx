import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import type { StudioReleaseView } from "../api/studio.adapters";
import { toReleaseView } from "../api/studio.adapters";
import type { StudioReleaseDTO } from "../api/studio.types";
import { studioKeys } from "../api/studioQueryKeys";
import type { StudioAudioEvent } from "./studioAudioEngine";
import { StudioPlayerProvider } from "./StudioPlayerProvider";
import { queueFromRelease } from "./studioQueue";
import { useStudioPlayer, useStudioPlayerClock } from "./studioPlayerContext";

let loggedIn = true;
let access = {
  status: "granted",
  hasAccess: true,
  isPending: false,
  uploadablePersonas: [],
};
let streamVersion = 0;
const fetchStudioStream = vi.fn(async (_demoMode: boolean, trackId: string) => {
  streamVersion += 1;
  return {
    url: `https://stream.example/${trackId}?v=${streamVersion}`,
    expiresAt: new Date(Date.now() + 900_000).toISOString(),
  };
});

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: false }),
}));
vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({ loggedIn }),
}));
vi.mock("../api/useStudioAccess", () => ({ useStudioAccess: () => access }));
vi.mock("../api/studioStream", () => ({
  fetchStudioStream: (demoMode: boolean, trackId: string) =>
    fetchStudioStream(demoMode, trackId),
}));
// Releases the cache does not hold are gone unless a test says otherwise.
const getStudioRelease = vi.fn((releaseId: string) =>
  Promise.reject<StudioReleaseDTO>(
    new ApiError(404, `No release ${releaseId}`, { statusCode: 404 }),
  ),
);
vi.mock("../api/studio.api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../api/studio.api")>()),
  getStudioRelease: (releaseId: string) => getStudioRelease(releaseId),
}));

function createFakeEngine() {
  const listeners = new Set<(event: StudioAudioEvent) => void>();
  return {
    load: vi.fn(),
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
    seek: vi.fn(),
    reset: vi.fn(),
    subscribe: (listener: (event: StudioAudioEvent) => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emit: (event: StudioAudioEvent) =>
      listeners.forEach((listener) => listener(event)),
  };
}

const releaseDto: StudioReleaseDTO = {
  id: "r1",
  title: "Salt water",
  type: "ep",
  coverUrl: null,
  releasedOn: "2026-04-12",
  trackCount: 3,
  totalDurationSeconds: 600,
  artist: {
    id: "p1",
    handle: "nightform",
    name: "NIGHTFORM",
    kind: "musician",
    avatarUrl: null,
  },
  description: null,
  genre: null,
  status: "published",
  publishedAt: null,
  tracks: [
    {
      id: "t1",
      position: 1,
      title: "Tide",
      durationSeconds: 200,
      isExplicit: false,
      hasAudio: true,
    },
    {
      id: "t2",
      position: 2,
      title: "Pier",
      durationSeconds: 200,
      isExplicit: false,
      hasAudio: true,
    },
    {
      id: "t3",
      position: 3,
      title: "Pending",
      durationSeconds: null,
      isExplicit: false,
      hasAudio: false,
    },
  ],
  isOwner: false,
  rightsConfirmedAt: null,
  takedownReason: null,
};
const release: StudioReleaseView = toReleaseView(releaseDto);
const ME_KEY = studioKeys.me(false, "user-1");

function setup() {
  const engine = createFakeEngine();
  // One factory for the whole test, so a rerender never rebuilds the engine.
  const engineFactory = () => engine;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.setQueryData(studioKeys.release(false, "r1"), release);
  queryClient.setQueryData(ME_KEY, { hasAccess: true, uploadablePersonas: [] });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <StudioPlayerProvider engineFactory={engineFactory}>
        {children}
      </StudioPlayerProvider>
    </QueryClientProvider>
  );
  // Every status the player rendered, so a test can prove one never showed.
  const statuses: string[] = [];
  const hook = renderHook(
    () => {
      const player = useStudioPlayer();
      statuses.push(player.status);
      return { player, clock: useStudioPlayerClock() };
    },
    { wrapper },
  );
  return { engine, hook, statuses, queryClient };
}

function pendingStream() {
  let resolveStream: (stream: {
    url: string;
    expiresAt: string;
  }) => void = () => {};
  fetchStudioStream.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resolveStream = resolve;
      }),
  );
  return (url: string) =>
    resolveStream({
      url,
      expiresAt: new Date(Date.now() + 900_000).toISOString(),
    });
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
  fetchStudioStream.mockClear();
  getStudioRelease.mockClear();
});

describe("StudioPlayerProvider", () => {
  it("queues only playable tracks and starts on the one asked for", async () => {
    const { engine, hook } = setup();
    await act(() => hook.result.current.player.playRelease("r1", "t2"));
    expect(
      hook.result.current.player.queue.map((item) => item.trackId),
    ).toEqual(["t1", "t2"]);
    expect(hook.result.current.player.currentItem?.trackId).toBe("t2");
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t2?v=1",
      0,
    );
  });

  it("moves forward, and Previous restarts a track past three seconds", async () => {
    const { engine, hook } = setup();
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

  it("fetches a fresh stream once after a failure and resumes at the same second", async () => {
    const { engine, hook } = setup();
    await act(() => hook.result.current.player.playRelease("r1"));
    act(() => engine.emit({ type: "playing" }));
    act(() => engine.emit({ type: "time", seconds: 42 }));
    await act(async () => engine.emit({ type: "failed" }));
    expect(fetchStudioStream).toHaveBeenCalledTimes(2);
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t1?v=2",
      42,
    );
    await act(async () => engine.emit({ type: "failed" }));
    expect(fetchStudioStream).toHaveBeenCalledTimes(2);
    expect(hook.result.current.player.status).toBe("error");
    await act(async () => hook.result.current.player.retry());
    expect(fetchStudioStream).toHaveBeenCalledTimes(3);
  });

  it("plays on through the queue and stops after the last track", async () => {
    const { hook, engine } = setup();
    await act(() => hook.result.current.player.playRelease("r1"));
    await act(async () => engine.emit({ type: "ended" }));
    expect(hook.result.current.player.currentItem?.trackId).toBe("t2");
    await act(async () => engine.emit({ type: "ended" }));
    expect(hook.result.current.player.currentItem?.trackId).toBe("t2");
    expect(hook.result.current.player.status).toBe("paused");
  });

  it("stops and clears the queue on sign-out", async () => {
    const { hook, engine } = setup();
    await act(() => hook.result.current.player.playRelease("r1"));
    loggedIn = false;
    hook.rerender();
    expect(hook.result.current.player.queue).toEqual([]);
    expect(engine.reset).toHaveBeenCalled();
  });

  it("stops when GET /studio/me says the grant is gone", async () => {
    const { hook } = setup();
    await act(() => hook.result.current.player.playRelease("r1"));
    access = {
      status: "denied",
      hasAccess: false,
      isPending: false,
      uploadablePersonas: [],
    };
    hook.rerender();
    expect(hook.result.current.player.queue).toEqual([]);
  });

  it("keeps the clock in its own context", async () => {
    const { hook, engine } = setup();
    await act(() => hook.result.current.player.playRelease("r1"));
    act(() => engine.emit({ type: "time", seconds: 12 }));
    expect(hook.result.current.clock.currentTime).toBe(12);
  });

  it("spends one refresh on a failure the element reports twice", async () => {
    const { engine, hook, statuses } = setup();
    await act(() => hook.result.current.player.playRelease("r1"));
    act(() => engine.emit({ type: "playing" }));
    act(() => engine.emit({ type: "time", seconds: 42 }));
    // The element fires `error` and the pending play() rejects as well.
    await act(async () => {
      engine.emit({ type: "failed" });
      engine.emit({ type: "failed" });
    });
    expect(fetchStudioStream).toHaveBeenCalledTimes(2);
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t1?v=2",
      42,
    );
    act(() => engine.emit({ type: "playing" }));
    expect(hook.result.current.player.status).toBe("playing");
    expect(statuses).not.toContain("error");
  });

  it("ignores the old source while the next track loads", async () => {
    const { engine, hook } = setup();
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
    expect(fetchStudioStream).toHaveBeenCalledTimes(2);
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t2?v=9",
      0,
    );
  });

  it("leaves the engine paused when the next track cannot load", async () => {
    const { engine, hook } = setup();
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
    expect(engine.pause).toHaveBeenCalled();
    expect(engine.play).toHaveBeenCalledTimes(playCountBeforeNext);
  });

  it("retries from where the failed track stopped", async () => {
    const { engine, hook } = setup();
    await act(() => hook.result.current.player.playRelease("r1"));
    act(() => engine.emit({ type: "playing" }));
    act(() => engine.emit({ type: "time", seconds: 42 }));
    await act(async () => engine.emit({ type: "failed" }));
    // The refreshed source reports 0 before its metadata lands, then fails.
    act(() => engine.emit({ type: "time", seconds: 0 }));
    await act(async () => engine.emit({ type: "failed" }));
    expect(hook.result.current.player.status).toBe("error");
    await act(async () => hook.result.current.player.retry());
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t1?v=3",
      42,
    );
  });

  it("ignores Play while a track is still loading", async () => {
    const { engine, hook } = setup();
    await act(() => hook.result.current.player.playRelease("r1"));
    const loadCount = engine.load.mock.calls.length;
    const playCount = engine.play.mock.calls.length;
    act(() => hook.result.current.player.togglePlay());
    expect(hook.result.current.player.status).toBe("loading");
    expect(engine.load).toHaveBeenCalledTimes(loadCount);
    expect(engine.play).toHaveBeenCalledTimes(playCount);
    expect(engine.pause).toHaveBeenCalledTimes(1);
  });
});

describe("StudioPlayerProvider with a withdrawn grant or a missing release", () => {
  it("re-reads GET /studio/me when a stream says the grant is gone", async () => {
    const { hook, queryClient } = setup();
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
    const { engine, hook } = setup();
    await act(() => hook.result.current.player.playReleases(["gone", "r1"]));
    expect(getStudioRelease).toHaveBeenCalledWith("gone");
    expect(
      hook.result.current.player.queue.map((item) => item.trackId),
    ).toEqual(["t1", "t2"]);
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t1?v=1",
      0,
    );
  });

  it("drops a Play whose release arrives after sign-out", async () => {
    const { engine, hook } = setup();
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
      resolveRelease({ ...releaseDto, id: "r2" });
      await playing;
    });
    expect(fetchStudioStream).not.toHaveBeenCalled();
    expect(engine.load).not.toHaveBeenCalled();
    expect(hook.result.current.player.queue).toEqual([]);
  });
});

describe("StudioPlayerProvider: a list of tracks", () => {
  it("plays the items in the order given, from the chosen track, reading no release", async () => {
    const { engine, hook } = setup();
    const items = [...queueFromRelease(release)].reverse();
    await act(() => hook.result.current.player.playTracks(items, "t1"));
    expect(
      hook.result.current.player.queue.map((item) => item.trackId),
    ).toEqual(["t2", "t1"]);
    expect(hook.result.current.player.currentItem?.trackId).toBe("t1");
    expect(getStudioRelease).not.toHaveBeenCalled();
    expect(engine.load).toHaveBeenLastCalledWith(
      "https://stream.example/t1?v=1",
      0,
    );
  });

  it("leaves the player as it was for an empty list", async () => {
    const { hook } = setup();
    await act(() => hook.result.current.player.playTracks([]));
    expect(hook.result.current.player.queue).toEqual([]);
    expect(fetchStudioStream).not.toHaveBeenCalled();
  });
});
