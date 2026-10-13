import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  DEMO_PAGE_SIZE,
  demoStudioArtist,
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
