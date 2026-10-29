import { ApiError, apiPatch } from "../../../shared/api/client";
import type {
  ListingPhotoFramingResponse,
  UpdateListingPhotoFramingDto,
} from "./directory.api";

/** Throws unless the body carries a `photoGallery` array, so a malformed 200
 *  never reaches the cache write. */
function validatePhotoFramingResponse(
  data: unknown,
): ListingPhotoFramingResponse {
  const photoGallery = (data as { photoGallery?: unknown } | null)
    ?.photoGallery;
  if (!Array.isArray(photoGallery)) {
    throw new Error("The photo-framing response had no photoGallery array.");
  }
  return data as ListingPhotoFramingResponse;
}

/** `PATCH /listings/:ref/photo-framing`. A listing manager repositions the
 *  photos of a live listing; answers the full updated gallery. */
export const updateListingPhotoFraming = (
  ref: string,
  body: UpdateListingPhotoFramingDto,
): Promise<ListingPhotoFramingResponse> =>
  apiPatch<ListingPhotoFramingResponse>(
    `/listings/${encodeURIComponent(ref)}/photo-framing`,
    body,
    undefined,
    validatePhotoFramingResponse,
  );

/** `PATCH /admin/listings/:ref/photo-framing`. The admin twin of the member
 *  save. */
export const updateAdminListingPhotoFraming = (
  ref: string,
  body: UpdateListingPhotoFramingDto,
): Promise<ListingPhotoFramingResponse> =>
  apiPatch<ListingPhotoFramingResponse>(
    `/admin/listings/${encodeURIComponent(ref)}/photo-framing`,
    body,
    undefined,
    validatePhotoFramingResponse,
  );

/** The cause a failed reposition save is named after. */
export type ListingPhotoFramingErrorReason =
  | "notFound"
  | "notManager"
  | "notAdmin"
  | "restricted"
  | "notLive"
  | "photoNotInGallery"
  | "invalid"
  | "signedOut"
  | "rateLimited"
  | "offline"
  | "unreachable"
  | "server"
  | "refused";

export interface ListingPhotoFramingError {
  reason: ListingPhotoFramingErrorReason;
  /** The HTTP status, or null when no response arrived. */
  status: number | null;
}

/** Catalog key of the copy naming each reason. */
export const LISTING_PHOTO_FRAMING_ERROR_KEYS: Record<
  ListingPhotoFramingErrorReason,
  string
> = {
  notFound: "marketing:directory.detail.reposition.error.notFound",
  notManager: "marketing:directory.detail.reposition.error.notManager",
  notAdmin: "marketing:directory.detail.reposition.error.notAdmin",
  restricted: "marketing:directory.detail.reposition.error.restricted",
  notLive: "marketing:directory.detail.reposition.error.notLive",
  photoNotInGallery:
    "marketing:directory.detail.reposition.error.photoNotInGallery",
  invalid: "marketing:directory.detail.reposition.error.invalid",
  signedOut: "marketing:directory.detail.reposition.error.signedOut",
  rateLimited: "marketing:directory.detail.reposition.error.rateLimited",
  offline: "marketing:directory.detail.reposition.error.offline",
  unreachable: "marketing:directory.detail.reposition.error.unreachable",
  server: "marketing:directory.detail.reposition.error.server",
  refused: "marketing:directory.detail.reposition.error.refused",
};

function reasonForStatus(
  error: ApiError,
  asAdmin: boolean,
): ListingPhotoFramingErrorReason {
  const errorCode = (error.data as { code?: unknown } | null)?.code;
  switch (error.status) {
    case 401:
      return "signedOut";
    case 404:
      return "notFound";
    case 408:
      return "unreachable";
    case 429:
      return "rateLimited";
    case 403:
      if (errorCode === "ACCOUNT_RESTRICTED") return "restricted";
      if (errorCode === "LISTING_NOT_MANAGER") return "notManager";
      return asAdmin ? "notAdmin" : "refused";
    case 409:
      return errorCode === "LISTING_NOT_LIVE" ? "notLive" : "refused";
    case 400:
      return errorCode === "PHOTO_NOT_IN_GALLERY"
        ? "photoNotInGallery"
        : "invalid";
    default:
      return error.status >= 500 ? "server" : "refused";
  }
}

/** Names the cause of a failed reposition save: offline first, then a missing
 *  response, then the HTTP status and the backend's `code`. */
export function listingPhotoFramingErrorOf(
  error: unknown,
  options: { asAdmin: boolean; isOffline?: boolean },
): ListingPhotoFramingError {
  const isOffline =
    options.isOffline ??
    (typeof navigator !== "undefined" && navigator.onLine === false);
  const status = error instanceof ApiError ? error.status : null;
  if (isOffline) return { reason: "offline", status };
  if (!(error instanceof ApiError)) return { reason: "unreachable", status };
  return { reason: reasonForStatus(error, options.asAdmin), status };
}
