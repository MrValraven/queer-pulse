/**
 * "Out and about": businesses with no premises of their own, like walking
 * tours, mobile hairdressers, photographers and movers. The whole vocabulary
 * and its rules live here so every surface (form, payload, card, map, detail
 * page) reads the same answers. New code asks `listingKindOf` and never the
 * raw `online` and `mobile` flags.
 *
 * A leaf module: it imports nothing at runtime, so the directory fixtures,
 * the form and the adapters can all import it without a cycle.
 */

/** The 24 Lisbon parishes, spelled exactly as `properties.name` in
 *  `shared/components/map/freguesias.data.ts` (the contract's list). */
export const LISBON_PARISH_NAMES = [
  "Ajuda",
  "Alcântara",
  "Alvalade",
  "Areeiro",
  "Arroios",
  "Avenidas Novas",
  "Beato",
  "Belém",
  "Benfica",
  "Campo de Ourique",
  "Campolide",
  "Carnide",
  "Estrela",
  "Lumiar",
  "Marvila",
  "Misericórdia",
  "Olivais",
  "Parque das Nações",
  "Penha de França",
  "Santa Clara",
  "Santa Maria Maior",
  "Santo António",
  "São Domingos de Benfica",
  "São Vicente",
] as const;

export type LisbonParishName = (typeof LISBON_PARISH_NAMES)[number];

/** "Also travels to": the municipalities around Lisbon, in contract order. */
export const NEARBY_MUNICIPALITIES = [
  "Almada",
  "Amadora",
  "Cascais",
  "Loures",
  "Odivelas",
  "Oeiras",
  "Seixal",
  "Sintra",
] as const;

export type NearbyMunicipality = (typeof NEARBY_MUNICIPALITIES)[number];

export type ListingKind = "place" | "online" | "mobile";

/** The two flags every listing shape carries (draft, wire, directory place). */
export type KindSource = { online?: boolean | null; mobile?: boolean | null };

/** Where an out-and-about business works. The wire shape and the draft
 *  shape are the same. */
export interface ListingMobileDetails {
  /** The whole city. When true, `parishes` means nothing on the page. */
  allOfCity: boolean;
  /** A subset of `LISBON_PARISH_NAMES`, canonical order, once each. */
  parishes: string[];
  /** A subset of `NEARBY_MUNICIPALITIES`, canonical order, once each. */
  alsoTravelsTo: string[];
  /** No fixed hours: people get in touch to book. */
  byAppointment: boolean;
}

/** A row carrying both flags is one the server refuses, so it reads as
 *  online, the kind whose rules are strictest about location. */
export function listingKindOf(listing: KindSource): ListingKind {
  if (listing.online === true) return "online";
  if (listing.mobile === true) return "mobile";
  return "place";
}

export function emptyMobileDetails(): ListingMobileDetails {
  return {
    allOfCity: true,
    parishes: [],
    alsoTravelsTo: [],
    byAppointment: false,
  };
}

/** The entries of `raw` that the vocabulary knows, in vocabulary order. */
function inVocabularyOrder(
  raw: unknown,
  vocabulary: readonly string[],
): string[] {
  if (!Array.isArray(raw)) return [];
  const wanted = new Set(
    raw.filter((entry): entry is string => typeof entry === "string"),
  );
  return vocabulary.filter((entry) => wanted.has(entry));
}

/**
 * Any stored or typed block, healed to the full shape. Unknown names and
 * repeats drop out and the lists follow the vocabularies' order. The picked
 * parishes stay while "All of Lisbon" is on, so a draft that switches back
 * to "Some parishes" gets them back; `mobileDetailsForPayload` empties them
 * on the way out.
 */
export function normalizeMobileDetails(raw: unknown): ListingMobileDetails {
  const record =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    allOfCity: record.allOfCity !== false,
    parishes: inVocabularyOrder(record.parishes, LISBON_PARISH_NAMES),
    alsoTravelsTo: inVocabularyOrder(
      record.alsoTravelsTo,
      NEARBY_MUNICIPALITIES,
    ),
    byAppointment: record.byAppointment === true,
  };
}

/** The block a save sends, shaped as the server stores it: the empty block
 *  for anything that is not out and about, and no parishes while the whole
 *  city is covered. */
export function mobileDetailsForPayload(
  listing: KindSource & { mobileDetails?: unknown },
): ListingMobileDetails {
  if (listingKindOf(listing) !== "mobile") return emptyMobileDetails();
  const details = normalizeMobileDetails(listing.mobileDetails);
  return details.allOfCity ? { ...details, parishes: [] } : details;
}

/** An out-and-about listing that works by appointment only. It never counts
 *  as open now and sends no hours. */
export function isByAppointmentListing(
  listing: KindSource & { mobileDetails?: unknown },
): boolean {
  return (
    listingKindOf(listing) === "mobile" &&
    normalizeMobileDetails(listing.mobileDetails).byAppointment
  );
}

/** A stored or published listing has a meeting point when it is out and
 *  about and carries both coordinates (the contract's own definition). */
export function hasMeetingPoint(
  listing: KindSource & {
    latitude?: number | null;
    longitude?: number | null;
  },
): boolean {
  return (
    listingKindOf(listing) === "mobile" &&
    listing.latitude != null &&
    listing.longitude != null
  );
}

/** A draft that is out and about with "People meet us at a set spot"
 *  unticked. Its address, neighbourhood and pin stay in the draft and never
 *  reach the payload, the preview or the card. */
export function isMobileWithoutMeetingPoint(
  draft: KindSource & { hasMeetingPoint?: boolean },
): boolean {
  return listingKindOf(draft) === "mobile" && draft.hasMeetingPoint !== true;
}

/** The parishes an out-and-about listing covers: all 24 for the whole city,
 *  else its picks. What the map shades for it. */
export function coveredParishes(
  details: ListingMobileDetails,
): readonly string[] {
  return details.allOfCity ? LISBON_PARISH_NAMES : details.parishes;
}

/** A catalog key with its interpolation values, resolved by the caller. */
export interface MessageRef {
  key: string;
  values?: Record<string, string | number>;
}

const CARD_KEY = "marketing:directory.card";

/**
 * The card's location line for an out-and-about listing: the meeting point's
 * neighbourhood when it has one, else "Works across Lisbon", else up to two
 * parish names and a count of the rest. "Also travels to" stays off the card.
 * Expects normalised details.
 */
export function mobileCardAreaLine({
  hood,
  isAtMeetingPoint,
  details,
}: {
  hood: string;
  isAtMeetingPoint: boolean;
  details: ListingMobileDetails;
}): MessageRef {
  const trimmedHood = hood.trim();
  if (isAtMeetingPoint && trimmedHood) {
    return { key: `${CARD_KEY}.meetsIn`, values: { hood: trimmedHood } };
  }
  const [first, second] = details.parishes;
  if (details.allOfCity || first === undefined) {
    return { key: `${CARD_KEY}.worksAcrossLisbon` };
  }
  if (second === undefined) {
    return { key: `${CARD_KEY}.worksInOne`, values: { first } };
  }
  const remainingCount = details.parishes.length - 2;
  return remainingCount > 0
    ? {
        key: `${CARD_KEY}.worksInMore`,
        values: { first, second, count: remainingCount },
      }
    : { key: `${CARD_KEY}.worksInTwo`, values: { first, second } };
}

/** "Almada and Oeiras" in the reader's language. */
export function joinedPlaceNames(
  names: readonly string[],
  locale: string,
): string {
  return new Intl.ListFormat(locale, {
    style: "long",
    type: "conjunction",
  }).format(names);
}
