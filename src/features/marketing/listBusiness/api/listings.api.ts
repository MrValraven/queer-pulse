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
  OwnerPersonalField,
  PhotoKey,
} from "../listBusiness.data";
import type {
  AccessibilityAnswerMap,
  ListingAccessibilityView,
} from "../listingAccessibility.data";
import type { ListingServiceOffering } from "../listingServices.data";
import type {
  AffirmingBaselineView,
  QueerOwnedVerificationView,
} from "../../directoryPlaces";

// ── Backend DTOs ───────────────────────────────────────────────────────────
// The directory-listings domain accepts the full listing draft on create/patch
// (ListingDraft is already a flat, serialisable payload — no JSX / ReactNode),
// and returns it back enriched with the server-assigned identity/ownership
// fields the review flow renders.

/**
 * PATCH body — the wizard's draft, with the two structured blocks in their
 * wire shape rather than their editable one.
 *
 * `accessibility.note` is a plain string here (a form field has no null), and
 * `services` has lost the client-only React key each editable row carries.
 * Everything else is the draft verbatim, which is the shape the API has always
 * accepted.
 */
export interface UpdateListingDto
  extends Omit<
    ListingDraft,
    | "accessibility"
    | "services"
    | "affirmingBaselineAccepted"
    // Draft-only: who the signed-in member is to this listing. It decides
    // which payload is built, and is never part of one.
    | "managementRole"
  > {
  accessibility?: { answers: AccessibilityAnswerMap; note: string };
  services?: ListingServiceOffering[];
}

/**
 * POST body — the same payload plus the one create-only field.
 *
 * `affirmingBaselineAccepted` must be `true`: agreeing to the LGBTQ+ affirming
 * baseline is the condition of appearing in the directory, so the API rejects
 * `false` rather than storing it, and rejects the field entirely on PATCH
 * because there is no edit that un-agrees to it.
 */
export interface CreateListingDto extends UpdateListingDto {
  affirmingBaselineAccepted: boolean;
}

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
export interface ListingDTO
  extends Omit<UpdateListingDto, "photos" | "accessibility"> {
  ref: string;
  slug: string;
  status: ListingStatus;
  submittedBy: MemberRefDTO | null;
  /** ISO 8601 timestamp. */
  createdAt: string;
  photos: Record<PhotoKey, string | null>;
  /** Moderator-verified confirmation of the "queer-owned" badge — distinct
   *  from `badge` (the member's own self-reported claim). Toggled via
   *  `PATCH /listings/:ref/queer-owned-verified` (moderator/admin only). */
  queerOwnedVerified: boolean;
  /** The business's own report about whether it is still trading. Distinct
   *  from `status`, which is our review of the submission: an owner setting
   *  this never moves `status` and never sends the listing back for review. */
  operatingState: OperatingStateView;
  /** The successor listing a moved business points at, when it has one.
   *  Always null unless `operatingState.state === "moved"`. */
  movedToListingId: string | null;
  /** ISO 8601 stamp of the last time the owner said "this is still accurate",
   *  or null when they never have. */
  detailsConfirmedAt: string | null;
  /** The venue's six accessibility answers plus its free-text note. All six
   *  always arrive; the note is `null` when the owner wrote none. Optional
   *  here only because a payload predating the feature carries none. */
  accessibility?: ListingAccessibilityView;
  /** Who confirmed the queer-owned badge, when, and on what basis. Read
   *  `queerOwnedVerified` above for whether the badge currently applies. */
  queerOwnedVerification?: QueerOwnedVerificationView;
  /** The listing's agreement to the affirming baseline. True on every listing:
   *  agreeing is the condition of appearing. */
  affirmingBaseline?: AffirmingBaselineView;
  /** Whether the OWNER is currently showing this listing in the directory. A
   *  separate question from `operatingState` (is the business trading) and from
   *  `status` (what moderation thinks). Owner-facing only, so it never appears
   *  on a public directory payload. */
  directoryVisibility?: DirectoryVisibilityView;
}

