import { beforeEach, describe, expect, it } from "vitest";
import type { SavedItem } from "../../app/providers/useSaved";
import { toPlaylistCardView } from "./api/studio.adapters";
import {
  demoMyPlaylistsPage,
  resetDemoPlaylists,
} from "./api/studioDemoPlaylists";
import {
  RAIL_PLAYLIST_SORT_ACCESSORS,
  railPlaylistFilterText,
  toRailPlaylistRows,
  toRailReleaseRows,
} from "./studioRailPlaylistRows";

function demoOwnPlaylists() {
  return demoMyPlaylistsPage(null).items.map(toPlaylistCardView);
}

/** The demo playlists the rail lists: every one bar the pending invites. */
function demoRailPlaylists() {
  return demoOwnPlaylists().filter((playlist) => playlist.role !== "invitee");
}

function savedPlaylist(overrides: Partial<SavedItem> & { id: string }) {
  return {
    kind: "studio_playlist",
    title: "Saved one",
    href: `/studio/collection?id=${overrides.id.split(":")[1]}`,
    availability: "available",
    ...overrides,
  } as SavedItem;
}

function savedRelease(overrides: Partial<SavedItem> & { id: string }) {
  return {
    kind: "studio_release",
    title: "Liked one",
    href: `/studio/album?id=${overrides.id.split(":")[1]}`,
    availability: "available",
    ...overrides,
  } as SavedItem;
}

beforeEach(() => {
  resetDemoPlaylists();
});

describe("toRailPlaylistRows", () => {
  it("keeps the member's own playlists in their input order, first", () => {
    const railPlaylists = demoRailPlaylists();
    const rows = toRailPlaylistRows(demoOwnPlaylists(), [
      savedPlaylist({ id: "studio_playlist:someone-elses" }),
    ]);
    expect(rows.map((row) => row.playlistId)).toEqual([
      ...railPlaylists.map((playlist) => playlist.id),
      "someone-elses",
    ]);
    expect(rows[0]).toMatchObject({
      key: railPlaylists[0]!.savedId,
      ownerName: railPlaylists[0]!.credit.name,
      isCollaborative: railPlaylists[0]!.isCollaborative,
      isSaved: false,
    });
  });

  it("leaves a pending playlist invite out of the rail", () => {
    const ownPlaylists = demoOwnPlaylists();
    const invite = ownPlaylists.find(
      (playlist) => playlist.id === "demo-playlist-pride-warm-up",
    );
    expect(invite?.role).toBe("invitee");
    const rows = toRailPlaylistRows(ownPlaylists, []);
    expect(rows.map((row) => row.playlistId)).not.toContain(
      "demo-playlist-pride-warm-up",
    );
    expect(rows).toHaveLength(demoRailPlaylists().length);
  });

  it("drops a save that is already one of the member's own playlists", () => {
    const railPlaylists = demoRailPlaylists();
    const rows = toRailPlaylistRows(demoOwnPlaylists(), [
      savedPlaylist({ id: railPlaylists[0]!.savedId }),
    ]);
    expect(rows).toHaveLength(railPlaylists.length);
    expect(rows.filter((row) => row.isSaved)).toEqual([]);
  });

  it("drops a withdrawn save even though it keeps its href", () => {
    const rows = toRailPlaylistRows(
      [],
      [
        savedPlaylist({
          id: "studio_playlist:withdrawn",
          availability: "unavailable",
          unavailableReason: "withdrawn",
        }),
        savedPlaylist({ id: "studio_playlist:kept" }),
      ],
    );
    expect(rows.map((row) => row.playlistId)).toEqual(["kept"]);
  });

  it("drops an available save that has no href", () => {
    const rows = toRailPlaylistRows(
      [],
      [
        savedPlaylist({ id: "studio_playlist:linkless", href: null }),
        savedPlaylist({ id: "studio_playlist:kept" }),
      ],
    );
    expect(rows.map((row) => row.playlistId)).toEqual(["kept"]);
  });

  it("gives a save without meta a null owner name", () => {
    const [row] = toRailPlaylistRows(
      [],
      [savedPlaylist({ id: "studio_playlist:bare" })],
    );
    expect(row).toMatchObject({ ownerName: null, isSaved: true });
  });

  it("parses the playlist id from the saved id and keeps meta as the owner", () => {
    const [row] = toRailPlaylistRows(
      [],
      [
        savedPlaylist({
          id: "studio_playlist:demo-playlist-dyke-bar-standards",
          title: "Lisbon dyke-bar standards",
          meta: "Sara Marques",
        }),
      ],
    );
    expect(row).toMatchObject({
      key: "studio_playlist:demo-playlist-dyke-bar-standards",
      playlistId: "demo-playlist-dyke-bar-standards",
      name: "Lisbon dyke-bar standards",
      href: "/studio/collection?id=demo-playlist-dyke-bar-standards",
      ownerName: "Sara Marques",
    });
  });
});

describe("toRailReleaseRows", () => {
  it("turns a liked release into a release row with its own id", () => {
    const [row] = toRailReleaseRows([
      savedRelease({
        id: "studio_release:demo-release-cidade-dos-santos",
        title: "Cidade dos santos",
        meta: "Mariana Sol",
        coverUrl: "https://example.test/cover.jpg",
      }),
    ]);
    expect(row).toMatchObject({
      kind: "release",
      key: "studio_release:demo-release-cidade-dos-santos",
      releaseId: "demo-release-cidade-dos-santos",
      name: "Cidade dos santos",
      href: "/studio/album?id=demo-release-cidade-dos-santos",
      artistLine: "Mariana Sol",
      coverUrl: "https://example.test/cover.jpg",
    });
    expect(row).not.toHaveProperty("playlistId");
  });

  it("keeps saved-store order and leaves out withdrawn and linkless likes", () => {
    const rows = toRailReleaseRows([
      savedRelease({ id: "studio_release:first" }),
      savedRelease({
        id: "studio_release:withdrawn",
        availability: "unavailable",
        unavailableReason: "withdrawn",
      }),
      savedRelease({ id: "studio_release:linkless", href: null }),
      savedRelease({ id: "studio_release:second" }),
    ]);
    expect(rows.map((row) => row.releaseId)).toEqual(["first", "second"]);
  });

  it("gives a like without meta or cover a null artist line and cover", () => {
    const [row] = toRailReleaseRows([
      savedRelease({ id: "studio_release:bare" }),
    ]);
    expect(row).toMatchObject({ artistLine: null, coverUrl: null });
  });

  it("filters and sorts a release row by its name and artist", () => {
    const [row] = toRailReleaseRows([
      savedRelease({
        id: "studio_release:demo-release-home-2",
        title: "Bicha, with love",
        meta: "LeChatDashinko",
      }),
    ]);
    expect(railPlaylistFilterText(row!)).toBe(
      "Bicha, with love LeChatDashinko",
    );
    expect(RAIL_PLAYLIST_SORT_ACCESSORS.title(row!)).toBe("Bicha, with love");
    expect(RAIL_PLAYLIST_SORT_ACCESSORS.artist(row!)).toBe("LeChatDashinko");
  });

  it("marks playlist rows with the playlist kind", () => {
    const [row] = toRailPlaylistRows(
      [],
      [savedPlaylist({ id: "studio_playlist:kept" })],
    );
    expect(row?.kind).toBe("playlist");
  });
});
