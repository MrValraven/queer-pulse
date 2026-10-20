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

describe("your playlists and the editor role", () => {
  const minePages = (
    items: StudioPlaylistsPage["items"],
  ): InfiniteData<StudioPlaylistsPage, string | null> => ({
    pages: [{ items, nextCursor: null }],
    pageParams: [null],
  });
  const mineOf = (queryClient: QueryClient) =>
    queryClient.getQueryData<InfiniteData<StudioPlaylistsPage, string | null>>(
      studioKeys.myPlaylists(false),
    );

  it("puts an edited playlist at the top of your playlists", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(studioKeys.myPlaylists(false), minePages([]));
    const edited = toPlaylistView({
      ...dto,
      isOwner: false,
      role: "editor",
      editorCount: 2,
      visibility: null,
    });
    storePlaylist(queryClient, false, edited);
    const first = mineOf(queryClient)?.pages[0]?.items[0];
    expect(first?.id).toBe("playlist-1");
    expect(first?.role).toBe("editor");
    expect(first?.isCollaborative).toBe(true);
    expect(first?.hasEditRights).toBe(true);
  });

  it("keeps a listener's playlist out of your playlists", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(studioKeys.myPlaylists(false), minePages([]));
    storePlaylist(
      queryClient,
      false,
      toPlaylistView({ ...dto, isOwner: false, role: null, visibility: null }),
    );
    expect(mineOf(queryClient)?.pages[0]?.items).toEqual([]);
  });

  it("drops a listener's card that sits in your playlists", () => {
    const queryClient = new QueryClient();
    const listened = toPlaylistView({
      ...dto,
      isOwner: false,
      role: null,
      visibility: null,
    });
    queryClient.setQueryData(
      studioKeys.myPlaylists(false),
      minePages([
        { ...playlist, id: "older", name: "Older" },
        { ...listened, name: "Night bus before" },
      ]),
    );
    storePlaylist(queryClient, false, listened);
    expect(mineOf(queryClient)?.pages[0]?.items.map((item) => item.id)).toEqual(
      ["older"],
    );
  });

  it("puts an invited playlist in your playlists and keeps it there", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(
      studioKeys.myPlaylists(false),
      minePages([{ ...playlist, id: "older", name: "Older" }]),
    );
    const invited = toPlaylistView({
      ...dto,
      isOwner: false,
      role: "invitee",
      visibility: null,
    });
    storePlaylist(queryClient, false, invited);
    storePlaylist(queryClient, false, { ...invited, name: "Night bus home" });
    const items = mineOf(queryClient)?.pages[0]?.items;
    expect(items?.map((item) => [item.id, item.name])).toEqual([
      ["playlist-1", "Night bus home"],
      ["older", "Older"],
    ]);
    expect(items?.[0]?.role).toBe("invitee");
    expect(items?.[0]?.hasEditRights).toBe(false);
  });
});
