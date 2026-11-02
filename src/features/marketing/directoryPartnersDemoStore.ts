import { ApiError } from "../../shared/api/client";
import { foldForSearch } from "../../shared/lib/foldForSearch";
import {
  DIRECTORY_PARTNER_LIMIT,
  DIRECTORY_PARTNER_NOTE_MAX,
  type AdminDirectoryPartnerDTO,
  type AdminDirectoryPartnerSearchResultDTO,
  type DirectoryPartnerPlace,
  type DirectoryPartnerRefusalReason,
} from "./api/directoryPartners.api";
import { ADULT_ONLINE_DIRECTORY_PLACES } from "./directoryOnlinePlaces.data";
import {
  DEMO_DIRECTORY_PARTNER_SEED,
  type DemoDirectoryPartnerSeed,
} from "./directoryPartnersDemoSeed.data";
import { DIRECTORY_PLACES, type DirectoryPlace } from "./directoryPlaces";
import { ADULT_LISTING_CATEGORY_SLUG } from "./localCategories";

/**
 * The demo partners row, shared by the public row hook and the admin Partners
 * tab. Demo places carry no listing uuid, so a demo pick keys on the place's
 * slug: `listingId` is the slug and the pick id is `demo-partner-<slug>`. The
 * writes apply the same refusals as the backend (contract section 4, check
 * order from amendment 7), so demo errors show the real copy.
 */

type RefusalStatus = 400 | 404 | 409;

const STATUS_TEXT: Record<RefusalStatus, string> = {
  400: "Bad Request",
  404: "Not Found",
  409: "Conflict",
};

const SEARCH_RESULT_LIMIT = 20;
const PICK_ID_PREFIX = "demo-partner-";

/** Places the demo treats as not showing: a seed pick off the public row. */
const NOT_SHOWING_SLUGS = new Set(
  DEMO_DIRECTORY_PARTNER_SEED.filter(
    (seed) => seed.publicState !== "showing",
  ).map((seed) => seed.slug),
);

const ADULT_ONLINE_SLUGS = new Set(
  ADULT_ONLINE_DIRECTORY_PLACES.map((place) => place.slug),
);

let picks: DemoDirectoryPartnerSeed[] | null = null;

function copySeed(
  seed: readonly DemoDirectoryPartnerSeed[],
): DemoDirectoryPartnerSeed[] {
  return seed.map((entry) => ({ ...entry }));
}

function currentPicks(): DemoDirectoryPartnerSeed[] {
  picks ??= copySeed(DEMO_DIRECTORY_PARTNER_SEED);
  return picks;
}

function pickIdOf(slug: string): string {
  return `${PICK_ID_PREFIX}${slug}`;
}

function findPlace(slug: string): DirectoryPlace | undefined {
  return DIRECTORY_PLACES.find((place) => place.slug === slug);
}

function isAdultPlace(place: DirectoryPlace): boolean {
  return (
    ADULT_ONLINE_SLUGS.has(place.slug) ||
    (place.cats ?? [place.cat]).includes(ADULT_LISTING_CATEGORY_SLUG)
  );
}

/** Trimmed, with an empty note stored as null. */
function normalizeNote(note: string | null | undefined): string | null {
  const trimmedNote = (note ?? "").trim();
  return trimmedNote === "" ? null : trimmedNote;
}

/** Code points, so an emoji counts once the way a person sees it. */
function isNoteTooLong(note: string | null): boolean {
  return note !== null && Array.from(note).length > DIRECTORY_PARTNER_NOTE_MAX;
}

/** The refusal the backend would send, with the same body shape:
 *  `{ statusCode, error, message, reason }`. */
export function directoryPartnerRefusal(
  reason: DirectoryPartnerRefusalReason,
  status: RefusalStatus,
): ApiError {
  const statusText = STATUS_TEXT[status];
  return new ApiError(status, statusText, {
    statusCode: status,
    error: statusText,
    message: statusText,
    reason,
  });
}

/** Back to the opening row, or to the given picks (tests). */
export function resetDemoDirectoryPartners(
  seed: readonly DemoDirectoryPartnerSeed[] = DEMO_DIRECTORY_PARTNER_SEED,
): void {
  picks = copySeed(seed);
}

/** The public row: showing picks only, in position order. */
export function demoPublicDirectoryPartners(): DirectoryPartnerPlace[] {
  return currentPicks().flatMap((pick) => {
    const place = findPlace(pick.slug);
    if (!place || pick.publicState !== "showing") return [];
    return [{ place, note: pick.note }];
  });
}

/** Every pick as the admin tab lists it, positions from 1. */
export function demoAdminDirectoryPartners(): AdminDirectoryPartnerDTO[] {
  const resolvedPicks = currentPicks().flatMap((pick) => {
    const place = findPlace(pick.slug);
    return place ? [{ pick, place }] : [];
  });
  return resolvedPicks.map(({ pick, place }, index) => ({
    id: pickIdOf(place.slug),
    listingId: place.slug,
    listingRef: place.ref ?? place.slug,
    slug: place.slug,
    name: place.name,
    cat: place.cat,
    hood: place.hood,
    coverImage: place.photos?.wide ?? null,
    tint: place.tint,
    av: place.av,
    note: pick.note,
    position: index + 1,
    publicState: pick.publicState,
  }));
}

