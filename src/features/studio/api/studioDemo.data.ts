import {
  ALBUM,
  ALBUM_COVER,
  TRACKS as ALBUM_TRACKS,
} from "../studioAlbum.data";
import {
  RELEASES as ARTIST_RELEASES,
  SINGLES as ARTIST_SINGLES,
} from "../studioArtist.data";
import { TRACKS as HOME_CARDS } from "../studioPage.data";
import { CREDITS as TRACK_CREDITS } from "../studioTrack.data";
import type {
  StudioArtistRefDTO,
  StudioChapter,
  StudioCreditDTO,
  StudioMood,
  StudioReleaseDTO,
  StudioReleaseType,
  StudioReleaseVersionDTO,
  StudioSyncedLyricLine,
  StudioTrackSummaryDTO,
} from "./studio.types";
import {
  DEMO_MIX_CHAPTERS,
  DEMO_MIX_CLOCK,
  DEMO_MIX_RELEASE_ID,
  DEMO_MIX_TRACK_ID,
  DEMO_SYNCED_LYRIC_TIMES_MS,
} from "./studioDemoListening.data";
import { demoSupportLinksFor } from "./studioDemoCards";
import {
  DEMO_ARTIST_LECHATDASHINKO,
  DEMO_ARTIST_MARIANA,
  DEMO_ARTIST_NIGHTFORM,
  DEMO_DEFAULT_RELEASE_ID,
  DEMO_DEFAULT_TRACK_ID,
} from "./studioDemoMe.data";
import {
  demoSceneIdOfRelease,
  demoSceneRefOfRelease,
} from "./studioDemoScenes.data";

/** One mood per demo release; releases left out have none. */
const DEMO_RELEASE_MOODS: Record<string, StudioMood> = {
  "demo-release-cidade-dos-santos": "melancholy",
  "demo-release-mariana-2": "tender",
  "demo-release-mariana-3": "slow-burn",
  "demo-release-mariana-single-1": "melancholy",
  "demo-release-home-1": "tender",
  "demo-release-home-2": "sweaty",
  "demo-release-home-3": "playful",
  "demo-release-home-4": "late-night",
};

const RITA: StudioArtistRefDTO = {
  id: "demo-persona-rita-ferreira",
  handle: "",
  name: "Rita Ferreira",
  kind: "musician",
  avatarUrl: null,
};
const CORO: StudioArtistRefDTO = {
  id: "demo-persona-coro-de-outubro",
  handle: "",
  name: "Coro de Outubro",
  kind: "musician",
  avatarUrl: null,
};

const DAY_MS = 86_400_000;
/** An instant `days` ahead of when the demo loaded, on the hour (UTC). */
function isoAhead(days: number, utcHour: number): string {
  const instant = new Date(Date.now() + days * DAY_MS);
  instant.setUTCHours(utcHour, 0, 0, 0);
  return instant.toISOString();
}

// Studio v3 fixture ids: the draft with a live preview link, the demo
// owner's scheduled single and another persona's scheduled single (the
// visitor view of an upcoming release).
export const DEMO_DRAFT_RELEASE_ID = "demo-release-draft-cartas-ao-mar";
export const DEMO_SCHEDULED_RELEASE_ID = "demo-release-scheduled-mare-alta";
export const DEMO_VISITOR_UPCOMING_RELEASE_ID =
  "demo-release-scheduled-night-bus";

export const DEMO_ARTISTS: StudioArtistRefDTO[] = [
  DEMO_ARTIST_MARIANA,
  DEMO_ARTIST_NIGHTFORM,
  DEMO_ARTIST_LECHATDASHINKO,
  RITA,
  CORO,
];

/** `city` stays null, as the server always sends it (personas have no city
 *  field), so the demo renders exactly what live renders. */
export const DEMO_ARTIST_DETAILS: Record<
  string,
  { bio: string | null; city: string | null }
> = {
  [DEMO_ARTIST_MARIANA.id]: {
    bio: "Mariana Sol writes letters set to a piano so patient it sometimes forgets to play. Born in Beja, based in Sintra. Her work moves between fado's grammar and something quieter, the song you hum doing the dishes.",
    city: null,
  },
  [DEMO_ARTIST_NIGHTFORM.id]: {
    bio: "Synths, a drum machine and one long night bus home",
    city: null,
  },
  [DEMO_ARTIST_LECHATDASHINKO.id]: {
    bio: "Mixes for the hour after the lights come up",
    city: null,
  },
  [RITA.id]: { bio: null, city: null },
  [CORO.id]: {
    bio: "A community choir that rehearses on Tuesdays",
    city: null,
  },
};

