import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { studioErrorCodeOf } from "./studio.api";
import { DEMO_ARTISTS, DEMO_RELEASES } from "./studioDemo.data";
import { DEMO_DRAFT_EPISODE_ID } from "./studioDemoFormats.data";
import { DEMO_DEFAULT_PLAYLIST_ID } from "../studioCollection.data";
import {
  demoAddPlaylistTracks,
  demoArtistPlaylistCards,
  demoCreatePlaylist,
  demoDeletePlaylist,
  demoMyPlaylistsPage,
  demoRemovePlaylistEntry,
  demoReorderPlaylist,
  demoSearchPlaylistCards,
  demoStudioPlaylist,
  demoTrackPlaylists,
  demoUpdatePlaylist,
  resetDemoPlaylists,
} from "./studioDemoPlaylists";

beforeEach(() => resetDemoPlaylists());

describe("demo playlist store", () => {
  it("lists the playlists the viewer owns, edits or is invited to, newest updated first", () => {
    const page = demoMyPlaylistsPage(null);
    expect(
      page.items.every(
        (card) =>
          card.role === "owner" ||
          card.role === "editor" ||
          card.role === "invitee",
      ),
    ).toBe(true);
    const ids = page.items.map((card) => card.id);
    expect(ids).toContain("demo-playlist-tour-diary");
    expect(ids).toContain("demo-playlist-pride-warm-up");
    const prideCard = page.items.find(
      (card) => card.id === "demo-playlist-pride-warm-up",
    );
    expect(prideCard?.role).toBe("invitee");
    const updated = page.items.map((card) => card.updatedAt);
    expect([...updated].sort().reverse()).toEqual(updated);
  });

  it("shows the owner an unavailable entry and nobody else", () => {
    const kitchen = demoStudioPlaylist("demo-playlist-kitchen-tapes");
    const unavailable = kitchen.entries.filter((entry) => !entry.isAvailable);
    expect(unavailable).toHaveLength(1);
    expect(unavailable[0]?.track).toBeNull();
    expect(unavailable[0]?.unavailableReason).toBe("withdrawn");
    expect(kitchen.entries.map((entry) => entry.position)).toEqual([
      1, 2, 3, 4, 5,
    ]);
    const groupChat = demoStudioPlaylist("demo-playlist-for-the-group-chat");
    const gone = groupChat.entries.filter((entry) => !entry.isAvailable);
    expect(gone).toHaveLength(1);
    expect(gone[0]?.unavailableReason).toBeUndefined();
    const standards = demoStudioPlaylist(DEMO_DEFAULT_PLAYLIST_ID);
    expect(standards.isOwner).toBe(false);
    expect(standards.visibility).toBeNull();
    expect(standards.entries.every((entry) => entry.isAvailable)).toBe(true);
  });

  it("creates, renames and deletes a playlist", () => {
    const created = demoCreatePlaylist({
      name: "  Night bus  ",
      visibility: "private",
    });
    expect(created.name).toBe("Night bus");
    expect(created.credit.member?.displayName).toBe("Tiago Costa");
    const renamed = demoUpdatePlaylist(created.id, {
      name: "Night bus home",
      visibility: "public",
    });
    expect(renamed.name).toBe("Night bus home");
    expect(renamed.visibility).toBe("public");
    demoDeletePlaylist(created.id);
    expect(() => demoStudioPlaylist(created.id)).toThrow(ApiError);
  });

  it("skips tracks already present and appends the rest in order", () => {
    const before = demoStudioPlaylist("demo-playlist-for-the-group-chat");
    const after = demoAddPlaylistTracks("demo-playlist-for-the-group-chat", [
      "demo-track-home-2-01",
      "demo-track-cidade-dos-santos-01",
    ]);
    expect(after.entries).toHaveLength(before.entries.length + 1);
    expect(after.entries.at(-1)?.track?.id).toBe(
      "demo-track-cidade-dos-santos-01",
    );
  });

  it("refuses an unknown or audio-less track with 422 and changes nothing", () => {
    const before = demoStudioPlaylist("demo-playlist-for-the-group-chat");
    const track = DEMO_RELEASES.flatMap((release) => release.tracks).find(
      (candidate) => candidate.id === "demo-track-cidade-dos-santos-01",
    );
    if (!track) throw new Error("fixture has no such track");
    track.hasAudio = false;
    try {
      for (const trackId of ["demo-track-nope", track.id]) {
        try {
          demoAddPlaylistTracks("demo-playlist-for-the-group-chat", [trackId]);
          throw new Error("expected a refusal");
        } catch (error) {
          expect(studioErrorCodeOf(error)).toBe(
            "studio_playlist_track_unavailable",
          );
        }
      }
    } finally {
      track.hasAudio = true;
    }
    expect(
      demoStudioPlaylist("demo-playlist-for-the-group-chat").updatedAt,
    ).toBe(before.updatedAt);
  });

  it("leaves updatedAt alone when every track is already present", () => {
    const before = demoStudioPlaylist("demo-playlist-for-the-group-chat");
    const presentId = before.entries[0]?.track?.id;
    if (!presentId) throw new Error("fixture playlist is empty");
    const after = demoAddPlaylistTracks("demo-playlist-for-the-group-chat", [
      presentId,
    ]);
    expect(after.updatedAt).toBe(before.updatedAt);
    expect(after.entries).toHaveLength(before.entries.length);
  });

  it("keeps a playlist with an unresolvable persona credit private to its owner", () => {
    const index = DEMO_ARTISTS.findIndex(
      (artist) => artist.id === "demo-persona-mariana-sol",
    );
    const [removed] = DEMO_ARTISTS.splice(index, 1);
    try {
      const own = demoStudioPlaylist("demo-playlist-cartas-que-voltam");
      expect(own.visibility).toBe("private");
      expect(own.credit.persona).toBeNull();
      expect(own.credit.member?.slug).toBeTruthy();
      expect(
        demoArtistPlaylistCards("demo-persona-mariana-sol").map(
          (card) => card.id,
        ),
      ).not.toContain("demo-playlist-cartas-que-voltam");
    } finally {
      if (removed) DEMO_ARTISTS.splice(index, 0, removed);
    }
  });

  it("refuses a reorder that does not name every entry once", () => {
    const playlist = demoStudioPlaylist("demo-playlist-for-the-group-chat");
    const ids = playlist.entries.map((entry) => entry.entryId);
    const reversed = demoReorderPlaylist(playlist.id, [...ids].reverse());
    expect(reversed.entries.map((entry) => entry.entryId)).toEqual(
      [...ids].reverse(),
    );
    try {
      demoReorderPlaylist(playlist.id, ids.slice(1));
      throw new Error("expected a refusal");
    } catch (error) {
      expect(studioErrorCodeOf(error)).toBe("studio_playlist_order_mismatch");
    }
  });

  it("removes an entry and renumbers the rest", () => {
    const playlist = demoStudioPlaylist("demo-playlist-kitchen-tapes");
    const first = playlist.entries[0];
    if (!first) throw new Error("fixture has no entries");
    demoRemovePlaylistEntry(playlist.id, first.entryId);
    const after = demoStudioPlaylist(playlist.id);
    expect(after.entries.map((entry) => entry.position)).toEqual([1, 2, 3, 4]);
  });

  it("refuses a listener's write with 403 owner only", () => {
    try {
      demoUpdatePlaylist(DEMO_DEFAULT_PLAYLIST_ID, { name: "Mine now" });
      throw new Error("expected a refusal");
    } catch (error) {
      expect((error as ApiError).status).toBe(403);
      expect(studioErrorCodeOf(error)).toBe("studio_playlist_owner_only");
    }
  });
});

