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
  StudioCreditDTO,
  StudioReleaseDTO,
  StudioReleaseType,
  StudioTrackSummaryDTO,
} from "./studio.types";
import {
  DEMO_ARTIST_MARIANA,
  DEMO_DEFAULT_RELEASE_ID,
  DEMO_DEFAULT_TRACK_ID,
} from "./studioDemoMe.data";

const NIGHTFORM: StudioArtistRefDTO = {
  id: "sp-diogo-nightform",
  handle: "nightform",
  name: "NIGHTFORM",
  kind: "musician",
  avatarUrl: null,
};
const LECHATDASHINKO: StudioArtistRefDTO = {
  id: "sp-jordan-lechatdashinko",
  handle: "jordan-lechatdashinko",
  name: "LeChatDashinko",
  kind: "dj",
  avatarUrl: null,
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

export const DEMO_ARTISTS: StudioArtistRefDTO[] = [
  DEMO_ARTIST_MARIANA,
  NIGHTFORM,
  LECHATDASHINKO,
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
  [NIGHTFORM.id]: {
    bio: "Synths, a drum machine and one long night bus home",
    city: null,
  },
  [LECHATDASHINKO.id]: {
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

const secondsOf = (clock: string): number => {
  const [minutes = "0", seconds = "0"] = clock.split(":");
  return Number(minutes) * 60 + Number(seconds);
};
const joinTitle = (pre: string, em?: string, post?: string) =>
  `${pre}${em ?? ""}${post ?? ""}`.trim();

function trackRows(
  releaseId: string,
  titles: { title: string; clock: string }[],
): StudioTrackSummaryDTO[] {
  return titles.map((row, index) => ({
    id: `${releaseId.replace("demo-release-", "demo-track-")}-${String(index + 1).padStart(2, "0")}`,
    position: index + 1,
    title: row.title,
    durationSeconds: secondsOf(row.clock),
    isExplicit: false,
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
const EXTRA_TRACK_TITLES: Record<string, { title: string; clock: string }[]> = {
  "A Beja": [
    { title: "Planície", clock: "3:58" },
    { title: "A Beja", clock: "4:21" },
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

const HOME_ARTISTS = [RITA, LECHATDASHINKO, CORO, NIGHTFORM];
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
    trackRows(id, [{ title, clock: mock.time }]),
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
      id: "demo-release-draft-cartas-ao-mar",
      title: "Cartas ao mar",
      type: "ep",
      coverUrl: null,
      releasedOn: null,
      artist: DEMO_ARTIST_MARIANA,
      status: "draft",
    },
    [],
  ),
  release(
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
];

export const DEMO_TRACK_DETAILS: Record<
  string,
  { credits: StudioCreditDTO[]; lyrics: string | null }
> = {
  [DEMO_DEFAULT_TRACK_ID]: { credits: DEMO_TRACK_CREDITS, lyrics: DEMO_LYRICS },
};
