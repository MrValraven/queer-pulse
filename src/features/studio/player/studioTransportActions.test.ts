import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { hasExplicitStart, markExplicitStart } from "./studioEpisodePlay";
import type { PlaybackCommands, PlaybackRefs } from "./studioPlaybackCommands";
import type {
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

const episode: StudioQueueTrack = {
  trackId: "e1",
  title: "Pilot",
  durationSeconds: 1800,
  trackHref: "/studio/track?id=e1",
  releaseId: "show-1",
  releaseTitle: "Late Bloomers",
  coverUrl: null,
  tint: "jade",
  artistId: "p1",
  artistName: "Late Bloomers",
  artistHref: "/studio/artist?id=p1",
  isExplicit: false,
  isEpisode: true,
};
const source: StudioQueueSource = {
  kind: "release",
  label: "Late Bloomers",
  href: "/studio/album?id=show-1",
};

function ref<Value>(current: Value) {
  return { current };
}

/** The transport with the real queue reducer and a recorded first load. */
function createTransport() {
  let queueState: StudioQueueState = EMPTY_QUEUE_STATE;
  const loadEntry = vi.fn(() => Promise.resolve());
  const refs = {
    queueRef: ref(EMPTY_QUEUE_STATE),
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
  const actions = createTransportActions({
    refs,
    playRequestRef: ref(0),
    shouldStopRef: ref(false),
    dispatch: (action: StudioQueueAction) => {
      queueState = studioQueueReducer(queueState, action);
      return queueState;
    },
    commands: () => ({ loadEntry }) as unknown as PlaybackCommands,
    readPlaybackSettings: () => ({ autoplayNext: true, hideExplicit: false }),
    demoMode: true,
    queryClient: new QueryClient(),
    clearSavedQueue: () => {},
  });
  return {
    actions,
    loadEntry,
    currentEntryId: () => queueState.current?.queueEntryId ?? null,
  };
}

afterEach(() => {
  markExplicitStart(null);
});

describe("createTransportActions named starts", () => {
  it("marks a 0:00 start on the new entry so its saved place stays put", async () => {
    const transport = createTransport();
    await transport.actions.playTracks([episode], "e1", source, 0);
    expect(transport.loadEntry).toHaveBeenCalledWith(
      expect.objectContaining({ trackId: "e1" }),
      0,
    );
    expect(hasExplicitStart(transport.currentEntryId())).toBe(true);
  });

  it("leaves a plain Play unmarked, so the episode resumes", async () => {
    const transport = createTransport();
    markExplicitStart("an-older-entry");
    await transport.actions.playTracks([episode], "e1", source);
    expect(transport.loadEntry).toHaveBeenCalledWith(
      expect.objectContaining({ trackId: "e1" }),
      0,
    );
    expect(hasExplicitStart(transport.currentEntryId())).toBe(false);
    expect(hasExplicitStart("an-older-entry")).toBe(false);
  });
});
