/**
 * Canonical Lisbon housing neighbourhoods: the informal areas listings use as
 * their `area`, each with the approximate centroid the map pins at. Mirrors the
 * backend's `housing-geo.ts` NEIGHBOURHOOD_CENTROIDS (Lisbon entries). The
 * neighbourhood picker offers these `name`s; a listing whose area isn't here is
 * still listable, just not pickable/mappable until added in both places.
 */
export interface HousingNeighbourhood {
  name: string;
  latitude: number;
  longitude: number;
}

// Display order roughly central-out. Names are the human display form; matching
// against listing areas is accent/case-insensitive (see `normalizeName`).
export const LISBON_HOUSING_NEIGHBOURHOODS: readonly HousingNeighbourhood[] = [
  { name: "Príncipe Real", latitude: 38.7176, longitude: -9.1503 },
  { name: "Chiado", latitude: 38.7106, longitude: -9.141 },
  { name: "Bairro Alto", latitude: 38.713, longitude: -9.147 },
  { name: "Cais do Sodré", latitude: 38.7057, longitude: -9.1454 },
  { name: "Mouraria", latitude: 38.7167, longitude: -9.1355 },
  { name: "Alfama", latitude: 38.7118, longitude: -9.129 },
  { name: "Graça", latitude: 38.7223, longitude: -9.13 },
  { name: "Intendente", latitude: 38.722, longitude: -9.136 },
  { name: "Anjos", latitude: 38.726, longitude: -9.135 },
  { name: "Arroios", latitude: 38.73, longitude: -9.135 },
  { name: "Penha", latitude: 38.735, longitude: -9.128 },
  { name: "Estrela", latitude: 38.7135, longitude: -9.1607 },
  { name: "Lapa", latitude: 38.7085, longitude: -9.165 },
  { name: "Santos", latitude: 38.708, longitude: -9.156 },
  { name: "Campo de Ourique", latitude: 38.718, longitude: -9.166 },
  { name: "Alcântara", latitude: 38.705, longitude: -9.178 },
  { name: "Belém", latitude: 38.6975, longitude: -9.2036 },
  { name: "Marvila", latitude: 38.738, longitude: -9.101 },
  { name: "Benfica", latitude: 38.75, longitude: -9.2 },
];

/** Accent- and case-insensitive key ("Príncipe Real" and "principe real" match)
 * - same normalisation the backend geocoder uses. */
function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036F]/g, "")
    .trim()
    .toLowerCase();
}

const BY_KEY = new Map(
  LISBON_HOUSING_NEIGHBOURHOODS.map((entry) => [normalizeName(entry.name), entry]),
);

/** The centroid for a neighbourhood name, or null when we don't know it. */
export function neighbourhoodCentroid(
  name: string,
): { latitude: number; longitude: number } | null {
  const entry = BY_KEY.get(normalizeName(name));
  return entry ? { latitude: entry.latitude, longitude: entry.longitude } : null;
}
