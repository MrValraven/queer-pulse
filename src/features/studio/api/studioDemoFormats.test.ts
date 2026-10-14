import { describe, expect, it } from "vitest";
import {
  demoStudioArtist,
  demoStudioFormats,
  demoStudioGenres,
  demoStudioLatestEpisodes,
  demoStudioRelease,
  demoStudioReleasesPage,
  demoStudioSearch,
  demoStudioTrack,
} from "./studioDemoApi";
import { demoStudioRadio } from "./studioDemoDiscovery";
import {
  DEMO_ARTIST_VANDA_DIESEL,
  DEMO_DRAFT_EPISODE_ID,
  DEMO_SHOW_ID,
} from "./studioDemoFormats.data";
import { DEMO_ARTIST_LATE_BLOOMERS } from "./studioDemoMe.data";

describe("demo artist kinds catalogue", () => {
  it("answers every format with published content, in map order", () => {
    expect(demoStudioFormats().formats).toEqual([
      "music",
      "podcast",
      "spoken_word",
      "performance",
    ]);
  });

  it("filters releases by format", () => {
    const performance = demoStudioReleasesPage(null, null, null, "performance");
    expect(performance.items.map((card) => card.type).sort()).toEqual([
      "edit",
      "lip_sync",
    ]);
    expect(
      performance.items.every((card) => card.format === "performance"),
    ).toBe(true);
  });

  it("gives the show three published episodes and a draft its owner sees", () => {
    const show = demoStudioRelease(DEMO_SHOW_ID);
    expect(show.type).toBe("podcast");
    expect(show.isOwner).toBe(true);
    expect(show.tracks.filter((track) => !track.isDraft)).toHaveLength(3);
    expect(show.tracks.find((track) => track.isDraft)?.id).toBe(
      DEMO_DRAFT_EPISODE_ID,
    );
    expect(
      show.tracks.every((track) => (track.notesExcerpt ?? "").length > 0),
    ).toBe(true);
    expect(demoStudioTrack(show.tracks[0]?.id ?? "").notes).toContain("00:00");
  });

  it("lists the newest published episodes and never a draft", () => {
    const page = demoStudioLatestEpisodes(12);
    expect(page.items).toHaveLength(3);
    expect(page.items.every((item) => item.track.lyrics === null)).toBe(true);
    expect(page.items.map((item) => item.track.id)).not.toContain(
      DEMO_DRAFT_EPISODE_ID,
    );
    const dates = page.items.map((item) => item.track.publishedAt ?? "");
    expect([...dates].sort().reverse()).toEqual(dates);
    expect(page.nextCursor).toBeNull();
  });

  it("gives two episodes chapters and one a transcript", () => {
    const episodes = demoStudioRelease(DEMO_SHOW_ID).tracks.filter(
      (track) => !track.isDraft,
    );
    const details = episodes.map((track) => demoStudioTrack(track.id));
    expect(
      details.filter((track) => (track.chapters ?? []).length > 0),
    ).toHaveLength(2);
    expect(details.filter((track) => track.lyrics)).toHaveLength(1);
  });

  it("credits four sources on the lip-sync mix", () => {
    const vanda = demoStudioArtist(DEMO_ARTIST_VANDA_DIESEL.id);
    const lipSync = vanda.releases.find((card) => card.type === "lip_sync");
    expect(lipSync).toBeDefined();
    const release = demoStudioRelease(lipSync?.id ?? "");
    expect(demoStudioTrack(release.tracks[0]?.id ?? "").sources).toHaveLength(
      4,
    );
  });

  it("makes the demo viewer the show's owner on the artist page", () => {
    const artist = demoStudioArtist(DEMO_ARTIST_LATE_BLOOMERS.id);
    expect(artist.ownerReleases).toEqual([]);
    expect(artist.releases.map((card) => card.id)).toEqual([DEMO_SHOW_ID]);
  });

  it("finds the new artists by format in search", () => {
    const result = demoStudioSearch("a", "artists", null, null, "spoken_word");
    expect(result.artists.map((artist) => artist.kind)).toEqual(["poet"]);
  });

  it("offers the spoken word genre and keeps episodes off every radio", () => {
    expect(demoStudioGenres().genres).toContain("spoken-word");
    // The show carries no genre or mood, so no radio filter matches it; this
    // pins the spoken word station to Lua's three poems.
    const radio = demoStudioRadio({ kind: "genre", value: "spoken-word" });
    expect(radio.items.length).toBe(3);
    expect(radio.items.some((item) => item.releaseId === DEMO_SHOW_ID)).toBe(
      false,
    );
  });

  it("never finds the draft episode in search", () => {
    const result = demoStudioSearch("Our parents", "tracks");
    expect(result.tracks.map((track) => track.id)).not.toContain(
      DEMO_DRAFT_EPISODE_ID,
    );
    expect(result.tracks.every((track) => track.isDraft !== true)).toBe(true);
  });
});
