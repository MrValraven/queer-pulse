import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { fetchStudioStream } from "../api/studioStream";
import type { StudioAudioEngine } from "./studioAudioEngine";
import {
  createDeckPreloader,
  type StudioDeckSources,
} from "./studioDeckPreload";
import {
  createPlaybackCommands,
  type PlaybackCommands,
  type PlaybackRefs,
} from "./studioPlaybackCommands";
import type {
  StudioPlaybackSettings,
  StudioQueueItem,
  StudioQueueSource,
  StudioQueueTrack,
} from "./studioPlayerContext";
import {
  EMPTY_QUEUE_STATE,
  studioQueueReducer,
  type StudioQueueAction,
  type StudioQueueState,
} from "./studioQueueReducer";
import { createTransportActions } from "./studioTransportActions";
import {
  clearStudioWarningConsent,
  consentToWarnedTrack,
  hasWarningConsent,
} from "./studioWarningGate";

vi.mock("../api/studioStream", () => ({
  fetchStudioStream: vi.fn(),
  rememberStreamAnalysis: vi.fn(),
  streamAnalysisOf: vi.fn(() => ({
    waveformPeaks: null,
    loudnessLufs: null,
    peakDb: null,
  })),
}));

const track = (
  trackId: string,
  contentWarnings: StudioQueueTrack["contentWarnings"] = [],
): StudioQueueTrack => ({
  trackId,
  title: trackId,
  durationSeconds: 200,
  trackHref: `/studio/track?id=${trackId}`,
  releaseId: `release-${trackId}`,
  releaseTitle: "Release",
  coverUrl: null,
  tint: "plum",
  artistId: "p1",
  artistName: "Artist",
  artistHref: "/studio/artist?id=p1",
  isExplicit: false,
  contentWarnings,
});
const SOURCE: StudioQueueSource = { kind: "tracks", label: "", href: null };
const ASKING: StudioPlaybackSettings = {
  autoplayNext: true,
  hideExplicit: false,
  askBeforeWarnings: true,
};
const ref = <Value>(current: Value) => ({ current });

function createRefs(queueRef: { current: StudioQueueState }) {
  return {
    queueRef,
    statusRef: ref("idle"),
    playheadRef: ref({ currentTime: 0, duration: null }),
    engineRef: ref(null),
    expiresAtRef: ref(0),
    refreshCountRef: ref(0),
    hasTriedPlainModeRef: ref(false),
    loadTokenRef: ref(0),
    sourceTokenRef: ref(0),
    resumeAtRef: ref(0),
    intentTokenRef: ref(0),
  } as unknown as PlaybackRefs;
}

function createTransport(settings: StudioPlaybackSettings = ASKING) {
  const queueRef = { current: EMPTY_QUEUE_STATE };
  const loadEntry = vi.fn(() => Promise.resolve());
  const advance = vi.fn();
  const resetPlayback = vi.fn();
  const clearSavedQueue = vi.fn();
  const actions = createTransportActions({
    refs: createRefs(queueRef),
    playRequestRef: ref(0),
    shouldStopRef: ref(false),
    dispatch: (action: StudioQueueAction) => {
      queueRef.current = studioQueueReducer(queueRef.current, action);
      return queueRef.current;
    },
    commands: () =>
      ({ loadEntry, advance, resetPlayback }) as unknown as PlaybackCommands,
    readPlaybackSettings: () => settings,
    demoMode: true,
    queryClient: new QueryClient(),
    clearSavedQueue,
  });
  return {
    actions,
    loadEntry,
    advance,
    resetPlayback,
    clearSavedQueue,
    queue: () => queueRef.current,
  };
}

afterEach(() => clearStudioWarningConsent());

describe("direct play consents (spec 6.3, D5)", () => {
  it("consents and plays when Play names the warned track", async () => {
    const transport = createTransport();
    await transport.actions.playTracks(
      [track("w", ["self-harm"])],
      "w",
      SOURCE,
    );
    expect(hasWarningConsent("w")).toBe(true);
    expect(transport.loadEntry).toHaveBeenCalledWith(
      expect.objectContaining({ trackId: "w" }),
      0,
    );
  });

  it("asks first when a plain Play starts on a warned track", async () => {
    const transport = createTransport();
    await transport.actions.playTracks(
      [track("w", ["self-harm"]), track("a")],
      undefined,
      SOURCE,
    );
    expect(transport.queue().pendingWarning?.trackId).toBe("w");
    expect(transport.loadEntry).toHaveBeenCalledWith(
      expect.objectContaining({ trackId: "w" }),
      0,
      false,
    );
  });

  it("plays straight through with the setting off", async () => {
    const transport = createTransport({ ...ASKING, askBeforeWarnings: false });
    await transport.actions.playTracks(
      [track("w", ["self-harm"])],
      undefined,
      SOURCE,
    );
    expect(transport.queue().pendingWarning ?? null).toBeNull();
    expect(transport.loadEntry).toHaveBeenCalledWith(
      expect.objectContaining({ trackId: "w" }),
      0,
    );
  });
});

