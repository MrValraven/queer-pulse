import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  DEFAULT_STUDIO_PLAYBACK,
  type StudioPlaybackPreferencesDTO,
} from "../api/studio.types";
import { postStudioPlay } from "../api/studioListening.api";
import { studioKeys } from "../api/studioQueryKeys";
import {
  readStudioListeningNotice,
  resetStudioListeningNoticeForTests,
} from "./studioListeningNoticeStore";
import {
  clearStudioRecentlyPlayed,
  recordStudioRecentlyPlayed,
  resumeStudioListeningMemoryForTests,
} from "./studioListeningMemory";
import type { StudioQueueItem } from "./studioPlayerContext";
import {
  useStudioRecentlyPlayed,
  useStudioRecentlyPlayedRecorder,
} from "./useStudioRecentlyPlayed";

const mocks: { row: StudioPlaybackPreferencesDTO | undefined } = vi.hoisted(
  () => ({ row: undefined }),
);

vi.mock("../api/studioListening.api", () => ({
  postStudioPlay: vi.fn(() => Promise.resolve()),
}));
vi.mock("../api/studioPlayback.api", () => ({
  putStudioPlayback: vi.fn(() => Promise.resolve(DEFAULT_STUDIO_PLAYBACK)),
}));
vi.mock("../api/useStudioPlaybackPreferences", () => ({
  useStudioPlaybackRow: () => mocks.row,
}));
vi.mock("./useStudioListeningSwitchMigration", () => ({
  useStudioListeningSwitchMigration: vi.fn(),
}));
vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({ user: { id: "member-1" } }),
}));
vi.mock("./studioListeningMemory", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./studioListeningMemory")>();
  return {
    ...actual,
    recordStudioRecentlyPlayed: vi.fn(actual.recordStudioRecentlyPlayed),
  };
});

const item: StudioQueueItem = {
  trackId: "track-1",
  title: "Track one",
  durationSeconds: 200,
  trackHref: "/studio/track?id=track-1",
  releaseId: "release-1",
  releaseTitle: "Release",
  coverUrl: null,
  tint: "jade",
  artistId: "persona-1",
  artistName: "Artist",
  artistHref: "/studio/artist?id=persona-1",
  queueEntryId: "entry-track-1",
  isExplicit: false,
};

interface RecorderSetup {
  row: StudioPlaybackPreferencesDTO | undefined;
  current?: StudioQueueItem;
  demoMode?: boolean;
  /** The playhead each read returns, in order; the last one repeats. Left
   *  out, the playhead moves one second per read. */
  positions?: number[];
}

