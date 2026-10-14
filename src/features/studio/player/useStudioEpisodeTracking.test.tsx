import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../../test/studioPlayerTestValue";
import {
  clearStudioEpisodeMemory,
  markEpisodePlayed,
  readEpisodeMemory,
  saveEpisodePosition,
} from "./studioEpisodeMemory";
import { markExplicitStart } from "./studioEpisodePlay";
import {
  StudioPlayerClockContext,
  StudioPlayerContext,
  type StudioPlayerClock,
  type StudioPlayerValue,
  type StudioQueueItem,
} from "./studioPlayerContext";
import { DEMO_EPISODE_MEMBER_ID } from "./useStudioEpisodeMemory";
import { useStudioEpisodeTracking } from "./useStudioEpisodeTracking";

const memberOverride = vi.hoisted(() => ({ current: null as string | null }));

// A member switch needs a second member id: the override swaps the id and
// reads that member's memory, and every other test keeps the real hook.
vi.mock("./useStudioEpisodeMemory", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./useStudioEpisodeMemory")>();
  const memoryModule = await import("./studioEpisodeMemory");
  return {
    ...actual,
    useStudioEpisodeMemory: () => {
      const real = actual.useStudioEpisodeMemory();
      if (memberOverride.current === null) return real;
      return {
        ...real,
        memberId: memberOverride.current,
        memory: memoryModule.readEpisodeMemory(memberOverride.current),
      };
    },
  };
});

const member = DEMO_EPISODE_MEMBER_ID;

const episode: StudioQueueItem = {
  queueEntryId: "q-e1",
  trackId: "e1",
  title: "Pilot",
  durationSeconds: 2400,
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

function clockAt(currentTime: number): StudioPlayerClock {
  return {
    currentTime,
    duration: 2400,
    currentChapterIndex: null,
    currentLyricIndex: null,
  };
}

function setup(player: StudioPlayerValue, clock: StudioPlayerClock) {
  let current = { player, clock };
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestProviders>
      <StudioPlayerContext.Provider value={current.player}>
        <StudioPlayerClockContext.Provider value={current.clock}>
          {children}
        </StudioPlayerClockContext.Provider>
      </StudioPlayerContext.Provider>
    </TestProviders>
  );
  const hook = renderHook(() => useStudioEpisodeTracking(), { wrapper });
  return {
    update(
      next: Partial<{ player: StudioPlayerValue; clock: StudioPlayerClock }>,
    ) {
      current = { ...current, ...next };
      hook.rerender();
    },
  };
}

afterEach(() => {
  memberOverride.current = null;
  markExplicitStart(null);
  clearStudioEpisodeMemory();
});

