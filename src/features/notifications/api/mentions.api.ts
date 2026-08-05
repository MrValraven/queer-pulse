import { apiGet, apiPost } from "../../../shared/api/client";

/**
 * The member who wrote the mention, resolved server-side so the inbox can name,
 * link to, and show an avatar for them. `null`/absent when the row carries no
 * actor or the profile can no longer be resolved.
 */
export interface MentionActorDTO {
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

/**
 * A single `@`-mention exactly as `GET /mentions` serves it — a hand-mapped
 * projection of a `mention` notification row (there is no mentions table). The
 * backend flattens the opaque notification payload into these fields and
 * resolves `sourceLabel` (the forum thread title / community name) so the client
 * doesn't have to reverse-engineer a slug. Display text/labels are still built
 * client-side through i18n; see `mentions.adapters.ts`.
 */
export interface MentionDTO {
  /** The backing notification id — also what per-row "mark read" POSTs to
   *  `/notifications/:id/read`. */
  id: string;
  /** ISO timestamp. */
  createdAt: string;
  read: boolean;
  actor?: MentionActorDTO | null;
  /** `"forum"` | `"community"` | null. */
  source: string | null;
  /** `member` | `community` | `business` | `event` | `thread` | null. */
  entityKind: string | null;
  excerpt: string;
  threadSlug: string | null;
  communitySlug: string | null;
  postId: string | null;
  sourceLabel: string | null;
}

interface MentionsPage {
  items: MentionDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * GET /mentions — the current member's `@`-mentions, newest first. Unwraps the
 * canonical `{ items, total, page, pageSize }` envelope to the row array the
 * adapter groups; tolerates a bare array in case the endpoint is ever
 * un-paginated (mirrors `getNotifications`).
 */
export const getMentions = async (): Promise<MentionDTO[]> => {
  const res = await apiGet<MentionsPage | MentionDTO[]>("/mentions");
  return Array.isArray(res) ? res : (res?.items ?? []);
};

/**
 * POST /mentions/read-all — mark every one of the member's mentions read.
 * Scoped to mentions on the server, so it never clears the member's other
 * notification categories (which `/notifications/read-all` would).
 */
export const markAllMentionsRead = () =>
  apiPost<{ ok: true }>("/mentions/read-all");
