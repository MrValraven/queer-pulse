import {
  ApiError,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";

// ── Composer autosave, over the generic drafts module ────────────────────────
// SOC-13: the forum composer used to be a plain textarea with nowhere to put an
// unfinished post, while a complete server-side drafts module sat unconnected.
// This file is the connection. It does NOT define a second drafts system: every
// call here hits the SAME `/me/drafts` endpoints the members drafts surface
// uses, under the same owner-scoped, client-minted ids.
//
// It lives in `features/forum/api` (not alongside `members/api/drafts.api.ts`)
// because it needs two things that surface never did: a read of ONE draft by
// its known id, and a PATCH that round-trips the optimistic-concurrency
// `version`. Both are plain calls against endpoints that already exist.

/** The subset of the server's `DraftDTO` a forum composer draft uses. */
export interface ForumDraft {
  id: string;
  kind: string;
  kindVariant: "post";
  title: string;
  /** The composer body. */
  desc: string;
  progress: number;
  category: "posts";
  href?: string;
  /** Optimistic-concurrency counter — sent back as `expectedVersion` so a
   *  second tab autosaving the same composer gets a 409 rather than silently
   *  discarding this one's text. */
  version: number;
}

/** What a composer knows about its own draft: the body, plus the title and
 *  link that make the row readable on the member's drafts list. */
export interface ForumDraftInput {
  title: string;
  body: string;
  href: string;
  /** Free-form display label the drafts list renders verbatim. */
  kind: string;
}

/**
 * The draft id for the new-thread composer. One per member: the composer is a
 * single modal, so a second unfinished thread would overwrite the first either
 * way, and a stable id is what lets it be recovered on the next visit.
 */
export const NEW_THREAD_DRAFT_ID = "forum-thread-new";

/** The draft id for a reply composer, scoped to the thread it belongs to. */
export const replyDraftId = (threadSlug: string) => `forum-reply-${threadSlug}`;

/**
 * Reads one draft, or null when the member has none under this id.
 *
 * A missing draft is the ORDINARY case (most composers are opened on a blank
 * page), so the 404 is folded into `null` here rather than thrown at the hook.
 * Every other failure propagates: an outage must not look like "you had no
 * draft", which would invite the member to start again over text that still
 * exists.
 */
export async function getForumDraft(id: string): Promise<ForumDraft | null> {
  try {
    return await apiGet<ForumDraft>(`/me/drafts/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Creates the draft under a caller-minted id. 409 means it already exists. */
export const createForumDraft = (id: string, input: ForumDraftInput) =>
  apiPost<ForumDraft>("/me/drafts", {
    id,
    kind: input.kind,
    kindVariant: "post",
    title: input.title,
    desc: input.body,
    progress: 0,
    category: "posts",
    href: input.href,
  });

/** Patches the draft, declaring the version this client last read. */
export const updateForumDraft = (
  id: string,
  input: ForumDraftInput,
  expectedVersion: number,
) =>
  apiPatch<ForumDraft>(`/me/drafts/${encodeURIComponent(id)}`, {
    kind: input.kind,
    title: input.title,
    desc: input.body,
    href: input.href,
    expectedVersion,
  });

/** Discards the draft, once its post is published. */
export const deleteForumDraft = (id: string) =>
  apiDelete<void>(`/me/drafts/${encodeURIComponent(id)}`);
