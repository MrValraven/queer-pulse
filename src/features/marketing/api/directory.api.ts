import { apiGet, apiPost } from "../../../shared/api/client";
import type { HoursType, Owner, Review, Tint } from "../directoryPlaces";
import type { DayHours, PhotoKey } from "../listBusiness/listBusiness.data";

/** Photos as the detail endpoint returns them — each slot resolved to a URL or null. */
export type PhotoSetView = Record<PhotoKey, string | null>;

/**
 * A directory grid card from the public `GET /directory` endpoint. Mirrors the
 * backend's `DirectoryCardDTO`. `tint`/`av` are presentation primitives; the
 * category label and badge copy are resolved on the frontend. `memberFirst` is
 * non-null only when the listing is linked to its owner's member profile.
 */
export interface DirectoryCardDTO {
  slug: string;
  name: string;
  cat: string;
  hood: string;
  blurb: string;
  tint: Tint;
  av: string;
  owned: boolean;
  memberFirst: string | null;
  // Map pin the owner placed while listing. null ⇒ list-only (no pin).
  latitude: number | null;
  longitude: number | null;
  /** Safe-space verification state. "none" = never reviewed. */
  safeSpaceStatus: "none" | "verified" | "removed";
  /** Verification tier when `safeSpaceStatus` is "verified"; null otherwise. */
  safeSpaceTier: number | null;
}

/** GET /directory — every live directory listing (public), optionally filtered. */
export function getDirectory(params?: {
  cat?: string;
  q?: string;
  /** `"verified"` restricts to safe-space-verified listings (also boosted
   * first by the backend's default order). */
  safe?: "verified";
}): Promise<DirectoryCardDTO[]> {
  const search = new URLSearchParams();
  if (params?.cat) search.set("cat", params.cat);
  if (params?.q) search.set("q", params.q);
  if (params?.safe) search.set("safe", params.safe);
  const query = search.toString();
  return apiGet<DirectoryCardDTO[]>(`/directory${query ? `?${query}` : ""}`);
}

/** A safe-space "promise" the venue keeps — mirrors the backend's
 * `SafeSpacePromise`. */
export interface SafeSpacePromiseDTO {
  title: string;
  desc: string;
}

/** A member vouch for a safe space, as the directory detail DTO carries it —
 * RAW, with no `initials`/`tint` (unlike the safe-spaces hub's own
 * `SafeSpaceVouchDTO`, which the backend enriches with those before sending).
 * Mirrors the backend's `SafeSpaceVouch` entity shape. */
export interface DirectorySafeSpaceVouchDTO {
  name: string;
  byline: string;
  text: string;
  when: string;
}

/** Removal narrative, populated only when `safeSpaceStatus` is `"removed"`.
 * Mirrors the backend's `SafeSpaceRemoval`. */
export interface SafeSpaceRemovalDTO {
  reason: string;
  removedDate: string;
  listedSince: string;
  flags: number;
  reasonLong: string[];
  timeline: { date: string; event: string }[];
  whatNow: string;
}

/**
 * The full detail payload from `GET /directory/:slug`. Mirrors the backend's
 * `DirectoryDetailDTO`. `rating` is a placeholder ("0" / 0) until the reviews
 * subsystem lands; `reviews`/`upcoming` are added by later sub-projects.
 *
 * The `safeSpace*`-prefixed fields are the RAW trust block — present
 * alongside the inherited `safeSpaceStatus`/`safeSpaceTier` so the directory
 * detail page can render the full safe-space narrative from the same record.
 * They mirror the raw `Listing` columns exactly (same source the backend's
 * `toSafeSpaceDetail` reads for the safe-spaces hub) rather than that hub's
 * own derived `SafeSpaceDetailDTO`, which adds per-vouch `initials`/`tint` —
 * `directorySafeSpace.adapters.ts` derives those client-side instead. `null`/
 * empty whenever the listing has never been a verified/removed safe space.
 */
export interface DirectoryDetailDTO extends DirectoryCardDTO {
  tagline: string;
  pills: string[];
  gallery: string[];
  whatItIs: string[];
  goodFor: { label: string; yes: boolean }[];
  hoursType: HoursType;
  hoursNote: string;
  owner: Owner;
  social: {
    instagram: string;
    website: string;
    email: string;
    phone: string;
  };
  address: string;
  rating: { score: string; count: number };
  reviews: Review[];
  /** Upcoming events at this venue. `startAt` is ISO; the FE composes `when`.
   * `id`/`slug` deep-link into the Events Hub (`/events/:slug`). */
  upcoming: { id: string; slug: string; startAt: string; title: string }[];
  photos: PhotoSetView;
  alt: Record<PhotoKey, string>;
  hours: Record<string, DayHours>;
  langs: string[];
  /** Count of members who saved this listing. Drives the "Saved by N members"
   * trust signal on the detail page. */
  savedCount: number;
  safeSpaceVerifier: string | null;
  safeSpaceReVerifiedAt: string | null;
  safeSpaceSub: string | null;
  safeSpacePromises: SafeSpacePromiseDTO[];
  safeSpaceVouches: DirectorySafeSpaceVouchDTO[];
  safeSpaceRemoval: SafeSpaceRemovalDTO | null;
}

/**
 * GET /directory/by-member/:slug — a member's publicly-live directory listings
 * (public, no auth). Returns `[]` for unknown members. Same redacted card DTO
 * the public grid uses, so visitors can see the places a member runs.
 */
export const getListingsByMember = (slug: string) =>
  apiGet<DirectoryCardDTO[]>(`/directory/by-member/${encodeURIComponent(slug)}`);

/** GET /directory/:slug — one live directory listing by slug (public). */
export const getDirectorySpace = (slug: string) =>
  apiGet<DirectoryDetailDTO>(`/directory/${slug}`);

/** Body for leaving a review. */
export interface SubmitReviewInput {
  stars: number;
  text: string;
}

/**
 * POST /directory/:slug/reviews — leave a review (member-only). Returns the
 * created review in the same shape the detail page renders.
 */
export const submitReview = (slug: string, input: SubmitReviewInput) =>
  apiPost<Review>(`/directory/${slug}/reviews`, input);
