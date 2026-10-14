import { QueryClient, type InfiniteData } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { toPlaylistView } from "./studio.adapters";
import type { StudioPlaylistDTO } from "./studio.types";
import {
  movedEntryIds,
  movedEntryIdsTo,
  storePlaylist,
  withEntryOrder,
  withoutEntry,
} from "./studioPlaylistCache";
import { studioKeys } from "./studioQueryKeys";
import type { StudioPlaylistsPage } from "./useStudioMyPlaylists";

const card = {
  id: "release-1",
  title: "Cartas",
  type: "single" as const,
  coverUrl: null,
  releasedOn: null,
  trackCount: 1,
  totalDurationSeconds: 60,
  artist: {
    id: "persona-1",
    handle: "",
    name: "Mariana Sol",
    kind: "musician" as const,
    avatarUrl: null,
  },
  publishedAt: null,
  genre: null,
  mood: null,
  scene: null,
};
const track = (id: string) => ({
  id,
  position: 1,
  title: id,
  durationSeconds: 60,
  isExplicit: false,
  hasAudio: true,
  release: card,
});
const dto: StudioPlaylistDTO = {
  id: "playlist-1",
  name: "Night bus",
  credit: {
    persona: null,
    member: {
      id: "member-1",
      slug: "tiago",
      displayName: "Tiago Costa",
      avatarUrl: null,
    },
  },
  coverUrls: [],
  trackCount: 2,
  totalDurationSeconds: 120,
  updatedAt: "2026-10-10T10:00:00.000Z",
  isOwner: true,
  visibility: "private",
  description: null,
  creditSubprofileId: null,
  entries: [
    {
      entryId: "a",
      position: 1,
      addedAt: "2026-10-01T00:00:00.000Z",
      isAvailable: true,
      track: track("t-a"),
    },
    {
      entryId: "b",
      position: 2,
      addedAt: "2026-10-01T00:00:00.000Z",
      isAvailable: false,
      track: null,
    },
    {
      entryId: "c",
      position: 3,
      addedAt: "2026-10-01T00:00:00.000Z",
      isAvailable: true,
      track: track("t-c"),
    },
  ],
};
const playlist = toPlaylistView(dto);

const coveredCard = (id: string) => ({
  ...card,
  id,
  coverUrl: `https://files.example/${id}.webp`,
});
const coveredTrack = (id: string, releaseId: string) => ({
  ...track(id),
  release: coveredCard(releaseId),
});
const coveredPlaylist = toPlaylistView({
  ...dto,
  coverUrls: [
    "https://files.example/release-1.webp",
    "https://files.example/release-2.webp",
  ],
  entries: [
    {
      entryId: "a",
      position: 1,
      addedAt: "2026-10-01T00:00:00.000Z",
      isAvailable: true,
      track: coveredTrack("t-a", "release-1"),
    },
    {
      entryId: "b",
      position: 2,
      addedAt: "2026-10-01T00:00:00.000Z",
      isAvailable: true,
      track: coveredTrack("t-b", "release-2"),
    },
    {
      entryId: "c",
      position: 3,
      addedAt: "2026-10-01T00:00:00.000Z",
      isAvailable: true,
      track: coveredTrack("t-c", "release-1"),
    },
  ],
});

describe("playlist cache helpers", () => {
  it("reorders and renumbers, unavailable entries included", () => {
    const reordered = withEntryOrder(playlist, ["c", "b", "a"]);
    expect(
      reordered.entries.map((entry) => [entry.entryId, entry.position]),
    ).toEqual([
      ["c", 1],
      ["b", 2],
      ["a", 3],
    ]);
    expect(reordered.playableTracks.map((item) => item.id)).toEqual([
      "t-c",
      "t-a",
    ]);
  });

  it("removes an entry and recounts what can be played", () => {
    const without = withoutEntry(playlist, "a");
    expect(without.entries.map((entry) => entry.position)).toEqual([1, 2]);
    expect(without.trackCount).toBe(1);
    expect(without.totalDurationSeconds).toBe(60);
  });

  it("drops the cover of a release once its only entry leaves", () => {
    const without = withoutEntry(coveredPlaylist, "b");
    expect(without.coverUrls).toEqual(["https://files.example/release-1.webp"]);
  });

  it("orders the covers by the first entry of each release", () => {
    const reordered = withEntryOrder(coveredPlaylist, ["b", "a", "c"]);
    expect(reordered.coverUrls).toEqual([
      "https://files.example/release-2.webp",
      "https://files.example/release-1.webp",
    ]);
  });

  it("moves by one and refuses to leave the list", () => {
    expect(movedEntryIds(playlist.entries, "a", 1)).toEqual(["b", "a", "c"]);
    expect(movedEntryIds(playlist.entries, "a", -1)).toBeNull();
    expect(movedEntryIds(playlist.entries, "c", 1)).toBeNull();
    expect(movedEntryIdsTo(playlist.entries, "c", 0)).toEqual(["c", "a", "b"]);
    expect(movedEntryIdsTo(playlist.entries, "a", 0)).toBeNull();
  });

  it("puts a stored owner playlist first in your playlists", () => {
    const queryClient = new QueryClient();
    const mineKey = studioKeys.myPlaylists(false);
    queryClient.setQueryData<InfiniteData<StudioPlaylistsPage, string | null>>(
      mineKey,
      {
        pages: [
          {
            items: [{ ...playlist, id: "older", name: "Older" }],
            nextCursor: null,
          },
        ],
        pageParams: [null],
      },
    );
    storePlaylist(queryClient, false, { ...playlist, name: "Night bus home" });
    const pages =
      queryClient.getQueryData<
        InfiniteData<StudioPlaylistsPage, string | null>
      >(mineKey)?.pages;
    expect(pages?.[0]?.items.map((item) => item.name)).toEqual([
      "Night bus home",
      "Older",
    ]);
    expect(
      queryClient.getQueryData(studioKeys.playlist(false, "playlist-1")),
    ).toMatchObject({ name: "Night bus home" });
  });
});