const CIDADE_LINER_NOTES =
  "This is a record I have been writing in pieces since I was nineteen. In Sintra, mostly. Some of it in Beja, where my mother is from and where the saint of the title lived, briefly, before she went to Lisbon to be martyred.\n\nI wrote eleven songs and recorded ten in a kitchen in Anjos with one cellist, one engineer, and an upright piano that belonged to my landlady. Track nine has my grandmother in it, a field recording I made of her humming, before she knew I was recording.";

export const DEMO_LYRICS =
  "Querida santa, não me ouves,\ne ainda assim te escrevo.\nA casa está vazia, a rádio ligada,\ne a luz que entra é a tua.\nO dia inteiro à porta, à espera,\ncomo quem espera a chuva.\n\nMãe deixou a chave por baixo da pedra,\na manhã que partiu.\nDisseste-me: não voltes.\nEu não voltei.\n\nSanta que ouve quem ninguém ouve,\nesta casa é tua também.";

/** "Mariana Sol · voice, piano, words" becomes a name and a role. */
export const DEMO_TRACK_CREDITS: StudioCreditDTO[] = TRACK_CREDITS.map(
  (credit) => {
    const [name = credit.who, role = ""] = credit.who.split(" · ");
    return { name, role };
  },
);

/** "4:18" or "1:04:12" to seconds. */
const secondsOf = (clock: string): number =>
  clock.split(":").reduce((total, part) => total * 60 + Number(part), 0);
const joinTitle = (pre: string, em?: string, post?: string) =>
  `${pre}${em ?? ""}${post ?? ""}`.trim();

function trackRows(
  releaseId: string,
  titles: { title: string; clock: string; isExplicit?: boolean }[],
): StudioTrackSummaryDTO[] {
  return titles.map((row, index) => ({
    id: `${releaseId.replace("demo-release-", "demo-track-")}-${String(index + 1).padStart(2, "0")}`,
    position: index + 1,
    title: row.title,
    durationSeconds: secondsOf(row.clock),
    isExplicit: row.isExplicit ?? false,
    hasAudio: true,
  }));
}

function release(
  base: Pick<
    StudioReleaseDTO,
    "id" | "title" | "type" | "coverUrl" | "releasedOn" | "artist"
  > & {
    description?: string | null;
    genre?: string | null;
    status?: StudioReleaseDTO["status"];
    takedownReason?: string | null;
    // Studio v3
    publishAt?: string | null;
    buyUrl?: string | null;
    isGapless?: boolean;
    version?: number;
    versions?: StudioReleaseVersionDTO[];
  },
  tracks: StudioTrackSummaryDTO[],
): StudioReleaseDTO {
  const status = base.status ?? "published";
  return {
    id: base.id,
    title: base.title,
    type: base.type,
    coverUrl: base.coverUrl,
    releasedOn: base.releasedOn,
    artist: base.artist,
    trackCount: tracks.length,
    totalDurationSeconds: tracks.reduce(
      (sum, track) => sum + (track.hasAudio ? (track.durationSeconds ?? 0) : 0),
      0,
    ),
    description: base.description ?? null,
    genre: base.genre ?? null,
    mood: DEMO_RELEASE_MOODS[base.id] ?? null,
    scene: demoSceneRefOfRelease(base.id),
    status,
    publishedAt:
      status === "published" && base.releasedOn
        ? `${base.releasedOn}T10:00:00.000Z`
        : null,
    tracks,
    isOwner: base.artist.id === DEMO_ARTIST_MARIANA.id,
    rightsConfirmedAt:
      base.artist.id === DEMO_ARTIST_MARIANA.id && status !== "draft"
        ? "2026-04-01T10:00:00.000Z"
        : null,
    takedownReason: base.takedownReason ?? null,
    // Studio v3
    publishAt: status === "scheduled" ? (base.publishAt ?? null) : null,
    buyUrl: base.buyUrl ?? null,
    isGapless: base.isGapless ?? false,
    supportLinks: demoSupportLinksFor(base.artist.id),
    version: base.version ?? 1,
    versions: base.versions ?? [],
    isReminderSet: false,
    isPreview: false,
    hasUnnotedChanges: false,
    // Filled per read from the demo store (studioDemoApi forViewer).
    previewToken: null,
    previewLinkCreatedAt: null,
    sceneId:
      base.artist.id === DEMO_ARTIST_MARIANA.id
        ? demoSceneIdOfRelease(base.id)
        : null,
    // demoStudioRelease reads the credit summary from the ledger on every
    // call, so the fixture loads without touching the credit modules.
    personaCredits: [],
  };
}

