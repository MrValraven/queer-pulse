import { apiGet, apiPatch } from "../../../shared/api/client";

/**
 * Admin oversight of magazine story submissions
 * (`/admin/magazine-submissions`, admin-only). Lists every reader story — the
 * submitter, their working title, format, the piece as they wrote it, and its
 * status — and records the editorial decision on one. The backend scopes both
 * to admins and 403s otherwise; this file only owns the wire shape.
 */

export type MagazineSubmissionStatus =
  "draft" | "submitted" | "in_review" | "accepted" | "rejected" | "published";

/** The staff verdict. `accepted` and `commissioned` both land `status` on
 *  `accepted`; a commission also creates a pitch in the desk's inbox. */
export type MagazineSubmissionDecision =
  "accepted" | "declined" | "commissioned";

export interface AdminPersonDTO {
  slug: string;
  name: string;
  avatarUrl?: string | null;
}

export interface AdminMagazineSubmissionDTO {
  id: string;
  /** The member who submitted (null if their profile is gone). */
  submitter: AdminPersonDTO | null;
  /** The section/format the story targets (editorial config, free text). */
  format: string;
  workingTitle: string;
  /** The short summary, as the member wrote it. */
  pitch: string;
  /** The standfirst. Null on rows written before deck/body were split out. */
  deck: string | null;
  /** The piece itself. Null on rows written before the split — those carry
   *  everything in `pitch`. */
  body: string | null;
  /** The cover the member uploaded, already resolved to a URL. */
  coverUrl: string | null;
  status: MagazineSubmissionStatus;
  decision: MagazineSubmissionDecision | null;
  /** The reply the decider wrote back to the submitter. */
  decisionNote: string | null;
  decidedAt: string | null;
  /** Set when a commission put this piece in the desk's pitch inbox. */
  commissionedPitchId: string | null;
  createdAt: string;
}

export interface AdminMagazineSubmissionListDTO {
  items: AdminMagazineSubmissionDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/** Paginated story-submission list, optionally filtered by status. */
export const getAdminMagazineSubmissions = (parameters: {
  page?: number;
  status?: MagazineSubmissionStatus;
}) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.status) searchParams.set("status", parameters.status);
  const querySuffix = searchParams.toString();
  return apiGet<AdminMagazineSubmissionListDTO>(
    `/admin/magazine-submissions${querySuffix ? `?${querySuffix}` : ""}`,
  );
};

/** Accept, decline, or commission one submission. 409s if it was already
 *  decided (another editor got there first). */
export const decideAdminMagazineSubmission = (
  id: string,
  dto: { decision: MagazineSubmissionDecision; replyNote?: string },
) =>
  apiPatch<AdminMagazineSubmissionDTO>(
    `/admin/magazine-submissions/${id}`,
    dto,
  );
