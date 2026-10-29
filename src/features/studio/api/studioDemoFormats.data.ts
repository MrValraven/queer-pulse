import type {
  StudioArtistRefDTO,
  StudioChapter,
  StudioCreditDTO,
  StudioReleaseDTO,
  StudioSource,
  StudioTrackSummaryDTO,
} from "./studio.types";
import type { StudioHeroChoice } from "../studioHeroChoice";
import { notesExcerpt } from "./studioEpisodes";
import {
  DEMO_ARTISTS,
  DEMO_ARTIST_DETAILS,
  DEMO_RELEASES,
} from "./studioDemo.data";
import { DEMO_ARTIST_LATE_BLOOMERS, DEMO_STUDIO_ME } from "./studioDemoMe.data";
import { DEMO_FOUNDING_ARTIST_IDS } from "./studioDemoFounding.data";

// Studio artist kinds in the demo (spec 7): a podcast, a spoken word EP and
// two performance releases, wire-shaped so they reach the pages through the
// same adapters as live answers. studioDemoApi.ts merges them with the music
// catalogue. Release dates sit in 2022, behind the first page of the music
// grid; the episodes went live in 2026.

// Cover art reuses the demo photo set the music catalogue already uses
// (studioArtist.data.ts), at 800px like the other release covers.
const COVER_LATE_BLOOMERS =
  "https://images.unsplash.com/photo-1754403754631-75ccec6ca1ed?q=80&w=800&auto=format&fit=crop";
const COVER_LUA_EP =
  "https://images.unsplash.com/photo-1755276706451-7258309ed76a?q=80&w=800&auto=format&fit=crop";
const COVER_PERFORMANCE_EDIT =
  "https://images.unsplash.com/photo-1755593574938-6d66d28f8e57?q=80&w=800&auto=format&fit=crop";

export const DEMO_ARTIST_LUA_CARDOSO: StudioArtistRefDTO = {
  id: "demo-persona-lua-cardoso",
  handle: "",
  name: "Lua Cardoso",
  kind: "poet",
  avatarUrl: null,
};

/** The subprofiles demo's drag persona. */
export const DEMO_ARTIST_VANDA_DIESEL: StudioArtistRefDTO = {
  id: "sp-ines-fonseca-vanda-diesel",
  handle: "vanda-diesel",
  name: "Vanda Diesel",
  kind: "drag",
  avatarUrl:
    "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=800&auto=format&fit=crop",
};

export const DEMO_FORMAT_ARTISTS: StudioArtistRefDTO[] = [
  DEMO_ARTIST_LATE_BLOOMERS,
  DEMO_ARTIST_LUA_CARDOSO,
  DEMO_ARTIST_VANDA_DIESEL,
];

/** `city` stays null, as the server always sends it. */
export const DEMO_FORMAT_ARTIST_DETAILS: Record<
  string,
  { bio: string | null; city: string | null }
> = {
  [DEMO_ARTIST_LATE_BLOOMERS.id]: {
    bio: "Two friends, one kitchen table and a microphone and we talk about coming out late, dating again, chosen family and the small rituals that get us through",
    city: null,
  },
  [DEMO_ARTIST_LUA_CARDOSO.id]: {
    bio: "Poems for reading out loud on the last tram home",
    city: null,
  },
  [DEMO_ARTIST_VANDA_DIESEL.id]: {
    bio: "Lip sync assassin with numbers about religion, motorbikes and my mother",
    city: null,
  },
};

export const DEMO_SHOW_ID = "demo-release-late-bloomers";
export const DEMO_DRAFT_EPISODE_ID = "demo-episode-late-bloomers-draft";

interface DemoTrackSeed {
  id: string;
  title: string;
  durationSeconds: number;
  notes?: string | null;
  sources?: StudioSource[];
  publishedAt?: string | null;
  isDraft?: boolean;
}

/** Notes and sources by track id: the full track read carries them, the
 *  tracklist rows carry the notes' excerpt only (as the backend's do).
 *  `tracksOf` fills it while the releases below are built. */
export const DEMO_FORMAT_TRACK_CONTENT: Record<
  string,
  { notes: string | null; sources: StudioSource[] }
> = {};

function tracksOf(seeds: DemoTrackSeed[]): StudioTrackSummaryDTO[] {
  return seeds.map((seed, index) => {
    DEMO_FORMAT_TRACK_CONTENT[seed.id] = {
      notes: seed.notes ?? null,
      sources: seed.sources ?? [],
    };
    return {
      id: seed.id,
      position: index + 1,
      title: seed.title,
      durationSeconds: seed.durationSeconds,
      isExplicit: false,
      hasAudio: true,
      publishedAt: seed.publishedAt ?? null,
      isDraft: seed.isDraft ?? false,
      notesExcerpt: notesExcerpt(seed.notes ?? null),
    };
  });
}