describe("demo playlist store, editors", () => {
  it("shows an editor the unavailable entry too, with who added each one", () => {
    const tour = demoStudioPlaylist("demo-playlist-tour-diary");
    expect(tour.role).toBe("editor");
    expect(tour.isOwner).toBe(false);
    expect(tour.visibility).toBeNull();
    expect(tour.editorCount).toBe(1);
    expect(tour.entries).toHaveLength(4);
    expect(tour.entries.filter((entry) => !entry.isAvailable)).toHaveLength(1);
    expect(tour.entries[1]?.addedBy?.displayName).toBe("Tiago Costa");
  });

  it("gives an invitee the invite and no attribution", () => {
    const pride = demoStudioPlaylist("demo-playlist-pride-warm-up");
    expect(pride.role).toBe("invitee");
    expect(pride.invite?.invitedBy.displayName).toBe("Catarina Vaz");
    expect(pride.editorCount).toBeNull();
    expect(pride.entries.every((entry) => entry.addedBy === null)).toBe(true);
  });

  it("lets an editor rename and add, and stamps who added", () => {
    const renamed = demoUpdatePlaylist("demo-playlist-tour-diary", {
      name: "Tour diary 2026",
    });
    expect(renamed.name).toBe("Tour diary 2026");
    const after = demoAddPlaylistTracks("demo-playlist-tour-diary", [
      "demo-track-cidade-dos-santos-01",
    ]);
    expect(after.entries.at(-1)?.addedBy?.slug).toBe("tiago");
  });

  it("refuses an editor's visibility or credit change with 403", () => {
    for (const body of [
      { visibility: "public" as const },
      { creditSubprofileId: null },
    ]) {
      try {
        demoUpdatePlaylist("demo-playlist-tour-diary", body);
        throw new Error("expected a refusal");
      } catch (error) {
        expect(studioErrorCodeOf(error)).toBe("studio_playlist_owner_only");
      }
    }
  });

  it("asks before a credit change removes editors, then removes them", () => {
    try {
      demoUpdatePlaylist("demo-playlist-cartas-que-voltam", {
        creditSubprofileId: null,
      });
      throw new Error("expected a refusal");
    } catch (error) {
      expect(studioErrorCodeOf(error)).toBe(
        "studio_playlist_credit_change_removes_editors",
      );
      expect(
        ((error as ApiError).data as { editors: { slug: string }[] }).editors,
      ).toEqual([
        { slug: "rita", displayName: "Rita Varela", avatarUrl: null },
      ]);
    }
    const changed = demoUpdatePlaylist("demo-playlist-cartas-que-voltam", {
      creditSubprofileId: null,
      confirmEditorRemoval: true,
    });
    expect(changed.editorCount).toBe(0);
    expect(changed.credit.member?.slug).toBe("tiago");
    expect(
      changed.entries.some((entry) => entry.addedBy?.slug === "rita"),
    ).toBe(false);
  });

  it("answers a remove of an entry already gone with 404 entry not found", () => {
    try {
      demoRemovePlaylistEntry("demo-playlist-kitchen-tapes", "no-such-entry");
      throw new Error("expected a refusal");
    } catch (error) {
      expect(studioErrorCodeOf(error)).toBe("studio_playlist_entry_not_found");
    }
  });
});

