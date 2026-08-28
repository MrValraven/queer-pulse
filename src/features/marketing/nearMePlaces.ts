import { distanceInMetres, type Coordinates } from "./geoDistance";
import type { LocalPlace } from "./localPlaces";

/**
 * Ordering the Local list by how far each place is from the member, and the
 * walking time that goes on its card.
 *
 * Pure and dependency-free, so the component around it stays a render and the
 * member's position never leaves the call: nothing here stores, sends or logs a
 * coordinate. The maths is haversine over coordinates the page has already
 * fetched, so switching this on costs no request at all.
 */

/**
 * A comfortable walking pace, in metres per minute. 80 m/min is about
 * 4.8 km/h: the pace planners use for an unhurried adult on flat ground.
 * Lisbon's hills mean a real walk often takes longer, which is why the chip
 * says "about", and why the estimate is never presented as a promise.
 */
const WALKING_METRES_PER_MINUTE = 80;

/** Under a minute still reads as a minute; nothing rounds down to zero. */
export function walkMinutes(metres: number): number {
  return Math.max(1, Math.round(metres / WALKING_METRES_PER_MINUTE));
}

/**
 * The straight-line distance from the member to each place that has a real
 * position, keyed by `LocalPlace.id`.
 *
 * A place with no coordinates is simply ABSENT from the map. It never gets a
 * fabricated distance and never gets zero, which would sort an online-only
 * business or an unpinned listing to the very top of a "what is near me" list.
 */
export function distancesFrom(
  origin: Coordinates,
  places: LocalPlace[],
): Map<string, number> {
  const metresById = new Map<string, number>();
  for (const place of places) {
    if (!place.coords) continue;
    metresById.set(place.id, distanceInMetres(origin, place.coords));
  }
  return metresById;
}

/**
 * The same places, nearest first.
 *
 * Places with no coordinates keep their existing relative order and sit at the
 * end, after everything that could be measured. They are still results (an
 * online business is a real answer to a search), they just cannot answer "how
 * far", so they never jump the queue and never claim a distance.
 */
export function sortByDistance(
  places: LocalPlace[],
  metresById: ReadonlyMap<string, number>,
): LocalPlace[] {
  return [...places].sort((first, second) => {
    const firstMetres = metresById.get(first.id);
    const secondMetres = metresById.get(second.id);
    if (firstMetres === undefined && secondMetres === undefined) return 0;
    if (firstMetres === undefined) return 1;
    if (secondMetres === undefined) return -1;
    return firstMetres - secondMetres;
  });
}

/**
 * The same places grouped by neighbourhood, with distance deciding the order at
 * both levels: the neighbourhoods themselves come nearest-first (each one
 * judged by its closest place), and inside each neighbourhood the places do
 * too.
 *
 * This is how "By neighbourhood" and "use my location" both stay in force at
 * once. The chosen sort still decides the SHAPE of the list (one neighbourhood
 * at a time, which is what the member asked for), and the position decides the
 * order within that shape, so neither answer has to be thrown away.
 *
 * The same rule as `sortByDistance` covers what cannot be measured: a place
 * with no coordinates sits at the end of its own neighbourhood, and a
 * neighbourhood where nothing could be measured sits at the end of the list,
 * alphabetically among its like. Nothing is given a fabricated distance.
 */
export function sortByNeighbourhoodDistance(
  places: LocalPlace[],
  metresById: ReadonlyMap<string, number>,
): LocalPlace[] {
  const nearestByNeighbourhood = new Map<string, number>();
  for (const place of places) {
    const metres = metresById.get(place.id);
    if (metres === undefined) continue;
    const nearest = nearestByNeighbourhood.get(place.neighbourhood);
    if (nearest === undefined || metres < nearest) {
      nearestByNeighbourhood.set(place.neighbourhood, metres);
    }
  }

  return [...places].sort((first, second) => {
    if (first.neighbourhood !== second.neighbourhood) {
      const firstNearest = nearestByNeighbourhood.get(first.neighbourhood);
      const secondNearest = nearestByNeighbourhood.get(second.neighbourhood);
      if (firstNearest === undefined && secondNearest === undefined) {
        return first.neighbourhood.localeCompare(second.neighbourhood);
      }
      if (firstNearest === undefined) return 1;
      if (secondNearest === undefined) return -1;
      return (
        firstNearest - secondNearest ||
        first.neighbourhood.localeCompare(second.neighbourhood)
      );
    }
    const firstMetres = metresById.get(first.id);
    const secondMetres = metresById.get(second.id);
    if (firstMetres === undefined && secondMetres === undefined) {
      return first.name.localeCompare(second.name);
    }
    if (firstMetres === undefined) return 1;
    if (secondMetres === undefined) return -1;
    return firstMetres - secondMetres || first.name.localeCompare(second.name);
  });
}
