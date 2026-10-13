import type {
  StudioArtistRefView,
  StudioReleaseCardView,
} from "./api/studio.adapters";

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
