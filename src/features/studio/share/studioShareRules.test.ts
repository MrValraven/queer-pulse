import { describe, expect, it } from "vitest";
import {
  releaseViewFixture,
  trackFixture,
} from "../player/ui/studioPlayerTestHarness";
import { toArtistRefView, toPlaylistView } from "../api/studio.adapters";
import type { StudioPlaylistDTO } from "../api/studio.types";
import { studioShareRulesOf } from "./studioShareRules";

const NIGHTFORM = toArtistRefView({
  id: "p1",
  handle: "nightform",
  name: "NIGHTFORM",
  kind: "musician",
  avatarUrl: null,
});

/** An owned persona as the access answer lists it. */
function personaRef(id: string, name: string) {
  return toArtistRefView({
    id,
    handle: name.toLowerCase().replace(/ /g, "-"),
    name,
    kind: "musician",
    avatarUrl: null,
  });
}

function personaPlaylist(
  overrides: Partial<StudioPlaylistDTO>,
): ReturnType<typeof toPlaylistView> {
  return toPlaylistView({
    id: "pl1",
    name: "Kitchen tapes",
    credit: {
      persona: {
        id: "p1",
        handle: "nightform",
        name: "NIGHTFORM",
        kind: "musician",
        avatarUrl: null,
      },
      member: null,
    },
    coverUrls: [],
    trackCount: 0,
    totalDurationSeconds: 0,
    updatedAt: "2026-10-10T10:00:00.000Z",
    isOwner: true,
    visibility: "connections",
    description: null,
    creditSubprofileId: "p1",
    entries: [],
    ...overrides,
  });
}

describe("studioShareRulesOf", () => {
  it("keeps the owner of a persona-credited Connections playlist from sending it", () => {
    expect(
      studioShareRulesOf("playlist", { playlist: personaPlaylist({}) }, []),
    ).toEqual({ canSendToOthers: false, ownPersonaName: null });
  });

  it("lets anyone else send that playlist", () => {
    expect(
      studioShareRulesOf(
        "playlist",
        { playlist: personaPlaylist({ isOwner: false }) },
        [],
      ).canSendToOthers,
    ).toBe(true);
  });

  it("lets the owner send a public persona playlist", () => {
    expect(
      studioShareRulesOf(
        "playlist",
        { playlist: personaPlaylist({ visibility: "public" }) },
        [],
      ).canSendToOthers,
    ).toBe(true);
  });

  it("holds Send in a message while the playlist is still loading", () => {
    expect(studioShareRulesOf("playlist", {}, []).canSendToOthers).toBe(false);
  });

  it("names the owner's persona on their own release and track", () => {
    expect(
      studioShareRulesOf("release", { release: releaseViewFixture() }, [
        NIGHTFORM,
      ]),
    ).toEqual({ canSendToOthers: true, ownPersonaName: "NIGHTFORM" });
    expect(
      studioShareRulesOf("track", { track: trackFixture() }, [NIGHTFORM])
        .ownPersonaName,
    ).toBe("NIGHTFORM");
  });

  it("names nobody for someone else's release", () => {
    expect(
      studioShareRulesOf("release", { release: releaseViewFixture() }, []),
    ).toEqual({ canSendToOthers: true, ownPersonaName: null });
  });

  it("names the owned persona behind a milestone and lets it be sent", () => {
    expect(
      studioShareRulesOf("milestone", { milestoneArtistId: "p1" }, [
        personaRef("p1", "Mariana Sol"),
      ]),
    ).toEqual({ canSendToOthers: true, ownPersonaName: "Mariana Sol" });
    expect(
      studioShareRulesOf("milestone", { milestoneArtistId: "p9" }, [
        personaRef("p1", "Mariana Sol"),
      ]),
    ).toEqual({ canSendToOthers: true, ownPersonaName: null });
  });
});
