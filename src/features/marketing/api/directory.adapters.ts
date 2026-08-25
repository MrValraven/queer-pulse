import type { Formatters } from "../../../shared/i18n/format";
import type { DirectoryPlace, Tint } from "../directoryPlaces";
import {
  initials,
  normalizeHours,
  type PendingListing,
  type PhotoKey,
} from "../listBusiness/listBusiness.data";
import { normalizeAccessibilityAnswers } from "../listBusiness/listingAccessibility.data";
import { servicesForPayload } from "../listBusiness/listingServices.data";
import type {
  CoverPhotoView,
  DirectoryCardDTO,
  DirectoryDetailDTO,
} from "./directory.api";

/**
 * Spread the card DTO's `coverPhoto` into the `photos`/`alt`/`photoFocus`
 * fields the card body reads.
 *
 * Returns an EMPTY object for a listing with no photo, rather than a `photos`
 * record of nulls: `LocalBusinessCardBody` shows its placeholder caption when
 * `photos?.wide` is falsy either way, but leaving the field undefined keeps a
 * photoless card indistinguishable from the demo places, which carry no
 * `photos` at all and fall back to their `gallery` caption blocks.
 */
function cardCoverPhoto(
  cover: CoverPhotoView | null | undefined,
): Pick<DirectoryPlace, "photos" | "alt" | "photoFocus"> {
  if (!cover?.image) return {};
  return {
    photos: { wide: cover.image, d1: null, d2: null, vibe: null },
    alt: { wide: cover.alt, d1: "", d2: "", vibe: "" },
    ...(cover.crop ? { photoFocus: cover.crop } : {}),
  };
}

/**
 * Map a public `DirectoryCardDTO` onto the `DirectoryPlace` view model the grid
 * renders. The grid reads only card-level fields (name, cat, hood, desc, tint,
 * av, owned, member, cover photo); the detail-only fields are filled with empty
 * defaults here because the detail page fetches its own richer payload via
 * `useDirectoryPlace` — these placeholder values are never rendered.
 */
export function cardDtoToPlace(dto: DirectoryCardDTO): DirectoryPlace {
  return {
    // card fields
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    cat: dto.cat,
    hood: dto.hood,
    owned: dto.owned,
    queerOwnedVerified: dto.queerOwnedVerified,
    member: dto.memberFirst ?? undefined,
    av: dto.av,
    tint: dto.tint,
    desc: dto.blurb,
    online: dto.online ?? false,
    latitude: dto.latitude,
    longitude: dto.longitude,
    safeSpaceStatus: dto.safeSpaceStatus ?? "none",
    safeSpaceTier: dto.safeSpaceTier ?? null,
    // A temporarily closed or moved business still appears in results, so the
    // card carries its state too. Absent on older payloads → left undefined
    // and read through `operatingStateOf`, which defaults to "open".
    operatingState: dto.operatingState,
    // The owner's cover photo, so the card shows the wide shot they uploaded
    // rather than the "Photo coming" frame. The card reads the `wide` slot, and
    // the cover IS the first gallery entry (the wide shot), so it lands there;
    // the remaining slots stay empty because a card payload never carries them.
    ...cardCoverPhoto(dto.coverPhoto),
    // detail-only fields — unused by the grid, filled by the detail fetch
    tagline: "",
    pills: [],
    rating: { score: "0", count: 0 },
    gallery: [],
    whatItIs: [],
    goodFor: [],
    hoursType: "appointment",
    hoursNote: "",
    owner: {
      name: "",
      initials: dto.av,
      tint: dto.tint,
      role: "",
      bio: "",
      inQueerPulse: dto.memberFirst !== null,
      first: dto.memberFirst ?? "",
    },
    social: {},
    address: "",
    reviews: [],
  };
}

/**
 * Map the full `DirectoryDetailDTO` onto `DirectoryPlace` for the detail page.
 * `fmt` composes each upcoming event's localized "Sat 21 Jun · 20:00" line from
 * the DTO's ISO `startAt` (the server emits the primitive; the client formats).
 */
