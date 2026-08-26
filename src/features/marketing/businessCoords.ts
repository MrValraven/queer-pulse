/**
 * Approximate coordinates for street-addressed directory businesses, keyed by
 * slug. Only non-overlapping businesses appear here — the six that share a
 * venue name inherit coordinates from their venue twin during the demo merge
 * (see mergeLocalPlaces), and location-less listings (e.g. queer-supper-club)
 * are omitted so they stay list-only. Values are hand-placed from the real
 * street addresses; refine against the rendered map in slice 3.
 */
import type { Coordinates } from "./geoDistance";
import type { DirectoryPlace } from "./directoryPlaces";

export const BUSINESS_COORDS: Record<
  string,
  { latitude: number; longitude: number }
> = {
  "atelier-pulso": { latitude: 38.7167, longitude: -9.149 },
  "estudio-beatriz-pinto": { latitude: 38.7205, longitude: -9.1305 },
  "opus-diversus": { latitude: 38.7195, longitude: -9.136 },
  "livraria-bertha": { latitude: 38.7148, longitude: -9.15 },
  "cafe-mouraria-velha": { latitude: 38.7156, longitude: -9.136 },
  "bairro-alto-studio": { latitude: 38.7128, longitude: -9.146 },
  "espaco-intendente": { latitude: 38.7205, longitude: -9.1355 },
  "a-farinha": { latitude: 38.729, longitude: -9.136 },
  "studio-andre-quintela": { latitude: 38.707, longitude: -9.145 },
  "clinica-da-estrela": { latitude: 38.713, longitude: -9.16 },
  "galeria-lume": { latitude: 38.736, longitude: -9.105 },
};

/**
 * Where a place actually sits, in the one fallback order the whole directory
 * agrees on: the listing's own pin first (live listings carry it on the DTO),
 * then the hand-placed demo table above, keyed by slug.
 *
 * The table is DEMO seed data, so `demoMode` gates it, exactly as
 * `businessToLocal` gates the same lookup. Without that gate a real listing
 * whose slug happened to match one of the eleven demo slugs would inherit
 * coordinates for a business it has nothing to do with, and get a confident
 * pin on a street it has never traded on.
 *
 * Returns `null` when neither exists: an online-only business, a live listing
 * whose owner never dropped a pin, or a listing with no location at all.
 * Callers must treat that as "not on the map" and never substitute a
 * placeholder point.
 */
export function placeCoordinates(
  place: DirectoryPlace,
  demoMode: boolean,
): Coordinates | null {
  if (place.latitude != null && place.longitude != null) {
    return { latitude: place.latitude, longitude: place.longitude };
  }
  return demoMode ? (BUSINESS_COORDS[place.slug] ?? null) : null;
}
