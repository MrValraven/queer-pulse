import { describe, expect, it } from "vitest";
import type { FollowedPersonaDTO } from "../../subprofiles/api/subprofiles.api";
import type {
  StudioArtistDTO,
  StudioPlaylistDTO,
  StudioPressKitDTO,
  StudioReleaseDTO,
  StudioTrackDTO,
  StudioUpcomingReleaseDTO,
} from "./studio.types";
import {
  STUDIO_FORMAT_LABEL_KEY,
  STUDIO_GENRE_LABEL_KEY,
  STUDIO_KIND_LABEL_KEY,
  STUDIO_RELEASE_TYPE_LABEL_KEY,
  excerptOnWord,
  formatOfKind,
  formatTrackTime,
  genreLabelKeyOf,
  isBandcampHost,
  isSourcedReleaseType,
  isStudioGenre,
  isTranscriptFormat,
  lyricStanzasOf,
  tintForId,
  toArtistStatsView,
  toArtistView,
  toBuyLinkView,
  toChapterViews,
  toCountView,
  toFollowedArtistView,
  toFormatList,
  toGenreList,
  toLatestEpisodeViews,
  toOwnerTrackRowView,
  toPlaylistCardView,
  toPlaylistCreditView,
  toPlaylistEntryView,
  toPlaylistView,
  toPressContactView,
  toPreviewView,
  toReleaseCardView,
  toReleaseView,
  toSources,
  toStudioPressKitView,
  toSupportLinkViews,
  toSyncedLyricViews,
  toTrackRowView,
  toTrackView,
  toWaveform,
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
  mood: null,
  scene: null,
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
  sceneId: null,
  personaCredits: [],
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
      syncedLyrics: null,
      chapters: null,
      release: releaseDto,
      personaCredits: [],
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

describe("discovery fields from an older backend", () => {
  // The types call these fields required; the payload below leaves them out.
  const {
    mood: _mood,
    scene: _scene,
    sceneId: _sceneId,
    personaCredits: _personaCredits,
    ...olderRelease
  } = {
    ...releaseDto,
    isOwner: true,
  };

  it("reads a release without them as empty credits and no mood or scene", () => {
    const view = toReleaseView(olderRelease as unknown as StudioReleaseDTO);
    expect(view.personaCredits).toEqual([]);
    expect(view.mood).toBeNull();
    expect(view.scene).toBeNull();
    expect(view.sceneId).toBeNull();
  });

  it("reads a track without them as empty credits and no mood or scene", () => {
    const olderTrack = {
      ...releaseDto.tracks[0]!,
      releaseId: "release-1",
      credits: [],
      lyrics: null,
      release: olderRelease,
    };
    const view = toTrackView(olderTrack as unknown as StudioTrackDTO);
    expect(view.personaCredits).toEqual([]);
    expect(view.release.mood).toBeNull();
    expect(view.release.scene).toBeNull();
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
  mood: null,
  scene: null,
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

describe("withdrawn entries and disputes (open pages)", () => {
  const takenDown: StudioReleaseDTO = {
    ...releaseDto,
    status: "taken_down",
    isOwner: true,
    takedownReason: "Uncleared sample on track 2",
    canDispute: true,
    dispute: {
      id: "dispute-1",
      status: "rejected",
      note: "The sample is cleared, here is the licence",
      staffReply: "We checked the licence and it covers a different recording",
      createdAt: "2026-10-10T10:00:00.000Z",
      decidedAt: "2026-10-11T10:00:00.000Z",
    },
  };

  it("gives the owner the latest dispute and whether another can be filed", () => {
    const view = toReleaseView(takenDown);
    expect(view.dispute).toEqual({
      id: "dispute-1",
      status: "rejected",
      note: "The sample is cleared, here is the licence",
      staffReply: "We checked the licence and it covers a different recording",
      createdAt: "2026-10-10T10:00:00.000Z",
      decidedAt: "2026-10-11T10:00:00.000Z",
    });
    expect(view.canDispute).toBe(true);
  });

  it("shows a listener no dispute, whatever the payload carries", () => {
    const view = toReleaseView({ ...takenDown, isOwner: false });
    expect(view.dispute).toBeNull();
    expect(view.canDispute).toBe(false);
  });

  it("offers a dispute only while the release is taken down", () => {
    expect(
      toReleaseView({ ...takenDown, status: "published" }).canDispute,
    ).toBe(false);
  });

  it("reads a missing dispute field as none", () => {
    const view = toReleaseView({
      ...releaseDto,
      status: "taken_down",
      isOwner: true,
    });
    expect(view.dispute).toBeNull();
    expect(view.canDispute).toBe(false);
  });

  it("keeps the withdrawn reason on an unavailable entry only", () => {
    const addedAt = "2026-10-01T00:00:00.000Z";
    expect(
      toPlaylistEntryView({
        entryId: "entry-1",
        position: 1,
        addedAt,
        isAvailable: false,
        track: null,
        unavailableReason: "withdrawn",
      }).unavailableReason,
    ).toBe("withdrawn");
    expect(
      toPlaylistEntryView({
        entryId: "entry-2",
        position: 2,
        addedAt,
        isAvailable: false,
        track: null,
      }).unavailableReason,
    ).toBeNull();
  });
});

describe("studio v3: release fields", () => {
  it("defaults every v3 field when an older server leaves them out", () => {
    const view = toReleaseView(releaseDto);
    expect(view.version).toBe(1);
    expect(view.versions).toEqual([]);
    expect(view.latestVersion).toBeNull();
    expect(view.supportLinks).toEqual([]);
    expect(view.buyLink).toBeNull();
    expect(view.isReminderSet).toBe(false);
    expect(view.isPreview).toBe(false);
    expect(view.isUpcoming).toBe(false);
    expect(view.publishAt).toBeNull();
  });

  it("drops owner-only fields for a viewer even when a server sends them", () => {
    const view = toReleaseView({
      ...releaseDto,
      isOwner: false,
      hasUnnotedChanges: true,
      previewToken: "a".repeat(64),
      previewLinkCreatedAt: "2026-10-10T10:00:00.000Z",
    });
    expect(view.hasUnnotedChanges).toBe(false);
    expect(view.previewToken).toBeNull();
    expect(view.previewLinkCreatedAt).toBeNull();
  });

  it("keeps owner-only fields for the owner", () => {
    const view = toReleaseView({
      ...releaseDto,
      isOwner: true,
      hasUnnotedChanges: true,
      previewToken: "b".repeat(64),
      previewLinkCreatedAt: "2026-10-10T10:00:00.000Z",
    });
    expect(view.hasUnnotedChanges).toBe(true);
    expect(view.previewToken).toBe("b".repeat(64));
    expect(view.previewLinkCreatedAt).toBe("2026-10-10T10:00:00.000Z");
  });

  it("reads a scheduled release as upcoming with its publish time", () => {
    const view = toReleaseView({
      ...releaseDto,
      status: "scheduled",
      publishAt: "2026-10-20T17:00:00.000Z",
      isReminderSet: true,
      tracks: [],
    });
    expect(view.isUpcoming).toBe(true);
    expect(view.publishAt).toBe("2026-10-20T17:00:00.000Z");
    expect(view.isReminderSet).toBe(true);
    expect(view.statusLabelKey).toBe("studio:releaseStatus.scheduled");
    expect(view.trackCount).toBe(2);
    expect(view.playableTrackCount).toBe(0);
  });

  it("hides a scheduled tracklist from a viewer even when a server sends one", () => {
    const scheduled: StudioReleaseDTO = {
      ...releaseDto,
      status: "scheduled",
      publishAt: "2026-10-20T17:00:00.000Z",
    };
    const viewerView = toReleaseView({ ...scheduled, isOwner: false });
    expect(viewerView.tracks).toEqual([]);
    expect(viewerView.playableTrackCount).toBe(0);
    expect(viewerView.trackCount).toBe(2);
    const ownerView = toReleaseView({ ...scheduled, isOwner: true });
    expect(ownerView.tracks.map((track) => track.id)).toEqual([
      "track-1",
      "track-2",
    ]);
    expect(ownerView.playableTrackCount).toBe(1);
    const previewView = toReleaseView({
      ...scheduled,
      isOwner: false,
      isPreview: true,
    });
    expect(previewView.tracks).toHaveLength(2);
    expect(previewView.playableTrackCount).toBe(1);
  });

  it("never reads a reminder on a release that is not scheduled", () => {
    expect(
      toReleaseView({ ...releaseDto, isReminderSet: true }).isReminderSet,
    ).toBe(false);
  });

  it("shows the latest version note from version 2 on", () => {
    const view = toReleaseView({
      ...releaseDto,
      version: 3,
      versions: [
        {
          version: 3,
          note: "Mastered again",
          createdAt: "2026-10-12T10:00:00.000Z",
        },
        {
          version: 2,
          note: "Fixed track 2",
          createdAt: "2026-10-01T10:00:00.000Z",
        },
      ],
    });
    expect(view.latestVersion?.note).toBe("Mastered again");
    expect(view.versions).toHaveLength(2);
  });

  it("keeps the discovery fields beside the v3 ones", () => {
    const view = toReleaseView({
      ...releaseDto,
      isOwner: true,
      sceneId: "scene-1",
      status: "scheduled",
      publishAt: "2026-10-20T17:00:00.000Z",
    });
    expect(view.sceneId).toBe("scene-1");
    expect(view.personaCredits).toEqual([]);
    expect(view.dispute).toBeNull();
    expect(view.isUpcoming).toBe(true);
  });
});

describe("studio v3: buy and support links", () => {
  it("labels Bandcamp and its subdomains, and any other shop plainly", () => {
    expect(isBandcampHost("https://bandcamp.com/album/x")).toBe(true);
    expect(isBandcampHost("https://marianasol.bandcamp.com/album/x")).toBe(
      true,
    );
    expect(isBandcampHost("https://bandcamp.com.example.org/x")).toBe(false);
    expect(isBandcampHost("https://evilbandcamp.com/x")).toBe(false);
    expect(
      toBuyLinkView("https://marianasol.bandcamp.com/album/x")?.labelKey,
    ).toBe("studio:support.buyOnBandcamp");
    expect(toBuyLinkView("https://shop.example.org/cd")?.labelKey).toBe(
      "studio:support.buyRelease",
    );
  });

  it("drops a buy link that is not https", () => {
    expect(toBuyLinkView("http://shop.example.org")).toBeNull();
    expect(toBuyLinkView("")).toBeNull();
    expect(toBuyLinkView(null)).toBeNull();
  });

  it("keeps Bandcamp, Ko-fi and Patreon in the persona's order and resolves handles", () => {
    const links = toSupportLinkViews([
      { platform: "patreon", urlOrHandle: "@marianasol" },
      { platform: "bandcamp", urlOrHandle: "https://marianasol.bandcamp.com" },
      { platform: "kofi", urlOrHandle: "   " },
    ]);
    expect(links.map((link) => link.platform)).toEqual(["patreon", "bandcamp"]);
    expect(links[0]?.href).toBe("https://patreon.com/marianasol");
    expect(links[0]?.platformLabel).toBe("Patreon");
  });

  it("drops a support link that resolves to http", () => {
    const links = toSupportLinkViews([
      { platform: "bandcamp", urlOrHandle: "http://marianasol.bandcamp.com" },
      { platform: "kofi", urlOrHandle: "@marianasol" },
    ]);
    expect(links.map((link) => link.platform)).toEqual(["kofi"]);
  });
});

describe("studio v3: artist upcoming and owner rows", () => {
  it("lists upcoming releases soonest first and carries publishAt on owner rows", () => {
    const upcoming = (
      id: string,
      publishAt: string,
    ): StudioUpcomingReleaseDTO => ({
      ...releaseDto,
      id,
      publishAt,
      isReminderSet: false,
    });
    const view = toArtistView({
      artist: { ...artist, bio: null, city: null },
      releases: [],
      ownerReleases: [
        {
          ...releaseDto,
          id: "s1",
          status: "scheduled",
          takedownReason: null,
          publishAt: "2026-10-20T17:00:00.000Z",
        },
      ],
      followerCount: 0,
      isFollowing: false,
      playlists: [],
      upcoming: [
        upcoming("later", "2026-11-01T10:00:00.000Z"),
        upcoming("sooner", "2026-10-20T17:00:00.000Z"),
      ],
    });
    expect(view.upcoming.map((release) => release.id)).toEqual([
      "sooner",
      "later",
    ]);
    expect(view.ownerReleases?.[0]?.publishAt).toBe("2026-10-20T17:00:00.000Z");
    expect(view.ownerReleases?.[0]?.statusLabelKey).toBe(
      "studio:releaseStatus.scheduled",
    );
    expect(view.supportLinks).toEqual([]);
  });

  it("shows at most 6 upcoming releases, the soonest ones", () => {
    const days = [7, 3, 5, 1, 6, 2, 4];
    const view = toArtistView({
      artist: { ...artist, bio: null, city: null },
      releases: [],
      ownerReleases: null,
      followerCount: 0,
      isFollowing: false,
      playlists: [],
      upcoming: days.map((day): StudioUpcomingReleaseDTO => ({
        ...releaseDto,
        id: `day-${day}`,
        publishAt: `2026-11-0${day}T10:00:00.000Z`,
        isReminderSet: false,
      })),
    });
    expect(view.upcoming.map((release) => release.id)).toEqual([
      "day-1",
      "day-2",
      "day-3",
      "day-4",
      "day-5",
      "day-6",
    ]);
  });
});

describe("studio v3: preview and press kit", () => {
  it("marks a preview release and passes a published id through", () => {
    const draft = toPreviewView({
      release: { ...releaseDto, status: "draft" },
      publishedReleaseId: null,
    });
    expect(draft.release?.isPreview).toBe(true);
    expect(draft.publishedReleaseId).toBeNull();
    const published = toPreviewView({
      release: null,
      publishedReleaseId: "r9",
    });
    expect(published.release).toBeNull();
    expect(published.publishedReleaseId).toBe("r9");
  });

  it("reads a contact as an address or a web page, and drops anything else", () => {
    expect(toPressContactView("mailto:press@marianasol.pt")).toEqual({
      href: "mailto:press@marianasol.pt",
      label: "press@marianasol.pt",
      isEmail: true,
    });
    expect(toPressContactView("https://www.marianasol.pt/press")?.label).toBe(
      "marianasol.pt/press",
    );
    expect(toPressContactView("javascript:alert(1)")).toBeNull();
    expect(toPressContactView(null)).toBeNull();
  });

  it("cuts the one-sheet bio on a word", () => {
    const text = "word ".repeat(300);
    const excerpt = excerptOnWord(text, 900);
    expect(excerpt.length).toBeLessThanOrEqual(901);
    expect(excerpt.endsWith("…")).toBe(true);
    expect(excerptOnWord("Short bio", 900)).toBe("Short bio");
  });

  it("builds the press kit view and keeps the owner block for the owner only", () => {
    const dto: StudioPressKitDTO = {
      artist: { ...artist, bio: "Persona bio", city: null },
      personaHandle: "nightform",
      pitch: "  After-hours electronics  ",
      bio: "Press bio",
      featuredTracks: [
        { ...releaseDto.tracks[0]!, release: releaseDto },
        { ...releaseDto.tracks[1]!, release: releaseDto },
      ],
      isFeaturedFallback: false,
      releases: [releaseDto],
      quotes: [{ quote: "Hypnotic", source: "Rimas" }],
      contact: "mailto:booking@nightform.pt",
      socialLinks: [
        { platform: "instagram", urlOrHandle: "@nightform" },
        { platform: "bandcamp", urlOrHandle: "https://nightform.bandcamp.com" },
      ],
      supportLinks: [
        { platform: "bandcamp", urlOrHandle: "https://nightform.bandcamp.com" },
      ],
      isOwner: false,
      owner: {
        pitch: "x",
        pressBio: null,
        featuredTrackIds: [],
        quotes: [],
        contact: null,
        updatedAt: null,
      },
    };
    const view = toStudioPressKitView(dto);
    expect(view.pitch).toBe("After-hours electronics");
    expect(view.featuredTracks.map((track) => track.id)).toEqual(["track-1"]);
    expect(view.socialLinks.map((link) => link.platform)).toEqual([
      "instagram",
    ]);
    expect(view.supportLinks.map((link) => link.platform)).toEqual([
      "bandcamp",
    ]);
    expect(view.contact?.label).toBe("booking@nightform.pt");
    expect(view.owner).toBeNull();
    const ownerView = toStudioPressKitView({ ...dto, isOwner: true });
    expect(ownerView.owner).toEqual({
      pitch: "x",
      pressBio: "",
      featuredTrackIds: [],
      quotes: [],
      contact: "",
      updatedAt: null,
    });
  });
});

describe("studio v3: reminder counts", () => {
  it("reads a reminder count with the same floor, and null when absent", () => {
    const stats = toArtistStatsView({
      subprofileId: "persona-1",
      followerCount: 3,
      releases: [
        {
          release: { ...releaseDto, status: "scheduled" },
          saves: { value: 0, isBelowThreshold: false },
          playlistInclusions: { value: 0, isBelowThreshold: false },
          tracks: [],
          reminders: { value: 3, isBelowThreshold: false },
        },
        {
          release: { ...releaseDto, id: "release-2", status: "published" },
          saves: { value: 0, isBelowThreshold: false },
          playlistInclusions: { value: 0, isBelowThreshold: false },
          tracks: [],
        },
      ],
    });
    expect(stats.releases[0]?.reminders).toEqual({
      value: null,
      isBelowThreshold: true,
    });
    expect(stats.releases[1]?.reminders).toBeNull();
  });
});

describe("formatTrackTime from an hour up", () => {
  it("adds hours and pads the minutes", () => {
    expect(formatTrackTime(3600)).toBe("1:00:00");
    expect(formatTrackTime(3852)).toBe("1:04:12");
    expect(formatTrackTime(3599)).toBe("59:59");
    expect(formatTrackTime(36_000 + 61)).toBe("10:01:01");
  });
});

describe("listening adapters", () => {
  it("orders synced lines by time and keeps empty lines as gaps", () => {
    expect(
      toSyncedLyricViews([
        { ms: 9000, text: "two" },
        { ms: 1200.7, text: "one" },
        { ms: 9000, text: "" },
      ]),
    ).toEqual([
      { ms: 1200, text: "one" },
      { ms: 9000, text: "two" },
      { ms: 9000, text: "" },
    ]);
    expect(toSyncedLyricViews(null)).toBeNull();
    expect(toSyncedLyricViews([])).toBeNull();
    expect(toSyncedLyricViews(undefined)).toBeNull();
  });

  it("labels chapters with their time and reads an empty artist as none", () => {
    expect(
      toChapterViews([
        { startSeconds: 3750, title: "Late", artist: "Rita" },
        { startSeconds: 0, title: "Open", artist: "  " },
      ]),
    ).toEqual([
      { startSeconds: 0, title: "Open", artist: null, timeLabel: "0:00" },
      {
        startSeconds: 3750,
        title: "Late",
        artist: "Rita",
        timeLabel: "1:02:30",
      },
    ]);
    expect(toChapterViews([])).toBeNull();
  });

  it("normalises peaks to 0..1 and clamps stray values", () => {
    expect(toWaveform([0, 255, 51, 300, -4])).toEqual([0, 1, 0.2, 1, 0]);
    expect(toWaveform(null)).toBeNull();
    expect(toWaveform([])).toBeNull();
  });

  it("gives the track view its synced lyrics and chapters", () => {
    const view = toTrackView({
      ...releaseDto.tracks[0]!,
      releaseId: "release-1",
      credits: [],
      lyrics: null,
      syncedLyrics: [{ ms: 500, text: "hello" }],
      chapters: [{ startSeconds: 0, title: "Intro", artist: null }],
      release: releaseDto,
      personaCredits: [],
    });
    expect(view.syncedLyrics).toEqual([{ ms: 500, text: "hello" }]);
    expect(view.chapters?.[0]?.timeLabel).toBe("0:00");
  });

  it("builds owner rows only for the owner, with defaults for missing keys", () => {
    expect(
      toReleaseView({ ...releaseDto, isOwner: false }).ownerTracks,
    ).toBeNull();
    const owned = toReleaseView({
      ...releaseDto,
      isOwner: true,
      tracks: releaseDto.tracks.map((track, index) =>
        index === 0
          ? {
              ...track,
              hasAnalysis: true,
              loudnessLufs: -7.8,
              peakDb: -0.1,
              chapters: [{ startSeconds: 0, title: "Intro", artist: null }],
            }
          : track,
      ),
    });
    expect(owned.ownerTracks?.map((row) => row.hasAnalysis)).toEqual(
      owned.tracks.map((_row, index) => index === 0),
    );
    expect(owned.ownerTracks?.[0]?.chapters?.[0]?.title).toBe("Intro");
    expect(owned.ownerTracks?.[0]).toMatchObject({
      loudnessLufs: -7.8,
      peakDb: -0.1,
    });
    expect(owned.ownerTracks?.[1]).toMatchObject({
      loudnessLufs: null,
      peakDb: null,
    });
    expect(owned.ownerTracks?.[1]?.syncedLyrics ?? null).toBeNull();
    expect(owned.tracks[0]).not.toHaveProperty("hasAnalysis");
  });

  it("keeps owner rows on a scheduled release for its owner alone", () => {
    const scheduled = { ...releaseDto, status: "scheduled" as const };
    expect(
      toReleaseView({ ...scheduled, isOwner: false }).ownerTracks,
    ).toBeNull();
    expect(
      toReleaseView({ ...scheduled, isOwner: true }).ownerTracks,
    ).toHaveLength(2);
  });

  it("reads a lone owner row field set by field", () => {
    const row = toOwnerTrackRowView({
      id: "t9",
      position: 1,
      title: "Nine",
      durationSeconds: 100,
      isExplicit: false,
      hasAudio: true,
    });
    expect(row).toMatchObject({
      hasAnalysis: false,
      loudnessLufs: null,
      peakDb: null,
      syncedLyrics: null,
      chapters: null,
    });
  });
});

const podcaster = {
  id: "p-pod",
  handle: "late-bloomers",
  name: "Late Bloomers",
  kind: "podcaster" as const,
  avatarUrl: null,
};
const showBase: StudioReleaseDTO = {
  id: "show-1",
  title: "Late Bloomers",
  type: "podcast",
  coverUrl: null,
  releasedOn: null,
  trackCount: 2,
  totalDurationSeconds: 3600,
  artist: podcaster,
  publishedAt: "2026-08-01T10:00:00.000Z",
  genre: null,
  mood: null,
  scene: null,
  description: null,
  status: "published",
  tracks: [
    {
      id: "e1",
      position: 1,
      title: "Pilot",
      durationSeconds: 1800,
      isExplicit: false,
      hasAudio: true,
      notesExcerpt: "00:00 Hello",
      publishedAt: "2026-08-01T10:00:00.000Z",
      isDraft: false,
    },
    {
      id: "e2",
      position: 2,
      title: "Unfinished",
      durationSeconds: 1800,
      isExplicit: false,
      hasAudio: true,
      notesExcerpt: null,
      publishedAt: null,
      isDraft: true,
    },
  ],
  isOwner: false,
  rightsConfirmedAt: null,
  takedownReason: null,
  sceneId: null,
  personaCredits: [],
};

describe("Studio artist kinds in the adapters", () => {
  it("reads the format from the persona kind when the server sends none", () => {
    const view = toReleaseView(showBase);
    expect(view.format).toBe("podcast");
    expect(view.isShow).toBe(true);
    expect(view.artist.format).toBe("podcast");
    expect(view.artist.kindLabelKey).toBe("subprofiles:kind.podcaster");
    expect(view.typeLabelKey).toBe("studio:releaseType.podcast");
  });

  it("keeps the server's format when it sends one", () => {
    const view = toReleaseCardView({ ...showBase, format: "spoken_word" });
    expect(view.format).toBe("spoken_word");
  });

  it("drops a draft episode from a listener's view", () => {
    const view = toReleaseView(showBase);
    expect(view.tracks.map((track) => track.id)).toEqual(["e1"]);
    expect(view.tracks[0]?.notesExcerpt).toBe("00:00 Hello");
    expect(view.tracks[0]?.publishedAt).toBe("2026-08-01T10:00:00.000Z");
  });

  it("keeps a draft episode for the owner, marked as a draft", () => {
    const view = toReleaseView({ ...showBase, isOwner: true });
    expect(view.tracks.map((track) => [track.id, track.isDraft])).toEqual([
      ["e1", false],
      ["e2", true],
    ]);
  });

  it("defaults the episode fields an older server leaves out", () => {
    const row = toTrackRowView({
      id: "t1",
      position: 1,
      title: "Tide",
      durationSeconds: 200,
      isExplicit: false,
      hasAudio: true,
    });
    expect(row).toMatchObject({
      notesExcerpt: null,
      publishedAt: null,
      isDraft: false,
    });
  });

  it("reads notes and sources from the full track read", () => {
    const track = toTrackView({
      id: "t2",
      position: 1,
      title: "Sunday Mass",
      durationSeconds: 412,
      isExplicit: false,
      hasAudio: true,
      releaseId: "r2",
      credits: [],
      lyrics: null,
      syncedLyrics: null,
      chapters: null,
      release: { ...showBase, type: "lip_sync" },
      personaCredits: [],
      sources: [{ title: "Vogue", artist: "Madonna" }],
    });
    expect(track.sources).toEqual([{ title: "Vogue", artist: "Madonna" }]);
    expect(track.notes).toBeNull();
  });

  it("trims sources and leaves out a row with an empty field", () => {
    expect(
      toSources([
        { title: "  Vogue ", artist: " Madonna " },
        { title: "", artist: "Someone" },
      ]),
    ).toEqual([{ title: "Vogue", artist: "Madonna" }]);
  });
});

describe("Studio artist kinds: labels, formats, stats and the shelf", () => {
  it("labels every new kind, type, genre and format", () => {
    expect(STUDIO_KIND_LABEL_KEY.drag).toBe("subprofiles:kind.drag");
    expect(STUDIO_KIND_LABEL_KEY.musician).toBe("studio:kind.musician");
    expect(STUDIO_RELEASE_TYPE_LABEL_KEY.lip_sync).toBe(
      "studio:releaseType.lip_sync",
    );
    expect(STUDIO_GENRE_LABEL_KEY["spoken-word"]).toBe(
      "studio:genre.spokenWord",
    );
    expect(STUDIO_FORMAT_LABEL_KEY.spoken_word).toBe(
      "studio:format.spoken_word",
    );
    expect(isTranscriptFormat("podcast")).toBe(true);
    expect(isTranscriptFormat("performance")).toBe(false);
    expect(isSourcedReleaseType("mix")).toBe(true);
    expect(isSourcedReleaseType("ep")).toBe(false);
  });

  it("keeps a format list in the server's order and drops unknown values", () => {
    expect(toFormatList({ formats: ["music", "radio", "podcast"] })).toEqual([
      "music",
      "podcast",
    ]);
  });

  it("follows every map kind in the library Artists tab", () => {
    const view = toFollowedArtistView({
      id: "sp-1",
      handle: "vanda-diesel",
      displayName: "Vanda Diesel",
      kind: "drag",
      avatarUrl: null,
    } as Parameters<typeof toFollowedArtistView>[0]);
    expect(view?.format).toBe("performance");
    const writer = toFollowedArtistView({
      id: "sp-2",
      handle: "w",
      displayName: "Writer",
      kind: "writer",
      avatarUrl: null,
    } as Parameters<typeof toFollowedArtistView>[0]);
    expect(writer).toBeNull();
  });

  it("shows no per-episode numbers on a show's stats row", () => {
    const stats = toArtistStatsView({
      subprofileId: "p-pod",
      followerCount: 12,
      releases: [
        {
          release: { ...showBase, status: "published" },
          saves: { value: 7, isBelowThreshold: false },
          playlistInclusions: { value: null, isBelowThreshold: true },
          tracks: [
            {
              track: showBase.tracks[0]!,
              saves: { value: 5, isBelowThreshold: false },
              playlistInclusions: { value: 5, isBelowThreshold: false },
            },
          ],
        },
      ],
    });
    expect(stats.releases[0]?.tracks).toEqual([]);
    expect(stats.releases[0]?.saves.value).toBe(7);
  });

  it("reads an unknown server format from the persona kind", () => {
    const card = toReleaseCardView({
      ...showBase,
      format: "radio" as never,
      artist: { ...podcaster, format: "radio" as never },
    });
    expect(card.format).toBe("podcast");
    expect(card.artist.format).toBe("podcast");
    expect(formatOfKind("writer")).toBe("music");
  });

  it("drops a draft episode from the latest episodes shelf", () => {
    const feedTrack = {
      id: "e1",
      position: 1,
      title: "Pilot",
      durationSeconds: 1800,
      isExplicit: false,
      hasAudio: true,
      notesExcerpt: null,
      publishedAt: "2026-08-01T10:00:00.000Z",
      isDraft: false,
      releaseId: "show-1",
      credits: [],
      lyrics: null,
      syncedLyrics: null,
      chapters: null,
      release: showBase,
      personaCredits: [],
    };
    const shelf = toLatestEpisodeViews([
      { track: feedTrack, release: showBase },
      {
        track: { ...feedTrack, id: "e2", publishedAt: null, isDraft: true },
        release: showBase,
      },
    ]);
    expect(shelf.map((item) => item.track.id)).toEqual(["e1"]);
    expect(shelf[0]?.release.isShow).toBe(true);
  });
});
