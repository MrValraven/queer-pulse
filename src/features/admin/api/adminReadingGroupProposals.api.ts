import { apiGet, apiPost } from "../../../shared/api/client";

/**
 * Admin oversight of reading-group proposals
 * (`/admin/reading-group-proposals`, admin-only). Lists every "Start your own
 * group" a member has submitted — the book, their reason, the format, and group
 * size — so staff can help spin the group up. The backend scopes this to admins
 * and 403s otherwise; this file only owns the wire shape.
 */

export type ReadingGroupFormat = "In-person" | "Online" | "Either";

/** Admin decision lifecycle of a proposal (mirrors the backend enum). A fresh
 *  proposal is `pending` until an admin/moderator acts on it. */
export type ReadingGroupProposalStatus =
  "pending" | "approved" | "declined" | "archived";

export interface AdminPersonDTO {
  slug: string;
  name: string;
  avatarUrl?: string | null;
}

export interface AdminReadingGroupProposalDTO {
  id: string;
  /** The member who proposed the group (null if their profile is gone). */
  member: AdminPersonDTO | null;
  /** "Book title & author" as free text. */
  book: string;
  /** The optional "Why this book?" note, if any. */
  why: string | null;
  format: ReadingGroupFormat;
  /** Max people the member picked (4, 6, or 8). */
  maxPeople: number;
  createdAt: string;
  /** Where the proposal sits in the admin decision lifecycle. */
  status: ReadingGroupProposalStatus;
  /** When the current status was decided (null while pending). */
  decidedAt: string | null;
  /** Optional note the deciding admin/moderator attached (null while pending).
   *  On a decline this is the REQUIRED reason, and it is the message the
   *  proposer is sent. */
  decisionNote: string | null;
  /**
   * The community an approval actually created, owned by the proposer, or null
   * for a proposal still pending, declined, archived, or approved before
   * approval created anything at all. Rendered as a link so a reviewer can see
   * the outcome of their own decision.
   */
  createdCommunitySlug: string | null;
}

export interface AdminReadingGroupProposalListDTO {
  items: AdminReadingGroupProposalDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/** Paginated list, optionally filtered by format and by decision state. */
export const getAdminReadingGroupProposals = (parameters: {
  page?: number;
  format?: ReadingGroupFormat;
  status?: ReadingGroupProposalStatus;
}) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.format) searchParams.set("format", parameters.format);
  if (parameters.status) searchParams.set("status", parameters.status);
  const querySuffix = searchParams.toString();
  return apiGet<AdminReadingGroupProposalListDTO>(
    `/admin/reading-group-proposals${querySuffix ? `?${querySuffix}` : ""}`,
  );
};

/** The three admin decisions an oversight actor can take on a proposal. */
export type ReadingGroupProposalDecision = "approve" | "decline" | "archive";

const decisionBody = (note?: string) =>
  note && note.trim() ? { note: note.trim() } : {};

/**
 * Approve a proposal (admin/moderator). Approving CREATES the community the
 * member proposed, owned by them, and tells them. Idempotent: a second approve
 * on a proposal that already built its community returns it unchanged.
 */
export const approveReadingGroupProposal = (id: string, note?: string) =>
  apiPost<AdminReadingGroupProposalDTO>(
    `/admin/reading-group-proposals/${id}/approve`,
    decisionBody(note),
  );

/**
 * Decline a proposal (admin/moderator). The reason is REQUIRED by the backend
 * and it is the message the proposer receives, so it is a plain parameter here
 * rather than an optional note: a decline with no words attached would tell a
 * member only "no" about work they actually did.
 */
export const declineReadingGroupProposal = (id: string, reason: string) =>
  apiPost<AdminReadingGroupProposalDTO>(
    `/admin/reading-group-proposals/${id}/decline`,
    { reason: reason.trim() },
  );

/** Archive a proposal (admin/moderator). Echoes the updated proposal. */
export const archiveReadingGroupProposal = (id: string, note?: string) =>
  apiPost<AdminReadingGroupProposalDTO>(
    `/admin/reading-group-proposals/${id}/archive`,
    decisionBody(note),
  );