function formatRelease(
  base: Pick<
    StudioReleaseDTO,
    "id" | "title" | "type" | "artist" | "releasedOn" | "description" | "genres"
  > & { isOwner?: boolean; coverUrl?: string | null },
  tracks: StudioTrackSummaryDTO[],
): StudioReleaseDTO {
  const playable = tracks.filter((track) => !track.isDraft);
  return {
    id: base.id,
    title: base.title,
    type: base.type,
    coverUrl: base.coverUrl ?? null,
    releasedOn: base.releasedOn,
    trackCount: playable.length,
    totalDurationSeconds: playable.reduce(
      (sum, track) => sum + (track.durationSeconds ?? 0),
      0,
    ),
    artist: base.artist,
    publishedAt: base.releasedOn ? `${base.releasedOn}T10:00:00.000Z` : null,
    genre: base.genres[0] ?? null,
    genres: base.genres,
    mood: null,
    scene: null,
    description: base.description,
    status: "published",
    tracks,
    isOwner: base.isOwner ?? false,
    rightsConfirmedAt: base.isOwner ? "2022-11-07T10:00:00.000Z" : null,
    takedownReason: null,
    sceneId: null,
    personaCredits: [],
  };
}

const LATE_BLOOMERS_SHOW = formatRelease(
  {
    id: DEMO_SHOW_ID,
    title: "Late Bloomers",
    type: "podcast",
    artist: DEMO_ARTIST_LATE_BLOOMERS,
    releasedOn: "2022-11-07",
    description:
      "A podcast for people who found themselves later than expected, with new episodes every other Monday",
    genres: [],
    isOwner: true,
    coverUrl: COVER_LATE_BLOOMERS,
  },
  tracksOf([
    {
      id: "demo-episode-late-bloomers-01",
      title: "Coming out at 40",
      durationSeconds: 2292,
      publishedAt: "2026-08-03T07:00:00.000Z",
      notes:
        "We start with the question everyone asks us: why now?\n\n00:00 Hello again\n04:10 Why now\n18:45 Telling our families\n31:20 What we wish we had known\n\nThe support line we mention is at https://example.org/lisbon-helpline",
    },
    {
      id: "demo-episode-late-bloomers-02",
      title: "Dating again at 45",
      durationSeconds: 2645,
      publishedAt: "2026-09-14T07:00:00.000Z",
      notes:
        "Apps, first dates and the courage to say what you want\n\n00:00 Cold open\n06:30 The apps\n27:15 First dates, honestly",
    },
    {
      id: "demo-episode-late-bloomers-03",
      title: "Chosen family dinners",
      durationSeconds: 3100,
      publishedAt: "2026-10-12T07:00:00.000Z",
      notes:
        "Who sits at your table on a Sunday\n\nListener stories from Porto, Faro and Lisbon and if you only came for the recipe skip to 22:40",
    },
    {
      id: DEMO_DRAFT_EPISODE_ID,
      title: "Our parents, part two",
      durationSeconds: 1770,
      isDraft: true,
      notes: "Still editing this one\n\n00:00 Intro",
    },
  ]),
);

const SPOKEN_WORD_EP = formatRelease(
  {
    id: "demo-release-lua-ultimo-eletrico",
    title: "Último elétrico",
    type: "ep",
    artist: DEMO_ARTIST_LUA_CARDOSO,
    releasedOn: "2022-10-21",
    description: "Three poems recorded in one take on a Sunday night",
    genres: ["spoken-word"],
    coverUrl: COVER_LUA_EP,
  },
  tracksOf([
    { id: "demo-track-lua-01", title: "Paragem", durationSeconds: 184 },
    { id: "demo-track-lua-02", title: "Bilhete", durationSeconds: 221 },
    { id: "demo-track-lua-03", title: "Fim da linha", durationSeconds: 263 },
  ]),
);

const LIP_SYNC_MIX = formatRelease(
  {
    id: "demo-release-vanda-sunday-mass",
    title: "Sunday Mass",
    type: "lip_sync",
    artist: DEMO_ARTIST_VANDA_DIESEL,
    releasedOn: "2022-09-30",
    description: "The mix from my Sunday Mass number, cut for the stage",
    genres: [],
    coverUrl: DEMO_ARTIST_VANDA_DIESEL.avatarUrl ?? COVER_PERFORMANCE_EDIT,
  },
  tracksOf([
    {
      id: "demo-track-vanda-mass-01",
      title: "Sunday Mass (stage mix)",
      durationSeconds: 412,
      sources: [
        { title: "Like a Prayer", artist: "Madonna" },
        { title: "Gloria", artist: "Laura Branigan" },
        { title: "Hallelujah", artist: "Leonard Cohen" },
        { title: "Holy", artist: "Sara Tavares" },
      ],
    },
  ]),
);

