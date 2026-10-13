import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  DEMO_PAGE_SIZE,
  demoStudioArtist,
  demoStudioGenres,
  demoStudioRelease,
  demoStudioReleasesPage,
  demoStudioSearch,
  demoStudioTrack,
} from "./studioDemoApi";
import {
  DEMO_DEFAULT_ARTIST_ID,
  DEMO_DEFAULT_RELEASE_ID,
  DEMO_DEFAULT_TRACK_ID,
} from "./studioDemoMe.data";

describe("demo studio fixture", () => {
  it("pages published releases newest first and stops on the last page", () => {
    const first = demoStudioReleasesPage(null);
    expect(first.items).toHaveLength(DEMO_PAGE_SIZE);
    expect(first.pageInfo.hasMore).toBe(true);
    const dates = first.items.map((item) => item.releasedOn ?? "");
    expect([...dates].sort().reverse()).toEqual(dates);
    const second = demoStudioReleasesPage(first.pageInfo.nextCursor);
    expect(second.pageInfo.hasMore).toBe(false);
    const ids = [...first.items, ...second.items].map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("serves the default release with every track playable in the demo", () => {
    const release = demoStudioRelease(DEMO_DEFAULT_RELEASE_ID);
    expect(release.tracks.length).toBeGreaterThan(5);
    expect(release.tracks.every((track) => track.hasAudio)).toBe(true);
    expect(release.trackCount).toBe(release.tracks.length);
  });

  it("serves the default track with credits and lyrics", () => {
    const track = demoStudioTrack(DEMO_DEFAULT_TRACK_ID);
    expect(track.credits.length).toBeGreaterThan(0);
    expect(track.lyrics).toBeTruthy();
    expect(track.lyrics).not.toMatch(/\u2014|\u2013/);
  });

  it("gives the demo owner their drafts and taken-down releases", () => {
    const artist = demoStudioArtist(DEMO_DEFAULT_ARTIST_ID);
    const statuses = artist.ownerReleases?.map((release) => release.status);
    expect(statuses).toEqual(expect.arrayContaining(["draft", "taken_down"]));
  });

  it("answers an unknown id with a 404, as live does", () => {
    expect(() => demoStudioRelease("missing")).toThrow(ApiError);
  });

  it("searches titles and artist names with accents folded", () => {
    const result = demoStudioSearch("devocao", "all");
    expect(result.releases.map((release) => release.title)).toContain(
      "Devoção",
    );
    const onlyArtists = demoStudioSearch("mariana", "artists");
    expect(onlyArtists.releases).toEqual([]);
    expect(onlyArtists.artists.map((artist) => artist.name)).toContain(
      "Mariana Sol",
    );
  });
});

describe("demo studio fixture (v2)", () => {
  it("filters the home feed and search by genre", () => {
    const fado = demoStudioReleasesPage(null, "fado");
    expect(fado.items.length).toBeGreaterThan(0);
    expect(fado.items.every((item) => item.genre === "fado")).toBe(true);
    const search = demoStudioSearch("a", "releases", "electronic");
    expect(
      search.releases.every((release) => release.genre === "electronic"),
    ).toBe(true);
  });

  it("lists genres with releases in STUDIO_GENRES order", () => {
    expect(demoStudioGenres().genres).toEqual(["fado", "electronic", "folk"]);
  });

  it("gives an artist a follower count and their public playlists", () => {
    const artist = demoStudioArtist(DEMO_DEFAULT_ARTIST_ID);
    expect(artist.followerCount).toBeGreaterThan(0);
    expect(artist.playlists.map((card) => card.name)).toContain(
      "Cartas que voltam",
    );
  });

  it("puts publishedAt and genre on every card", () => {
    const first = demoStudioReleasesPage(null).items[0];
    expect(first?.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(first?.genre).toBe("folk");
  });
});
