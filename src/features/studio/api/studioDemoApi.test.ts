import { beforeEach, describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import { studioErrorCodeOf } from "./studio.api";
import { resetDemoCreditLedger } from "./studioDemoCreditLedger";
import {
  DEMO_LYRICS,
  DEMO_RELEASES,
  DEMO_WITHDRAWN_RELEASE_ID,
} from "./studioDemo.data";
import { DEMO_MIX_RELEASE_ID } from "./studioDemoListening.data";
import {
  DEMO_PAGE_SIZE,
  demoStudioArtist,
  demoStudioGenres,
  demoStudioMoods,
  demoStudioPreview,
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
import {
  DEMO_PREVIEW_TOKEN,
  DEMO_PUBLISHED_PREVIEW_TOKEN,
  DEMO_VISITOR_PREVIEW_TOKEN,
} from "./studioDemoArtistTools";
import { demoStudioArtistStats } from "./studioDemoStats";

beforeEach(() => resetDemoCreditLedger());

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
    expect(demoStudioGenres().genres).toEqual([
      "fado",
      "electronic",
      "folk",
      "spoken-word",
    ]);
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

describe("demo withdrawn release and disputes", () => {
  it("answers 410 studio_release_withdrawn for the withdrawn release and its track", () => {
    const reads = [
      () => demoStudioRelease(DEMO_WITHDRAWN_RELEASE_ID),
      () => demoStudioTrack("demo-track-withdrawn-01"),
    ];
    for (const read of reads) {
      try {
        read();
        throw new Error("expected a 410");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(410);
        expect(studioErrorCodeOf(error)).toBe("studio_release_withdrawn");
      }
    }
  });

  it("offers the demo owner a dispute on the taken-down release", () => {
    const release = demoStudioRelease("demo-release-taken-down-bairro");
    expect(release.status).toBe("taken_down");
    expect(release.isOwner).toBe(true);
    expect(release.canDispute).toBe(true);
    expect(release.dispute).toBeNull();
  });

  it("marks a demo track explicit, so Hide explicit tracks has one to hide", () => {
    const tracks = DEMO_RELEASES.flatMap((release) => release.tracks);
    expect(tracks.filter((track) => track.isExplicit)).toHaveLength(1);
  });
});

describe("demo moods", () => {
  it("lists the moods that have releases, in list order", () => {
    expect(demoStudioMoods().moods).toEqual([
      "late-night",
      "tender",
      "melancholy",
      "slow-burn",
      "sweaty",
      "playful",
    ]);
  });

  it("filters a page by mood and combines it with a genre", () => {
    const tender = demoStudioReleasesPage(null, null, "tender");
    expect(tender.items.map((item) => item.id)).toEqual([
      "demo-release-home-1",
      "demo-release-mariana-2",
    ]);
    const fadoTender = demoStudioReleasesPage(null, "fado", "tender");
    expect(fadoTender.items.map((item) => item.id)).toEqual([
      "demo-release-mariana-2",
    ]);
  });

  it("narrows search releases by mood, as the server does", () => {
    expect(
      demoStudioSearch("kitchen", "releases", null, "tender").releases.map(
        (release) => release.id,
      ),
    ).toEqual(["demo-release-home-1"]);
    expect(
      demoStudioSearch("kitchen", "releases", null, "sweaty").releases,
    ).toEqual([]);
  });

  it("puts accepted persona credits on the default track", () => {
    const track = demoStudioTrack(DEMO_DEFAULT_TRACK_ID);
    expect(
      track.personaCredits.map((credit) => [credit.persona.name, credit.role]),
    ).toEqual([
      ["NIGHTFORM", "producer"],
      ["GRAIN", "cover-art"],
    ]);
  });
});

describe("demo studio fixture (v3)", () => {
  const MARE_ALTA = "demo-release-scheduled-mare-alta";
  const NIGHT_BUS = "demo-release-scheduled-night-bus";

  it("gives Mariana support links, an upcoming single and a scheduled owner row", () => {
    const artist = demoStudioArtist(DEMO_DEFAULT_ARTIST_ID);
    expect(artist.supportLinks?.map((link) => link.platform)).toEqual([
      "bandcamp",
      "kofi",
    ]);
    expect(artist.upcoming?.map((release) => release.id)).toEqual([MARE_ALTA]);
    const scheduled = artist.ownerReleases?.find(
      (release) => release.status === "scheduled",
    );
    expect(scheduled?.publishAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("shows NIGHTFORM's upcoming single to a visitor with its Bandcamp link", () => {
    const artist = demoStudioArtist("sp-diogo-nightform");
    expect(artist.ownerReleases).toBeNull();
    expect(artist.upcoming?.map((release) => release.id)).toEqual([NIGHT_BUS]);
    expect(artist.upcoming?.[0]?.isReminderSet).toBe(false);
    expect(artist.supportLinks?.map((link) => link.platform)).toEqual([
      "bandcamp",
    ]);
    expect(artist.releases.map((release) => release.id)).not.toContain(
      NIGHT_BUS,
    );
  });

  it("keeps scheduled releases off the home feed and out of search", () => {
    const ids: string[] = [];
    let cursor: string | null = null;
    do {
      const page = demoStudioReleasesPage(cursor);
      ids.push(...page.items.map((item) => item.id));
      cursor = page.pageInfo.nextCursor;
    } while (cursor !== null);
    expect(ids.length).toBeGreaterThan(DEMO_PAGE_SIZE);
    expect(ids).not.toContain(MARE_ALTA);
    expect(ids).not.toContain(NIGHT_BUS);
    expect(ids).not.toContain("demo-release-draft-cartas-ao-mar");
    expect(demoStudioSearch("maré alta", "releases").releases).toEqual([]);
    expect(demoStudioSearch("last stop", "tracks").tracks).toEqual([]);
  });

  it("hides a scheduled release's tracks from a non-owner and keeps the counts", () => {
    const release = demoStudioRelease(NIGHT_BUS);
    expect(release.status).toBe("scheduled");
    expect(release.isOwner).toBe(false);
    expect(release.tracks).toEqual([]);
    expect(release.trackCount).toBe(2);
    expect(release.publishAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(release.previewToken ?? null).toBeNull();
  });

  it("answers 404 for a scheduled release's track read by a non-owner", () => {
    expect(() => demoStudioTrack("demo-track-scheduled-night-bus-01")).toThrow(
      ApiError,
    );
    expect(demoStudioTrack("demo-track-scheduled-mare-alta-01").title).toBe(
      "Maré alta",
    );
  });

  it("gives the owner their scheduled release's tracks and the draft's preview link", () => {
    expect(demoStudioRelease(MARE_ALTA).tracks).toHaveLength(1);
    const draft = demoStudioRelease("demo-release-draft-cartas-ao-mar");
    expect(draft.previewToken).toBe(DEMO_PREVIEW_TOKEN);
    expect(draft.previewLinkCreatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("puts Cidade dos santos at version 2 with a Bandcamp buy link", () => {
    const release = demoStudioRelease(DEMO_DEFAULT_RELEASE_ID);
    expect(release.version).toBe(2);
    expect(release.versions?.[0]?.note).toBeTruthy();
    expect(release.buyUrl).toMatch(/^https:\/\/marianasol\.bandcamp\.com\//);
  });

  it("counts Notify me holders on the scheduled release only", () => {
    const rows = demoStudioArtistStats(DEMO_DEFAULT_ARTIST_ID).releases;
    const scheduled = rows.find((row) => row.release.id === MARE_ALTA);
    expect(scheduled?.reminders).toEqual({
      value: 12,
      isBelowThreshold: false,
    });
    const others = rows.filter((row) => row.release.id !== MARE_ALTA);
    expect(others.every((row) => row.reminders === null)).toBe(true);
  });

  it("opens the owner's own draft as the owner view, and redirects a published one", () => {
    const draft = demoStudioPreview(DEMO_PREVIEW_TOKEN);
    expect(draft.release?.isPreview).toBe(true);
    expect(draft.release?.isOwner).toBe(true);
    expect(draft.release?.tracks.length).toBe(3);
    expect(demoStudioPreview(DEMO_PUBLISHED_PREVIEW_TOKEN)).toEqual({
      release: null,
      publishedReleaseId: DEMO_DEFAULT_RELEASE_ID,
    });
  });

  it("opens another persona's scheduled release as a visitor, with its tracks", () => {
    const visitor = demoStudioPreview(DEMO_VISITOR_PREVIEW_TOKEN);
    expect(visitor.release?.isOwner).toBe(false);
    expect(visitor.release?.status).toBe("scheduled");
    expect(visitor.release?.tracks.map((track) => track.position)).toEqual([
      1, 2,
    ]);
    expect(visitor.release?.previewToken ?? null).toBeNull();
  });

  it("answers the same 404 for an unknown or malformed token", () => {
    for (const token of ["0".repeat(64), "not-a-token"]) {
      try {
        demoStudioPreview(token);
        throw new Error("expected a 404");
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(404);
        expect(studioErrorCodeOf(error)).toBe("studio_preview_not_found");
      }
    }
  });
});

describe("demo listening data", () => {
  it("times every line of the default track's lyrics", () => {
    const track = demoStudioTrack(DEMO_DEFAULT_TRACK_ID);
    const timedTexts = (track.syncedLyrics ?? [])
      .map((line) => line.text)
      .filter((text) => text.length > 0);
    const writtenLines = DEMO_LYRICS.split("\n").filter(
      (line) => line.length > 0,
    );
    expect(timedTexts).toEqual(writtenLines);
    const times = (track.syncedLyrics ?? []).map((line) => line.ms);
    expect([...times].sort((left, right) => left - right)).toEqual(times);
    expect(Math.max(...times)).toBeLessThan(
      (track.durationSeconds ?? 0) * 1000,
    );
  });

  it("gives the demo mix 6 to 10 chapters inside its duration", () => {
    const mix = demoStudioRelease(DEMO_MIX_RELEASE_ID);
    expect(mix.type).toBe("mix");
    const [mixTrack] = mix.tracks;
    const detail = demoStudioTrack(mixTrack!.id);
    const chapters = detail.chapters ?? [];
    expect(chapters.length).toBeGreaterThanOrEqual(6);
    expect(chapters.length).toBeLessThanOrEqual(10);
    expect(chapters[0]?.startSeconds).toBe(0);
    for (const chapter of chapters)
      expect(chapter.startSeconds).toBeLessThan(detail.durationSeconds ?? 0);
    expect(detail.durationSeconds).toBeGreaterThanOrEqual(3600);
  });

  it("sends owner fields on owned rows and omits them for listeners", () => {
    const owned = demoStudioRelease(DEMO_DEFAULT_RELEASE_ID);
    expect(owned.isOwner).toBe(true);
    expect(owned.tracks[0]).toHaveProperty("hasAnalysis", true);
    expect(
      owned.tracks.find(
        (track) => track.id === "demo-track-cidade-dos-santos-04",
      ),
    ).toMatchObject({
      loudnessLufs: -7.8,
      peakDb: -0.1,
    });
    const listened = demoStudioRelease(DEMO_MIX_RELEASE_ID);
    expect(listened.isOwner).toBe(false);
    expect(listened.tracks[0]).not.toHaveProperty("hasAnalysis");
    expect(listened.tracks[0]).not.toHaveProperty("chapters");
    expect(listened.tracks[0]).not.toHaveProperty("loudnessLufs");
  });
});
