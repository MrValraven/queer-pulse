import { apiDelete, apiGet, apiPatch, apiPost } from "../../../shared/api/client";
import type { ItemsPage } from "../../../shared/api/pagination";
import {
  validateDirectoryDetail,
  validateDirectoryList,
} from "../../../shared/api/validation";
import type {
  AffirmingBaselineView,
  HoursType,
  ListingHoursException,
  MovedToListingView,
  OperatingStateView,
  ListingPublicQuestion,
  Owner,
  QueerOwnedVerificationView,
  Review,
  Tint,
} from "../directoryPlaces";
import type { DayHours, PhotoKey } from "../listBusiness/listBusiness.data";
import type { ListingAccessibilityView } from "../listBusiness/listingAccessibility.data";
import type { ListingServiceOffering } from "../listBusiness/listingServices.data";

/** Photos as the detail endpoint returns them — each slot resolved to a URL or null. */
export type PhotoSetView = Record<PhotoKey, string | null>;

/**
 * A directory grid card from the public `GET /directory` endpoint. Mirrors the
 * backend's `DirectoryCardDTO`. `tint`/`av` are presentation primitives; the
 * category label and badge copy are resolved on the frontend. `memberFirst` is
 * non-null only when the listing is linked to its owner's member profile.
 */
export interface DirectoryCardDTO {
  /** The listing's real DB uuid — distinct from `slug` (the cosmetic public
   * URL id). Lets a cross-entity FK (e.g. a gathering's venue link) target a
   * real listing picked from this card grid. */
  id: string;
  slug: string;
  name: string;
  cat: string;
  hood: string;
  blurb: string;
  tint: Tint;
  av: string;
  owned: boolean;
  /** Moderator-confirmed queer-owned badge, distinct from the self-reported
   * `owned` claim above. Drives the "VERIFIED QUEER-OWNED" badge. */
  queerOwnedVerified: boolean;
  memberFirst: string | null;
  /** Online-only business (no physical location). Absent on older payloads. */
  online?: boolean;
  // Map pin the owner placed while listing. null ⇒ list-only (no pin).
  latitude: number | null;
  longitude: number | null;
  /** Safe-space verification state. "none" = never reviewed. */
  safeSpaceStatus: "none" | "verified" | "removed";
  /** Verification tier when `safeSpaceStatus` is "verified"; null otherwise. */
  safeSpaceTier: number | null;
  /** Whether the business is still trading. Optional here because it is a
   * newer backend addition and the demo/session card sources never carry it;
   * absent is read through `operatingStateOf`, which defaults to `"open"`. */
  operatingState?: OperatingStateView;
}

/** GET /directory — every live directory listing (public), optionally
 * filtered. Always the bare, `DEFAULT_LIST_LIMIT`-capped array shape — for
 * whole-catalog callers that need the full working set client-side rather
 * than a browsable page (the gatherings venue picker, @mention suggestions,
 * the directory detail page's "related places" strip). The `/local/directory`
 * grid itself calls `getDirectoryPage` instead, which paginates. */
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
  return apiGet<DirectoryCardDTO[]>(
    `/directory${query ? `?${query}` : ""}`,
    undefined,
    validateDirectoryList,
  );
}

/**
 * GET /directory?page=N — the paginated variant backing the `/local/directory`
 * grid (gap-audit HSG-5): sends `q`/`safe` server-side, so the network payload
 * matches what's actually being searched for instead of dragging down every
 * live listing on every render, and pages through the real `total` instead of
 * silently stopping at the backend's `DEFAULT_LIST_LIMIT` cap. `cat`
 * deliberately stays client-side (see `useDirectoryFilters`'s `categoryCounts`)
 * so each category chip's count stays correct against the loaded set no
 * matter which category is currently selected.
 *
 * No response validator, mirroring `companies.api.ts#getCompanies`'s identical
 * dual-shape precedent: the backend answers a bare array when `page` is
 * omitted and the `{items,total,page,pageSize}` envelope once it's given, and
 * `toItemsPage` (called by every caller) normalizes either into one shape.
 */
export function getDirectoryPage(params: {
  q?: string;
  safe?: "verified";
  page: number;
}): Promise<DirectoryCardDTO[] | ItemsPage<DirectoryCardDTO>> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.safe) search.set("safe", params.safe);
  search.set("page", String(params.page));
  return apiGet<DirectoryCardDTO[] | ItemsPage<DirectoryCardDTO>>(
    `/directory?${search.toString()}`,
  );
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
  /** Human-readable business reference (`QPL-2026-…`) the dispute endpoint is
   * keyed by. Optional here because it is a companion backend addition: the
   * detail response must add `ref: listing.ref` for a non-owner to be able to
   * dispute/contest a listing (owners already resolve it via `/listings/mine`).
   * Absent ⇒ the FE hides the live dispute action. */
  ref?: string;
  tagline: string;
  /** City the venue sits in; `null` ⇒ the FE defaults to Lisbon. */
  city: string | null;
  /** IANA timezone the hours run on; `null` ⇒ the FE defaults to Europe/Lisbon. */
  timezone: string | null;
  pills: string[];
  gallery: string[];
  whatItIs: string[];
  /** Atmosphere bullets only, every one a positive check. Accessibility moved
   * out of here into `accessibility` below, which can answer no. */
  goodFor: { label: string; yes: boolean }[];
  /** The venue's structured accessibility answers plus its free-text note. All
   * six questions are always present; `unknown` is a real answer and must not
   * be rendered as a negative or dropped. Optional here only because a payload
   * predating the feature carries none. */
  accessibility?: ListingAccessibilityView;
  /** What the business sells and what it costs, in the owner's own words
   * ("from 25 EUR", "sliding scale"). Empty when it prices nothing. */
  services?: ListingServiceOffering[];
  /** The listing's agreement to the affirming baseline. True on every listing
   * by definition, so it is never a distinguishing badge and never a filter. */
  affirmingBaseline?: AffirmingBaselineView;
  /** Who confirmed the queer-owned badge, when, on what basis, and when it
   * lapses — the same kind of evidence the safe-space block beside it carries. */
  queerOwnedVerification?: QueerOwnedVerificationView;
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
  /** The listing's most recent public questions, newest first, capped at 10 by
   * the backend. Optional on the wire: a payload predating the public-questions
   * work carries none, and the Q&A section then reads as "no questions yet". */
  questions?: ListingPublicQuestionDTO[];
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
  /** One-off date overrides of the weekly grid (holiday closures, special
   * hours). Optional: a payload predating the feature simply has none. */
  hoursExceptions?: ListingHoursException[];
  /** The successor listing when `operatingState.state` is `"moved"` and the new
   * premises are themselves listed here; `null` otherwise. */
  movedToListing?: MovedToListingView | null;
  /** ISO-8601 timestamp the owner last confirmed the practical details are
   * still correct; `null` when they never have. */
  detailsConfirmedAt?: string | null;
}