describe("useStudioEpisodeTracking", () => {
  it("resumes a fresh play at the saved place", () => {
    saveEpisodePosition(member, "e1", 600);
    const seek = vi.fn();
    const loading = {
      ...createStudioPlayerTestValue(episode),
      status: "loading" as const,
      seek,
    };
    const harness = setup(loading, clockAt(0));
    harness.update({ player: { ...loading, status: "playing" } });
    expect(seek).toHaveBeenCalledWith(600);
    // The playhead has not moved yet: the saved place stays 600.
    harness.update({ clock: clockAt(0.5) });
    expect(readEpisodeMemory(member).e1?.positionSeconds).toBe(600);
  });

  it("lets a &t= start win over the saved place", () => {
    saveEpisodePosition(member, "e1", 600);
    const seek = vi.fn();
    const playing = {
      ...createStudioPlayerTestValue(episode),
      status: "playing" as const,
      seek,
    };
    setup(playing, clockAt(90));
    expect(seek).not.toHaveBeenCalled();
  });

  it("starts a 0:00 timestamp at 0 over the saved place", () => {
    saveEpisodePosition(member, "e1", 600);
    markExplicitStart("q-e1");
    const seek = vi.fn();
    const loading = {
      ...createStudioPlayerTestValue(episode),
      status: "loading" as const,
      seek,
    };
    const harness = setup(loading, clockAt(0));
    harness.update({ player: { ...loading, status: "playing" } });
    harness.update({ clock: clockAt(0.5) });
    expect(seek).not.toHaveBeenCalled();
  });

  it("still resumes a plain Play after a named start on another entry", () => {
    saveEpisodePosition(member, "e1", 600);
    markExplicitStart("q-other");
    const seek = vi.fn();
    const loading = {
      ...createStudioPlayerTestValue(episode),
      status: "loading" as const,
      seek,
    };
    const harness = setup(loading, clockAt(0));
    harness.update({ player: { ...loading, status: "playing" } });
    expect(seek).toHaveBeenCalledWith(600);
  });

  it("starts a played episode from the top", () => {
    saveEpisodePosition(member, "e1", 600);
    markEpisodePlayed(member, "e1");
    const seek = vi.fn();
    const playing = {
      ...createStudioPlayerTestValue(episode),
      status: "playing" as const,
      seek,
    };
    setup(playing, clockAt(0));
    expect(seek).not.toHaveBeenCalled();
  });

  it("saves every 10 s of play and on pause", () => {
    const playing = {
      ...createStudioPlayerTestValue(episode),
      status: "playing" as const,
    };
    const harness = setup(playing, clockAt(0.2));
    harness.update({ clock: clockAt(5) });
    expect(readEpisodeMemory(member).e1).toBeUndefined();
    harness.update({ clock: clockAt(10.4) });
    expect(readEpisodeMemory(member).e1?.positionSeconds).toBe(10);
    harness.update({ clock: clockAt(14) });
    harness.update({ player: { ...playing, status: "paused" } });
    expect(readEpisodeMemory(member).e1?.positionSeconds).toBe(14);
  });

  it("saves on pagehide", () => {
    const playing = {
      ...createStudioPlayerTestValue(episode),
      status: "playing" as const,
    };
    const harness = setup(playing, clockAt(0.2));
    harness.update({ clock: clockAt(7) });
    window.dispatchEvent(new Event("pagehide"));
    expect(readEpisodeMemory(member).e1?.positionSeconds).toBe(7);
  });

  it("marks played at 90% and saves no place after it", () => {
    const playing = {
      ...createStudioPlayerTestValue(episode),
      status: "playing" as const,
    };
    const harness = setup(playing, clockAt(2150));
    harness.update({ clock: clockAt(2160) });
    expect(readEpisodeMemory(member).e1?.playedAt).toBeDefined();
    harness.update({ clock: clockAt(2200) });
    harness.update({ player: { ...playing, status: "paused" } });
    expect(readEpisodeMemory(member).e1?.positionSeconds).toBeUndefined();
  });

  it("leaves music alone", () => {
    const song = { ...episode, isEpisode: false };
    const playing = {
      ...createStudioPlayerTestValue(song),
      status: "playing" as const,
    };
    const harness = setup(playing, clockAt(0.2));
    harness.update({ clock: clockAt(30) });
    harness.update({ player: { ...playing, status: "paused" } });
    expect(readEpisodeMemory(member).e1).toBeUndefined();
  });

  it("seeks to the saved place exactly once", () => {
    saveEpisodePosition(member, "e1", 600);
    const seek = vi.fn();
    const loading = {
      ...createStudioPlayerTestValue(episode),
      status: "loading" as const,
      seek,
    };
    const harness = setup(loading, clockAt(0));
    harness.update({ player: { ...loading, status: "playing" } });
    harness.update({ clock: clockAt(600.4) });
    harness.update({ clock: clockAt(612) });
    harness.update({ clock: clockAt(640) });
    expect(seek).toHaveBeenCalledTimes(1);
  });

  it("keeps the saved place when a cued episode is paused at the start", () => {
    saveEpisodePosition(member, "e1", 600);
    const paused = {
      ...createStudioPlayerTestValue(episode),
      status: "paused" as const,
    };
    setup(paused, clockAt(0));
    window.dispatchEvent(new Event("pagehide"));
    expect(readEpisodeMemory(member).e1?.positionSeconds).toBe(600);
  });

  it("writes no place on pagehide after the episode is marked played", () => {
    const playing = {
      ...createStudioPlayerTestValue(episode),
      status: "playing" as const,
    };
    const harness = setup(playing, clockAt(2150));
    harness.update({ clock: clockAt(2160) });
    window.dispatchEvent(new Event("pagehide"));
    expect(readEpisodeMemory(member).e1?.positionSeconds).toBeUndefined();
    expect(readEpisodeMemory(member).e1?.playedAt).toBeDefined();
  });

  it("marks played when playback ends at an unknown length", () => {
    const playing = {
      ...createStudioPlayerTestValue(episode),
      status: "playing" as const,
    };
    const unknownLength = (currentTime: number) => ({
      ...clockAt(currentTime),
      duration: 0,
    });
    const harness = setup(playing, unknownLength(1000));
    harness.update({ clock: unknownLength(2399.5) });
    expect(readEpisodeMemory(member).e1?.playedAt).toBeUndefined();
    harness.update({ player: { ...playing, status: "paused" } });
    expect(readEpisodeMemory(member).e1?.playedAt).toBeDefined();
  });

  it("runs a fresh resume check when the member changes", () => {
    saveEpisodePosition("member-two", "e1", 600);
    const seek = vi.fn();
    const playing = {
      ...createStudioPlayerTestValue(episode),
      status: "playing" as const,
      seek,
    };
    const harness = setup(playing, clockAt(0));
    expect(seek).not.toHaveBeenCalled();
    memberOverride.current = "member-two";
    harness.update({ clock: clockAt(0.1) });
    expect(seek).toHaveBeenCalledWith(600);
  });
});
