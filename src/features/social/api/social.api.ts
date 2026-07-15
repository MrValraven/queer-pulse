import { apiGet, apiPost, apiDelete } from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";
import type { MemberRefDTO, Paginated } from "../../../shared/api/refs";

/**
 * Blocks & mutes API — the live-mode source of truth for the two safety
 * primitives. Mirrors `connect/api/connections.api.ts`. The actor is always the
 * authenticated user (session cookie); the target is a member **slug** in the
 * path — the single canonical key the whole client agrees on.
 *
 * `/blocks` is mutual/hard severance (see spec 03); `/mutes` is one-way/soft.
 * Server-side enforcement is authoritative — these calls just record intent and
 * let `SocialProvider` hydrate. Demo mode never reaches this module.
 */

/** A member the actor has blocked. */
export interface BlockDTO {
  /** Stable block id. */
  id: string;
  /** The blocked member (reuses the shared ref shape). */
  member: MemberRefDTO;
  /** ISO creation time. */
  createdAt: string;
  reason?: string;
}

/** A member the actor has muted. */
export interface MuteDTO {
  id: string;
  member: MemberRefDTO;
  createdAt: string;
}

/** Directional block status between the actor and one member. */
export interface BlockStatus {
  /** The actor has blocked this member. */
  blocking: boolean;
  /** This member has blocked the actor (never leaks *who* to the other side). */
  blockedBy: boolean;
}

/** Optional context when creating a block (drives the "also report" affordance). */
export interface BlockOptions {
  reason?: string;
  alsoReport?: boolean;
}

/** GET /blocks — members the actor has blocked, newest first. */
export async function getBlocks(page?: number) {
  const res = await apiGet<BlockDTO[] | Paginated<BlockDTO>>(
    `/blocks${page ? `?page=${page}` : ""}`,
  );
  return toItemsPage(res);
}

/** POST /blocks/:slug — block a member (idempotent server-side). */
export const blockMember = (slug: string, body?: BlockOptions) =>
  apiPost<BlockDTO>(`/blocks/${encodeURIComponent(slug)}`, body);

/** DELETE /blocks/:slug — unblock. Does not restore any severed connection. */
export const unblockMember = (slug: string) =>
  apiDelete<void>(`/blocks/${encodeURIComponent(slug)}`);

/** GET /blocks/:slug — am I blocking / blocked-by this member? */
export const getBlockStatus = (slug: string) =>
  apiGet<BlockStatus>(`/blocks/${encodeURIComponent(slug)}`);

/** GET /mutes — members the actor has muted, newest first. */
export async function getMutes(page?: number) {
  const res = await apiGet<MuteDTO[] | Paginated<MuteDTO>>(
    `/mutes${page ? `?page=${page}` : ""}`,
  );
  return toItemsPage(res);
}

/** POST /mutes/:slug — mute a member (one-way; target is not notified). */
export const muteMember = (slug: string) =>
  apiPost<MuteDTO>(`/mutes/${encodeURIComponent(slug)}`);

/** DELETE /mutes/:slug — unmute. */
export const unmuteMember = (slug: string) =>
  apiDelete<void>(`/mutes/${encodeURIComponent(slug)}`);
