import type { IconType } from "react-icons";
import { FiHeadphones, FiHeart, FiMapPin } from "react-icons/fi";
import type {
  StudioArtistRefView,
  StudioReleaseCardView,
} from "./api/studio.adapters";
import { STUDIO_GENRE_LABEL_KEY } from "./api/studio.adapters";
import {
  STUDIO_GENRES,
  STUDIO_MOODS,
  type StudioGenre,
  type StudioMood,
} from "./api/studio.types";
import { STUDIO_MOOD_LABEL_KEY } from "./studioDiscoveryLabels";
import type { StudioTaste } from "./studioFirstRunTaste";

/** Static data for the Studio welcome (PRD-12): its three steps, what Studio
 *  is, the genre and mood vocabularies and the artists to follow. */

export type StudioFirstRunStepId = "about" | "taste" | "follow";

export interface StudioFirstRunStep {
  id: StudioFirstRunStepId;
  titleKey: string;
  /** Read after "Step 2 of 3" in the live region when the step changes. */
  nameKey: string;
}

/** Never empty, so the first step always exists. */
export const FIRST_RUN_STEPS: readonly [
  StudioFirstRunStep,
  ...StudioFirstRunStep[],
] = [
  {
    id: "about",
    titleKey: "studio:firstRun.about.title",
    nameKey: "studio:firstRun.about.name",
  },
  {
    id: "taste",
    titleKey: "studio:firstRun.taste.title",
    nameKey: "studio:firstRun.taste.name",
  },
  {
    id: "follow",
    titleKey: "studio:firstRun.follow.title",
    nameKey: "studio:firstRun.follow.name",
  },
];

/** The step at `index`, the first one for an index out of range. */
export function firstRunStepAt(index: number): StudioFirstRunStep {
  return FIRST_RUN_STEPS[index] ?? FIRST_RUN_STEPS[0];
}

export interface StudioFirstRunPromise {
  id: string;
  icon: IconType;
  titleKey: string;
  bodyKey: string;
}

/** Step 1: listen, save, follow. */
export const FIRST_RUN_PROMISES: readonly StudioFirstRunPromise[] = [
  {
    id: "listen",
    icon: FiHeadphones,
    titleKey: "studio:firstRun.about.listen.title",
    bodyKey: "studio:firstRun.about.listen.body",
  },
  {
    id: "save",
    icon: FiHeart,
    titleKey: "studio:firstRun.about.save.title",
    bodyKey: "studio:firstRun.about.save.body",
  },
  {
    id: "follow",
    icon: FiMapPin,
    titleKey: "studio:firstRun.about.follow.title",
    bodyKey: "studio:firstRun.about.follow.body",
  },
];

export interface StudioFirstRunChoice<Value extends string> {
  value: Value;
  labelKey: string;
}

/** Not offered in step 2: the catch-all, and Spoken word, which the
 *  format chips already name. */
const FIRST_RUN_LEFT_OUT_GENRES: ReadonlySet<StudioGenre> = new Set([
  "other",
  "spoken-word",
]);

/** Step 2: every genre a release can carry, less the ones left out above. */
export const FIRST_RUN_GENRES: readonly StudioFirstRunChoice<StudioGenre>[] =
  STUDIO_GENRES.filter((genre) => !FIRST_RUN_LEFT_OUT_GENRES.has(genre)).map(
    (genre) => ({
      value: genre,
      labelKey: STUDIO_GENRE_LABEL_KEY[genre],
    }),
  );

export const FIRST_RUN_MOODS: readonly StudioFirstRunChoice<StudioMood>[] =
  STUDIO_MOODS.map((mood) => ({
    value: mood,
    labelKey: STUDIO_MOOD_LABEL_KEY[mood],
  }));

/** Step 3 shows at most this many artists. */
export const FIRST_RUN_ARTIST_LIMIT = 6;

export interface StudioFirstRunArtist {
  artist: StudioArtistRefView;
  /** The scene of the release that brought the artist in, if any. */
  sceneName: string | null;
}

/** The artists behind the loaded releases, the member's own personas left
 *  out. Artists whose releases match a picked genre or mood come first; each
 *  group keeps the server's newest-first order. */
export function suggestedArtistsOf(
  releases: readonly StudioReleaseCardView[],
  taste: StudioTaste,
  ownArtistIds: ReadonlySet<string>,
  limit: number = FIRST_RUN_ARTIST_LIMIT,
): StudioFirstRunArtist[] {
  const pickedGenres: ReadonlySet<string> = new Set(taste.genres);
  const pickedMoods: ReadonlySet<string> = new Set(taste.moods);
  const matching = new Map<string, StudioFirstRunArtist>();
  const others = new Map<string, StudioFirstRunArtist>();
  for (const release of releases) {
    const artistId = release.artist.id;
    if (ownArtistIds.has(artistId) || matching.has(artistId)) continue;
    const isMatch =
      release.genres.some((genre) => pickedGenres.has(genre)) ||
      (release.mood !== null && pickedMoods.has(release.mood));
    const suggestion = {
      artist: release.artist,
      sceneName: release.scene?.name ?? null,
    };
    if (isMatch) {
      others.delete(artistId);
      matching.set(artistId, suggestion);
    } else if (!others.has(artistId)) {
      others.set(artistId, suggestion);
    }
  }
  return [...matching.values(), ...others.values()].slice(0, limit);
}