/**
 * GET /directory/by-member/:slug — a member's publicly-live directory listings
 * (public, no auth). Returns `[]` for unknown members. Same redacted card DTO
 * the public grid uses, so visitors can see the places a member runs.
 */
export const getListingsByMember = (slug: string) =>
  apiGet<DirectoryCardDTO[]>(
    `/directory/by-member/${encodeURIComponent(slug)}`,
    undefined,
    validateDirectoryList,
  );

/** GET /directory/:slug — one live directory listing by slug (public). */
export const getDirectorySpace = (slug: string) =>
  apiGet<DirectoryDetailDTO>(
    `/directory/${slug}`,
    undefined,
    validateDirectoryDetail,
  );

/** Body for leaving a review. */
export interface SubmitReviewInput {
  stars: number;
  text: string;
  /**
   * A `listing-photo` presign key from `useUploadImage("listing-photo")` — the
   * private storage key, never a fetchable URL. Omit to post a text-only
   * review; send `""` to clear a photo that was attached before.
   */
  photo?: string;
}

/**
 * POST /directory/:slug/reviews — leave a review (member-only). Returns the
 * created review in the same shape the detail page renders.
 */
export const submitReview = (slug: string, input: SubmitReviewInput) =>
  apiPost<Review>(`/directory/${slug}/reviews`, input);

/** Body for editing your own review. Same shape as leaving one. */
export type EditReviewInput = SubmitReviewInput;

/**
 * PATCH /directory/:slug/reviews/:reviewId — rewrite your own review. The
 * endpoint is author-gated and answers 403 for anyone else, so the UI only
 * ever offers this on a review whose `authorSlug` matches the signed-in
 * member. Returns the updated review in the detail page's own shape.
 */
export const editReview = (
  slug: string,
  reviewId: string,
  input: EditReviewInput,
) => apiPatch<Review>(`/directory/${slug}/reviews/${reviewId}`, input);

/**
 * The answer to a helpful-vote mutation. This is the ONLY place a member's own
 * vote state (`hasVoted`) is ever revealed: the public reads are CDN-cached,
 * so carrying it there would hand one member's vote to the next reader. See
 * `useReviewHelpful` for how the control is built around that.
 */
export interface ReviewHelpfulResponse {
  reviewId: string;
  helpful: number;
  hasVoted: boolean;
}

/** POST /directory/:slug/reviews/:reviewId/helpful — idempotent; 400 on your
 *  own review. */
export const voteReviewHelpful = (slug: string, reviewId: string) =>
  apiPost<ReviewHelpfulResponse>(
    `/directory/${slug}/reviews/${reviewId}/helpful`,
  );

/** DELETE /directory/:slug/reviews/:reviewId/helpful — idempotent. */
export const clearReviewHelpful = (slug: string, reviewId: string) =>
  apiDelete<ReviewHelpfulResponse>(
    `/directory/${slug}/reviews/${reviewId}/helpful`,
  );

/** The wire shape of one public question. Structurally identical to the
 *  frontend's own `ListingPublicQuestion`, aliased here so call sites read as
 *  DTOs at the API seam. */
export type ListingPublicQuestionDTO = ListingPublicQuestion;

/**
 * GET /directory/:slug/questions — the full, paged question list, for
 * everything beyond the ten the detail payload carries. Newest first.
 */
export const getListingQuestions = (slug: string, page: number) =>
  apiGet<ItemsPage<ListingPublicQuestionDTO>>(
    `/directory/${slug}/questions?page=${page}`,
  );

/**
 * POST /directory/:slug/questions — ask the business something in public.
 * Member-gated and throttled: 400 when you own the listing yourself, 429 once
 * you are over quota (that body carries a plain reason worth showing).
 */
export const askListingQuestion = (slug: string, body: string) =>
  apiPost<ListingPublicQuestionDTO>(`/directory/${slug}/questions`, { body });

/**
 * POST /listings/:ref/public-questions/:id/answer — the owner answering, keyed
 * by the listing's `ref` (its owner-facing id, distinct from the public
 * `slug` — see `DirectorySpacePage`'s `owned.ref`).
 */
export const answerListingQuestion = (
  ref: string,
  questionId: string,
  answer: string,
) =>
  apiPost<ListingPublicQuestionDTO>(
    `/listings/${ref}/public-questions/${questionId}/answer`,
    { answer },
  );
