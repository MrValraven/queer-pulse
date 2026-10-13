import { describe, expect, it } from "vitest";
import type {
  StudioArtistDTO,
  StudioReleaseDTO,
  StudioTrackDTO,
} from "./studio.types";
import {
  formatTrackTime,
  lyricStanzasOf,
  tintForId,
  toArtistView,
  toReleaseView,
  toTrackView,
} from "./studio.adapters";

const artist = {
  id: "persona-1",
  handle: "nightform",
  name: "NIGHTFORM",
  kind: "musician" as const,
  avatarUrl: null,
};

const releaseDto: StudioReleaseDTO = {
  id: "release-1",
  title: "Salt water",
  type: "ep",
  coverUrl: "https://files.example/cover.webp",
  releasedOn: "2026-04-12",
  trackCount: 2,
  totalDurationSeconds: 400,
  artist,
  description: "Two songs from one night",
  genre: "folk",
  status: "published",
  publishedAt: "2026-04-12T10:00:00.000Z",
  tracks: [
    {
      id: "track-1",
      position: 1,
      title: "Tide",
      durationSeconds: 258,
      isExplicit: false,
      hasAudio: true,
    },
    {
      id: "track-2",
      position: 2,
      title: "Pier",
      durationSeconds: null,
      isExplicit: true,
      hasAudio: false,
    },
  ],
  isOwner: false,
  rightsConfirmedAt: null,
  takedownReason: null,
};

describe("formatTrackTime", () => {
  it("formats whole minutes and pads the seconds", () => {
    expect(formatTrackTime(258)).toBe("4:18");
    expect(formatTrackTime(61.9)).toBe("1:01");
    expect(formatTrackTime(0)).toBe("0:00");
  });

  it("returns null for a duration the server has not read yet", () => {
    expect(formatTrackTime(null)).toBeNull();
    expect(formatTrackTime(Number.NaN)).toBeNull();
    expect(formatTrackTime(-3)).toBeNull();
  });
});

describe("toReleaseView", () => {
  it("links the release, its tracks and its artist by id", () => {
    const view = toReleaseView(releaseDto);
    expect(view.href).toBe("/studio/album?id=release-1");
    expect(view.tracks[0]?.href).toBe("/studio/track?id=track-1");
    expect(view.artist.href).toBe("/studio/artist?id=persona-1");
    expect(view.artist.personaHref).toBe("/p/nightform");
    expect(view.releaseYear).toBe("2026");
  });

  it("counts only tracks with confirmed audio as playable", () => {
    const view = toReleaseView(releaseDto);
    expect(view.playableTrackCount).toBe(1);
    expect(view.tracks[1]?.durationLabel).toBeNull();
  });

  it("resolves label keys from full maps", () => {
    const view = toReleaseView(releaseDto);
    expect(view.typeLabelKey).toBe("studio:releaseType.ep");
    expect(view.genreLabelKey).toBe("studio:upload.metadata.genre.folk");
    expect(view.statusLabelKey).toBe("studio:releaseStatus.published");
    expect(view.artist.kindLabelKey).toBe("studio:kind.musician");
  });

  it("leaves the persona link out for a persona without a handle", () => {
    const view = toReleaseView({
      ...releaseDto,
      artist: { ...artist, handle: "" },
    });
    expect(view.artist.personaHref).toBeNull();
  });
});

describe("toArtistView", () => {
  it("files singles apart from albums, EPs and mixes", () => {
    const card = (id: string, type: StudioReleaseDTO["type"]) => ({
      ...releaseDto,
      id,
      type,
    });
    const dto: StudioArtistDTO = {
      artist: { ...artist, bio: "Songs for the night bus", city: "Lisbon" },
      releases: [card("a", "album"), card("s", "single"), card("m", "mix")],
      ownerReleases: null,
    };
    const view = toArtistView(dto);
    expect(view.releases.map((release) => release.id)).toEqual(["a", "m"]);
    expect(view.singles.map((release) => release.id)).toEqual(["s"]);
    expect(view.ownerReleases).toBeNull();
    expect(view.artist.city).toBe("Lisbon");
  });
});

describe("toTrackView and lyricStanzasOf", () => {
  it("splits lyrics into stanzas on blank lines and keeps each line as written", () => {
    expect(lyricStanzasOf("one\ntwo\n\n\nthree\r\nfour")).toEqual([
      ["one", "two"],
      ["three", "four"],
    ]);
    expect(lyricStanzasOf(null)).toEqual([]);
    expect(lyricStanzasOf("\n\n")).toEqual([]);
  });

  it("carries credits in order and links back to the release", () => {
    const dto: StudioTrackDTO = {
      ...releaseDto.tracks[0]!,
      releaseId: "release-1",
      credits: [
        { name: "NIGHTFORM", role: "voice" },
        { name: "Ana", role: "cello" },
      ],
      lyrics: "line",
      release: releaseDto,
    };
    const view = toTrackView(dto);
    expect(view.credits.map((credit) => credit.name)).toEqual([
      "NIGHTFORM",
      "Ana",
    ]);
    expect(view.release.href).toBe("/studio/album?id=release-1");
    expect(view.savedId).toBe("studio_track:track-1");
  });
});

describe("tintForId", () => {
  it("is stable for the same id", () => {
    expect(tintForId("release-1")).toBe(tintForId("release-1"));
  });
});
