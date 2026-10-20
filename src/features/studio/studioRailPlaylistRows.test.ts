import { beforeEach, describe, expect, it } from "vitest";
import type { SavedItem } from "../../app/providers/useSaved";
import { toPlaylistCardView } from "./api/studio.adapters";
import {
  demoMyPlaylistsPage,
  resetDemoPlaylists,
} from "./api/studioDemoPlaylists";
import { toRailPlaylistRows } from "./studioRailPlaylistRows";

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
