import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../../test/studioPlayerTestValue";
import type { StudioPlayerClock, StudioQueueItem } from "./studioPlayerContext";
import { useStudioMediaSession } from "./useStudioMediaSession";

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

const handlers = new Map<
  string,
  (details: MediaSessionActionDetails) => void
>();

beforeEach(() => {
  handlers.clear();
  Object.defineProperty(navigator, "mediaSession", {
    configurable: true,
    value: {
      metadata: null,
      playbackState: "none",
      setActionHandler: (
        action: string,
        handler: ((details: MediaSessionActionDetails) => void) | null,
      ) => {
        if (handler) handlers.set(action, handler);
        else handlers.delete(action);
      },
      setPositionState: vi.fn(),
    },
  });
});

const CLOCK: StudioPlayerClock = {
  currentTime: 0,
  duration: 200,
  currentChapterIndex: null,
  currentLyricIndex: null,
};

const WARNED_ITEM: StudioQueueItem = {
  queueEntryId: "q1",
  trackId: "w",
  title: "Warned",
  durationSeconds: 200,
  trackHref: "/studio/track?id=w",
  releaseId: "r1",
  releaseTitle: "Release",
  coverUrl: null,
  tint: "coral",
  artistId: "p1",
  artistName: "Artist",
  artistHref: "/studio/artist?id=p1",
  isExplicit: false,
  contentWarnings: ["self-harm"],
};

describe("media session play at the warning gate (spec 6.3)", () => {
  it("does nothing on a lock screen play while a warned track asks", () => {
    const togglePlay = vi.fn();
    const playWarnedTrack = vi.fn();
    const player = {
      ...createStudioPlayerTestValue(WARNED_ITEM),
      pendingWarning: WARNED_ITEM,
      togglePlay,
      playWarnedTrack,
    };
    renderHook(() => useStudioMediaSession(player, CLOCK), { wrapper });
    handlers.get("play")?.({ action: "play" });
    expect(togglePlay).not.toHaveBeenCalled();
    expect(playWarnedTrack).not.toHaveBeenCalled();
  });

  it("plays again once the question is answered", () => {
    const togglePlay = vi.fn();
    const player = {
      ...createStudioPlayerTestValue(WARNED_ITEM),
      togglePlay,
    };
    renderHook(() => useStudioMediaSession(player, CLOCK), { wrapper });
    handlers.get("play")?.({ action: "play" });
    expect(togglePlay).toHaveBeenCalledTimes(1);
  });
});
