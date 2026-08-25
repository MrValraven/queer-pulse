/**
 * Great-circle distance between two points on Earth, in metres.
 *
 * There is no distance helper anywhere else in the repo: the housing feature's
 * geo work (`housingNeighbourhoods.ts`, `housingMapClusters.ts`) only ever
 * looks centroids up by name and groups by them, it never measures. So this is
 * the one place the maths lives.
 *
 * Kept pure and dependency-free (no React, no place types) so it can be tested
 * on its own and reused by anything that has two coordinate pairs. Haversine is
 * accurate to well under a metre at city scale, which is far more precision
 * than a "how far is that walk?" answer needs.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Mean Earth radius in metres (IUGG). */
const EARTH_RADIUS_METRES = 6371008.8;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Distance between two coordinates in metres. Always zero or positive. */
export function distanceInMetres(from: Coordinates, to: Coordinates): number {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_METRES * Math.asin(Math.min(1, Math.sqrt(haversine)));
}
