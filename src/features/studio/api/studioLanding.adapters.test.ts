import { describe, expect, it } from "vitest";
import { toStudioLandingView } from "./studioLanding.adapters";
import type {
  StudioLandingArtistCardDTO,
  StudioLandingDTO,
  StudioLandingNextEventDTO,
  StudioLandingPreviewCardDTO,
} from "./studioLanding.types";

function persona(handle: string, kind = "musician") {
  return { name: `Persona ${handle || "none"}`, handle, kind, avatarUrl: null };
}

function card(
  id: string,
  handle = id,
  kind = "musician",
): StudioLandingArtistCardDTO {
  return {
    id,
    artist: persona(handle, kind),
    quote: null,
    isFoundingArtist: false,
  };
}

function preview(id: string): StudioLandingPreviewCardDTO {
  return {
    id,
    trackTitle: `Track ${id}`,
    durationSeconds: 200,
    coverUrl: null,
    artist: persona(id),
  };
}

const EVENT: StudioLandingNextEventDTO = {
  slug: "queer-karaoke-night",
  title: "Queer Karaoke Night",
  startAt: "2026-11-06T22:00:00.000Z",
  timezone: "Europe/Lisbon",
  area: "Bairro Alto",
  isOnline: false,
  artist: persona("nightform"),
};

const BASE: StudioLandingDTO = {
  counts: { artists: 14, releases: 37, eventsThisMonth: 6 },
  nextEvent: null,
  previews: [],
  artists: [],
  photos: { hero: null, manifesto: null },
};

const sevenPreviews = ["a", "b", "c", "d", "e", "f", "g"].map(preview);
const eightCards = ["a", "b", "c", "d", "e", "f", "g", "h"].map((id) =>
  card(id),
);

describe("toStudioLandingView", () => {
  it("fails closed on a count under 5 and hides the strip without an artist count", () => {
    const view = toStudioLandingView({
      ...BASE,
      counts: { artists: 4, releases: 12, eventsThisMonth: 3 },
    });
    expect(view.counts).toEqual({
      artists: null,
      releases: 12,
      eventsThisMonth: null,
    });
    expect(view.isProofShown).toBe(false);
  });

  it("reads a count that is not a whole number as null", () => {
    const view = toStudioLandingView({
      ...BASE,
      counts: { artists: 7.5, releases: null, eventsThisMonth: 5 },
    });
    expect(view.counts).toEqual({
      artists: null,
      releases: null,
      eventsThisMonth: 5,
    });
  });

  it("shows the strip when the artist count is 5 or more", () => {
    expect(toStudioLandingView(BASE).isProofShown).toBe(true);
  });

  it("caps previews at 5 and cards at 6, and shows the cards from 2", () => {
    const view = toStudioLandingView({
      ...BASE,
      previews: sevenPreviews,
      artists: [card("a")],
    });
    expect(view.previews).toHaveLength(5);
    expect(view.isArtistsShown).toBe(false);
    const full = toStudioLandingView({ ...BASE, artists: eightCards });
    expect(full.artists).toHaveLength(6);
    expect(full.isArtistsShown).toBe(true);
  });

  it("links a persona only when it has a handle, and carries no city", () => {
    const view = toStudioLandingView({
      ...BASE,
      artists: [card("a", "lua"), card("b", "")],
    });
    expect(view.artists[0]?.artist.personaHref).toBe("/p/lua");
    expect(view.artists[1]?.artist.personaHref).toBeNull();
    expect(Object.keys(view.artists[0]?.artist ?? {})).not.toContain("city");
  });

  it("keeps a null avatar null and gives it initials and a tint", () => {
    const persona = toStudioLandingView({
      ...BASE,
      artists: [card("a"), card("b")],
    }).artists[0]!.artist;
    expect(persona.avatarUrl).toBeNull();
    expect(persona.initials).toMatch(/\S/);
    expect(["coral", "plum", "jade"]).toContain(persona.tint);
  });

  it("reads a known kind as its label key and an unknown kind as no kind line", () => {
    const view = toStudioLandingView({
      ...BASE,
      artists: [card("a", "x", "theremin"), card("b", "y", "dj")],
    });
    expect(view.artists[0]?.artist.kindLabelKey).toBeNull();
    expect(view.artists[1]?.artist.kindLabelKey).toBe("studio:kind.dj");
  });

  it("reads a blank quote as no quote and keeps the founding flag", () => {
    const view = toStudioLandingView({
      ...BASE,
      artists: [
        { ...card("a"), quote: "   ", isFoundingArtist: true },
        { ...card("b"), quote: "loud and warm" },
      ],
    });
    expect(view.artists[0]).toMatchObject({
      quote: null,
      isFoundingArtist: true,
    });
    expect(view.artists[1]?.quote).toBe("loud and warm");
  });

  it("gives each preview a cover tint from its id and keeps a null cover null", () => {
    const [first] = toStudioLandingView({
      ...BASE,
      previews: [preview("p1")],
    }).previews;
    expect(first?.coverUrl).toBeNull();
    expect(["coral", "plum", "jade"]).toContain(first?.coverTint);
  });

  it("keeps a next event whose start parses", () => {
    const view = toStudioLandingView({ ...BASE, nextEvent: EVENT });
    expect(view.nextEvent?.startAt.toISOString()).toBe(EVENT.startAt);
    expect(view.nextEvent?.artist.personaHref).toBe("/p/nightform");
  });

  it("drops a next event whose start does not parse", () => {
    expect(
      toStudioLandingView({
        ...BASE,
        nextEvent: { ...EVENT, startAt: "soon" },
      }).nextEvent,
    ).toBeNull();
  });

  it("passes a photo through and reads a missing credit as null", () => {
    const view = toStudioLandingView({
      ...BASE,
      photos: {
        hero: {
          url: "/p.jpg",
          altText: { en: "On stage", pt: "No palco" },
          credit: " ",
        },
        manifesto: null,
      },
    });
    expect(view.photos.hero).toEqual({
      url: "/p.jpg",
      altText: { en: "On stage", pt: "No palco" },
      credit: null,
    });
    expect(view.photos.manifesto).toBeNull();
  });
});
