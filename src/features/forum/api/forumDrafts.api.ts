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

/**
 * The draft row's kind-agnostic bag of composer state (the backend's
 * `DraftMeta`).
 *
 * Flat and scalar by contract: `@IsDraftMeta` refuses nesting, caps the key
 * count, every key and value, and the serialized size, because this column is
 * rewritten on a typing debounce by every active member. The forum's own keys
 * are defined by `ForumThreadDraftSnapshot`; a composer reads only the keys it
 * knows and ignores the rest.
 */
export type ForumDraftMeta = Record<
  string,
  string | number | boolean | null | string[]
>;

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
  /**
   * The composer state that used to live in this browser alone (PRD-165):
   * category, community, tags and the attached photo's REFERENCE. `null` for a
   * draft saved before the column existed, or by a composer that keeps none.
   */
  meta?: ForumDraftMeta | null;
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
  /**
   * The rest of the composer's state, so the draft reopens the same on any
   * device. Omitted by composers that have none (a reply box is a body and
   * nothing else); `null` clears a bag that was there before.
   */
  meta?: ForumDraftMeta | null;
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
 * The draft id for one INLINE nested-reply composer (PRD-166), scoped to both
 * the thread and the reply being answered.
 *
 * Both halves are load-bearing. Keyed on the thread alone, two half-written
 * answers under two different replies would overwrite each other, which is the
 * same loss the autosave exists to prevent; keyed on the parent post alone, the
 * id would not be stable across a thread that reuses ids in demo mode.
 */
export const nestedReplyDraftId = (threadKey: string, parentPostId: string) =>
  `forum-reply-${threadKey}-${parentPostId}`;

/**
 * react-query key for ONE composer draft, so a surface that only needs to know
 * "does an unsent draft exist?" (the forum page's resume notice) reads the same
 * cache entry the composer writes through on every save.
 */
export const forumDraftQueryKey = (id: string) => ["forum-draft", id] as const;

/**
 * What a surface OUTSIDE the composer needs to know about an unsent draft:
 * enough to name it and offer it back, never the whole payload. `null` under
 * this key means "there is no draft".
 */
export interface ForumDraftPreview {
  /** The autosaved body. Empty when only the other fields were filled in. */
  body: string;
  /** The autosaved title. Empty when the member never typed one. */
  title: string;
  /** True when the draft holds something beyond title and body (a community,
   *  tags, an attached photo), so a body-less draft still announces itself. */
  hasExtraFields: boolean;
}

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
    meta: input.meta,
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
    meta: input.meta,
    expectedVersion,
  });

/** Discards the draft, once its post is published. */
export const deleteForumDraft = (id: string) =>
  apiDelete<void>(`/me/drafts/${encodeURIComponent(id)}`);