describe("Play it and Skip", () => {
  it("Play it consents, clears the question and loads the track", async () => {
    const transport = createTransport();
    await transport.actions.playTracks(
      [track("w", ["violence"]), track("a")],
      undefined,
      SOURCE,
    );
    transport.loadEntry.mockClear();
    transport.actions.playWarnedTrack();
    expect(hasWarningConsent("w")).toBe(true);
    expect(transport.queue().pendingWarning).toBeNull();
    expect(transport.loadEntry).toHaveBeenCalledWith(
      expect.objectContaining({ trackId: "w" }),
      0,
    );
  });

  it("treats Play on the bar as Play it while the gate waits", async () => {
    const transport = createTransport();
    await transport.actions.playTracks(
      [track("w", ["violence"])],
      undefined,
      SOURCE,
    );
    transport.actions.togglePlay();
    expect(hasWarningConsent("w")).toBe(true);
  });

  it("Skip moves on to the next item", async () => {
    const transport = createTransport();
    await transport.actions.playTracks(
      [track("w", ["violence"]), track("a")],
      undefined,
      SOURCE,
    );
    transport.actions.skipWarnedTrack();
    expect(transport.advance).toHaveBeenCalledWith(true);
    expect(hasWarningConsent("w")).toBe(false);
  });

  it("Skip on the last item stops the player", async () => {
    const transport = createTransport();
    await transport.actions.playTracks(
      [track("w", ["violence"])],
      undefined,
      SOURCE,
    );
    transport.actions.skipWarnedTrack();
    expect(transport.resetPlayback).toHaveBeenCalledTimes(1);
    expect(transport.clearSavedQueue).toHaveBeenCalledTimes(1);
  });
});

function createEngine() {
  return {
    pause: vi.fn(),
    reset: vi.fn(),
    load: vi.fn(),
    play: vi.fn(() => Promise.resolve()),
    seek: vi.fn(),
    handover: vi.fn(),
    enterPlainMode: vi.fn(() => false),
    unlock: vi.fn(),
    preload: vi.fn(),
    cancelPreload: vi.fn(),
    hasPreload: vi.fn(() => false),
    isPlainMode: vi.fn(() => false),
  };
}

function createCommandsHarness(items: StudioQueueTrack[]) {
  const queueRef = {
    current: studioQueueReducer(EMPTY_QUEUE_STATE, {
      type: "playSource",
      source: SOURCE,
      items: items.map((item) => ({ ...item, queueEntryId: item.trackId })),
      startIndex: 0,
      shuffleSeed: 1,
    }),
  };
  const refs = createRefs(queueRef);
  const engine = createEngine();
  (refs.engineRef as { current: unknown }).current = engine;
  const setStatus = vi.fn();
  const tick = vi.fn();
  const decks = {
    takePreload: vi.fn(() => null),
    cancelPreload: vi.fn(),
    noteSeek: vi.fn(),
    noteTrackStarted: vi.fn(),
  };
  const commands = createPlaybackCommands(refs, {
    dispatch: (action) => {
      queueRef.current = studioQueueReducer(queueRef.current, action);
      return queueRef.current;
    },
    setStatus,
    tick,
    decks,
    sleep: {
      onTime: vi.fn(),
      consumeTrackEnd: () => false,
      cancelSleepTimer: vi.fn(),
    },
    readPlaybackSettings: () => ASKING,
    demoMode: true,
    queryClient: new QueryClient(),
  });
  return {
    commands,
    engine,
    setStatus,
    tick,
    decks,
    refs,
    queue: () => queueRef.current,
  };
}

