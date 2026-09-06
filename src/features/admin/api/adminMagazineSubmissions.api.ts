import { apiGet, apiPatch, apiPost } from "../../../shared/api/client";

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
 *  `accepted`; they differ in what lands on the desk. A commission creates a
 *  pitch in the desk's inbox to be triaged; an acceptance creates the piece
 *  outright, with the member's story already filed as its article draft. */
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
  /** Who last took a decline back and put the story in the queue again, and
   *  when. Both null until that happens. Reopening CLEARS the decision it
   *  undoes, so without these the row would be back in the queue looking as if
   *  nobody had ever decided it. */
  reopenedBy: AdminPersonDTO | null;
  reopenedAt: string | null;
  /** How many times this story has been declined and put back. `reopenedAt`
   *  holds only the last one. */
  reopenCount: number;
  /** Set when a commission put this piece in the desk's pitch inbox. */
  commissionedPitchId: string | null;
  /** Set when an acceptance created the desk piece for this story. Accepting
   *  builds the piece, carries the member's text across as its article draft,
   *  and assigns them as its writer, so the row can link straight to the desk
   *  record. */
  acceptedPieceId: string | null;
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

/**
 * Take a decline back and put the story in the queue again. Only a DECLINED
 * submission can be reopened: a yes left a record on the desk (a piece for an
 * accept, a pitch for a commission) that reopening would strand, a withdrawal
 * was the member's own decision, and an undecided row is already in the queue.
 * The backend answers each of those with a 409.
 *
 * Its own route rather than a fourth `decision` value, because it clears the
 * verdict instead of recording one and takes no reply note.
 */
export const reopenAdminMagazineSubmission = (id: string) =>
  apiPost<AdminMagazineSubmissionDTO>(
    `/admin/magazine-submissions/${id}/reopen`,
  );