const CIDADE = release(
  {
    id: DEMO_DEFAULT_RELEASE_ID,
    title: ALBUM.title,
    type: "album",
    coverUrl: ALBUM_COVER,
    releasedOn: "2026-04-12",
    artist: DEMO_ARTIST_MARIANA,
    description: CIDADE_LINER_NOTES,
    genre: "fado",
    buyUrl: "https://marianasol.bandcamp.com/album/cidade-dos-santos",
    version: 2,
    versions: [
      {
        version: 2,
        note: "Track 9 now carries the whole field recording of my grandmother and track 4 is remastered so the piano sits closer",
        createdAt: "2026-06-02T10:00:00.000Z",
      },
    ],
  },
  trackRows(
    DEMO_DEFAULT_RELEASE_ID,
    ALBUM_TRACKS.map((row) => ({
      title: joinTitle(row.pre, row.em, row.post),
      clock: row.tm,
    })),
  ),
);

const RELEASE_TYPE_BY_META: Record<string, StudioReleaseType> = {
  Album: "album",
  EP: "ep",
  Single: "single",
};
const metaYear = (meta: string) => meta.match(/\d{4}/)?.[0] ?? "2026";

/** Two more Mariana releases from the artist page mock, three songs each. */
const EXTRA_TRACK_TITLES: Record<
  string,
  { title: string; clock: string; isExplicit?: boolean }[]
> = {
  "A Beja": [
    { title: "Planície", clock: "3:58" },
    { title: "A Beja", clock: "4:21", isExplicit: true },
    { title: "Regresso", clock: "3:05" },
  ],
  Devoção: [
    { title: "Devoção", clock: "4:44" },
    { title: "Vela acesa", clock: "3:37" },
    { title: "Ladainha", clock: "5:02" },
  ],
};

const MARIANA_OTHER_RELEASES = ARTIST_RELEASES.slice(1).map((mock, index) => {
  const title = joinTitle(mock.pre, mock.em);
  const id = `demo-release-mariana-${index + 2}`;
  return release(
    {
      id,
      title,
      type:
        RELEASE_TYPE_BY_META[mock.meta.split(" · ")[0] ?? "Album"] ?? "album",
      coverUrl: mock.image,
      releasedOn: `${metaYear(mock.meta)}-03-01`,
      artist: DEMO_ARTIST_MARIANA,
      genre: "fado",
      // Devoção's songs run into each other, so it plays without gaps.
      isGapless: title === "Devoção",
    },
    trackRows(id, EXTRA_TRACK_TITLES[title] ?? [{ title, clock: "4:00" }]),
  );
});

const SINGLE_CLOCKS = ["4:18", "3:12", "3:40", "2:58", "4:05"];
const MARIANA_SINGLES = ARTIST_SINGLES.map((mock, index) => {
  const title = joinTitle(mock.pre, mock.em);
  const id = `demo-release-mariana-single-${index + 1}`;
  return release(
    {
      id,
      title,
      type: "single",
      coverUrl: mock.image,
      releasedOn: `${metaYear(mock.meta)}-0${(index % 8) + 1}-15`,
      artist: DEMO_ARTIST_MARIANA,
    },
    trackRows(id, [{ title, clock: SINGLE_CLOCKS[index] ?? "3:30" }]),
  );
});

const HOME_ARTISTS = [
  RITA,
  DEMO_ARTIST_LECHATDASHINKO,
  CORO,
  DEMO_ARTIST_NIGHTFORM,
];
const OTHER_ARTIST_RELEASES = HOME_CARDS.map((mock, index) => {
  const artist = HOME_ARTISTS[index] ?? RITA;
  const title = joinTitle(mock.titlePre, mock.titleEm);
  const id = `demo-release-home-${index + 1}`;
  return release(
    {
      id,
      title,
      type: artist.kind === "dj" ? "mix" : "single",
      coverUrl: mock.image ?? null,
      releasedOn: `2026-0${9 - index}-2${index}`,
      artist,
      genre: artist.kind === "dj" ? "electronic" : "folk",
    },
    trackRows(id, [
      { title, clock: id === DEMO_MIX_RELEASE_ID ? DEMO_MIX_CLOCK : mock.time },
    ]),
  );
});

/** Every published demo release, newest first. */
export const DEMO_RELEASES: StudioReleaseDTO[] = [
  CIDADE,
  ...MARIANA_OTHER_RELEASES,
  ...MARIANA_SINGLES,
  ...OTHER_ARTIST_RELEASES,
].sort((left, right) =>
  (right.releasedOn ?? "").localeCompare(left.releasedOn ?? ""),
);