/**
 * A listing as it reaches somebody who can MANAGE it, tagged with what they
 * are to it. Returned by `GET /listings/mine`, `GET /listings/:ref`,
 * `PATCH /listings/:ref`, `PATCH /:ref/operating-state` and
 * `PATCH /:ref/visibility`.
 *
 * The two arms are a discriminated union rather than one shape with nullable
 * fields, because the difference is real: a co-manager's payload does not
 * carry the owner's eight personal keys at all. Narrowing on `managementRole`
 * is therefore what unlocks reading them, and the compiler refuses any code
 * path that reads `ownerName` (or the other seven) off a listing that might be
 * co-managed.
 *
 * `managementRole` is optional on the owner arm because the same `ListingDTO`
 * shape also arrives from surfaces that never had a role to report (the
 * moderation queue, the public adapters). Absent means owner.
 */
export interface OwnedListingDTO extends ListingDTO {
  managementRole?: "owner";
}

/** The same listing minus the owner's own details (see `OWNER_PERSONAL_FIELDS`). */
export interface CoManagedListingDTO
  extends Omit<ListingDTO, OwnerPersonalField> {
  managementRole: "co_manager";
}

export type ManagedListingDTO = OwnedListingDTO | CoManagedListingDTO;

/**
 * The PATCH body a CO-MANAGER may send: everything about the business, and
 * none of the owner's own details. Built by its own allow-list in
 * `draftToDto.ts`, so re-adding one of the eight keys there is a compile
 * error rather than a 403 the member only meets at save time.
 */
export type CoManagerUpdateListingDto = Omit<
  UpdateListingDto,
  OwnerPersonalField
>;

/** The read side of an owner's pause. `hiddenAt` is `null` whenever the
 *  listing is showing. */
export interface DirectoryVisibilityView {
  isHiddenByOwner: boolean;
  hiddenAt: string | null;
}

/** `PATCH /listings/:ref/visibility` body. Nothing here can reach `status` or
 *  `operatingState`: it is only about whether the LISTING is shown. */
export interface UpdateListingVisibilityInput {
  isHiddenByOwner: boolean;
}

/** The four states a business can report about itself. `permanently_closed`
 *  is the only one that withdraws the listing from public browse, search, map
 *  and safe-space results. */
export type ListingOperatingState =
  | "open"
  | "temporarily_closed"
  | "permanently_closed"
  | "moved";

/** The read side of a listing's operating state. Everything but `state` comes
 *  back null while the business is trading normally. */
export interface OperatingStateView {
  state: ListingOperatingState;
  /** The owner's short public explanation, e.g. "back in September". */
  note: string | null;
  /** ISO 8601 stamp of when the state was last MOVED (never when the note was
   *  merely reworded). */
  setAt: string | null;
  /** Where a moved business went. Only set on `moved`. */
  movedToAddress: string | null;
}

/** `PATCH /listings/:ref/operating-state` body. `movedToAddress` is required
 *  and non-empty when `state === "moved"`; the server clears the fields that
 *  do not apply to the chosen state rather than letting a stale forwarding
 *  address outlive the move. */
export interface UpdateOperatingStateInput {
  state: ListingOperatingState;
  note?: string;
  movedToAddress?: string;
  movedToListingId?: string | null;
}

