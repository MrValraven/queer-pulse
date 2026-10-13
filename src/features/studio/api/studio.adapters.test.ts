import { describe, expect, it } from "vitest";
import type { FollowedPersonaDTO } from "../../subprofiles/api/subprofiles.api";
import type {
  StudioArtistDTO,
  StudioPlaylistDTO,
  StudioReleaseDTO,
  StudioTrackDTO,
} from "./studio.types";
import {
  formatTrackTime,
  genreLabelKeyOf,
  isStudioGenre,
  lyricStanzasOf,
  tintForId,
  toArtistStatsView,
  toArtistView,
  toCountView,
  toFollowedArtistView,
  toGenreList,
  toPlaylistCardView,
  toPlaylistCreditView,
  toPlaylistView,
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
      followerCount: 0,
      isFollowing: false,
      playlists: [],
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

const mariana = {
  id: "persona-mariana",
  handle: "",
  name: "Mariana Sol",
  kind: "musician" as const,
  avatarUrl: null,
};

const cardDto = {
  id: "release-7",
  title: "Cartas",
  type: "single" as const,
  coverUrl: "https://files.example/cartas.webp",
  releasedOn: "2026-03-01",
  trackCount: 1,
  totalDurationSeconds: 200,
  artist: mariana,
  publishedAt: "2026-03-01T10:00:00.000Z",
  genre: "fado",
};

const playlistDto: StudioPlaylistDTO = {
  id: "playlist-1",
  name: "Kitchen tapes",
  credit: {
    persona: null,
    member: {
      id: "member-1",
      slug: "tiago",
      displayName: "Tiago Costa",
      avatarUrl: null,
    },
  },
  coverUrls: [
    "https://files.example/cartas.webp",
    "https://files.example/cartas.webp",
  ],
  trackCount: 1,
  totalDurationSeconds: 200,
  updatedAt: "2026-10-10T10:00:00.000Z",
  isOwner: true,
  visibility: "connections",
  description: null,
  creditSubprofileId: null,
  entries: [
    {
      entryId: "entry-2",
      position: 2,
      addedAt: "2026-10-02T10:00:00.000Z",
      isAvailable: false,
      track: null,
    },
    {
      entryId: "entry-1",
      position: 1,
      addedAt: "2026-10-01T10:00:00.000Z",
      isAvailable: true,
      track: {
        id: "track-7",
        position: 1,
        title: "Cartas",
        durationSeconds: 200,
        isExplicit: false,
        hasAudio: true,
        release: cardDto,
      },
    },
    {
      entryId: "entry-3",
      position: 3,
      addedAt: "2026-10-03T10:00:00.000Z",
      isAvailable: true,
      track: {
        id: "track-8",
        position: 2,
        title: "Sem som",
        durationSeconds: null,
        isExplicit: false,
        hasAudio: false,
        release: cardDto,
      },
    },
  ],
};

describe("release cards (v2)", () => {
  it("carries publishedAt and the genre label", () => {
    const artistView = toArtistView({
      artist: { ...mariana, bio: null, city: null },
      releases: [cardDto],
      ownerReleases: null,
      followerCount: 12,
      isFollowing: true,
      playlists: [],
    });
    const card = artistView.allReleases[0];
    expect(card?.publishedAt).toBe("2026-03-01T10:00:00.000Z");
    expect(card?.genreLabelKey).toBe("studio:upload.metadata.genre.fado");
    expect(genreLabelKeyOf("polka")).toBeNull();
  });

  it("keeps the server's release order for Play all and flags the owner", () => {
    const albumDto = { ...cardDto, id: "release-8", type: "album" as const };
    const view = toArtistView({
      artist: { ...mariana, bio: null, city: null },
      releases: [cardDto, albumDto],
      ownerReleases: [],
      followerCount: 3,
      isFollowing: false,
      playlists: [],
    });
    expect(view.allReleases.map((release) => release.id)).toEqual([
      "release-7",
      "release-8",
    ]);
    expect(view.singles.map((release) => release.id)).toEqual(["release-7"]);
    expect(view.isOwner).toBe(true);
    expect(view.followerCount).toBe(3);
  });
});

describe("playlists", () => {
  it("orders entries by position and queues only playable tracks", () => {
    const view = toPlaylistView(playlistDto);
    expect(view.entries.map((entry) => entry.entryId)).toEqual([
      "entry-1",
      "entry-2",
      "entry-3",
    ]);
    expect(view.entries[1]?.isAvailable).toBe(false);
    expect(view.entries[1]?.track).toBeNull();
    expect(view.playableTracks.map((track) => track.id)).toEqual(["track-7"]);
    expect(view.href).toBe("/studio/collection?id=playlist-1");
    expect(view.savedId).toBe("studio_playlist:playlist-1");
  });

  it("de-duplicates covers and shows visibility to the owner only", () => {
    const ownerCard = toPlaylistCardView(playlistDto);
    expect(ownerCard.coverUrls).toEqual(["https://files.example/cartas.webp"]);
    expect(ownerCard.visibilityLabelKey).toBe(
      "studio:playlist.visibility.connections",
    );
    const viewerCard = toPlaylistCardView({
      ...playlistDto,
      isOwner: false,
      visibility: "public",
    });
    expect(viewerCard.visibility).toBeNull();
    expect(viewerCard.visibilityLabelKey).toBeNull();
  });

  it("credits a persona with its Studio page and a member with their profile", () => {
    expect(
      toPlaylistCreditView({ persona: mariana, member: null }),
    ).toMatchObject({
      kind: "persona",
      name: "Mariana Sol",
      href: "/studio/artist?id=persona-mariana",
    });
    expect(toPlaylistCreditView(playlistDto.credit)).toMatchObject({
      kind: "member",
      name: "Tiago Costa",
      href: "/members/tiago",
    });
    expect(
      toPlaylistCreditView({
        persona: null,
        member: { id: "m2", slug: "", displayName: "Ana", avatarUrl: null },
      }).href,
    ).toBeNull();
  });

  it("leaves unavailable entries out for a viewer", () => {
    const view = toPlaylistView({
      ...playlistDto,
      isOwner: false,
      visibility: null,
    });
    expect(view.entries.map((entry) => entry.entryId)).toEqual([
      "entry-1",
      "entry-3",
    ]);
  });

  it("drops a credit subprofile id for a viewer", () => {
    const view = toPlaylistView({
      ...playlistDto,
      isOwner: false,
      visibility: null,
      creditSubprofileId: "persona-mariana",
    });
    expect(view.creditSubprofileId).toBeNull();
  });
});

describe("counts on Your numbers", () => {
  it("withholds 1 to 4 even when the flag is missing", () => {
    expect(toCountView({ value: 0, isBelowThreshold: false })).toEqual({
      value: 0,
      isBelowThreshold: false,
    });
    expect(toCountView({ value: null, isBelowThreshold: true })).toEqual({
      value: null,
      isBelowThreshold: true,
    });
    expect(toCountView({ value: 3, isBelowThreshold: false })).toEqual({
      value: null,
      isBelowThreshold: true,
    });
    expect(toCountView({ value: null, isBelowThreshold: false })).toEqual({
      value: null,
      isBelowThreshold: true,
    });
    expect(toCountView({ value: 5, isBelowThreshold: false })).toEqual({
      value: 5,
      isBelowThreshold: false,
    });
  });

  it("maps a stats answer to rows with tracks", () => {
    const stats = toArtistStatsView({
      subprofileId: "persona-mariana",
      followerCount: 40,
      releases: [
        {
          release: { ...cardDto, status: "published" },
          saves: { value: 12, isBelowThreshold: false },
          playlistInclusions: { value: null, isBelowThreshold: true },
          tracks: [
            {
              track: {
                id: "track-7",
                position: 1,
                title: "Cartas",
                durationSeconds: 200,
                isExplicit: false,
                hasAudio: true,
              },
              saves: { value: 9, isBelowThreshold: false },
              playlistInclusions: { value: 0, isBelowThreshold: false },
            },
          ],
        },
      ],
    });
    expect(stats.releases[0]?.statusLabelKey).toBe(
      "studio:releaseStatus.published",
    );
    expect(stats.releases[0]?.playlistInclusions.isBelowThreshold).toBe(true);
    expect(stats.releases[0]?.tracks[0]?.track.title).toBe("Cartas");
  });
});

describe("genres and followed artists", () => {
  it("keeps known genres in the server's order", () => {
    expect(toGenreList({ genres: ["folk", "polka", "fado"] })).toEqual([
      "folk",
      "fado",
    ]);
    expect(isStudioGenre("hip-hop")).toBe(true);
    expect(isStudioGenre("polka")).toBe(false);
  });

  it("keeps musician and DJ personas only", () => {
    const followed = {
      id: "sp-1",
      displayName: "NIGHTFORM",
      kind: "musician",
      tagline: null,
      avatarUrl: null,
      accent: null,
      slug: "nightform",
      handle: "nightform",
      linkVisibility: "unlinked",
      ownerSlug: null,
      ownerName: null,
      followerCount: 3,
      followedAt: "2026-01-01T00:00:00.000Z",
    } as FollowedPersonaDTO;
    expect(toFollowedArtistView(followed)?.href).toBe("/studio/artist?id=sp-1");
    expect(
      toFollowedArtistView({
        ...followed,
        kind: "writer",
      }),
    ).toBeNull();
  });
});