const PERFORMANCE_EDIT = formatRelease(
  {
    id: "demo-release-vanda-motorbike",
    title: "Motorbike",
    type: "edit",
    artist: DEMO_ARTIST_VANDA_DIESEL,
    releasedOn: "2022-08-12",
    description: "The edit I ride in on",
    genres: [],
    coverUrl: COVER_PERFORMANCE_EDIT,
  },
  tracksOf([
    {
      id: "demo-track-vanda-motorbike-01",
      title: "Motorbike (entrance edit)",
      durationSeconds: 236,
      sources: [
        { title: "Born to Be Wild", artist: "Steppenwolf" },
        { title: "Bad Girls", artist: "Donna Summer" },
      ],
    },
  ]),
);

/** Published, newest first by release date. */
export const DEMO_FORMAT_RELEASES: StudioReleaseDTO[] = [
  LATE_BLOOMERS_SHOW,
  SPOKEN_WORD_EP,
  LIP_SYNC_MIX,
  PERFORMANCE_EDIT,
];

export interface DemoFormatTrackDetails {
  credits?: StudioCreditDTO[];
  /** The lyrics field: a transcript on podcast and spoken word tracks. */
  lyrics?: string;
  chapters?: StudioChapter[];
}

export const DEMO_FORMAT_TRACK_DETAILS: Record<string, DemoFormatTrackDetails> =
  {
    "demo-episode-late-bloomers-01": {
      credits: [{ name: "Late Bloomers", role: "hosts" }],
      chapters: [
        { startSeconds: 0, title: "Hello again", artist: null },
        { startSeconds: 250, title: "Why now", artist: null },
        { startSeconds: 1125, title: "Telling our families", artist: null },
        {
          startSeconds: 1880,
          title: "What we wish we had known",
          artist: null,
        },
      ],
    },
    "demo-episode-late-bloomers-02": {
      chapters: [
        { startSeconds: 0, title: "Cold open", artist: null },
        { startSeconds: 390, title: "The apps", artist: null },
        { startSeconds: 1635, title: "First dates, honestly", artist: null },
      ],
    },
    "demo-episode-late-bloomers-03": {
      lyrics:
        "Welcome back to Late Bloomers\nThis week we asked who sits at your table on a Sunday\n\nA listener in Porto wrote to us about her neighbours\nThey cook for twelve and nobody is related",
    },
    "demo-track-lua-01": {
      lyrics:
        "A paragem tem o meu nome escrito a giz\ne ninguém sabe ler a minha letra\n\nespero o elétrico como quem espera uma carta",
    },
    "demo-track-lua-02": {
      lyrics:
        "Guardei o bilhete no bolso do casaco\nválido até ao fim da linha\n\ne a linha nunca acaba",
    },
    "demo-track-lua-03": {
      lyrics:
        "No fim da linha há um banco de madeira\ne um homem que dá de comer aos pombos\n\nsento-me ao lado dele e não digo nada",
    },
  };

// The demo readers that answer for any persona (artist page, press kit,
// Your numbers, playlist credit) look personas up across both catalogues.

/** Every demo artist: the music catalogue's, then the artist kinds'. Read
 *  per call, so a test that edits DEMO_ARTISTS sees its edit. */
export const demoAllArtists = (): StudioArtistRefDTO[] => [
  ...DEMO_ARTISTS,
  ...DEMO_FORMAT_ARTISTS,
];

/** A persona's bio and city from whichever catalogue holds it. */
export function demoArtistDetailsOf(artistId: string): {
  bio: string | null;
  city: string | null;
  coverUrl: string | null;
  studioHero: StudioHeroChoice | null;
  isFoundingArtist: boolean;
} {
  const details: {
    bio: string | null;
    city: string | null;
    coverUrl?: string | null;
    studioHero?: StudioHeroChoice | null;
  } = DEMO_ARTIST_DETAILS[artistId] ??
    DEMO_FORMAT_ARTIST_DETAILS[artistId] ?? { bio: null, city: null };
  return {
    bio: details.bio,
    city: details.city,
    coverUrl: details.coverUrl ?? null,
    studioHero: details.studioHero ?? null,
    isFoundingArtist: DEMO_FOUNDING_ARTIST_IDS.includes(artistId),
  };
}

/** The demo viewer owns every persona they can upload as. */
export function isDemoOwnedPersona(subprofileId: string): boolean {
  return DEMO_STUDIO_ME.uploadablePersonas.some(
    (persona) => persona.id === subprofileId,
  );
}

/** A persona's published releases across both catalogues, newest first, as
 *  a listener reads them: a draft episode is left out. */
export function demoPublishedReleasesOf(artistId: string): StudioReleaseDTO[] {
  return [...DEMO_RELEASES, ...DEMO_FORMAT_RELEASES]
    .filter(
      (release) =>
        release.artist.id === artistId && release.status === "published",
    )
    .sort((left, right) =>
      (right.releasedOn ?? "").localeCompare(left.releasedOn ?? ""),
    )
    .map((release) => ({
      ...release,
      tracks: release.tracks.filter((track) => track.isDraft !== true),
    }));
}