/** What only Mariana, the demo owner, sees on her artist page. */
export const DEMO_OWNER_RELEASES: StudioReleaseDTO[] = [
  release(
    {
      id: DEMO_DRAFT_RELEASE_ID,
      title: "Cartas ao mar",
      type: "ep",
      coverUrl: null,
      releasedOn: null,
      artist: DEMO_ARTIST_MARIANA,
      status: "draft",
    },
    // Three playable tracks, so the draft's preview link has a tracklist.
    trackRows(DEMO_DRAFT_RELEASE_ID, [
      { title: "Carta um", clock: "3:41" },
      { title: "Maré vazia", clock: "4:02" },
      { title: "Cais", clock: "2:58" },
    ]),
  ),
  {
    ...release(
      {
        id: "demo-release-taken-down-bairro",
        title: "Bairro antigo",
        type: "single",
        coverUrl: null,
        releasedOn: "2025-11-02",
        artist: DEMO_ARTIST_MARIANA,
        status: "taken_down",
        takedownReason:
          "A rights holder asked us to check the sample on this track",
      },
      trackRows("demo-release-taken-down-bairro", [
        { title: "Bairro antigo", clock: "3:33" },
      ]),
    ),
    // The demo owner can dispute this takedown (Studio open pages).
    canDispute: true,
    dispute: null,
  },
  // Studio v3: scheduled four days ahead, with Notify me holders on Your
  // numbers.
  release(
    {
      id: DEMO_SCHEDULED_RELEASE_ID,
      title: "Maré alta",
      type: "single",
      coverUrl: ARTIST_SINGLES[1]?.image ?? null,
      releasedOn: isoAhead(4, 17).slice(0, 10),
      artist: DEMO_ARTIST_MARIANA,
      status: "scheduled",
      publishAt: isoAhead(4, 17),
      genre: "fado",
      description: "A single for the high tide recorded live in one take",
    },
    trackRows(DEMO_SCHEDULED_RELEASE_ID, [
      { title: "Maré alta", clock: "3:52" },
    ]),
  ),
];

/** Scheduled releases of personas the demo viewer does not own: the visitor
 *  view of an upcoming release (Notify me, the Upcoming card). */
export const DEMO_OTHER_UPCOMING_RELEASES: StudioReleaseDTO[] = [
  release(
    {
      id: DEMO_VISITOR_UPCOMING_RELEASE_ID,
      title: "Night bus (extended)",
      type: "single",
      coverUrl: HOME_CARDS[3]?.image ?? null,
      releasedOn: isoAhead(9, 21).slice(0, 10),
      artist: DEMO_ARTIST_NIGHTFORM,
      status: "scheduled",
      publishAt: isoAhead(9, 21),
      genre: "electronic",
    },
    trackRows(DEMO_VISITOR_UPCOMING_RELEASE_ID, [
      { title: "Night bus (extended)", clock: "7:12" },
      { title: "Last stop", clock: "5:40" },
    ]),
  ),
];

/** A release our team took down, as a listener meets it: its URL answers
 *  410 `studio_release_withdrawn` (the demo library save and the Kitchen
 *  tapes entry point at it). */
export const DEMO_WITHDRAWN_RELEASE_ID = "demo-release-withdrawn";
export const DEMO_WITHDRAWN_TRACK_IDS: ReadonlySet<string> = new Set([
  "demo-track-withdrawn-01",
]);

/** DEMO_LYRICS line by line with its times; blank lines become gaps. */
const DEMO_SYNCED_LYRICS: StudioSyncedLyricLine[] = DEMO_LYRICS.split("\n").map(
  (line, index) => ({ ms: DEMO_SYNCED_LYRIC_TIMES_MS[index] ?? 0, text: line }),
);

export const DEMO_TRACK_DETAILS: Record<
  string,
  {
    credits: StudioCreditDTO[];
    lyrics: string | null;
    syncedLyrics: StudioSyncedLyricLine[] | null;
    chapters: StudioChapter[] | null;
  }
> = {
  [DEMO_DEFAULT_TRACK_ID]: {
    credits: DEMO_TRACK_CREDITS,
    lyrics: DEMO_LYRICS,
    syncedLyrics: DEMO_SYNCED_LYRICS,
    chapters: null,
  },
  [DEMO_MIX_TRACK_ID]: {
    credits: [],
    lyrics: null,
    syncedLyrics: null,
    chapters: DEMO_MIX_CHAPTERS,
  },
};
