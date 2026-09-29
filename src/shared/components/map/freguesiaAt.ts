import type { Position } from "geojson";
import { FREGUESIAS } from "./freguesias.data";

// Even-odd ray cast: a horizontal ray from the point crosses the ring's edges
// an odd number of times exactly when the point is inside it.
function isInsideRing(
  longitude: number,
  latitude: number,
  ring: Position[],
): boolean {
  let isInside = false;
  for (
    let index = 0, previous = ring.length - 1;
    index < ring.length;
    previous = index++
  ) {
    const current = ring[index];
    const prior = ring[previous];
    if (!current || !prior) continue;
    const [currentLongitude = 0, currentLatitude = 0] = current;
    const [priorLongitude = 0, priorLatitude = 0] = prior;
    const crossesLatitude =
      currentLatitude > latitude !== priorLatitude > latitude;
    if (
      crossesLatitude &&
      longitude <
        ((priorLongitude - currentLongitude) * (latitude - currentLatitude)) /
          (priorLatitude - currentLatitude) +
          currentLongitude
    ) {
      isInside = !isInside;
    }
  }
  return isInside;
}

// The first ring is the outline; any later rings are holes cut out of it.
function isInsidePolygon(
  longitude: number,
  latitude: number,
  rings: Position[][],
): boolean {
  const [outline, ...holes] = rings;
  if (!outline || !isInsideRing(longitude, latitude, outline)) return false;
  return !holes.some((hole) => isInsideRing(longitude, latitude, hole));
}

// The parish whose polygon contains the point, or null when it falls outside
// every mapped parish (outside Lisbon, or on the river).
export function freguesiaAt(
  latitude: number,
  longitude: number,
): string | null {
  for (const feature of FREGUESIAS.features) {
    const geometry = feature.geometry;
    const polygons =
      geometry.type === "Polygon"
        ? [geometry.coordinates]
        : geometry.coordinates;
    if (polygons.some((rings) => isInsidePolygon(longitude, latitude, rings))) {
      return feature.properties.name;
    }
  }
  return null;
}
