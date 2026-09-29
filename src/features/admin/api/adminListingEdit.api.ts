import { ApiError, apiGet, apiPatch } from "../../../shared/api/client";
import type { ListingDraft } from "../../marketing/listBusiness/listBusiness.data";
import type {
  ListingDTO,
  ManagedListingDTO,
} from "../../marketing/listBusiness/api/listings.api";
import {
  adminDraftToDto,
  type AdminCreateListingDto,
} from "./adminListingCreate.api";

/** The admin edit page for one listing. */
export function adminListingEditPath(ref: string): string {
  return `/admin/listings/${encodeURIComponent(ref)}/edit`;
}

/**
 * The admin PATCH body, mirroring `AdminUpdateListingDto` on the server: the
 * admin create body without `publishState`, `ownerOffer` and `path`. Built
 * from the create body so the eight keys an admin may never send stay out by
 * the same allow-list and named-key delete.
 */
export type AdminUpdateListingDto = Omit<
  AdminCreateListingDto,
  "publishState" | "ownerOffer" | "path"
>;

/**
 * Build the admin PATCH body from a finished wizard draft.
 *
 * Runs the draft through `adminDraftToDto`, so the business half is the same
 * derivation (and the same excluded-key delete) the admin create uses, then
 * drops the three keys the edit body has no room for. `publishState` is only
 * there because the create builder requires one; `path` is dropped because
 * the draft carries the staff path the wizard needs to render, which is not
 * the listing's stored path. No `ownerOffer` is passed, so none is added.
 */
export function adminDraftToUpdateDto(
  draft: ListingDraft,
): AdminUpdateListingDto {
  const {
    publishState: _publishState,
    path: _path,
    ...business
  } = adminDraftToDto(draft, { publishState: "review" });
  return business;
}

/** `GET /admin/listings/:ref/editable`. Admin only. Owner-personal fields
 *  arrive redacted and `managementRole` is `"co_manager"`. */
export function getAdminEditableListing(
  ref: string,
): Promise<ManagedListingDTO> {
  return apiGet<ManagedListingDTO>(
    `/admin/listings/${encodeURIComponent(ref)}/editable`,
  );
}

/** `PATCH /admin/listings/:ref`. Admin only; 409 `LISTING_HAS_OWNER` once
 *  somebody owns the listing. */
export function adminUpdateListing(
  ref: string,
  body: AdminUpdateListingDto,
): Promise<ListingDTO> {
  return apiPatch<ListingDTO>(
    `/admin/listings/${encodeURIComponent(ref)}`,
    body,
  );
}

/** The stable `code` the server puts on the 409 an owned listing answers. */
export const LISTING_HAS_OWNER_CODE = "LISTING_HAS_OWNER";

/**
 * True when an admin edit was refused because the listing has an owner now:
 * a claim or a handover landed between the page loading and the save. The
 * owner edits it from then on, so the page swaps the wizard for a notice.
 */
export function isListingHasOwnerError(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 409) return false;
  const data = error.data;
  if (typeof data !== "object" || data === null || !("code" in data)) {
    return false;
  }
  return data.code === LISTING_HAS_OWNER_CODE;
}
