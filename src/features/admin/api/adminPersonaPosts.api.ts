import { apiGet, apiPost } from "../../../shared/api/client";

/** The staff read of one persona post (Moderator or Admin; 404 when gone). */
export interface AdminPersonaPostDTO {
  id: string;
  body: string;
  linkUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
  editedAt: string | null;
  persona: { id: string; name: string; handle: string | null };
}

const segment = (id: string) => encodeURIComponent(id);

export const getStaffPersonaPost = (postId: string) =>
  apiGet<AdminPersonaPostDTO>(`/admin/persona-posts/${segment(postId)}`);

/** Deletes the post, writes the audit entry and deletes its photo after the
 *  commit. `reportId` ties the audit entry to the open report; the
 *  moderator still closes the report in the decision grid. 204. */
export const removeReportedPersonaPost = (
  postId: string,
  reason: string,
  reportId?: string,
) =>
  apiPost<void>(`/admin/persona-posts/${segment(postId)}/remove`, {
    reason,
    ...(reportId ? { reportId } : {}),
  });
