import type {
  StudioArtistRefView,
  StudioReleaseCardView,
} from "./api/studio.adapters";
import type { StudioCuratedPickView } from "./api/studioDiscovery.adapters";

export const HOME_ARTIST_LIMIT = 8;

/** The artists behind the loaded releases, first appearance first. Studio has
 *  no artists endpoint in v1, so the row grows as more pages load. */
export function uniqueArtists(
  releases: StudioReleaseCardView[],
  limit: number,
): StudioArtistRefView[] {
  const seen = new Map<string, StudioArtistRefView>();
  for (const release of releases) {
    if (!seen.has(release.artist.id))
      seen.set(release.artist.id, release.artist);
    if (seen.size === limit) break;
  }
  return [...seen.values()];
}

export interface StudioHomeHeroChoice {
  release: StudioReleaseCardView | null;
  /** The staff note under the title; featured picks only. */
  note: string | null;
  isFeatured: boolean;
}

/** The featured pick when staff set one that is listenable, else the
 *  newest release, as Studio home always led with. */
export function homeHeroOf(
  featured: StudioCuratedPickView | null,
  releases: StudioReleaseCardView[],
): StudioHomeHeroChoice {
  if (featured)
    return { release: featured, note: featured.note, isFeatured: true };
  return { release: releases[0] ?? null, note: null, isFeatured: false };
}