export function detailDtoToPlace(
  dto: DirectoryDetailDTO,
  fmt: Formatters,
): DirectoryPlace {
  return {
    slug: dto.slug,
    // Present once the backend detail DTO carries it; drives the live dispute
    // action's addressability for non-owners.
    ref: dto.ref ?? null,
    name: dto.name,
    cat: dto.cat,
    hood: dto.hood,
    owned: dto.owned,
    queerOwnedVerified: dto.queerOwnedVerified,
    member: dto.memberFirst ?? undefined,
    av: dto.av,
    tint: dto.tint,
    desc: dto.blurb,
    online: dto.online ?? false,
    latitude: dto.latitude,
    longitude: dto.longitude,
    safeSpaceStatus: dto.safeSpaceStatus ?? "none",
    safeSpaceTier: dto.safeSpaceTier ?? null,
    safeSpaceVerifier: dto.safeSpaceVerifier,
    safeSpaceReVerifiedAt: dto.safeSpaceReVerifiedAt,
    safeSpaceSub: dto.safeSpaceSub,
    safeSpacePromises: dto.safeSpacePromises,
    safeSpaceVouches: dto.safeSpaceVouches,
    safeSpaceRemoval: dto.safeSpaceRemoval,
    tagline: dto.tagline,
    city: dto.city ?? undefined,
    timezone: dto.timezone ?? undefined,
    pills: dto.pills,
    rating: dto.rating,
    gallery: dto.gallery,
    whatItIs: dto.whatItIs,
    goodFor: dto.goodFor,
    // Optional on the wire: a payload predating the accessibility/services/
    // baseline work simply carries none of them, and every consumer treats an
    // absent block as "this listing has said nothing" rather than as a "no".
    accessibility: dto.accessibility,
    services: dto.services ?? [],
    affirmingBaseline: dto.affirmingBaseline,
    queerOwnedVerification: dto.queerOwnedVerification,
    hoursType: dto.hoursType,
    hoursNote: dto.hoursNote,
    owner: dto.owner,
    social: dto.social,
    address: dto.address,
    photos: dto.photos,
    alt: dto.alt,
    hours: dto.hours ? normalizeHours(dto.hours) : dto.hours,
    // Every field below is optional on the wire: a payload predating the
    // operating-state work simply has none of them, and the page then reads
    // as a plain open listing exactly as it did before.
    hoursExceptions: dto.hoursExceptions ?? [],
    operatingState: dto.operatingState,
    movedToListing: dto.movedToListing ?? null,
    detailsConfirmedAt: dto.detailsConfirmedAt ?? null,
    langs: dto.langs,
    savedCount: dto.savedCount,
    reviews: dto.reviews,
    // Optional on the wire (a payload predating the public-questions work has
    // none) — an absent block reads as "nobody has asked anything yet".
    questions: dto.questions ?? [],
    upcoming: dto.upcoming.map((event) => {
      const startAt = new Date(event.startAt);
      return {
        when: `${fmt.date(startAt, {
          weekday: "short",
          day: "numeric",
          month: "short",
        })} · ${fmt.time(startAt, { hour: "2-digit", minute: "2-digit" })}`,
        title: event.title,
        slug: event.slug,
        id: event.id,
        // Raw ISO, kept alongside the formatted `when` so the aside can build
        // add-to-calendar links (Google Calendar URL + .ics) without
        // re-parsing the localized display string.
        startAt: event.startAt,
      };
    }),
  };
}

const DIRECTORY_TINTS: Tint[] = ["coral", "jade", "plum"];

/** Deterministic tint from a string (a listing slug, or — for vouches, which
 * carry no slug — the voucher's name), so the same input keeps the same
 * colour across renders. Mirrors the backend's `tintForSlug`
 * (queerpulse-backend/src/listings/listing-response.ts), which the backend
 * itself keys on `vouch.name` for the safe-spaces hub's own vouches
 * (`toSafeSpaceDetail`) — exported so `directorySafeSpace.adapters.ts` can
 * derive the same tint client-side for the directory detail's RAW vouches. */
export function tintForSlug(slug: string): Tint {
  let hash = 0;
  for (const char of slug) {
    hash = (hash + char.charCodeAt(0)) % DIRECTORY_TINTS.length;
  }
  // invariant: `hash` is kept in `[0, DIRECTORY_TINTS.length)` by the
  // `% DIRECTORY_TINTS.length` above, so it's always a valid index.
  return DIRECTORY_TINTS[hash]!;
}

/** First word of a free-text owner name, for the "run by <first>" line.
 * Mirrors the backend's `ownerFirstName`. */
function ownerFirstNameOf(ownerName: string): string {
  return (
    ownerName
      .trim()
      .split(/[\s&·]+/)
      .filter(Boolean)[0] ?? ""
  );
}

interface SubmittedOwnerIdentity {
  name: string;
  role: string;
  bio: string;
  first: string;
  inQueerPulse: boolean;
}

/** The owner's public-facing identity, redacted to honour the visibility
 * chosen in the listing wizard — mirrors the backend's `ownerIdentity`, which
 * is the real boundary for live listings. Reproduced here so a demo listing's
 * own detail page looks the same regardless of source. */
