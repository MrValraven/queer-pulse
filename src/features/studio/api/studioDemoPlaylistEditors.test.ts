import { beforeEach, describe, expect, it } from "vitest";
import type { ApiError } from "../../../shared/api/client";
import { studioErrorCodeOf } from "./studio.api";
import {
  demoInvitePlaylistEditors,
  demoLeavePlaylist,
  demoPlaylistEditorCandidates,
  demoPlaylistEditors,
  demoRemovePlaylistEditor,
  demoRespondPlaylistInvite,
} from "./studioDemoPlaylistEditors";
import {
  demoMyPlaylistsPage,
  demoStudioPlaylist,
  resetDemoPlaylists,
} from "./studioDemoPlaylists";

beforeEach(() => resetDemoPlaylists());

const GROUP_CHAT = "demo-playlist-for-the-group-chat";
const CARTAS = "demo-playlist-cartas-que-voltam";
const TOUR = "demo-playlist-tour-diary";
const PRIDE = "demo-playlist-pride-warm-up";

function codeOf(run: () => unknown): string | null {
  try {
    run();
  } catch (error) {
    return studioErrorCodeOf(error);
  }
  throw new Error("expected a refusal");
}

describe("demo editor routes", () => {
  it("shows the owner invites and editors, and an editor the active ones", () => {
    expect(
      demoPlaylistEditors(GROUP_CHAT).items.map((row) => [
        row.member.slug,
        row.status,
      ]),
    ).toEqual([
      ["catarina-vaz", "active"],
      ["jonas", "active"],
      ["luisa", "invited"],
    ]);
    expect(
      demoPlaylistEditors(TOUR).items.map((row) => row.member.slug),
    ).toEqual(["tiago"]);
  });

  it("invites a connection and refuses anyone else with their slugs", () => {
    const after = demoInvitePlaylistEditors(GROUP_CHAT, ["anika"]);
    expect(after.items.at(-1)).toMatchObject({
      editorId: "demo-editor-demo-playlist-for-the-group-chat-anika",
      member: { slug: "anika", displayName: "Anika Kovač" },
      status: "invited",
      source: "member_invite",
    });
    try {
      // Sara Marques is no connection of the viewer in connectionSeeds.data.ts.
      demoInvitePlaylistEditors(GROUP_CHAT, ["sara-marques", "nobody-here"]);
      throw new Error("expected a refusal");
    } catch (error) {
      expect(studioErrorCodeOf(error)).toBe(
        "studio_playlist_editor_ineligible",
      );
      expect(
        ((error as ApiError).data as { memberSlugs: string[] }).memberSlugs,
      ).toEqual(["sara-marques", "nobody-here"]);
    }
  });

  it("picks a co-owner on a persona playlist as an active editor at once", () => {
    const after = demoInvitePlaylistEditors(CARTAS, ["nuno"]);
    expect(after.items.map((row) => [row.member.slug, row.status])).toEqual([
      ["rita", "active"],
      ["nuno", "active"],
    ]);
    expect(codeOf(() => demoInvitePlaylistEditors(CARTAS, ["jonas"]))).toBe(
      "studio_playlist_editor_ineligible",
    );
  });

  it("clears added by when the owner removes an editor by id", () => {
    const catarinaRow = demoPlaylistEditors(GROUP_CHAT).items.find(
      (row) => row.member.slug === "catarina-vaz",
    );
    expect(catarinaRow?.editorId).toBe(
      "demo-editor-demo-playlist-for-the-group-chat-catarina-vaz",
    );
    demoRemovePlaylistEditor(GROUP_CHAT, catarinaRow?.editorId ?? "");
    const playlist = demoStudioPlaylist(GROUP_CHAT);
    expect(playlist.editorCount).toBe(1);
    expect(
      playlist.entries.some((entry) => entry.addedBy?.slug === "catarina-vaz"),
    ).toBe(false);
    expect(
      codeOf(() =>
        demoRemovePlaylistEditor(GROUP_CHAT, catarinaRow?.editorId ?? ""),
      ),
    ).toBe("studio_playlist_editor_not_found");
  });

  it("lets an editor leave, which closes a private playlist to them", () => {
    demoLeavePlaylist(TOUR);
    expect(() => demoStudioPlaylist(TOUR)).toThrow();
    expect(
      demoMyPlaylistsPage(null).items.map((card) => card.id),
    ).not.toContain(TOUR);
    // The owner's leave is a no-op.
    demoLeavePlaylist(GROUP_CHAT);
    expect(demoStudioPlaylist(GROUP_CHAT).role).toBe("owner");
  });

  it("accepts an invite into your playlists, or declines it", () => {
    const accepted = demoRespondPlaylistInvite(PRIDE, "accept");
    expect(accepted?.role).toBe("editor");
    expect(demoMyPlaylistsPage(null).items.map((card) => card.id)).toContain(
      PRIDE,
    );
    resetDemoPlaylists();
    expect(demoRespondPlaylistInvite(PRIDE, "decline")).toBeUndefined();
    expect(() => demoStudioPlaylist(PRIDE)).toThrow();
    expect(codeOf(() => demoRespondPlaylistInvite(PRIDE, "accept"))).toBe(
      "studio_playlist_invite_not_found",
    );
  });

  it("lists a persona's co-owners, searched, and refuses a member playlist", () => {
    expect(
      demoPlaylistEditorCandidates(CARTAS, "").items.map((row) => [
        row.member.slug,
        row.isEditor,
      ]),
    ).toEqual([
      ["rita", true],
      ["nuno", false],
    ]);
    expect(
      demoPlaylistEditorCandidates(CARTAS, "nu").items.map(
        (row) => row.member.slug,
      ),
    ).toEqual(["nuno"]);
    expect(codeOf(() => demoPlaylistEditorCandidates(GROUP_CHAT, ""))).toBe(
      "studio_playlist_editor_source_mismatch",
    );
  });
});
