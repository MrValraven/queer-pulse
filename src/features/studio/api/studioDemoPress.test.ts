import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { DEMO_RELEASES } from "./studioDemo.data";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import {
  demoSaveStudioPressKit,
  demoStudioPressKit,
  demoSupportLinksFor,
} from "./studioDemoPress";

const EMPTY_KIT = {
  pitch: null,
  pressBio: null,
  featuredTrackIds: [],
  quotes: [],
  contact: null,
};

function refusalOf(run: () => unknown): ApiError | null {
  try {
    run();
  } catch (error) {
    if (error instanceof ApiError) return error;
    throw error;
  }
  return null;
}

describe("demo press kit", () => {
  it("gives the owner the stored fields and the chosen tracks in order", () => {
    const kit = demoStudioPressKit(DEMO_ARTIST_MARIANA.id);
    expect(kit.isOwner).toBe(true);
    expect(kit.owner?.featuredTrackIds.length).toBeGreaterThan(0);
    expect(kit.featuredTracks.map((track) => track.id)).toEqual(
      kit.owner?.featuredTrackIds,
    );
    expect(kit.isFeaturedFallback).toBe(false);
    expect(kit.releases.length).toBeGreaterThan(0);
    expect(kit.releases.length).toBeLessThanOrEqual(6);
    expect(kit.artist.city).toBeNull();
  });

  it("builds a press kit from the persona alone, with fallback tracks", () => {
    const kit = demoStudioPressKit("sp-diogo-nightform");
    expect(kit.isOwner).toBe(false);
    expect(kit.owner).toBeNull();
    expect(kit.isFeaturedFallback).toBe(true);
    expect(kit.personaHandle).toBe("nightform");
    expect(kit.featuredTracks.length).toBeGreaterThan(0);
    expect(kit.featuredTracks.length).toBeLessThanOrEqual(5);
    expect(
      kit.featuredTracks.every(
        (track) => track.release.artist.id === "sp-diogo-nightform",
      ),
    ).toBe(true);
    expect(kit.supportLinks.map((link) => link.platform)).toEqual(["bandcamp"]);
  });

  it("keeps Mariana's support links to Bandcamp and Ko-fi, in order", () => {
    expect(
      demoSupportLinksFor(DEMO_ARTIST_MARIANA.id).map((link) => link.platform),
    ).toEqual(["bandcamp", "kofi"]);
  });

  it("answers 404 for an unknown persona", () => {
    expect(refusalOf(() => demoStudioPressKit("missing"))?.status).toBe(404);
  });

  it("refuses a save on a persona the viewer does not own with a 403", () => {
    const refusal = refusalOf(() =>
      demoSaveStudioPressKit("sp-diogo-nightform", EMPTY_KIT),
    );
    expect(refusal?.status).toBe(403);
    expect(refusal?.data).toMatchObject({ code: "studio_not_persona_owner" });
    expect(demoStudioPressKit("sp-diogo-nightform").pitch).toBeNull();
  });

  it("refuses the same track picked twice", () => {
    const refusal = refusalOf(() =>
      demoSaveStudioPressKit(DEMO_ARTIST_MARIANA.id, {
        ...EMPTY_KIT,
        featuredTrackIds: [
          "demo-track-cidade-dos-santos-01",
          "demo-track-cidade-dos-santos-01",
        ],
      }),
    );
    expect(refusal?.status).toBe(400);
  });

  it("refuses a body the server validation would refuse with a 400", () => {
    const quote = { quote: "Warm", source: "Shape" };
    const bodies = [
      {
        ...EMPTY_KIT,
        featuredTrackIds: ["a", "b", "c", "d", "e", "f"],
      },
      { ...EMPTY_KIT, quotes: [quote, quote, quote, quote] },
      { ...EMPTY_KIT, pitch: "x".repeat(141) },
      { ...EMPTY_KIT, pressBio: "x".repeat(1501) },
      { ...EMPTY_KIT, quotes: [{ quote: "x".repeat(301), source: "Shape" }] },
      { ...EMPTY_KIT, quotes: [{ quote: "Warm", source: "x".repeat(81) }] },
      { ...EMPTY_KIT, contact: "http://marianasol.pt/press" },
      { ...EMPTY_KIT, contact: "marianasol.pt" },
      { ...EMPTY_KIT, quotes: [{ quote: "", source: "Shape" }] },
      { ...EMPTY_KIT, quotes: [{ quote: "   ", source: "Shape" }] },
      { ...EMPTY_KIT, quotes: [{ quote: "Warm", source: "" }] },
      { ...EMPTY_KIT, quotes: [{ quote: "Warm", source: "  " }] },
    ];
    for (const body of bodies) {
      const refusal = refusalOf(() =>
        demoSaveStudioPressKit(DEMO_ARTIST_MARIANA.id, body),
      );
      expect(refusal?.status).toBe(400);
    }
  });

  it("measures trimmed text, so a full pitch with a trailing space passes", () => {
    const saved = demoSaveStudioPressKit(DEMO_ARTIST_MARIANA.id, {
      ...EMPTY_KIT,
      pitch: `${"x".repeat(140)} `,
    });
    expect(saved.pitch).not.toBeNull();
  });

  it("refuses a featured track from another persona and saves a valid kit", () => {
    const seededRow = demoStudioPressKit(DEMO_ARTIST_MARIANA.id).owner;
    const refusal = refusalOf(() =>
      demoSaveStudioPressKit(DEMO_ARTIST_MARIANA.id, {
        ...EMPTY_KIT,
        featuredTrackIds: ["demo-track-home-1-01"],
      }),
    );
    expect(refusal?.status).toBe(422);
    expect(refusal?.data).toMatchObject({
      code: "studio_press_track_not_allowed",
    });
    const saved = demoSaveStudioPressKit(DEMO_ARTIST_MARIANA.id, {
      pitch: "Letters set to piano",
      pressBio: "",
      featuredTrackIds: [],
      quotes: [],
      contact: "https://marianasol.pt/press",
    });
    expect(saved.pitch).toBe("Letters set to piano");
    expect(saved.owner?.pressBio).toBeNull();
    expect(saved.isFeaturedFallback).toBe(true);
    // The fallback: the first five playable tracks, newest release first,
    // then in tracklist order.
    const expectedFallbackIds = DEMO_RELEASES.filter(
      (release) => release.artist.id === DEMO_ARTIST_MARIANA.id,
    )
      .flatMap((release) =>
        [...release.tracks]
          .sort((left, right) => left.position - right.position)
          .filter((track) => track.hasAudio)
          .map((track) => track.id),
      )
      .slice(0, 5);
    expect(expectedFallbackIds).toHaveLength(5);
    expect(saved.featuredTracks.map((track) => track.id)).toEqual(
      expectedFallbackIds,
    );
    expect(saved.owner?.updatedAt).not.toBeNull();
    expect(saved.owner?.updatedAt).not.toBe("2026-10-01T09:00:00.000Z");
    // Put Mariana's seeded kit back so test order never matters.
    if (seededRow)
      demoSaveStudioPressKit(DEMO_ARTIST_MARIANA.id, {
        pitch: seededRow.pitch,
        pressBio: seededRow.pressBio,
        featuredTrackIds: seededRow.featuredTrackIds,
        quotes: seededRow.quotes,
        contact: seededRow.contact,
      });
    expect(
      demoStudioPressKit(DEMO_ARTIST_MARIANA.id).owner?.featuredTrackIds,
    ).toEqual(seededRow?.featuredTrackIds);
  });
});
