import { placeCoordinates } from "./businessCoords";
import { distanceInMetres, type Coordinates } from "./geoDistance";
import { isPlaceOperating, type DirectoryPlace } from "./directoryPlaces";

/** One walkable neighbour, with how far away it is. */
export interface NearbyPlace {
  place: DirectoryPlace;
  metres: number;
}

/** About a fifteen-minute walk. Past this it stops being "while you're out". */
export const WALKING_RADIUS_METRES = 1200;

/** A strip, not a directory: four is enough to plan an evening around. */
export const MAX_NEARBY = 4;

/**
 * The walkable neighbours of a place, nearest first.
 *
 * Three exclusions, each for its own reason:
 *
 * - no coordinates on either side (online-only businesses, demo fixtures that
 *   predate `BUSINESS_COORDS`) → dropped outright. A missing pin is not a
 *   distance of zero, and sorting an unlocatable business to the top of a
 *   "how far is it" list would be a straightforward lie.
 * - the place itself, which is not near itself in any useful sense.
 * - anything not trading normally (`operatingState`): a shuttered, moved or
 *   paused business is a bad suggestion for tonight, however close it is. The
 *   listing still exists and is still reachable, it just doesn't get pitched
 *   as somewhere to go next.
 *
 * Pure, so the component around it stays a render.
 */
export function nearbyPlaces(
  origin: DirectoryPlace,
  candidates: DirectoryPlace[],
  options: { radiusMetres?: number; limit?: number } = {},
): NearbyPlace[] {
  const radiusMetres = options.radiusMetres ?? WALKING_RADIUS_METRES;
  const limit = options.limit ?? MAX_NEARBY;
  const from = placeCoordinates(origin);
  if (!from || origin.online) return [];

  const found: NearbyPlace[] = [];
  for (const candidate of candidates) {
    if (candidate.slug === origin.slug) continue;
    if (candidate.online) continue;
    if (!isPlaceOperating(candidate)) continue;
    const to: Coordinates | null = placeCoordinates(candidate);
    if (!to) continue;
    const metres = distanceInMetres(from, to);
    if (metres > radiusMetres) continue;
    found.push({ place: candidate, metres });
  }

  return found.sort((left, right) => left.metres - right.metres).slice(0, limit);
}
