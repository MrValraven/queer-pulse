import { routes } from "../../app/routeMap";
import type { DirectoryPlace } from "./directoryPlaces";
import type { Venue } from "./map.data";
import { BUSINESS_COORDS } from "./businessCoords";
import { FREGUESIAS } from "./freguesias.data";

export type LocalKind = "business" | "venue";

export interface Coords {
  latitude: number;
  longitude: number;
}

export interface LocalPlace {
  /** Namespaced: "business:<slug>" | "venue:<id>". */
  id: string;
  kind: LocalKind;
  name: string;
  /** Unified category id (see LOCAL_CATEGORIES / the fold). */
  category: string;
  /** Informal neighbourhood, for the card subtitle. */
  neighbourhood: string;
  /** Official parish — map + parish-sidebar key. */
  freguesia: string;
  /** null ⇒ list-only (no mappable address). */
  coords: Coords | null;
  /** Where "view / see full details" points. */
  detailPath: string;
  /** Venue-only extras; undefined for businesses without a venue twin. */
  vibe?: string[];
  beenHere?: number;
  /** Original record, for kind-specific card rendering. */
  source: DirectoryPlace | Venue;
}

/** Informal directory `hood` → official parish used by the map + sidebar. */
export const HOOD_TO_FREGUESIA: Record<string, string> = {
  "Príncipe Real": "Misericórdia",
  "Bairro Alto": "Misericórdia",
  "Cais do Sodré": "Misericórdia",
  Mouraria: "Santa Maria Maior",
  Alfama: "Santa Maria Maior",
  Graça: "São Vicente",
  Intendente: "Arroios",
  Arroios: "Arroios",
  Estrela: "Estrela",
  Marvila: "Marvila",
};

/** The official parish names that have a polygon on the map. Source of truth: freguesias.data. */
export const FREGUESIA_NAMES: ReadonlySet<string> = new Set(
  FREGUESIAS.features.map((feature) => feature.properties.name),
);

/**
 * A place's map count only renders if its `freguesia` matches a parish polygon.
 * In dev, warn when it does not, so an unmapped hood or a mistyped venue parish
 * surfaces instead of silently dropping off the map (the place still lists in
 * the sidebar). `source` names where the value came from, for the message.
 */
function warnIfUnknownFreguesia(freguesia: string, source: string): string {
  if (import.meta.env.DEV && !FREGUESIA_NAMES.has(freguesia)) {
    console.warn(
      `[localPlaces] ${source} → freguesia "${freguesia}" is not one of the ` +
        `${FREGUESIA_NAMES.size} Lisbon parishes; its map count will not render. ` +
        `Add the hood to HOOD_TO_FREGUESIA or fix the parish name.`,
    );
  }
  return freguesia;
}

/** Venue `type` → unified category id (folds bar/club/sauna into "nightlife"). */
export const VENUE_TYPE_TO_CATEGORY: Record<string, string> = {
  café: "food",
  clinic: "health",
  gym: "fitness",
  barbershop: "grooming",
  bookshop: "culture",
  "community space": "space",
  bar: "nightlife",
  club: "nightlife",
  sauna: "nightlife",
};

/** Unified category ids, in chip order. "nightlife" is new; the rest mirror the directory. */
export const LOCAL_CATEGORIES = [
  "food",
  "design",
  "health",
  "space",
  "culture",
  "tech",
  "grooming",
  "fitness",
  "nightlife",
] as const;

/** Normalize a name for cross-dataset matching: fold diacritics + trim + lowercase. */
export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function businessToLocal(place: DirectoryPlace): LocalPlace {
  return {
    id: `business:${place.slug}`,
    kind: "business",
    name: place.name,
    category: place.cat,
    neighbourhood: place.hood,
    freguesia: warnIfUnknownFreguesia(
      HOOD_TO_FREGUESIA[place.hood] ?? place.hood,
      `business "${place.name}"`,
    ),
    coords: BUSINESS_COORDS[place.slug] ?? null,
    detailPath: `${routes.directory}/${place.slug}`,
    source: place,
  };
}

export function venueToLocal(venue: Venue): LocalPlace {
  return {
    id: `venue:${venue.id}`,
    kind: "venue",
    name: venue.name,
    category: VENUE_TYPE_TO_CATEGORY[venue.type] ?? venue.type,
    neighbourhood: venue.bairro,
    freguesia: warnIfUnknownFreguesia(venue.freguesia, `venue "${venue.name}"`),
    coords: { latitude: venue.latitude, longitude: venue.longitude },
    detailPath: `${routes.venue}/${venue.id}`,
    vibe: venue.vibe,
    beenHere: venue.beenHere,
    source: venue,
  };
}

/**
 * Demo-only merge: businesses are canonical. A venue whose normalized name
 * matches a business folds its coords/vibe/beenHere into that business and is
 * dropped; a business keeps its own coords when it already has them. Venues
 * with no business twin pass through as their own entries.
 */
export function mergeLocalPlaces(
  businesses: LocalPlace[],
  venues: LocalPlace[],
): LocalPlace[] {
  const venueByName = new Map<string, LocalPlace>();
  venues.forEach((venue) => venueByName.set(normalizeName(venue.name), venue));

  const mergedBusinesses = businesses.map((business) => {
    const key = normalizeName(business.name);
    const twin = venueByName.get(key);
    if (!twin) return business;
    venueByName.delete(key);
    return {
      ...business,
      coords: business.coords ?? twin.coords,
      vibe: twin.vibe,
      beenHere: twin.beenHere,
    };
  });

  return [...mergedBusinesses, ...venueByName.values()];
}

/** Unified category id → i18n label key. "nightlife" is the only new key. */
export const LOCAL_CATEGORY_LABEL_KEYS: Record<string, string> = {
  food: "marketing:directory.cat.food",
  design: "marketing:directory.cat.design",
  health: "marketing:directory.cat.health",
  space: "marketing:directory.cat.space",
  culture: "marketing:directory.cat.culture",
  tech: "marketing:directory.cat.tech",
  grooming: "marketing:directory.cat.grooming",
  fitness: "marketing:directory.cat.fitness",
  nightlife: "marketing:local.cat.nightlife",
};

export interface LocalFilters {
  category: string;
  query: string;
  vibes: string[];
}

/** Shared filter for both list + map views. Vibe-less places drop out once any vibe is selected. */
export function filterLocalPlaces(
  places: LocalPlace[],
  filters: LocalFilters,
): LocalPlace[] {
  const normalizedQuery = filters.query.trim().toLowerCase();
  return places.filter((place) => {
    if (filters.category !== "all" && place.category !== filters.category) {
      return false;
    }
    if (
      normalizedQuery &&
      !(
        place.name.toLowerCase().includes(normalizedQuery) ||
        place.neighbourhood.toLowerCase().includes(normalizedQuery)
      )
    ) {
      return false;
    }
    if (
      filters.vibes.length > 0 &&
      !filters.vibes.some((vibe) => (place.vibe ?? []).includes(vibe))
    ) {
      return false;
    }
    return true;
  });
}
