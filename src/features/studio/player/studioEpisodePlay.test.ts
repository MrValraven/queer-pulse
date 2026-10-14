import { afterEach, describe, expect, it, vi } from "vitest";
import { createStudioPlayerTestValue } from "../../../test/studioPlayerTestValue";
import {
  hasExplicitStart,
  isEpisodeTransition,
  markExplicitStart,
  playEpisode,
} from "./studioEpisodePlay";
import type {
  StudioQueueItem,
  StudioQueueSource,
  StudioQueueTrack,
} from "./studioPlayerContext";

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

const loadedEpisode: StudioQueueItem = { ...episode, queueEntryId: "q-e1" };

afterEach(() => {
  markExplicitStart(null);
});

describe("isEpisodeTransition", () => {
  it("is true when either side is an episode", () => {
    expect(isEpisodeTransition({ isEpisode: true }, { isEpisode: false })).toBe(
      true,
    );
    expect(isEpisodeTransition({}, { isEpisode: true })).toBe(true);
    expect(isEpisodeTransition({}, {})).toBe(false);
    expect(isEpisodeTransition(null, null)).toBe(false);
  });
});

describe("playEpisode", () => {
  it("queues the episode alone with the show as its source", async () => {
    const playTracks = vi.fn(() => Promise.resolve());
    const player = { ...createStudioPlayerTestValue(null), playTracks };
    await playEpisode(player, episode, source, 750);
    expect(playTracks).toHaveBeenCalledWith([episode], "e1", source, 750);
  });

  it("seeks on the episode already loaded and plays it", async () => {
    const seek = vi.fn();
    const togglePlay = vi.fn();
    const playTracks = vi.fn(() => Promise.resolve());
    const player = {
      ...createStudioPlayerTestValue(null),
      isCurrentTrack: (trackId: string) => trackId === "e1",
      status: "paused" as const,
      seek,
      togglePlay,
      playTracks,
    };
    await playEpisode(player, episode, source, 120);
    expect(seek).toHaveBeenCalledWith(120);
    expect(togglePlay).toHaveBeenCalledTimes(1);
    expect(playTracks).not.toHaveBeenCalled();
  });

  it("passes a 0:00 start through for an episode that is not loaded", async () => {
    const playTracks = vi.fn(() => Promise.resolve());
    const player = { ...createStudioPlayerTestValue(null), playTracks };
    await playEpisode(player, episode, source, 0);
    expect(playTracks).toHaveBeenCalledWith([episode], "e1", source, 0);
  });

  it("marks a 0:00 start on the loaded episode so a waiting resume gives way", async () => {
    const seek = vi.fn();
    const player = {
      ...createStudioPlayerTestValue(loadedEpisode),
      status: "paused" as const,
      seek,
    };
    await playEpisode(player, episode, source, 0);
    expect(seek).toHaveBeenCalledWith(0);
    expect(hasExplicitStart("q-e1")).toBe(true);
  });

  it("leaves the loaded episode unmarked on a plain Play", async () => {
    const player = {
      ...createStudioPlayerTestValue(loadedEpisode),
      status: "paused" as const,
    };
    await playEpisode(player, episode, source);
    expect(hasExplicitStart("q-e1")).toBe(false);
  });
});
