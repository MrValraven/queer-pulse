import { apiPost } from "../../../shared/api/client";

/** Which public marketing form produced the inquiry. `listing_correction`
 *  (PRD-434) is a Contact message sent under the listing-correction topic. */
export type InquiryKind = "contact" | "partner" | "listing_correction";

/** Body for `POST /inquiries` — mirrors the backend `CreateInquiryDto`. */
export interface CreateInquiryDto {
  kind: InquiryKind;
  name: string;
  email: string;
  /** Topic (contact) / interest (partner) selector. */
  subject?: string;
  /**
   * PRD-452. The Contact form's topic id (`safety`, `press`, ...). `subject`
   * carries the translated label; the backend reads this id to put a safety
   * concern first in the admin inbox and announce it to staff.
   */
  topic?: string;
  body: string;
  /** Organisation name — partner form only. */
  orgName?: string;
  /**
   * PRD-434. The listing a `listing_correction` is about, as the ref the
   * "Suggest a correction" link carried. The backend stores it only on that
   * kind, and the admin inbox links to the listing from it.
   */
  listingRef?: string;
}

/** The backend's acknowledgement for a stored inquiry. */
export interface InquiryAckDTO {
  id: string;
  status: "new" | "handled";
}

/** POST /inquiries — public marketing-form intake (Contact + partnerships). */
export const createInquiry = (dto: CreateInquiryDto) =>
  apiPost<InquiryAckDTO>("/inquiries", dto);
