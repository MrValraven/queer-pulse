import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";

/**
 * The topic directory's staff surface, mirroring the backend's
 * `AdminTopicsController` (`queerpulse-backend/src/admin-topics`).
 *
 * Topics are the platform's only interest graph, linked from the meganav and
 * from global search, and until this existed the only ones that could ever
 * exist were the ones a migration inserted. Every route here is gated at the
 * moderator/admin tier.
 */

/** One topic as the admin screen sees it: the member-facing fields plus the
 *  id, the follower count and the archive state. */
export interface AdminTopicDTO {
  id: string;
  tag: string;
  label: string;
  description: string;
  totalPosts: number;
  followerCount: number;
  /** Surfaces the crisis-support card in the topic page's sidebar. */
  isCrisisCard: boolean;
  isArchived: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicBody {
  tag: string;
  label: string;
  description: string;
  isCrisisCard?: boolean;
}

/** `tag` is absent on purpose: it is the topic's public URL and the key its
 *  followers are stored under, so the backend refuses to change it. Archive
 *  the topic and create the new tag instead. */
export type UpdateTopicBody = Partial<Omit<CreateTopicBody, "tag">>;

/** GET /admin/topics: every topic, archived ones included. */
export const getAdminTopics = () => apiGet<AdminTopicDTO[]>("/admin/topics");

/** POST /admin/topics. 409 when the tag already exists, archived or not. */
export const createAdminTopic = (body: CreateTopicBody) =>
  apiPost<AdminTopicDTO>("/admin/topics", body);

/** PATCH /admin/topics/:id: label, description and crisis card only. */
export const updateAdminTopic = (id: string, body: UpdateTopicBody) =>
  apiPatch<AdminTopicDTO>(`/admin/topics/${id}`, body);

/** POST /admin/topics/:id/archive: out of the directory, posts and followers
 *  kept. */
export const archiveAdminTopic = (id: string) =>
  apiPost<AdminTopicDTO>(`/admin/topics/${id}/archive`);

/** POST /admin/topics/:id/restore: back in the directory, exactly as it was. */
export const restoreAdminTopic = (id: string) =>
  apiPost<AdminTopicDTO>(`/admin/topics/${id}/restore`);

/** DELETE /admin/topics/:id: destroys the topic, its posts and its follows. */
export const deleteAdminTopic = (id: string) =>
  apiDelete<void>(`/admin/topics/${id}`);
