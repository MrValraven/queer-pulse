import type { ListingDTO } from "../../marketing/listBusiness/api/listings.api";
import type {
  DirectoryPlace,
  HoursType,
  Tint,
} from "../../marketing/directoryPlaces";
import { normalizeAccessibilityAnswers } from "../../marketing/listBusiness/listingAccessibility.data";

// ── Ported from backend `listing-response.ts` so the moderator preview renders
//    exactly what `GET /directory/:slug` would once the listing is live. Keep
//    in sync with that file if its derivation changes. ────────────────────────

const DIRECTORY_TINTS: Tint[] = ["coral", "jade", "plum"];

/** Stable per-slug tint (mirrors backend `tintForSlug`). */
function tintForSlug(slug: string): Tint {
  let hash = 0;
  for (const character of slug) {
    hash = (hash + character.charCodeAt(0)) % DIRECTORY_TINTS.length;
  }
  return DIRECTORY_TINTS[hash]!;
}

/** Two-letter initials from the business name (mirrors backend `initialsForName`). */
function initialsForName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const firstWord = words[0] ?? "";
  if (words.length === 1) return firstWord.slice(0, 2).toUpperCase();
  const secondWord = words[1] ?? "";
  return ((firstWord[0] ?? "") + (secondWord[0] ?? "")).toUpperCase();
}

/** First name of the owner (mirrors backend `ownerFirstName`). */
function ownerFirstName(ownerName: string): string {
  return (
    ownerName
      .trim()
      .split(/[\s&·]+/)
      .filter(Boolean)[0] ?? ""
  );
}

/**
 * The listing fields this mapper actually reads: everything the owner authors,
 * plus the public slug the page is served at. A saved `ListingDTO` satisfies
 * it as-is (it is that DTO minus the server-only identity/moderation fields),
 * and so does an UNSAVED editor draft once the caller supplies the slug the
 * listing already has, which is how the owner's editor previews changes it has
 * not committed yet.
 */
export type ListingPreviewSource = Omit<
  ListingDTO,
  | "ref"
  | "status"
  | "submittedBy"
  | "createdAt"
  | "queerOwnedVerified"
  // A preview is built from the fields the editor edits. Operating state
  // (open / closed / moved) and the "still accurate" stamp live on their own
  // owner endpoints and are not part of a draft, so a preview neither claims
  // the business is trading nor claims it is shut.
  | "operatingState"
  | "movedToListingId"
  | "detailsConfirmedAt"
>;

interface OwnerIdentityView {
  name: string;
  role: string;
  bio: string;
  first: string;
  inQueerPulse: boolean;
}

/** Owner identity redacted per the wizard visibility choice (mirrors backend `ownerIdentity`). */
function ownerIdentity(dto: ListingPreviewSource): OwnerIdentityView {
  if (dto.visibility === "anon") {
    return { name: "", role: "", bio: "", first: "", inQueerPulse: false };
  }
  if (dto.visibility === "role") {
    return {
      name: dto.ownerRole,
      role: "",
      bio: dto.ownerBio,
      first: "",
      inQueerPulse: false,
    };
  }
  return {
    name: dto.ownerName,
    role: dto.ownerRole,
    bio: dto.ownerBio,
    first: ownerFirstName(dto.ownerName),
    inQueerPulse: dto.linkToProfile,
  };
}

/** Primary category → weekly-hours template (mirrors backend `hoursTypeForCategory`). */
const CATEGORY_HOURS_TYPE: Record<string, HoursType> = {
  food: "restaurant",
  design: "studio",
  culture: "gallery",
  tech: "studio",
  grooming: "shop",
  fitness: "gym",
  health: "clinic",
  space: "studio",
};

function hoursTypeForCategory(category: string): HoursType {
  return CATEGORY_HOURS_TYPE[category] ?? "appointment";
}

/**
 * Map a listing onto the `DirectoryPlace` view model the public detail
 * components render. Faithful to the live page: same tint, initials,
 * redaction, pills, gallery, hours template. Rating/reviews/upcoming are empty:
 * a submission under review has none yet.
 *
 * Takes the widened `ListingPreviewSource`, so the same mapper serves the
 * moderator drawer (passing the full `ListingDTO` the admin queue returns) and
 * the owner's editor (passing its unsaved draft). One mapper, one live view.
 */
export function listingDtoToPreviewPlace(
  dto: ListingPreviewSource,
): DirectoryPlace {
  const identity = ownerIdentity(dto);
  const category = dto.cats[0] ?? "";
  return {
    slug: dto.slug,
    name: dto.name,
    cat: category,
    hood: dto.hood,
    // The submitter's own step-1 ownership claim, exactly as the public card
    // reads it. `linkToProfile` below is a different question (does the owner
    // want this listing shown on their profile), and answers the "run by"
    // line only.
    owned: dto.badge === "owned",
    member: dto.linkToProfile ? identity.first || undefined : undefined,
    av: initialsForName(dto.name),
    tint: tintForSlug(dto.slug),
    desc: dto.blurb,
    latitude: dto.latitude,
    longitude: dto.longitude,
    tagline: dto.tagline,
    // Price tier first (when set), then the listing's own tags — as detail pills.
    pills: [...(dto.price ? [dto.price] : []), ...dto.tags],
    rating: { score: "0", count: 0 },
    // Carry the real uploaded photos + their alt text so the moderator sees the
    // actual photo hero/thumbnails the public page shows — not a caption stand-in.
    // `DirectoryGallery` only falls back to caption cells when every slot is null.
    photos: dto.photos,
    alt: dto.alt,
    // Caption-cell fallback (used only when no photos are uploaded): surface the
    // alt-text captions, dropping empty slots.
    gallery: [dto.alt.wide, dto.alt.d1, dto.alt.d2, dto.alt.vibe].filter(
      (caption) => caption.length > 0,
    ),
    whatItIs: dto.whatItIs.map((line) => line.text),
    // Atmosphere tags only, and the listing stores positive bullets, so every
    // one is a "yes". Access claims live on `accessibility` below, which can
    // answer no.
    goodFor: dto.goodFor.map((label) => ({ label, yes: true })),
    // Both structured blocks are part of what a moderator reviews and what an
    // owner previews, so they render exactly as the public page would. Healed
    // on the way through: a draft written before these existed answers all six
    // questions as "not answered" rather than as nothing at all.
    accessibility: {
      answers: normalizeAccessibilityAnswers(dto.accessibility?.answers),
      note: dto.accessibility?.note?.trim() || null,
    },
    services: (dto.services ?? [])
      .filter((service) => service.name.trim() !== "")
      .map((service) => ({
        name: service.name.trim(),
        price: service.price.trim(),
        note: service.note.trim(),
      })),
    hoursType: hoursTypeForCategory(category),
    hoursNote: dto.hoursNote,
    owner: {
      name: identity.name,
      initials: initialsForName(identity.name),
      tint: tintForSlug(dto.slug),
      role: identity.role,
      bio: identity.bio,
      inQueerPulse: identity.inQueerPulse,
      first: identity.first,
    },
    social: dto.social,
    address: dto.address,
    reviews: [],
    upcoming: [],
  };
}
