import { apiGet, apiPatch } from "../../../shared/api/client";

/**
 * The public contact + partnership inbox (`/admin/intakes`, Inquiries section).
 * Read straight off the wire: the server hand-maps every field this console
 * renders, so there is no adapter between the DTO and the row.
 * `POST /inquiries` is open to anyone and stores every message sent through
 * `/about/contact` — which is the escape hatch the sign-in page, the under-18
 * notice and the request-invite confirmation all point at. Until ACQ-03 nothing
 * in the frontend read it back.
 *
 * QueerPulse sends no email, so "handled" here means a human read it and
 * answered from their own inbox. Nothing on this surface sends anything.
 */

/** `listing_correction` (PRD-434) is a Contact message about one directory
 *  listing, sent under the form's listing-correction topic. */
export type InquiryKind = "contact" | "partner" | "listing_correction";
export type InquiryStatus = "new" | "handled";

export const INQUIRY_KINDS: readonly InquiryKind[] = [
  "contact",
  "partner",
  "listing_correction",
];
export const INQUIRY_STATUSES: readonly InquiryStatus[] = ["new", "handled"];

/** The admin who marked it handled. Null on rows handled before ACQ-03 shipped
 *  (no backfill), rendered as "no recorded handler" rather than a guess. */
export interface InquiryHandler {
  id: string;
  name: string;
}

/**
 * PRD-434. The directory listing a correction is about, resolved by the
 * server from the stored ref. `isPublic` is true while the public page opens
 * (live and not hidden by its owner); otherwise the row links to the staff
 * editor.
 */
export interface InquiryListingDTO {
  ref: string;
  name: string;
  slug: string;
  isPublic: boolean;
}

export interface AdminInquiryDTO {
  id: string;
  kind: InquiryKind;
  name: string;
  email: string;
  /** Absent when the sender left no subject. */
  subject?: string;
  body: string;
  /** Absent for a plain contact message; the organisation on a partner one. */
  orgName?: string;
  status: InquiryStatus;
  /** RES-F6 (PRD-452). A safety concern: the server sorts it first while it
   *  is `new`, and the row wears a priority badge. */
  isPriority: boolean;
  /** PRD-434. The ref a `listing_correction` was sent about; null on every
   *  other kind and on a correction sent without one. */
  listingRef: string | null;
  /** PRD-434. `listingRef` resolved to the listing, or null when no listing
   *  has that ref any more. */
  listing: InquiryListingDTO | null;
  createdAt: string;
  handledAt: string | null;
  handledBy: InquiryHandler | null;
}

export interface AdminInquiryListDTO {
  items: AdminInquiryDTO[];
  total: number;
  page: number;
  pageSize: number;
  /**
   * How many rows are still `new`. Honours the `kind` filter and ignores the
   * `status` one, so reading the handled tab never zeroes the badge. Always
   * read this rather than counting the loaded page: the page is one slice.
   */
  unhandledCount: number;
}

/** Paginated inquiry list, optionally narrowed by kind and/or status. Page size
 *  is a server constant of 20 and is not a parameter. */
export const getAdminInquiries = async (parameters: {
  page?: number;
  kind?: InquiryKind;
  status?: InquiryStatus;
}): Promise<AdminInquiryListDTO> => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.kind) searchParams.set("kind", parameters.kind);
  if (parameters.status) searchParams.set("status", parameters.status);
  const query = searchParams.toString();
  return apiGet<AdminInquiryListDTO>(
    query ? `/inquiries?${query}` : "/inquiries",
  );
};

/**
 * Flip one inquiry between `new` and `handled`. Moving to `handled` stamps the
 * acting admin; a re-PATCH of an already-attributed row keeps the original
 * stamp; moving back to `new` clears it. Echoes the updated row.
 */
export const updateInquiryStatus = (
  id: string,
  status: InquiryStatus,
): Promise<AdminInquiryDTO> =>
  apiPatch<AdminInquiryDTO>(`/inquiries/${id}`, { status });