describe("the commands at the gate", () => {
  beforeEach(() => vi.mocked(fetchStudioStream).mockReset());

  it("cues a warned track a track end reaches and reads no stream", () => {
    const harness = createCommandsHarness([track("a"), track("w", ["police"])]);
    harness.commands.advance(false);
    expect(harness.queue().pendingWarning?.trackId).toBe("w");
    expect(fetchStudioStream).not.toHaveBeenCalled();
    expect(harness.engine.reset).toHaveBeenCalled();
    expect(harness.setStatus).toHaveBeenLastCalledWith("paused");
  });

  it("drops a track withheld since it was queued and plays the next", async () => {
    vi.mocked(fetchStudioStream)
      .mockRejectedValueOnce(
        new ApiError(410, "Gone", {
          statusCode: 410,
          code: "studio_track_withheld",
          message: "This track is unavailable.",
          error: "Gone",
        }),
      )
      .mockResolvedValueOnce({
        url: "blob:b",
        expiresAt: new Date(Date.now() + 3_600_000).toISOString(),
        waveformPeaks: null,
      } as Awaited<ReturnType<typeof fetchStudioStream>>);
    const harness = createCommandsHarness([track("a"), track("b")]);
    const current = harness.queue().current as StudioQueueItem;
    await harness.commands.loadEntry(current, 0);
    await vi.waitFor(() => expect(harness.engine.load).toHaveBeenCalled());
    expect(harness.queue().current?.trackId).toBe("b");
    expect(
      harness.queue().sourceItems.map((item) => item.trackId),
    ).not.toContain("a");
  });

  it("restores a warned track asking again with no stream read and no track begun", () => {
    const harness = createCommandsHarness([track("a")]);
    const saved = studioQueueReducer(EMPTY_QUEUE_STATE, {
      type: "playSource",
      source: SOURCE,
      items: [{ ...track("w", ["police"]), queueEntryId: "w" }],
      startIndex: 0,
      shuffleSeed: 1,
    });
    const loadTokenBefore = harness.refs.loadTokenRef.current;
    harness.commands.restoreCued({ state: saved, positionSeconds: 42 });
    expect(harness.queue().pendingWarning?.trackId).toBe("w");
    expect(fetchStudioStream).not.toHaveBeenCalled();
    expect(harness.decks.noteTrackStarted).not.toHaveBeenCalled();
    expect(harness.refs.loadTokenRef.current).toBe(loadTokenBefore);
    expect(harness.tick).toHaveBeenLastCalledWith({
      currentTime: 0,
      duration: 200,
    });
    expect(harness.setStatus).toHaveBeenLastCalledWith("paused");
  });
});

describe("preload never pre-buffers a gated track", () => {
  function preloaderFor(state: StudioQueueState) {
    const engine = createEngine();
    const sources: StudioDeckSources = {
      demoMode: true,
      durationFor: () => 200,
      readQueue: () => state,
      readStatus: () => "playing",
      readCrossfadeSeconds: () => 6,
      readPlaybackSettings: () => ASKING,
      releaseTrackIdsFor: () => null,
      shouldHoldCrossfade: () => false,
      onCrossfadeStart: vi.fn(),
    };
    const preloader = createDeckPreloader(
      {
        engineRef: ref(engine as unknown as StudioAudioEngine),
        sourcesRef: ref(sources),
        remoteRef: ref({ isAvailable: false, isConnected: false }),
      },
      new QueryClient(),
    );
    return { preloader, sources };
  }
  const queued = studioQueueReducer(EMPTY_QUEUE_STATE, {
    type: "playSource",
    source: SOURCE,
    items: [track("a"), track("w", ["police"])].map((item) => ({
      ...item,
      queueEntryId: item.trackId,
    })),
    startIndex: 0,
    shuffleSeed: 1,
  });

  beforeEach(() => {
    vi.mocked(fetchStudioStream).mockReset();
    vi.mocked(fetchStudioStream).mockReturnValue(new Promise(() => {}));
  });

  it("skips the stream read and the crossfade for a warned next track", () => {
    const { preloader, sources } = preloaderFor(queued);
    preloader.handleTime(197);
    expect(fetchStudioStream).not.toHaveBeenCalled();
    expect(sources.onCrossfadeStart).not.toHaveBeenCalled();
  });

  it("preloads it once the member agreed to hear it", () => {
    consentToWarnedTrack("w");
    const { preloader } = preloaderFor(queued);
    preloader.handleTime(190);
    expect(fetchStudioStream).toHaveBeenCalledTimes(1);
  });
});