function submittedOwnerIdentity(
  listing: PendingListing,
): SubmittedOwnerIdentity {
  if (listing.visibility === "anon") {
    return { name: "", role: "", bio: "", first: "", inQueerPulse: false };
  }
  if (listing.visibility === "role") {
    return {
      name: listing.ownerRole,
      role: "",
      bio: listing.ownerBio,
      first: "",
      inQueerPulse: false,
    };
  }
  return {
    name: listing.ownerName,
    role: listing.ownerRole,
    bio: listing.ownerBio,
    first: ownerFirstNameOf(listing.ownerName),
    inQueerPulse: listing.linkToProfile,
  };
}

const PLACE_PHOTO_KEYS: PhotoKey[] = ["wide", "d1", "d2", "vibe"];

/**
 * Map a member's own submitted listing (the wizard draft + submission
 * metadata kept in `useDirectoryListings`' `submitted` overlay) onto
 * `DirectoryPlace`, so a demo-created listing's detail page
 * (`/local/directory/:slug`) resolves instead of only ever finding the static
 * `DIRECTORY_PLACES` fixtures. Mirrors the backend's `toDirectoryDetail`
 * (queerpulse-backend/src/listings/listing-response.ts) field-for-field, so
 * the page renders the same whether the source is a live
 * `GET /directory/:slug` or this demo fallback.
 *
 * `useDirectoryPlace`'s demo branch is the only caller — live mode never
 * touches this. Ownership (the "Edit this listing" link, the review-reply
 * composer) is resolved independently by matching the route slug against
 * `submitted` in `DirectorySpacePage`, not from any field this returns, so
 * nothing here needs to be owner-aware.
 *
 * Deliberate simplifications versus the live payload:
 * - `rating`/`reviews` are always empty — a freshly submitted listing has no
 *   reviews yet.
 * - `hoursType` is always `"appointment"`. Harmless: this listing's real
 *   per-weekday `hours` (always present — the wizard seeds every day via
 *   `emptyHours()`) takes priority over the `hoursType` template on the
 *   detail page, so the template is never actually rendered.
 */
export function submittedToPlace(
  listing: PendingListing,
  /** The submitter's own profile photo, for the "Who runs it" card — same
   * gating as `identity.inQueerPulse` below (only a public, profile-linked
   * submission shows a real photo). The caller passes `useAuth()`'s
   * `user.profile.avatarUrl`; absent when logged out or the profile has no
   * photo, and the card falls back to the tinted `initials` avatar. */
  submitterAvatarUrl?: string | null,
): DirectoryPlace {
  const tint = tintForSlug(listing.slug);
  const identity = submittedOwnerIdentity(listing);
  const photos = Object.fromEntries(
    PLACE_PHOTO_KEYS.map((key) => [key, listing.photos[key] || null]),
  ) as Record<PhotoKey, string | null>;

  return {
    slug: listing.slug,
    name: listing.name,
    cat: listing.cats[0] ?? "",
    hood: listing.hood,
    owned: listing.linkToProfile,
    // A freshly self-submitted listing has never been through moderator
    // review, so it's never pre-verified.
    queerOwnedVerified: false,
    member: listing.linkToProfile ? identity.first || undefined : undefined,
    av: initials(listing.name),
    tint,
    desc: listing.blurb,
    online: listing.online,
    latitude: listing.latitude,
    longitude: listing.longitude,
    tagline: listing.tagline,
    pills: [...(listing.price ? [listing.price] : []), ...listing.tags],
    rating: { score: "0", count: 0 },
    gallery: [
      listing.alt.wide,
      listing.alt.d1,
      listing.alt.d2,
      listing.alt.vibe,
    ].filter((caption) => caption.length > 0),
    whatItIs: listing.whatItIs.map((line) => line.text),
    goodFor: listing.goodFor.map((id) => ({ label: id, yes: true })),
    // A draft saved before these fields existed carries neither, so both are
    // healed rather than read straight: the answer map is filled up to all six
    // questions and the service rows lose their client-only keys.
    accessibility: {
      answers: normalizeAccessibilityAnswers(listing.accessibility?.answers),
      note: listing.accessibility?.note?.trim() || null,
    },
    services: servicesForPayload(listing.services ?? []),
    // Every listing agrees to the baseline in order to exist, this one
    // included; the wizard's own agreement is what created it.
    affirmingBaseline: { isAccepted: true, acceptedAt: null },
    hoursType: "appointment",
    hoursNote: listing.hoursNote,
    owner: {
      name: identity.name,
      initials: initials(identity.name),
      tint,
      role: identity.role,
      bio: identity.bio,
      inQueerPulse: identity.inQueerPulse,
      first: identity.first,
      avatarUrl: identity.inQueerPulse ? submitterAvatarUrl : null,
    },
    social: listing.social,
    address: listing.address,
    photos,
    alt: listing.alt,
    hours: normalizeHours(listing.hours),
    langs: listing.langs,
    reviews: [],
  };
}
