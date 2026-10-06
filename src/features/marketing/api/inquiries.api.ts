import { apiPost } from "../../../shared/api/client";

/** Which public marketing form produced the inquiry. */
export type InquiryKind = "contact" | "partner";

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
}

/** The backend's acknowledgement for a stored inquiry. */
export interface InquiryAckDTO {
  id: string;
  status: "new" | "handled";
}

/** POST /inquiries — public marketing-form intake (Contact + partnerships). */
export const createInquiry = (dto: CreateInquiryDto) =>
  apiPost<InquiryAckDTO>("/inquiries", dto);
