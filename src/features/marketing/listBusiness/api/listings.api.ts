import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "../../../../shared/api/client";
import { toItemsPage } from "../../../../shared/api/pagination";
import type { MemberRefDTO, Paginated } from "../../../../shared/api/refs";
import type {
  ListingDraft,
  ListingStatus,
  PhotoKey,
} from "../listBusiness.data";

// ── Backend DTOs ───────────────────────────────────────────────────────────
// The directory-listings domain accepts the full listing draft on create/patch
// (ListingDraft is already a flat, serialisable payload — no JSX / ReactNode),
// and returns it back enriched with the server-assigned identity/ownership
// fields the review flow renders.

/** POST/PATCH body — the wizard's draft is the create payload verbatim. */
export type CreateListingDto = ListingDraft;

/**
 * A listing as returned by the backend. `photos` is narrower than the request
 * payload's `Record<PhotoKey, string>`: the backend response converts each
 * stored storage key / external URL to a fetchable URL via `toImageUrl`,
 * which maps an absent/invalid value to `null` rather than `''` (see
 * `listing-response.ts`, `ListingPhotoSetView`) — so this widens just that
 * field to match, instead of the request-only `CreateListingDto` it otherwise
 * extends verbatim.
 *
 * `submittedBy` is nullable: the backend emits `submittedBy: null` when the
 * listing's owner has no profile row (deleted/system/house account). The
 * moderation queue lists everyone's listings, so this case is real and must
 * be handled by every consumer, not just the owner-scoped ones.
 */
export interface ListingDTO extends Omit<CreateListingDto, "photos"> {
  ref: string;
  slug: string;
  status: ListingStatus;
  submittedBy: MemberRefDTO | null;
  /** ISO 8601 timestamp. */
  createdAt: string;
  photos: Record<PhotoKey, string | null>;
}

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

/** POST /listings — submit a new directory listing for review. */
export const createListing = (dto: CreateListingDto) =>
  apiPost<ListingDTO>("/listings", dto);

export interface ResolvedMapLink {
  latitude: number;
  longitude: number;
  placeName?: string;
}

/** POST /geocode/resolve-link — resolve a pasted map link to coordinates. */
export const resolveMapLink = (url: string) =>
  apiPost<ResolvedMapLink>("/geocode/resolve-link", { url });

/** GET /listings/mine?page= — the caller's own submitted listings. */
export async function getMyListings(page = 1): Promise<Paginated<ListingDTO>> {
  const res = await apiGet<ListingDTO[] | Paginated<ListingDTO>>(
    `/listings/mine?page=${page}`,
  );
  return toItemsPage(res);
}

/** GET /listings/:ref — a single listing by its reference. */
export const getListing = (ref: string) =>
  apiGet<ListingDTO>(`/listings/${ref}`);

/** PATCH /listings/:ref — edit an owned listing. */
export const updateListing = (ref: string, dto: Partial<CreateListingDto>) =>
  apiPatch<ListingDTO>(`/listings/${ref}`, dto);

/** DELETE /listings/:ref — withdraw an owned listing (204 No Content). */
export const deleteListing = (ref: string) =>
  apiDelete<void>(`/listings/${ref}`);

/**
 * PATCH /listings/:ref/status — move a listing along its review status.
 * Moderator-only: this is NOT called from the member client (members cannot
 * self-transition their own listings). Declared here for contract completeness
 * and use by the moderation surface.
 */
export const setListingStatus = (ref: string, status: ListingStatus) =>
  apiPatch<ListingDTO>(`/listings/${ref}/status`, { status });

/**
 * POST /listings/:ref/question — a moderator asks the submitter a question.
 * Sends the text to the submitter as a DM and moves the listing to `question`
 * status. Moderator-only: NOT called from the member client.
 */
export const askListingQuestion = (ref: string, body: string) =>
  apiPost<ListingDTO>(`/listings/${ref}/question`, { body });