/** `POST /listings/:ref/confirm-details` response. */
export interface ConfirmDetailsResult {
  ref: string;
  /** ISO 8601. */
  detailsConfirmedAt: string;
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

/**
 * POST /geocode/address — geocode a typed street address to coordinates, so a
 * member who has no Google Maps link to paste can still place their pin
 * (item #1). Same response shape as `resolveMapLink`. Throws on an
 * un-geocodable address; the caller falls back to a neighbourhood centroid.
 */
export const geocodeAddress = (address: string) =>
  apiPost<ResolvedMapLink>("/geocode/address", { address });

/** One directory look-alike surfaced while the member types a name (item #5). */
export interface SimilarListing {
  name: string;
  cat: string;
  hood: string;
  slug: string;
  /** Metres from the typed coordinates, or null when matched by name only. */
  distanceM: number | null;
}

/**
 * GET /listings/similar — real duplicate detection against the live directory,
 * by name (fuzzy) and/or proximity to the given coordinates. Replaces the old
 * hardcoded 6-place seed match. Returns at most five.
 */
/** GET /listings/similar?name=&lat=&lng=&excludeRef= — accepts an `AbortSignal`
 *  (react-query forwards its `queryFn` signal here) so a fast retype in the
 *  wizard's name field cancels the previous keystroke's still-in-flight
 *  request instead of letting it run to completion. `excludeRef` is the
 *  listing being edited, so it never surfaces as a duplicate of itself. */
export function getSimilarListings(
  name: string,
  coords?: { latitude: number; longitude: number },
  excludeRef?: string,
  signal?: AbortSignal,
): Promise<SimilarListing[]> {
  const params = new URLSearchParams({ name });
  if (coords) {
    params.set("lat", String(coords.latitude));
    params.set("lng", String(coords.longitude));
  }
  if (excludeRef) params.set("excludeRef", excludeRef);
  return apiGet<SimilarListing[]>(
    `/listings/similar?${params.toString()}`,
    undefined,
    undefined,
    signal,
  );
}

/** GET /listings/mine?page= — the caller's own submitted listings. */
export async function getMyListings(
  page = 1,
): Promise<Paginated<ManagedListingDTO>> {
  const res = await apiGet<ManagedListingDTO[] | Paginated<ManagedListingDTO>>(
    `/listings/mine?page=${page}`,
  );
  return toItemsPage(res);
}

/** GET /listings/:ref — a single listing by its reference. */
export const getListing = (ref: string) =>
  apiGet<ManagedListingDTO>(`/listings/${ref}`);

/** PATCH /listings/:ref — edit an owned listing. Takes the update body, which
 *  deliberately cannot carry `affirmingBaselineAccepted`. */
export const updateListing = (ref: string, dto: Partial<UpdateListingDto>) =>
  apiPatch<ManagedListingDTO>(`/listings/${ref}`, dto);

/**
 * PATCH /listings/:ref/visibility — the OWNER pausing or resuming their own
 * entry in the directory. Owner-gated, and kept strictly apart from the
 * operating state: this says nothing about whether the business is trading,
 * only about whether the listing is currently shown. Everything is kept, so
 * putting it back restores it whole.
 */
export const setListingDirectoryVisibility = (
  ref: string,
  input: UpdateListingVisibilityInput,
) => apiPatch<ManagedListingDTO>(`/listings/${ref}/visibility`, input);

/**
 * PATCH /listings/:ref/operating-state — the OWNER telling the directory
 * whether their business is still trading. Owner-gated, not moderator-gated:
 * this is the business's report about itself, so it never touches `status`.
 */
export const setListingOperatingState = (
  ref: string,
  input: UpdateOperatingStateInput,
) => apiPatch<ManagedListingDTO>(`/listings/${ref}/operating-state`, input);

/**
 * POST /listings/:ref/confirm-details — "still accurate". Carries no body at
 * all: the act is the payload. Stamps `detailsConfirmedAt` and changes nothing
 * else about the listing.
 */
export const confirmListingDetails = (ref: string) =>
  apiPost<ConfirmDetailsResult>(`/listings/${ref}/confirm-details`, {});

/** DELETE /listings/:ref — withdraw an owned listing (204 No Content). */
export const deleteListing = (ref: string) =>
  apiDelete<void>(`/listings/${ref}`);

/** DELETE /admin/listings/:ref — moderator hard-delete of any listing
 *  (204 No Content). Separate from `deleteListing`, which is owner-scoped.
 *  `reason` is optional free text recorded on the listing's moderation event. */
export const deleteListingAsModerator = (ref: string, reason?: string) =>
  apiDelete<void>(`/admin/listings/${ref}`, { reason });

/**
 * PATCH /listings/:ref/status — move a listing along its review status.
 * Moderator-only: this is NOT called from the member client (members cannot
 * self-transition their own listings). Declared here for contract completeness
 * and use by the moderation surface. `reason` is optional free text recorded
 * on the listing's moderation event (and DM'd to the submitter on a send-back
 * per the backend contract).
 */
export const setListingStatus = (
  ref: string,
  status: ListingStatus,
  reason?: string,
) => apiPatch<ListingDTO>(`/admin/listings/${ref}/status`, { status, reason });

/**
 * POST /listings/:ref/question — a moderator asks the submitter a question.
 * Sends the text to the submitter as a DM and moves the listing to `question`
 * status. Moderator-only: NOT called from the member client.
 */
export const askListingQuestion = (ref: string, body: string) =>
  apiPost<ListingDTO>(`/admin/listings/${ref}/question`, { body });