function wrapperWith(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function renderRecorder(setup: RecorderSetup) {
  const demoMode = setup.demoMode ?? false;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  if (setup.row !== undefined)
    queryClient.setQueryData(studioKeys.playback(demoMode), setup.row);
  mocks.row = setup.row;
  let readCount = 0;
  const readPositionSeconds = () => {
    const position = setup.positions
      ? (setup.positions[Math.min(readCount, setup.positions.length - 1)] ?? 0)
      : readCount;
    readCount += 1;
    return position;
  };
  renderHook(
    () =>
      useStudioRecentlyPlayedRecorder({
        memberId: "member-1",
        canRecord: true,
        demoMode,
        current: setup.current ?? item,
        isPlaying: true,
        readPositionSeconds,
      }),
    { wrapper: wrapperWith(queryClient) },
  );
  return queryClient;
}

function advanceTicks(count: number) {
  act(() => {
    vi.advanceTimersByTime(count * 1000);
  });
}

/** One playhead read per second, one second of listening per read. */
const advanceListening = advanceTicks;

function renderEntries(setup: {
  row: StudioPlaybackPreferencesDTO | undefined;
  stored: string[];
}) {
  mocks.row = setup.row;
  setup.stored.forEach((trackId) =>
    recordStudioRecentlyPlayed("member-1", trackId),
  );
  return renderHook(() => useStudioRecentlyPlayed());
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  resetStudioListeningNoticeForTests();
  resumeStudioListeningMemoryForTests();
  clearStudioRecentlyPlayed();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useStudioRecentlyPlayedRecorder", () => {
  it("counts a live play once after 30 seconds and remembers it while history is on", () => {
    renderRecorder({
      row: { ...DEFAULT_STUDIO_PLAYBACK, isListeningHistoryOn: true },
    });
    advanceListening(31);
    expect(postStudioPlay).toHaveBeenCalledTimes(1);
    expect(postStudioPlay).toHaveBeenCalledWith(item.trackId);
    expect(recordStudioRecentlyPlayed).toHaveBeenCalledWith(
      "member-1",
      item.trackId,
    );
    advanceListening(60);
    expect(postStudioPlay).toHaveBeenCalledTimes(1);
  });

  it("still counts while history is paused, and remembers nothing", () => {
    renderRecorder({
      row: { ...DEFAULT_STUDIO_PLAYBACK, isListeningHistoryOn: false },
    });
    advanceListening(31);
    expect(postStudioPlay).toHaveBeenCalledTimes(1);
    expect(recordStudioRecentlyPlayed).not.toHaveBeenCalled();
  });

  it("remembers nothing while the playback row has not loaded", () => {
    renderRecorder({ row: undefined });
    advanceListening(31);
    expect(postStudioPlay).toHaveBeenCalledTimes(1);
    expect(recordStudioRecentlyPlayed).not.toHaveBeenCalled();
  });

  it("stays silent and sends no second count when the server refuses with a 429", async () => {
    vi.mocked(postStudioPlay).mockRejectedValueOnce(
      new ApiError(429, "Too many requests"),
    );
    renderRecorder({ row: DEFAULT_STUDIO_PLAYBACK });
    advanceListening(31);
    await Promise.resolve();
    advanceListening(60);
    expect(postStudioPlay).toHaveBeenCalledTimes(1);
    expect(readStudioListeningNotice()).toBe(false);
  });

  it("never counts a preview link's track, and leaves it off the device list", () => {
    renderRecorder({
      row: DEFAULT_STUDIO_PLAYBACK,
      current: { ...item, previewToken: "tok" },
    });
    advanceListening(31);
    expect(postStudioPlay).not.toHaveBeenCalled();
    expect(recordStudioRecentlyPlayed).not.toHaveBeenCalled();
  });

  it("remembers an episode and never counts it", () => {
    renderRecorder({
      row: DEFAULT_STUDIO_PLAYBACK,
      current: { ...item, isEpisode: true },
    });
    advanceListening(31);
    expect(postStudioPlay).not.toHaveBeenCalled();
    expect(recordStudioRecentlyPlayed).toHaveBeenCalledTimes(1);
  });

  it("never counts in demo, and remembers from the demo playback row", () => {
    renderRecorder({ row: DEFAULT_STUDIO_PLAYBACK, demoMode: true });
    advanceListening(31);
    expect(postStudioPlay).not.toHaveBeenCalled();
    expect(recordStudioRecentlyPlayed).toHaveBeenCalledTimes(1);
  });

  it("adds nothing for a seek, so a jump to 40 seconds counts nothing", () => {
    renderRecorder({
      row: DEFAULT_STUDIO_PLAYBACK,
      positions: [0, 1, 2, 40, 41],
    });
    advanceTicks(5);
    expect(postStudioPlay).not.toHaveBeenCalled();
    expect(recordStudioRecentlyPlayed).not.toHaveBeenCalled();
  });

  it("shows the first-play notice after a live count resolves on an unstamped row", async () => {
    const queryClient = renderRecorder({
      row: { ...DEFAULT_STUDIO_PLAYBACK, listeningNoticeSeenAt: null },
    });
    advanceListening(31);
    await act(async () => {
      await Promise.resolve();
    });
    expect(readStudioListeningNotice()).toBe(true);
    expect(
      queryClient.getQueryData<StudioPlaybackPreferencesDTO>(
        studioKeys.playback(false),
      )?.listeningNoticeSeenAt,
    ).not.toBeNull();
  });
});

describe("useStudioRecentlyPlayed", () => {
  it("hides the device list while history is paused", () => {
    const { result } = renderEntries({
      row: { ...DEFAULT_STUDIO_PLAYBACK, isListeningHistoryOn: false },
      stored: ["track-1"],
    });
    expect(result.current.entries).toEqual([]);
  });

  it("shows the device list while history is on", () => {
    const { result } = renderEntries({
      row: DEFAULT_STUDIO_PLAYBACK,
      stored: ["track-1"],
    });
    expect(result.current.entries.map((entry) => entry.trackId)).toEqual([
      "track-1",
    ]);
  });
});
