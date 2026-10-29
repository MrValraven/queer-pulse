import { describe, expect, it } from "vitest";
import {
  releaseViewFixture,
  trackFixture,
} from "../player/ui/studioPlayerTestHarness";
import { toPlaylistView } from "../api/studio.adapters";
import type { StudioPlaylistDTO } from "../api/studio.types";
import type { StudioLoadState } from "../api/studioLoadState";
import {
  playlistPlayModel,
  releasePlayModel,
  studioShareCardStatus,
  trackPlayModel,
} from "./studioShareCardModel";

const GRANTED = { hasAccess: true, isPending: false };

function loadState(overrides: Partial<StudioLoadState> = {}): StudioLoadState {
  return {
    isLoading: false,
    isError: false,
    isRetrying: false,
    isNotFound: false,
    isWithdrawn: false,
    retry: () => {},
    ...overrides,
  };
}

function playlistFixture(
  overrides: Partial<StudioPlaylistDTO> = {},
): ReturnType<typeof toPlaylistView> {
  const release = {
    id: "r1",
    title: "Salt water",
    type: "ep" as const,
    coverUrl: null,
    releasedOn: "2026-04-12",
    trackCount: 2,
    totalDurationSeconds: 400,
    artist: {
      id: "p1",
      handle: "nightform",
      name: "NIGHTFORM",
      kind: "musician" as const,
      avatarUrl: null,
    },
    genre: null,
    genres: [],
    publishedAt: "2026-04-12T10:00:00.000Z",
    mood: null,
    scene: null,
  };
  return toPlaylistView({
    id: "pl1",
    name: "Kitchen tapes",
    credit: {
      persona: null,
      member: {
        id: "m1",
        slug: "tiago",
        displayName: "Tiago",
        avatarUrl: null,
      },
    },
    coverUrls: [],
    trackCount: 2,
    totalDurationSeconds: 400,
    updatedAt: "2026-10-10T10:00:00.000Z",
    isOwner: false,
    visibility: "public",
    description: null,
    creditSubprofileId: null,
    entries: [
      {
        entryId: "e1",
        position: 1,
        addedAt: "2026-10-01T10:00:00.000Z",
        isAvailable: true,
        track: {
          id: "t1",
          position: 1,
          title: "Tide",
          durationSeconds: 200,
          isExplicit: true,
          hasAudio: true,
          release,
        },
      },
      {
        entryId: "e2",
        position: 2,
        addedAt: "2026-10-01T10:00:00.000Z",
        isAvailable: true,
        track: {
          id: "t2",
          position: 2,
          title: "Pier",
          durationSeconds: 200,
          isExplicit: false,
          hasAudio: true,
          release,
        },
      },
    ],
    ...overrides,
  });
}

describe("studioShareCardStatus", () => {
  it("waits while access is pending", () => {
    expect(
      studioShareCardStatus({ hasAccess: false, isPending: true }, null, false),
    ).toBe("loading");
  });

  it("shows the teaser without a grant, signed out included", () => {
    expect(
      studioShareCardStatus(
        { hasAccess: false, isPending: false },
        null,
        false,
      ),
    ).toBe("teaser");
  });

  it("shows data as soon as it is there, whatever a refetch says", () => {
    expect(
      studioShareCardStatus(GRANTED, loadState({ isError: true }), true),
    ).toBe("ready");
  });

  it("maps a 410 to withdrawn, a gone item to unavailable and a failed read to error", () => {
    expect(
      studioShareCardStatus(GRANTED, loadState({ isWithdrawn: true }), false),
    ).toBe("withdrawn");
    expect(
      studioShareCardStatus(GRANTED, loadState({ isNotFound: true }), false),
    ).toBe("unavailable");
    expect(
      studioShareCardStatus(GRANTED, loadState({ isError: true }), false),
    ).toBe("error");
  });

  it("reads a withheld track as unavailable", () => {
    expect(
      studioShareCardStatus(
        GRANTED,
        loadState({ isTrackWithheld: true }),
        false,
      ),
    ).toBe("unavailable");
  });

  it("is loading while the read is in flight", () => {
    expect(
      studioShareCardStatus(GRANTED, loadState({ isLoading: true }), false),
    ).toBe("loading");
  });
});

describe("play models", () => {
  it("plays a track and hides an explicit one while hide explicit is on", () => {
    expect(trackPlayModel(trackFixture(), false).playMode).toBe("playable");
    expect(
      trackPlayModel(trackFixture({ isExplicit: true }), true).playMode,
    ).toBe("hidden");
    expect(
      trackPlayModel(trackFixture({ isExplicit: true }), false).playMode,
    ).toBe("playable");
  });

  it("blocks a track without audio", () => {
    expect(
      trackPlayModel(trackFixture({ hasAudio: false }), false).playMode,
    ).toBe("blocked");
  });

  it("shows a scheduled release to a listener with no play", () => {
    const release = releaseViewFixture({
      status: "scheduled",
      publishAt: "2030-01-01T10:00:00.000Z",
    });
    expect(releasePlayModel(release, false).playMode).toBe("scheduled");
  });

  it("keeps play for the owner of a scheduled release", () => {
    const release = releaseViewFixture({
      status: "scheduled",
      publishAt: "2030-01-01T10:00:00.000Z",
      isOwner: true,
    });
    expect(releasePlayModel(release, false).playMode).not.toBe("scheduled");
  });

  it("queues only the audible tracks of a release with hidden ones", () => {
    const release = releaseViewFixture({
      tracks: [
        {
          id: "t1",
          position: 1,
          title: "Tide",
          durationSeconds: 200,
          isExplicit: true,
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
      ],
    });
    const model = releasePlayModel(release, true);
    expect(model.playMode).toBe("playable");
    expect(model.hasHiddenTrack).toBe(true);
    expect(model.queue.map((item) => item.trackId)).toEqual(["t2"]);
  });

  it("hides a release whose every audible track is explicit", () => {
    const release = releaseViewFixture({
      tracks: [
        {
          id: "t1",
          position: 1,
          title: "Tide",
          durationSeconds: 200,
          isExplicit: true,
          hasAudio: true,
        },
      ],
    });
    expect(releasePlayModel(release, true).playMode).toBe("hidden");
  });

  it("blocks a taken-down release", () => {
    expect(
      releasePlayModel(releaseViewFixture({ status: "taken_down" }), false)
        .playMode,
    ).toBe("blocked");
  });

  it("plays a playlist's audible tracks", () => {
    const model = playlistPlayModel(playlistFixture(), true);
    expect(model.queue.map((item) => item.trackId)).toEqual(["t2"]);
    expect(model.hasHiddenTrack).toBe(true);
  });

  it("blocks an empty playlist", () => {
    expect(
      playlistPlayModel(playlistFixture({ entries: [] }), false).playMode,
    ).toBe("blocked");
  });
});
