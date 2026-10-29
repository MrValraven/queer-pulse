import type { StudioReleaseView } from "./api/studio.adapters";
import {
  STUDIO_FORMAT_BY_KIND,
  STUDIO_GENRES,
  type StudioArtistPersonaKind,
  type StudioGenre,
} from "./api/studio.types";

const KNOWN_GENRES: ReadonlySet<string> = new Set(STUDIO_GENRES);

/** Artist kinds: poet and spoken word releases start on Spoken word (spec
 *  4.6); everyone else starts with no genre. */
export function defaultGenresForKind(
  kind: StudioArtistPersonaKind | undefined,
): StudioGenre[] {
  return kind && STUDIO_FORMAT_BY_KIND[kind] === "spoken_word"
    ? ["spoken-word"]
    : [];
}

/** The listed genres of a saved release, in its order. Unlisted legacy
 *  values stay out of the form. */
export function knownGenresOf(release: StudioReleaseView): StudioGenre[] {
  return release.genres.filter((genre): genre is StudioGenre =>
    KNOWN_GENRES.has(genre),
  );
}
