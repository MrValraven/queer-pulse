import { routes } from "../../app/routeMap";
import { normalizeCategory, VENUE_TYPE_TO_CATEGORY } from "./localCategories";
import {
  isPlaceOperating,
  openStatus,
  zonedNow,
  type DirectoryPlace,
} from "./directoryPlaces";
import type { AccessibilitySlug } from "./listBusiness/listingAccessibility.data";
import type { ListingOwnedBy } from "./listBusiness/listingOwnedBy.data";
import type { Venue } from "./map.data";
import { BUSINESS_COORDS } from "./businessCoords";
import { FREGUESIAS } from "../../shared/components/map/freguesias.data";
import { freguesiaAt } from "../../shared/components/map/freguesiaAt";

export type LocalKind = "business" | "venue";

/**
 * The badge as it CURRENTLY speaks for a place, mirrored from the directory
 * card DTO. `"none"` = never reviewed.
 *
 * `"suspended"` is a granted badge the platform has put on hold while a review
 * runs: the grant is untouched, so the stored column still reads verified, and
 * only this derived value tells the truth. It matches neither `"verified"` nor
 * `"removed"`, so every existing comparison against `"verified"` fails safe.
 */
export type SafeSpaceStatus = "none" | "verified" | "suspended" | "removed";

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
  /** The badge as it currently speaks, from the live directory card DTO.
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

/** The official parish names that have a polygon on the map. Source of truth: shared/components/map/freguesias.data.ts. */
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

/**
 * The parish a place is counted and filtered under. The pin wins: an owner's
 * typed neighbourhood can name another part of town, and a place listed under
 * a parish it does not sit in vanishes when that parish is picked on the map.
 * The typed value only stands in when there is no pin, or the pin falls
 * outside every mapped parish.
 */
