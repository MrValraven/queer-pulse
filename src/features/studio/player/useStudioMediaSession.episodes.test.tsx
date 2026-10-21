import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../../test/studioPlayerTestValue";
import {
  clearStudioEpisodeMemory,
  writeEpisodeSpeed,
} from "./studioEpisodeMemory";
import type {
  StudioPlayerClock,
  StudioPlayerValue,
  StudioQueueItem,
} from "./studioPlayerContext";
import { DEMO_EPISODE_MEMBER_ID } from "./useStudioEpisodeMemory";
import { useStudioMediaSession } from "./useStudioMediaSession";

const wrapper = ({ children }: { children: ReactNode }) => (
  <TestProviders>{children}</TestProviders>
);

const handlers = new Map<
  string,
  (details: MediaSessionActionDetails) => void
>();
const setPositionState = vi.fn();

beforeEach(() => {
  handlers.clear();
  setPositionState.mockClear();
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
      setPositionState,
    },
  });
});

afterEach(() => clearStudioEpisodeMemory());

function clockAt(currentTime: number): StudioPlayerClock {
  return {
    currentTime,
    duration: 1800,
    currentChapterIndex: null,
    currentLyricIndex: null,
  };
}

function itemOf(isEpisode: boolean): StudioQueueItem {
  return {
    queueEntryId: "q1",
    trackId: "t1",
    title: "One",
    durationSeconds: 1800,
    trackHref: "/studio/track?id=t1",
    releaseId: "r1",
    releaseTitle: "Release",
    coverUrl: null,
    tint: "coral",
    artistId: "p1",
    artistName: "Artist",
    artistHref: "/studio/artist?id=p1",
    isExplicit: false,
    isEpisode,
  };
}

describe("media session for episodes", () => {
  it("steps back 15 s and forward 30 s on an episode", () => {
    const seek = vi.fn();
    const player = { ...createStudioPlayerTestValue(itemOf(true)), seek };
    renderHook(() => useStudioMediaSession(player, clockAt(600)), { wrapper });
    handlers.get("seekbackward")?.({ action: "seekbackward" });
    expect(seek).toHaveBeenLastCalledWith(585);
    handlers.get("seekforward")?.({ action: "seekforward" });
    expect(seek).toHaveBeenLastCalledWith(630);
  });

  it("keeps 10 s steps for music", () => {
    const seek = vi.fn();
    const player = { ...createStudioPlayerTestValue(itemOf(false)), seek };
    renderHook(() => useStudioMediaSession(player, clockAt(600)), { wrapper });
    handlers.get("seekbackward")?.({ action: "seekbackward" });
    expect(seek).toHaveBeenLastCalledWith(590);
  });

  it("reports the real rate to the lock screen", () => {
    writeEpisodeSpeed(DEMO_EPISODE_MEMBER_ID, 1.5);
    const player = createStudioPlayerTestValue(itemOf(true));
    renderHook(() => useStudioMediaSession(player, clockAt(60)), { wrapper });
    expect(setPositionState).toHaveBeenLastCalledWith(
      expect.objectContaining({ playbackRate: 1.5 }),
    );
  });

  it("updates the lock-screen position when the member seeks", () => {
    const player = createStudioPlayerTestValue(itemOf(false));
    const { rerender } = renderHook(
      ({ clock }) => useStudioMediaSession(player, clock),
      { wrapper, initialProps: { clock: clockAt(60) } },
    );
    rerender({ clock: clockAt(300) });
    expect(setPositionState).toHaveBeenLastCalledWith(
      expect.objectContaining({ position: 300, duration: 1800 }),
    );
  });

  it("updates the lock-screen position when the play state changes", () => {
    const clock = clockAt(60);
    const { rerender } = renderHook(
      ({ status }) =>
        useStudioMediaSession(
          { ...createStudioPlayerTestValue(itemOf(false)), status },
          clock,
        ),
      {
        wrapper,
        initialProps: { status: "playing" as StudioPlayerValue["status"] },
      },
    );
    setPositionState.mockClear();
    rerender({ status: "paused" });
    expect(setPositionState).toHaveBeenCalledTimes(1);
  });
});