describe("demo playlist store, lists and adds", () => {
  it("lists public playlists only on artist pages, track pages and search", () => {
    expect(
      demoArtistPlaylistCards("demo-persona-mariana-sol").map(
        (card) => card.id,
      ),
    ).toEqual(["demo-playlist-cartas-que-voltam"]);
    const onTrack = demoTrackPlaylists("demo-track-home-2-01").items.map(
      (card) => card.id,
    );
    expect(onTrack).toContain(DEMO_DEFAULT_PLAYLIST_ID);
    expect(onTrack).not.toContain("demo-playlist-for-the-group-chat");
    expect(demoSearchPlaylistCards("kitchen")).toEqual([]);
    expect(demoSearchPlaylistCards("dyke bar").map((card) => card.id)).toEqual([
      DEMO_DEFAULT_PLAYLIST_ID,
    ]);
  });

  it("lists a track without audio but does not count it", () => {
    const track = DEMO_RELEASES.flatMap((release) => release.tracks).find(
      (candidate) => candidate.id === "demo-track-home-4-01",
    );
    if (!track) throw new Error("fixture has no such track");
    const before = demoStudioPlaylist("demo-playlist-for-the-group-chat");
    track.hasAudio = false;
    try {
      const after = demoStudioPlaylist("demo-playlist-for-the-group-chat");
      expect(after.entries).toHaveLength(before.entries.length);
      expect(after.trackCount).toBe(before.trackCount - 1);
      expect(after.totalDurationSeconds).toBe(
        before.totalDurationSeconds - (track.durationSeconds ?? 0),
      );
    } finally {
      track.hasAudio = true;
    }
  });

  it("refuses an over-long name with a 400", () => {
    try {
      demoCreatePlaylist({ name: "x".repeat(81), visibility: "private" });
      throw new Error("expected a refusal");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
    }
  });
});

describe("demo playlist store, format tracks", () => {
  it("adds a published episode to a playlist", () => {
    const after = demoAddPlaylistTracks("demo-playlist-for-the-group-chat", [
      "demo-episode-late-bloomers-01",
    ]);
    expect(after.entries.at(-1)?.track?.id).toBe(
      "demo-episode-late-bloomers-01",
    );
    expect(after.entries.at(-1)?.isAvailable).toBe(true);
  });

  it("refuses a draft episode with 422 and changes nothing", () => {
    const before = demoStudioPlaylist("demo-playlist-for-the-group-chat");
    try {
      demoAddPlaylistTracks("demo-playlist-for-the-group-chat", [
        DEMO_DRAFT_EPISODE_ID,
      ]);
      throw new Error("expected a refusal");
    } catch (error) {
      expect(studioErrorCodeOf(error)).toBe(
        "studio_playlist_track_unavailable",
      );
    }
    expect(
      demoStudioPlaylist("demo-playlist-for-the-group-chat").entries,
    ).toHaveLength(before.entries.length);
  });
});