function placeFreguesia(
  coords: LocalPlace["coords"],
  typedFreguesia: string,
  source: string,
): string {
  const pinnedFreguesia = coords
    ? freguesiaAt(coords.latitude, coords.longitude)
    : null;
  return pinnedFreguesia ?? warnIfUnknownFreguesia(typedFreguesia, source);
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
  // An online-only business has no door to pin. Its stored coordinates are
  // ignored even when an old payload still carries some, so it can never
  // surface on the map under a stale address.
  const listedCoords =
    !place.online && place.latitude != null && place.longitude != null
      ? { latitude: place.latitude, longitude: place.longitude }
      : null;
  const fallbackCoords =
    demoMode && !place.online ? (BUSINESS_COORDS[place.slug] ?? null) : null;
  const coords = listedCoords ?? fallbackCoords;
  return {
    id: `business:${place.slug}`,
    kind: "business",
    name: place.name,
    category: normalizeCategory(place.cat),
    neighbourhood: place.hood,
    // No parish to count it under, and no warning either: an empty parish is
    // the truth for an online-only business, not a typo to surface.
    freguesia: place.online
      ? ""
      : placeFreguesia(
          coords,
          HOOD_TO_FREGUESIA[place.hood] ?? place.hood,
          `business "${place.name}"`,
        ),
    coords,
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
  const coords = { latitude: venue.latitude, longitude: venue.longitude };
  return {
    id: `venue:${venue.id}`,
    kind: "venue",
    name: venue.name,
    category: VENUE_TYPE_TO_CATEGORY[venue.type] ?? venue.type,
    neighbourhood: venue.bairro,
    freguesia: placeFreguesia(coords, venue.freguesia, `venue "${venue.name}"`),
    coords,
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

/** Whether a place is an online-only business: no door, no pin, reached
 *  through its website, socials or inbox instead. Venues are always physical. */
export function isOnlinePlace(place: LocalPlace): boolean {
  return (
    place.kind === "business" &&
    (place.source as DirectoryPlace).online === true
  );
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
    // A business that borrows its twin's pin takes the twin's parish with it.
    const isBorrowingPin = business.coords === null;
    return {
      ...business,
      coords: business.coords ?? twin.coords,
      freguesia: isBorrowingPin ? twin.freguesia : business.freguesia,
      vibe: twin.vibe,
      beenHere: twin.beenHere,
      searchText: buildSearchText([business.searchText, twin.searchText]),
    };
  });

  return [...mergedBusinesses, ...venueByName.values()];
}

export interface LocalFilters {
  /** Unified category ids to keep. Empty means every type; otherwise a place
   *  stays when its category is any one of them. */
  categories: string[];
  query: string;
  vibes: string[];
  /** `"verified"` restricts to safe-space-verified places; `null`/absent = no restriction. */
  safe?: "verified" | null;
  /** Keep only places open at this moment on their OWN clock. */
  openNow?: boolean;
  /** Accessibility needs that must all be met. Empty/absent = no restriction. */
  access?: AccessibilitySlug[];
  /** Ownership tags, ANY of which a place must carry. Empty/absent = no
   *  restriction. */
  owned?: ListingOwnedBy[];
}

/**
 * Whether the owner has said ANY of these about who owns and runs the place.
 *
 * Several tags are an OR, like place types and unlike access needs: someone
 * picking "Trans-owned" and "Non-binary-owned" wants places run by either.
 * Only a business can carry a tag: a demo-only venue says nothing about its
 * owners, so it drops out once the filter is on rather than being assumed
 * either way.
 */
export function placeMatchesOwnedBy(
  place: LocalPlace,
  owned: readonly ListingOwnedBy[],
): boolean {
  if (owned.length === 0) return true;
  if (place.kind !== "business") return false;
  const ownedBy = (place.source as DirectoryPlace).ownedBy ?? [];
  return owned.some((value) => ownedBy.includes(value));
}

/**
 * Whether a place is trading RIGHT NOW, on its own wall clock.
 *
 * Three states collapse to `false` here, and each of them is a deliberate no:
 *
 * - a listing that has never published hours answers `"unknown"`, which is not
 *   the same as open. Someone filtering for "open now" is asking to be able to
 *   walk in, and a guess is worse than an omission.
 * - a business that is temporarily closed, permanently closed or has moved is
 *   not open however healthy its weekday grid looks.
 * - a demo-only venue carries no hours field at all.
 *
 * Computed client-side on purpose: the grid is CDN-cached, so a server-baked
 * open state would go stale in the dangerous direction, saying open when shut.
 */
export function isPlaceOpenNow(place: LocalPlace): boolean {
  if (place.kind !== "business") return false;
  const business = place.source as DirectoryPlace;
  if (!isPlaceOperating(business)) return false;
  const status = openStatus(
    business.hours,
    zonedNow(business.timezone),
    business.hoursExceptions,
  );
  return status.state === "open";
}

/**
 * Whether a place meets EVERY listed accessibility need.
 *
 * The match is on a stored answer of exactly `"yes"`, mirroring the backend's
 * `access=` filter. `unknown` never counts: "nobody has told us" is a real,
 * different answer, and surfacing it as a met need would send a wheelchair user
 * to a door that may have steps. A listing that has answered nothing at all
 * carries no accessibility block, and so meets nothing.
 */
export function placeMeetsAccess(
  place: LocalPlace,
  access: AccessibilitySlug[],
): boolean {
  if (access.length === 0) return true;
  if (place.kind !== "business") return false;
  const answers = (place.source as DirectoryPlace).accessibility?.answers;
  if (!answers) return false;
  return access.every((slug) => answers[slug] === "yes");
}

/**
 * Shared filter for both list + map views. The query matches the full
 * `searchText` haystack (name + area + category + blurb + tags), not just the
 * name. Vibes are **pass-through**: only venues carry vibe data, so a selected
 * vibe narrows venues while businesses (no vibe) always stay visible — instead
 * of silently deleting every business the moment a vibe is picked. Place types
 * combine as an OR, since a place has exactly one type and someone picking
 * "Food" and "Nightlife" wants both kinds of place. `safe` is a hard filter
 * like the place types: demo-only venues never carry `safeSpaceStatus`
 * (undefined), so they're naturally excluded once it's active.
 *
 * `safe` matches `"verified"` EXACTLY, which is the rule the server applies to
 * `?safe=verified`: it anti-joins the open badge suspensions inside the query,
 * so a paused badge never reaches the page or its `total`. A place whose badge
 * is on hold reads `"suspended"` and drops out here too, so the two agree
 * rather than one of them quietly re-admitting what the other excluded.
 * Nothing is filtered twice: in live mode the server has already dropped them
 * and this predicate simply never re-adds one.
 *
 * `openNow` and `access` are hard filters too, and both refuse to guess: a
 * place with no published hours is never "open now", and a need nobody has
 * answered is never "met". See `isPlaceOpenNow` / `placeMeetsAccess`. `owned`
 * is a hard filter too, an OR across its tags (see `placeMatchesOwnedBy`).
 */
export function filterLocalPlaces(
  places: LocalPlace[],
  filters: LocalFilters,
): LocalPlace[] {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const wantedCategories = new Set(filters.categories);
  return places.filter((place) => {
    if (wantedCategories.size > 0 && !wantedCategories.has(place.category)) {
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
    // Exactly "verified". A suspended badge is not a verified one, and this
    // must never soften into a truthiness check.
    if (filters.safe === "verified" && place.safeSpaceStatus !== "verified") {
      return false;
    }
    if (filters.openNow && !isPlaceOpenNow(place)) {
      return false;
    }
    if (!placeMeetsAccess(place, filters.access ?? [])) {
      return false;
    }
    if (!placeMatchesOwnedBy(place, filters.owned ?? [])) {
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
