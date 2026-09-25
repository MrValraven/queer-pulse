/**
 * Lisbon's official freguesias (parishes): the taxonomy housing listings use
 * as their `area`. Derived directly from the freguesia dataset the maps
 * render (`shared/components/map/freguesias.data.ts`), so the picker and the
 * map are always in sync. Mirrors the backend's `housing-geo.ts`
 * NEIGHBOURHOOD_CENTROIDS. A listing whose area isn't a freguesia is still
 * listable, just not pickable/mappable until added in both places.
 */
import { FREGUESIAS } from "../../shared/components/map/freguesias.data";

export interface HousingNeighbourhood {
  name: string;
  latitude: number;
  longitude: number;
}

export const LISBON_HOUSING_NEIGHBOURHOODS: readonly HousingNeighbourhood[] =
  FREGUESIAS.features.map((feature) => ({
    name: feature.properties.name,
    latitude: feature.properties.labelPoint[1],
    longitude: feature.properties.labelPoint[0],
  }));

// Accent- and case-insensitive key ("Príncipe Real" and "principe real" match)
// same normalisation the backend geocoder uses.
function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

const BY_KEY = new Map(
  LISBON_HOUSING_NEIGHBOURHOODS.map((entry) => [
    normalizeName(entry.name),
    entry,
  ]),
);

/** The parish entry a name refers to, matched without regard to accents or
 * case ("principe real" finds "Príncipe Real"), or null when the name is not a
 * Lisbon parish. The entry's `name` is the exact spelling the map overlay uses. */
export function findHousingNeighbourhood(
  name: string,
): HousingNeighbourhood | null {
  return BY_KEY.get(normalizeName(name)) ?? null;
}

/** The centroid for a neighbourhood name, or null when we don't know it. */
export function neighbourhoodCentroid(
  name: string,
): { latitude: number; longitude: number } | null {
  const entry = findHousingNeighbourhood(name);
  return entry
    ? { latitude: entry.latitude, longitude: entry.longitude }
    : null;
}
