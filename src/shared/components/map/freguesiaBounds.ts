import type { MultiPolygon, Polygon } from "geojson";
import { FREGUESIAS } from "./freguesias.data";

// The bounding box [SW, NE] that contains every named parish's polygon, for
// easing the camera to a selection (one name or many). Unknown names are
// skipped; returns null if none of the given names match a known parish.
export function freguesiaBounds(
  names: string[],
): [[number, number], [number, number]] | null {
  const wanted = new Set(names);
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const feature of FREGUESIAS.features) {
    if (!wanted.has(feature.properties.name)) continue;
    const geometry: Polygon | MultiPolygon = feature.geometry;
    const polygons =
      geometry.type === "Polygon"
        ? [geometry.coordinates]
        : geometry.coordinates;
    for (const polygon of polygons) {
      for (const ring of polygon) {
        for (const position of ring) {
          const lng = position[0];
          const lat = position[1];
          if (lng === undefined || lat === undefined) continue;
          if (lng < minLng) minLng = lng;
          if (lat < minLat) minLat = lat;
          if (lng > maxLng) maxLng = lng;
          if (lat > maxLat) maxLat = lat;
        }
      }
    }
  }

  if (minLng === Infinity) return null;
  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
