import { routes } from "../../app/routeMap";
import type { TFunction } from "../../shared/i18n/types";
import type { DirectoryPlace } from "./directoryPlaces";
import type { Venue } from "./map.data";
import { BUSINESS_COORDS } from "./businessCoords";
import { FREGUESIAS } from "./freguesias.data";

export type LocalKind = "business" | "venue";

/** Safe-space verification state, mirrored from the directory card DTO.
 * "none" = never reviewed. */
export type SafeSpaceStatus = "none" | "verified" | "removed";

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
  /** Safe-space verification state, from the live directory card DTO.
   * Undefined for demo-only venues — never synthesize this for a venue. */
  safeSpaceStatus?: SafeSpaceStatus;
  /** Verification tier when `safeSpaceStatus` is "verified"; null otherwise/absent. */
  safeSpaceTier?: number | null;
  /** Pre-lowered haystack for the search box — name + area + category + blurb
   *  + tags, so a query matches more than just the name. */
  searchText: string;
  /** Original record, for kind-specific card rendering. */
  source: DirectoryPlace | Venue;
}

/** Join the searchable parts of a place into one lowercased haystack. */
function buildSearchText(parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(" ").toLowerCase();
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

/** Freguesia strings already warned about, so a re-render never re-logs the same one. */
const warnedFreguesias = new Set<string>();

/**
 * A place's map count only renders if its `freguesia` matches a parish polygon.
 * In dev, warn when it does not, so an unmapped hood or a mistyped venue parish
 * surfaces instead of silently dropping off the map (the place still lists in
 * the sidebar). Each distinct unknown freguesia warns once, however many times
 * the mappers re-run. `source` names where the value came from, for the message.
 */
function warnIfUnknownFreguesia(freguesia: string, source: string): string {
  if (
    import.meta.env.DEV &&
    !FREGUESIA_NAMES.has(freguesia) &&
    !warnedFreguesias.has(freguesia)
  ) {
    warnedFreguesias.add(freguesia);
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

/**
 * Legacy wizard display strings → canonical slug. Early listings stored the
 * visible label ("Food & drink") as the category, which matches no map/filter
 * slug and paints a black pin. This heals those rows at read time so no DB
 * migration is needed; new places are written as slugs directly.
 */
const CATEGORY_LABEL_TO_SLUG: Record<string, string> = {
  "food & drink": "food",
  "design & craft": "design",
  "health & care": "health",
  spaces: "space",
  culture: "culture",
  tech: "tech",
  "barbershop & salon": "grooming",
  "gym & fitness": "fitness",
  nightlife: "nightlife",
};

const CANONICAL_CATEGORIES: ReadonlySet<string> = new Set(LOCAL_CATEGORIES);

/**
 * Canonicalize any category token to a unified slug. Accepts already-canonical
 * slugs (pass through), the legacy wizard display strings, and folded venue
 * types. Unknown values return unchanged so the `var(--ink)` pin fallback still
 * guards genuinely unmapped data.
 */
export function normalizeCategory(value: string): string {
  if (!value) return value;
  if (CANONICAL_CATEGORIES.has(value)) return value;
  const key = value.trim().toLowerCase();
  return (
    CATEGORY_LABEL_TO_SLUG[key] ?? VENUE_TYPE_TO_CATEGORY[key] ?? value
  );
}

/** Normalize a name for cross-dataset matching: fold diacritics + trim + lowercase. */
export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function businessToLocal(
  place: DirectoryPlace,
  demoMode: boolean,
): LocalPlace {
  // Prefer the pin the owner placed when listing. The hand-placed BUSINESS_COORDS
  // table is demo-only seed data — consulting it in live mode would give a real
  // listing without stored coordinates fake coords on a slug collision.
  const listedCoords =
    place.latitude != null && place.longitude != null
      ? { latitude: place.latitude, longitude: place.longitude }
      : null;
  const fallbackCoords = demoMode ? BUSINESS_COORDS[place.slug] ?? null : null;
  return {
    id: `business:${place.slug}`,
    kind: "business",
    name: place.name,
    category: normalizeCategory(place.cat),
    neighbourhood: place.hood,
    freguesia: warnIfUnknownFreguesia(
      HOOD_TO_FREGUESIA[place.hood] ?? place.hood,
      `business "${place.name}"`,
    ),
    coords: listedCoords ?? fallbackCoords,
    detailPath: `${routes.directory}/${place.slug}`,
    safeSpaceStatus: place.safeSpaceStatus ?? "none",
    safeSpaceTier: place.safeSpaceTier ?? null,
    searchText: buildSearchText([
      place.name,
      place.hood,
      place.cat,
      place.desc,
      place.pills?.join(" "),
    ]),
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
    searchText: buildSearchText([
      venue.name,
      venue.bairro,
      venue.type,
      venue.note,
      venue.vibe?.join(" "),
    ]),
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
      searchText: buildSearchText([business.searchText, twin.searchText]),
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

/**
 * The one way to render a category label. Canonicalizes the token first, so it
 * resolves both unified slugs and any legacy display-string value; falls back
 * to the raw value for genuinely unknown tokens.
 */
export function categoryLabel(t: TFunction, category: string): string {
  const slug = normalizeCategory(category);
  const key = LOCAL_CATEGORY_LABEL_KEYS[slug];
  return key ? t(key) : category;
}

export interface LocalFilters {
  category: string;
  query: string;
  vibes: string[];
  /** `"verified"` restricts to safe-space-verified places; `null`/absent = no restriction. */
  safe?: "verified" | null;
}

/**
 * Shared filter for both list + map views. The query matches the full
 * `searchText` haystack (name + area + category + blurb + tags), not just the
 * name. Vibes are **pass-through**: only venues carry vibe data, so a selected
 * vibe narrows venues while businesses (no vibe) always stay visible — instead
 * of silently deleting every business the moment a vibe is picked. `safe` is a
 * hard filter like category: demo-only venues never carry `safeSpaceStatus`
 * (undefined), so they're naturally excluded once it's active.
 */
export function filterLocalPlaces(
  places: LocalPlace[],
  filters: LocalFilters,
): LocalPlace[] {
  const normalizedQuery = filters.query.trim().toLowerCase();
  return places.filter((place) => {
    if (filters.category !== "all" && place.category !== filters.category) {
      return false;
    }
    if (normalizedQuery && !place.searchText.includes(normalizedQuery)) {
      return false;
    }
    if (filters.vibes.length > 0) {
      const placeVibes = place.vibe ?? [];
      if (
        placeVibes.length > 0 &&
        !filters.vibes.some((vibe) => placeVibes.includes(vibe))
      ) {
        return false;
      }
    }
    if (filters.safe === "verified" && place.safeSpaceStatus !== "verified") {
      return false;
    }
    return true;
  });
}

/** Sort options for the list. "default" keeps the curated data order. */
export type LocalSort = "default" | "name" | "hood";

/** Sort a filtered list. "default" is a no-op (returns the input untouched). */
export function sortLocalPlaces(
  places: LocalPlace[],
  sort: LocalSort,
): LocalPlace[] {
  if (sort === "default") return places;
  const sorted = [...places];
  if (sort === "name") {
    sorted.sort((first, second) => first.name.localeCompare(second.name));
  } else {
    sorted.sort(
      (first, second) =>
        first.neighbourhood.localeCompare(second.neighbourhood) ||
        first.name.localeCompare(second.name),
    );
  }
  return sorted;
}
