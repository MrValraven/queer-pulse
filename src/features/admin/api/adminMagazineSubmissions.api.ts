import { apiGet } from "../../../shared/api/client";

/**
 * Admin oversight of magazine story submissions
 * (`/admin/magazine-submissions`, admin-only). Lists every reader pitch — the
 * submitter, their working title, format, pitch text, and status — so editors
 * can see the pipeline (this is the READ side the submissions editor was
 * previously mock-only for). The backend scopes this to admins and 403s
 * otherwise; this file only owns the wire shape.
 */

export type MagazineSubmissionStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "accepted"
  | "rejected"
  | "published";

export interface AdminPersonDTO {
  slug: string;
  name: string;
  avatarUrl?: string | null;
}

export interface AdminMagazineSubmissionDTO {
  id: string;
  /** The member who pitched (null if their profile is gone). */
  submitter: AdminPersonDTO | null;
  /** The section/format the pitch targets (editorial config, free text). */
  format: string;
  workingTitle: string;
  /** The pitch body, as the member wrote it. */
  pitch: string;
  status: MagazineSubmissionStatus;
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
