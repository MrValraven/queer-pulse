import { describe, expect, it } from "vitest";
import type {
  StudioLikedTrackEntryDTO,
  StudioLikedTracksPageDTO,
} from "./studio.types";
import { demoPublishedTracks } from "./studioDemoPlaylists";
import {
  likedEntryToSavedItem,
  toLikedEntryView,
  toLikedTracksPageView,
} from "./studioLiked.adapters";

const publishedTrack = () => {
  const [track] = demoPublishedTracks().values();
  if (!track) throw new Error("the demo has no published track");
  return track;
};

function availableEntry(position = 1): StudioLikedTrackEntryDTO {
  const track = publishedTrack();
  return {
    entryId: `saved-${position}`,
    position,
    addedAt: "2026-10-01T12:00:00.000Z",
    isAvailable: true,
    track,
    trackId: track.id,
    savedTitle: "The title as saved",
  };
}

const unavailableEntry = (
  overrides: Partial<StudioLikedTrackEntryDTO> = {},
): StudioLikedTrackEntryDTO => ({
  entryId: "saved-gone",
  position: 2,
  addedAt: "2026-10-01T12:00:00.000Z",
  isAvailable: false,
  track: null,
  trackId: "track-gone",
  savedTitle: "Old tape",
  ...overrides,
});

describe("Liked songs adapters", () => {
  it("titles an available like from its track and links its page", () => {
    const view = toLikedEntryView(availableEntry());
    const track = publishedTrack();
    expect(view.title).toBe(track.title);
    expect(view.savedTitle).toBe("The title as saved");
    expect(view.trackId).toBe(track.id);
    expect(view.savedId).toBe(`studio_track:${track.id}`);
    expect(view.href).toBe(`/studio/track?id=${track.id}`);
    expect(view.track?.id).toBe(track.id);
    expect(view.unavailableReason).toBeNull();
  });

  it("keeps the saved title and track id on an unavailable like", () => {
    const view = toLikedEntryView(
      unavailableEntry({ unavailableReason: "withdrawn" }),
    );
    expect(view.isAvailable).toBe(false);
    expect(view.track).toBeNull();
    expect(view.title).toBe("Old tape");
    expect(view.trackId).toBe("track-gone");
    expect(view.savedId).toBe("studio_track:track-gone");
    expect(view.unavailableReason).toBe("withdrawn");
  });

  it("orders a page by position and carries its counts and cursor", () => {
    const page: StudioLikedTracksPageDTO = {
      items: [unavailableEntry(), availableEntry(1)],
      pageInfo: { nextCursor: "next", hasMore: true },
      trackCount: 7,
      totalDurationSeconds: 1260,
    };
    const view = toLikedTracksPageView(page);
    expect(view.entries.map((entry) => entry.position)).toEqual([1, 2]);
    expect(view.nextCursor).toBe("next");
    expect(view.trackCount).toBe(7);
    expect(view.totalDurationSeconds).toBe(1260);
    expect(
      toLikedTracksPageView({
        ...page,
        pageInfo: { nextCursor: "stale", hasMore: false },
      }).nextCursor,
    ).toBeNull();
  });

  it("stores an available like as the saved list would, under its saved title", () => {
    const track = publishedTrack();
    expect(likedEntryToSavedItem(toLikedEntryView(availableEntry()))).toEqual({
      id: `studio_track:${track.id}`,
      kind: "studio_track",
      title: "The title as saved",
      href: `/studio/track?id=${track.id}`,
      meta: track.release.artist.name,
      availability: "available",
    });
  });

  it("keeps the link on a withdrawn like and drops it on any other loss", () => {
    const withdrawn = likedEntryToSavedItem(
      toLikedEntryView(unavailableEntry({ unavailableReason: "withdrawn" })),
    );
    expect(withdrawn).toEqual({
      id: "studio_track:track-gone",
      kind: "studio_track",
      title: "Old tape",
      href: "/studio/track?id=track-gone",
      availability: "unavailable",
      unavailableReason: "withdrawn",
    });
    const gone = likedEntryToSavedItem(toLikedEntryView(unavailableEntry()));
    expect(gone.href).toBeNull();
    expect(gone.unavailableReason).toBeUndefined();
    expect(gone.availability).toBe("unavailable");
  });
});