/**
 * The candidate search: folded name, neighbourhood and blurb. Name hits come
 * first, then the other hits, each group by name. Skips 18+ places and places
 * that are not showing, and caps the list at 20.
 */
export function demoSearchDirectoryPartnerCandidates(
  query: string,
): AdminDirectoryPartnerSearchResultDTO[] {
  const foldedTerm = foldForSearch(query.trim());
  if (foldedTerm === "") return [];
  const pickedSlugs = new Set(currentPicks().map((pick) => pick.slug));
  const rankedPlaces = DIRECTORY_PLACES.flatMap((place) => {
    if (isAdultPlace(place) || NOT_SHOWING_SLUGS.has(place.slug)) return [];
    const isNameHit = foldForSearch(place.name).includes(foldedTerm);
    const isOtherHit =
      foldForSearch(place.hood).includes(foldedTerm) ||
      foldForSearch(place.desc).includes(foldedTerm);
    if (!isNameHit && !isOtherHit) return [];
    return [{ place, rank: isNameHit ? 0 : 1 }];
  });
  rankedPlaces.sort(
    (first, second) =>
      first.rank - second.rank ||
      first.place.name.localeCompare(second.place.name),
  );
  return rankedPlaces.slice(0, SEARCH_RESULT_LIMIT).map(({ place }) => ({
    listingId: place.slug,
    slug: place.slug,
    name: place.name,
    cat: place.cat,
    hood: place.hood,
    tint: place.tint,
    av: place.av,
    isPartner: pickedSlugs.has(place.slug),
  }));
}

/** Appends a pick. Checks run in the backend's order: note length, unknown
 *  listing, already picked, off the public row or 18+, then the limit. */
export function demoAddDirectoryPartner(input: {
  listingId: string;
  note?: string | null;
}): AdminDirectoryPartnerDTO[] {
  const note = normalizeNote(input.note);
  if (isNoteTooLong(note)) throw directoryPartnerRefusal("note_too_long", 400);
  const listingSlug = input.listingId;
  const place =
    findPlace(listingSlug) ??
    ADULT_ONLINE_DIRECTORY_PLACES.find((adult) => adult.slug === listingSlug);
  if (!place) throw directoryPartnerRefusal("listing_not_found", 404);
  const existingPicks = currentPicks();
  if (existingPicks.some((pick) => pick.slug === listingSlug)) {
    throw directoryPartnerRefusal("already_partner", 409);
  }
  if (NOT_SHOWING_SLUGS.has(listingSlug)) {
    throw directoryPartnerRefusal("listing_not_live", 409);
  }
  if (isAdultPlace(place)) {
    throw directoryPartnerRefusal("listing_adult_only", 409);
  }
  if (existingPicks.length >= DIRECTORY_PARTNER_LIMIT) {
    throw directoryPartnerRefusal("partner_limit_reached", 409);
  }
  picks = [
    ...existingPicks,
    { slug: listingSlug, note, publicState: "showing" },
  ];
  return demoAdminDirectoryPartners();
}

function indexOfPick(pickId: string): number {
  return currentPicks().findIndex((pick) => pickIdOf(pick.slug) === pickId);
}

/** Replaces a pick's note; a blank note clears it. */
export function demoUpdateDirectoryPartnerNote(
  pickId: string,
  note: string | null,
): AdminDirectoryPartnerDTO[] {
  const normalizedNote = normalizeNote(note);
  if (isNoteTooLong(normalizedNote)) {
    throw directoryPartnerRefusal("note_too_long", 400);
  }
  const pickIndex = indexOfPick(pickId);
  if (pickIndex === -1) throw directoryPartnerRefusal("partner_not_found", 404);
  picks = currentPicks().map((pick, index) =>
    index === pickIndex ? { ...pick, note: normalizedNote } : pick,
  );
  return demoAdminDirectoryPartners();
}

/** Puts the picks in the given order. The ids must be exactly the current
 *  pick ids, each once. */
export function demoReorderDirectoryPartners(
  ids: readonly string[],
): AdminDirectoryPartnerDTO[] {
  const existingPicks = currentPicks();
  const picksById = new Map(
    existingPicks.map((pick) => [pickIdOf(pick.slug), pick]),
  );
  const hasSameSet =
    ids.length === existingPicks.length &&
    new Set(ids).size === ids.length &&
    ids.every((pickId) => picksById.has(pickId));
  if (!hasSameSet) throw directoryPartnerRefusal("order_mismatch", 409);
  picks = ids.flatMap((pickId) => {
    const pick = picksById.get(pickId);
    return pick ? [pick] : [];
  });
  return demoAdminDirectoryPartners();
}

/** Removes a pick; the positions after it close up. */
export function demoRemoveDirectoryPartner(
  pickId: string,
): AdminDirectoryPartnerDTO[] {
  const pickIndex = indexOfPick(pickId);
  if (pickIndex === -1) throw directoryPartnerRefusal("partner_not_found", 404);
  picks = currentPicks().filter((_, index) => index !== pickIndex);
  return demoAdminDirectoryPartners();
}
