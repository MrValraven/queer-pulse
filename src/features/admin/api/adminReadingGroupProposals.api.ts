import { apiGet } from "../../../shared/api/client";

/**
 * Admin oversight of reading-group proposals
 * (`/admin/reading-group-proposals`, admin-only). Lists every "Start your own
 * group" a member has submitted — the book, their reason, the format, and group
 * size — so staff can help spin the group up. The backend scopes this to admins
 * and 403s otherwise; this file only owns the wire shape.
 */

export type ReadingGroupFormat = "In-person" | "Online" | "Either";

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
}

export interface AdminReadingGroupProposalListDTO {
  items: AdminReadingGroupProposalDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/** Paginated reading-group-proposal list, optionally filtered by format. */
export const getAdminReadingGroupProposals = (parameters: {
  page?: number;
  format?: ReadingGroupFormat;
}) => {
  const searchParams = new URLSearchParams();
  if (parameters.page) searchParams.set("page", String(parameters.page));
  if (parameters.format) searchParams.set("format", parameters.format);
  const querySuffix = searchParams.toString();
  return apiGet<AdminReadingGroupProposalListDTO>(
    `/admin/reading-group-proposals${querySuffix ? `?${querySuffix}` : ""}`,
  );
};
