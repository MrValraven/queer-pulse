import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
} from "../../../shared/api/client";
import { toPage } from "../../../shared/api/pagination";
import type {
  AuthorSummary,
  ForumPostHistoryResponse,
  ForumPostResponse as BaseForumPostResponse,
  ForumThreadResponse as BaseForumThreadResponse,
  PageInfo,
  Paginated,
} from "../../../shared/contracts/contracts";

/**
 * The forum DTOs, plus the fields SOC-13 added to them.
 *
 * Declared here rather than edited into `shared/contracts/contracts.ts`
 * because these fields are read by exactly one feature. The base
 * interfaces stay the shared cross-feature contract; the forum's own
 * extensions live next to the calls that produce them.
 */
export interface ForumThreadResponse extends BaseForumThreadResponse {
  /** Is the viewer following this thread (notified about new replies)? */
  isSubscribed: boolean;
  /** The reply marked as the answer, or null while the question is open. */
  acceptedPostId: string | null;
  /** May the viewer set/clear the accepted answer (author or moderator)? */
  canAcceptAnswer: boolean;
  /** May the viewer replace the tag set (author or moderator)? Wider than
   *  `canEdit`, which is the author-only title permission. */
  canEditTags: boolean;
  /** Has the whole thread been withdrawn by its author or taken down by staff
   *  (PRD-160)? Only ever `true` in a platform moderator's view: every
   *  member-facing read path filters withdrawn threads out of the result set,
   *  and a direct read of one 404s. */
  isDeleted: boolean;
  /** A short plain-text taste of the opening post for the list row and the
   *  feed's forum card (PRD-167). HTML-stripped, cut on a word boundary at 180
   *  characters with a trailing ellipsis when the body ran past it.
   *
   *  NULL whenever the OP has nothing showable behind it: no OP resolved on
   *  this echo, an OP its author tombstoned, or an OP a moderator hid or
   *  removed. Render nothing at all in that case: a takedown must not leak
   *  through the one field that now carries body text into the list. */
  excerpt: string | null;
  /** Replies posted since the viewer last opened this thread (PRD-170),
   *  capped at 99 by the server.
   *
   *  `null` is "there is no watermark to compare against": an anonymous
   *  reader, a thread never opened, or a write echo from
   *  follow/unfollow/lock/pin/delete/create/update, which do not carry the
   *  read state. `0` is "opened, nothing new since". Only `1..99` is a badge.
   *  Populated on the list, the pinned bucket, `/threads/:slug`, search and
   *  the community pulse lane. */
  unreadReplyCount: number | null;
  /** What the thread IS: one of the four composer kinds, or null for every
   *  thread written before the composer asked. Null is "unclassified", which a
   *  card renders as no chip at all rather than guessing one. */
  kind: string | null;
  /** The author's own warnings about what is inside, rendered in front of the
   *  body. Always an array: the column is NOT NULL DEFAULT '{}', so "none" is
   *  `[]` and no render site has to branch on null. */
  contentWarnings: string[];
  /** Whether the BYLINE above is masked. It leaks nothing — the masking has
   *  already happened by the time this is set — and a moderator sees `true`
   *  alongside the real author, which is the honest pair. */
  isAnonymous: boolean;
  /** A second member credited on the thread, or null for the ordinary
   *  single-author case. Null as well whenever the byline is masked: an
   *  "anonymous" thread co-credited to a named member is not anonymous. */
  coAuthor: AuthorSummary | null;
  /** When the thread became visible, which stops being `createdAt` the moment
   *  the composer can schedule. A future value only ever reaches the author or
   *  a moderator. */
  publishedAt: string;
  /** 'pending' / 'approved' / 'rejected', or null for the threads nobody ever
   *  submitted for review, which is most of them. */
  reviewState: string | null;
  /** Whether the thread is live to the forum RIGHT NOW — the conjunction the
   *  server applies, so the composer's success screen and an author's drafts
   *  view tell the three states apart without re-implementing the gate:
   *  published (`true`), scheduled (`false` + a future `publishedAt`), or
   *  awaiting review (`false` + `reviewState` 'pending'). */
  isPublished: boolean;
  /** A community thread its author also carried out to the town square. */
  crossPosted: boolean;
  /** The part of the city the thread is about, or null for nowhere in
   *  particular. */
  neighbourhood: string | null;
  /** When the thread stops taking new replies, or null when it never does.
   *  Enforced on the write path rather than by a job. */
  closesAt: string | null;
  /** 'pt', 'en' or 'both', or null for "unstated". */
  language: string | null;
  /** Derived: `closesAt` is set and has passed. The author's own deadline and
   *  a moderator's lock (`isLocked`) are different facts, so they stay two
   *  fields and a card can say which of the two closed the thread. */
  isClosed: boolean;
  /** The ballot attached to this thread, or null when it carries none. */
  poll: ForumPollView | null;
  /** The opening post's photos, resolved and ordered, so a card can draw the
   *  gallery without a second request. Reconciles the legacy single `image`
   *  column with the newer photo rows, so a post holding either renders the
   *  same way. EMPTY — never partial — whenever the OP is unshowable: a
   *  tombstone or a takedown blanks the photos exactly as it blanks the
   *  excerpt, because a photo is content. */
  opPhotos: ForumPostPhotoView[];
}

/** One photo on a post, already resolved to a URL the browser can fetch. */
export interface ForumPostPhotoView {
  /** Row id, or null for a legacy `image` presented as a one-photo gallery. */
  id: string | null;
  url: string;
  /** The author's description, or null when they wrote none. Null is honest
   *  and is never to be replaced with an invented string. */
  alt: string | null;
}

/** One answer on a poll, with the caller's own position on it. */
export interface ForumPollOptionView {
  id: string;
  label: string;
  /** The author's display order, 0-based. */
  position: number;
  /**
   * How many members picked this option, or NULL while the results are
   * withheld from this caller (see `ForumPollView.resultsVisible`).
   *
   * NULL IS NOT ZERO. It is the server declining to say, and a bar drawn at 0%
   * from it would tell a member that nobody has answered. A poll nobody has
   * answered reports a real `0` to a caller entitled to the count.
   */
  voteCount: number | null;
  /** Whether THIS caller picked it. Never withheld: it is their own ballot. */
  selected: boolean;
}

/**
 * The poll attached to a thread.
 *
 * The counts are WITHHELD rather than hidden client-side: a poll here can carry
 * answers that are nobody else's business, and a member who can read the tally
 * before answering is being invited to answer with the majority rather than
 * with the truth. They are released once this caller has voted, once the poll
 * has closed, and to a platform moderator. `hasVoted` and each option's
 * `selected` are always truthful, because they are facts about the caller's own
 * ballot rather than anybody else's.
 */
export interface ForumPollView {
  id: string;
  allowMultiple: boolean;
  /** Ordered by `position`. */
  options: ForumPollOptionView[];
  /** Sum of every option's count, or null while results are withheld. On a
   *  multi-choice poll this counts SELECTIONS, not voters. */
  totalVotes: number | null;
  /** When voting shuts, or null when the poll stays open as long as the thread
   *  does. */
  closesAt: string | null;
  /** Derived: `closesAt` is set and has passed. A closed poll still READS. */
  isClosed: boolean;
  /** Whether this caller has cast a ballot. */
  hasVoted: boolean;
  /** Whether the counts above are populated rather than withheld. Branch on
   *  THIS before rendering a number, never on a count being falsy. */
  resultsVisible: boolean;
}

export interface ForumPostResponse extends BaseForumPostResponse {
  /** Resolved URL of the photo attached to this post, or null. Blanked
   *  alongside the body on a tombstoned/removed post. */
  image: string | null;
  /** Is this post its thread's accepted answer? */
  isAccepted: boolean;
  /** Every photo on this post, resolved and ordered. Reconciles the legacy
   *  single `image` field above with the newer photo rows: a post carrying
   *  either renders the same way, and an unshowable post carries none. */
  photos: ForumPostPhotoView[];
  /** Is this the thread's GENUINE opening post (ENG-130)? Read off the post's
   *  own `is_op` column, never inferred from position, and still `true` when
   *  that post is tombstoned or removed by a moderator. The client used to
   *  take `data[0]` as the OP, so on any page whose first item was a reply
   *  that reply was rendered as the question, wearing its author's name and
   *  permissions, and vanished from the reply list. */
  isOp: boolean;
}

// ── Forum DTOs + raw calls ───────────────────────────────────────────────────
// Shapes come from src/shared/contracts/contracts.ts. PAGINATION: cursor-based
// (`Paginated<T>` = { data, pageInfo }) for both the thread list and a thread's
// posts — both are infinite. A thread's opening post is the one the server
// flags `isOp`, never "the first item of the page" (ENG-130): a page can carry
// no OP at all, and `opAvailable` says so.

export type { ForumPostHistoryResponse };

/** Server-supported orderings for the thread list. */
export type ForumSort = "new" | "top" | "active" | "unanswered";

/** Optional list filters/ordering, folded into the query string alongside
 *  `category`/`cursor`. */
export interface GetThreadsOptions {
  sort?: ForumSort;
  tag?: string;
  q?: string;
}

/** GET /forum/threads?category=&cursor=&sort=&tag=&q= — a cursor page of
 *  threads. */
export async function getThreads(
  category?: string,
  cursor?: string,
  opts?: GetThreadsOptions,
) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  if (cursor) params.set("cursor", cursor);
  if (opts?.sort) params.set("sort", opts.sort);
  if (opts?.tag) params.set("tag", opts.tag);
  if (opts?.q) params.set("q", opts.q);
  const qs = params.toString();
  const res = await apiGet<
    ForumThreadResponse[] | Paginated<ForumThreadResponse>
  >(`/forum/threads${qs ? `?${qs}` : ""}`);
  return toPage(res);
}

/** Per-category thread counts plus an `all` total, block-filtered like the
 *  list. Category keys mirror the list's `category` values. */
export interface ForumThreadCounts {
  all: number;
  [category: string]: number;
}

/** Wire shape of `GET /forum/threads/counts` — the per-category counts plus
 *  whether the caller has EVER posted (any thread or reply), kept as a
 *  separate `boolean` field rather than folded into `counts` so it doesn't
 *  have to share a type with the `Record<string, number>` category tally. */
export interface ForumThreadCountsResponse {
  counts: ForumThreadCounts;
  hasPosted: boolean;
}

/** GET /forum/threads/counts?q=&tag= — counts for the sidebar + list header,
 *  plus the truthful "has this member ever posted" signal the first-post
 *  prompt gates on (see `useForumPageState`). Piggybacks on this existing
 *  page-load request rather than costing a dedicated round-trip. */
export async function getThreadCounts(q?: string, tag?: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (tag) params.set("tag", tag);
  const qs = params.toString();
  return apiGet<ForumThreadCountsResponse>(
    `/forum/threads/counts${qs ? `?${qs}` : ""}`,
  );
}

/** GET /forum/threads/:slug — thread meta (title, author, counts). */
export const getThread = (slug: string) =>
  apiGet<ForumThreadResponse>(`/forum/threads/${slug}`);

/**
 * Server-supported orderings for a thread's REPLIES (PRD-162).
 *
 * `oldest` (the default, and what omitting `?sort=` has always meant) reads the
 * conversation top to bottom; `newest` is `created_at DESC`; `top` is
 * `vote_count DESC` with the oldest reply as the tie-break, and is what the
 * reply bar's "Most helpful" button sends. Anything else is a 400.
 */
export type ReplySort = "oldest" | "newest" | "top";

/** The posts envelope, which carries one key beyond `Paginated` (ENG-130). */
export interface ForumPostsPage {
  data: ForumPostResponse[];
  pageInfo: PageInfo;
  /**
   * Can THIS viewer see the thread's opening post at all?
   *
   * Carried on every page, because it describes the thread rather than the
   * page: false when the OP's author is muted or blocked for this viewer, when
   * a moderator hid the post, or when the thread carries no `is_op` post. It is
   * the difference between "the OP has not loaded yet" and "there is no OP here
   * for you", which is the whole reason a reply used to be promoted into the OP
   * card. Absent on an older/array response, which is read as `true`.
   */
  opAvailable: boolean;
}

/**
 * GET /forum/threads/:slug/posts?cursor=&sort= — the opening post plus a page
 * of replies.
 *
 * `limit` counts TOP-LEVEL replies rather than posts: a page carries its roots
 * PLUS every reply nested under them, so `data.length` can exceed the limit and
 * a reply never arrives before its parent. Order is
 * `[OP?] [accepted answer?] [roots in sort order] [descendants in sort order]`
 * and is rendered verbatim — see `buildReplyTree`, which groups but never
 * reorders.
 *
 * Each sort mints its OWN cursor format, and a cursor from one decodes as "no
 * cursor" under another (silently restarting the paging rather than erroring),
 * so `sort` is part of the react-query key in `useThread`: changing it starts a
 * fresh infinite query with no cursor instead of feeding the old one across.
 */
export async function getThreadPosts(
  slug: string,
  cursor?: string,
  sort?: ReplySort,
): Promise<ForumPostsPage> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  if (sort) params.set("sort", sort);
  const qs = params.toString();
  const res = await apiGet<
    | ForumPostResponse[]
    | (Paginated<ForumPostResponse> & { opAvailable?: boolean })
  >(`/forum/threads/${slug}/posts${qs ? `?${qs}` : ""}`);
  const page = toPage(res);
  return {
    ...page,
    // Only an explicit `false` withholds the OP card. A bare-array response (or
    // any envelope without the key) is read as "the OP is fine", so a stale
    // backend never blanks the opening post of every thread.
    opAvailable: Array.isArray(res) ? true : res?.opAvailable !== false,
  };
}

/**
 * POST /forum/threads/:slug/read — stamp the member's read watermark on this
 * thread, which is what clears its unread badge (PRD-170).
 *
 * READING IS NOT FOLLOWING. This is a different route from
 * `POST /forum/threads/:slug/follow` and writes a different field: opening a
 * thread records where the member got to and signs them up for nothing, so
 * `isSubscribed` is untouched. 404s on a thread the viewer could not have read.
 *
 * Call it AFTER rendering: `GET /forum/threads/:slug` deliberately answers with
 * the count from before the stamp, which is what lets the page show a member
 * where they left off on the very visit that clears it.
 */
export const markThreadRead = (slug: string) =>
  apiPost<{ ok: true }>(`/forum/threads/${slug}/read`);

/**
 * `POST /forum/threads` body. Mirrors the backend's own `CreateThreadDto`
 * FIELD FOR FIELD, and that is load-bearing rather than tidy: the API runs
 * under a global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted`,
 * so one key the server has never heard of does not get dropped — it fails
 * the whole request with a 400 and the member loses the publish.
 *
 * `image` and `photos` are two spellings of ONE thing and the server refuses a
 * body carrying both: `image` is the legacy single-photo column that every
 * already-published post still renders from, and `photos` is the gallery the
 * full-page composer writes. Send one or the other, never the pair.
 */
export interface CreateThreadDto {
  title: string;
  body: string;
  category: string;
  /** Optional free-text tags collected by the composer; the backend already
   *  persists them. Up to 5, each ≤ 24 characters. */
  tags?: string[];
  /** Attach the thread to one of the author's communities. Omitted (or
   *  undefined) keeps it a global thread, as before. */
  communitySlug?: string;
  /** Publish under the "QueerPulse Official" byline instead of the caller.
   *  Only an admin's value is actually honored — the backend silently
   *  coerces it to `false` for anyone else. */
  isOfficial?: boolean;
  /** Storage key of ONE photo on the opening post, from the shared presigned
   *  upload pipeline (`useUploadImage`). The legacy spelling: `ThreadComposer`
   *  still writes it, and the full-page composer writes `photos` instead.
   *  Never both. */
  image?: string;
  /** What the thread IS. A closed vocabulary server-side: anything outside the
   *  four values is a 400, and omitting it stores NULL ("unclassified"), which
   *  is a real state rather than a missing one. */
  kind?: "question" | "guide" | "proposal" | "share";
  /** The author's own warnings about what is inside, rendered ahead of the
   *  body. Up to 8, each ≤ 40 characters. */
  contentWarnings?: string[];
  /** Publish without the byline. Honoured only in the categories where
   *  anonymity is the difference between asking and not asking, and always
   *  lost to `isOfficial`; both are silent server-side coercions. */
  isAnonymous?: boolean;
  /** A second member to credit, by HANDLE — the identifier a member can read
   *  off a profile, never an internal id. A handle matching no active member
   *  is a 400, as is the caller's own. */
  coAuthorHandle?: string;
  /** The part of the city the thread is about. Free text, ≤ 60 characters:
   *  neighbourhood names are contested and member-defined, so the server
   *  validates no list. */
  neighbourhood?: string;
  /** Which language the thread is written in. `both` is a real answer for a
   *  post written twice over; the composer's own `auto` is a UI state and is
   *  never sent. */
  language?: "pt" | "en" | "both";
  /** Carry a community's thread out to the town square too. Coerced to false
   *  without a `communitySlug`, since a thread that belongs to no community is
   *  already there. */
  crossPosted?: boolean;
  /** When the thread stops taking replies, ISO-8601. The window (strictly
   *  future, at most a year out) is enforced in the service, not the DTO. */
  closesAt?: string;
  /** Publish later instead of now, ISO-8601. Every member-facing read path
   *  hides the row until that instant arrives. Same window as `closesAt`. */
  publishAt?: string;
  /** Send it to the editors (a guide) or the council (a proposal) first: the
   *  thread is created `reviewState: 'pending'` and stays out of every
   *  member-facing read until somebody approves it. */
  submitForReview?: boolean;
  /** An optional ballot, created in the same transaction as the thread. */
  poll?: CreateThreadPollDto;
  /** Up to four photos on the opening post, in the order the author arranged
   *  them. The ARRAY POSITION is the ordering — there is no `position` field,
   *  because two sources of truth for one ordering is how a gallery ends up
   *  rendering in an order nobody chose. Mutually exclusive with `image`. */
  photos?: CreateThreadPhotoDto[];
}

/** One photo on a new opening post. */
export interface CreateThreadPhotoDto {
  /** Storage key from the presigned upload pipeline. */
  image: string;
  /** The author's description, at most 280 characters (the column's width).
   *  Omitted rather than empty when there is none: a placeholder auto-filled
   *  to satisfy a field is worse for a screen reader than no alt at all. */
  alt?: string;
}

/** One answer on a new poll. Labels must carry a visible character, are at
 *  most 60, and may not repeat once trimmed and case-folded. */
export interface CreateThreadPollOptionDto {
  label: string;
}

/** The optional poll on `POST /forum/threads`. Between 2 and 6 options. */
export interface CreateThreadPollDto {
  options: CreateThreadPollOptionDto[];
  /** False (the default) means a voter picks exactly one. Settable only at
   *  creation: a poll that changed its arity after people had voted would be a
   *  different question asked of the same ballots. */
  allowMultiple?: boolean;
  /** When voting shuts, ISO-8601. Independent of the thread's own `closesAt`:
   *  a thread can keep taking replies after its poll has closed. */
  closesAt?: string;
}

/** POST /forum/threads — the full-page composer at `/forum/new`. */
export const createThread = (dto: CreateThreadDto) =>
  apiPost<ForumThreadResponse>("/forum/threads", dto);

/** POST /forum/threads/:slug/posts — ThreadComposer reply. `parentPostId`
 *  nests the reply under an existing post (nested-replies feature); omitted
 *  (or null) for a top-level reply to the thread. */
export const replyToThread = (
  slug: string,
  body: string,
  parentPostId?: string | null,
  image?: string | null,
) =>
  apiPost<ForumPostResponse>(`/forum/threads/${slug}/posts`, {
    body,
    ...(parentPostId ? { parentPostId } : {}),
    ...(image ? { image } : {}),
  });

/** POST /forum/posts/:id/vote — cast (`value: 1`) or clear (`value: 0`) the
 *  viewer's upvote on a post (idempotent). Returns the post with the updated
 *  `voteCount` + `myVote`. */
export const votePost = (id: string, value: 0 | 1) =>
  apiPost<ForumPostResponse>(`/forum/posts/${id}/vote`, { value });

/** PATCH /forum/posts/:id — author edits a post body, and optionally its
 *  photo. Omitting `image` leaves the existing one; an empty string clears it. */
export const editPost = (id: string, body: string, image?: string) =>
  apiPatch<ForumPostResponse>(`/forum/posts/${id}`, {
    body,
    ...(image !== undefined ? { image } : {}),
  });

/** DELETE /forum/posts/:id — soft tombstone (author or staff). */
export const deletePost = (id: string) =>
  apiDelete<ForumPostResponse>(`/forum/posts/${id}`);

/** POST /forum/posts/:id/restore — clear the tombstone (author or staff). */
export const restorePost = (id: string) =>
  apiPost<ForumPostResponse>(`/forum/posts/${id}/restore`);

/** PATCH /forum/threads/:slug — author edits the thread title. */
export const editThreadTitle = (slug: string, title: string) =>
  apiPatch<ForumThreadResponse>(`/forum/threads/${slug}`, { title });

/** PATCH /forum/threads/:slug, moving the thread to another category (PRD-163).
 *  Accepted from the AUTHOR within the thread's first 24 hours, or from a
 *  moderator at any time; the server is the authority and answers 403 outside
 *  that (`canMoveThreadCategory` keeps the affordance off the row rather than
 *  offering an action that will fail). `category` is free text on the wire
 *  (there is no backend enum), so the ids come from the frontend's own `CATS`
 *  list in `forum.data.ts`. `"all"` is reserved and rejected. */
export const moveThreadCategory = (slug: string, category: string) =>
  apiPatch<ForumThreadResponse>(`/forum/threads/${slug}`, { category });

/** DELETE /forum/threads/:slug, withdrawing a WHOLE thread (soft delete), from
 *  its author or platform staff (PRD-160). Distinct from
 *  `DELETE /forum/posts/:id`, which tombstones one post: that used to be the
 *  only delete the forum had, so deleting your opening post blanked its body
 *  and left the thread, its title and its link standing. Stamps the thread and
 *  tombstones the OP; replies are left alone. Idempotent. */
export const deleteThread = (slug: string) =>
  apiDelete<ForumThreadResponse>(`/forum/threads/${slug}`);

/** PATCH /forum/threads/:slug — replace the thread's tag set. Accepted from
 *  the author OR a moderator (filing a thread is janitorial, unlike the
 *  author-only title edit). An empty array clears every tag. The endpoint has
 *  accepted this field since the forum shipped; nothing ever sent it. */
export const editThreadTags = (slug: string, tags: string[]) =>
  apiPatch<ForumThreadResponse>(`/forum/threads/${slug}`, { tags });

/** POST /forum/threads/:slug/accepted-answer — mark a reply as the thread's
 *  answer, or clear the mark by passing `null`. Thread author or moderator. */
export const setAcceptedAnswer = (slug: string, postId: string | null) =>
  apiPost<ForumThreadResponse>(`/forum/threads/${slug}/accepted-answer`, {
    postId,
  });

/** POST /forum/threads/:slug/follow — start hearing about new replies. */
export const followThread = (slug: string) =>
  apiPost<ForumThreadResponse>(`/forum/threads/${slug}/follow`);

/** POST /forum/threads/:slug/unfollow — stop hearing about new replies. */
export const unfollowThread = (slug: string) =>
  apiPost<ForumThreadResponse>(`/forum/threads/${slug}/unfollow`);

/** POST /forum/threads/:slug/lock — moderator closes the thread to replies,
 *  with an optional note explaining why (shown on the locked banner). Returns
 *  the updated thread. */
export const lockThread = (slug: string, reason?: string) =>
  apiPost<ForumThreadResponse>(`/forum/threads/${slug}/lock`, {
    ...(reason?.trim() ? { reason: reason.trim() } : {}),
  });

/** POST /forum/threads/:slug/unlock — moderator reopens the thread. Returns
 *  the updated thread. */
export const unlockThread = (slug: string) =>
  apiPost<ForumThreadResponse>(`/forum/threads/${slug}/unlock`);

/** POST /forum/threads/:slug/pin — moderator pins the thread to the sticky
 *  bucket above the list. Returns the updated thread. */
export const pinThread = (slug: string) =>
  apiPost<ForumThreadResponse>(`/forum/threads/${slug}/pin`);

/** POST /forum/threads/:slug/unpin — moderator unpins the thread. Returns the
 *  updated thread. */
export const unpinThread = (slug: string) =>
  apiPost<ForumThreadResponse>(`/forum/threads/${slug}/unpin`);

/** PATCH /admin/forum/threads/:slug/official — admin-only, toggles a
 *  published thread between its real author and "QueerPulse Official".
 *  Returns the updated thread. */
export const setThreadOfficial = (slug: string, isOfficial: boolean) =>
  apiPatch<ForumThreadResponse>(`/admin/forum/threads/${slug}/official`, {
    isOfficial,
  });

/** GET /forum/threads/pinned?category= — the small, unpaginated sticky bucket
 *  rendered above the thread list. Most-recently-pinned first. */
export function getPinnedThreads(category?: string) {
  const params = new URLSearchParams();
  if (category && category !== "all") params.set("category", category);
  const qs = params.toString();
  return apiGet<ForumThreadResponse[]>(
    `/forum/threads/pinned${qs ? `?${qs}` : ""}`,
  );
}

// The backend serializes each revision's editor as `editor` (see
// queerpulse-backend's ForumPostHistoryEntry), but the FE contract names the
// same field `author` (matching ForumThreadResponse/ForumPostResponse). This
// raw type mirrors the wire shape so the mapping below type-checks without
// touching the backend or the FE contract.
interface RawForumPostHistoryEntry {
  id: string;
  previousBody: string;
  previousTitle: string | null;
  editor: AuthorSummary;
  createdAt: string;
}

interface RawForumPostHistoryResponse {
  revisions: RawForumPostHistoryEntry[];
}

/** GET /forum/posts/:id/history — edit revisions (author or staff). Maps the
 *  backend's `editor` field to the FE contract's `author`. */
export async function getPostHistory(
  id: string,
): Promise<ForumPostHistoryResponse> {
  const raw = await apiGet<RawForumPostHistoryResponse>(
    `/forum/posts/${id}/history`,
  );
  return {
    revisions: raw.revisions.map((revision) => ({
      id: revision.id,
      previousBody: revision.previousBody,
      previousTitle: revision.previousTitle,
      author: revision.editor,
      createdAt: revision.createdAt,
    })),
  };
}

/**
 * POST /forum/threads/:slug/poll/vote — cast a ballot on the thread's poll.
 *
 * A BALLOT, not a toggle: `optionIds` is the caller's COMPLETE selection and
 * replaces whatever they had picked before, so sending the same array twice
 * changes nothing and re-voting on a single-choice poll simply moves the
 * answer. One id for a single-choice poll, one to six for a multi-choice one.
 *
 * Answers with the poll, and the counts are RELEASED in that answer because
 * the caller has now voted — which is the moment most members first see a
 * tally at all (see `ForumPollView.resultsVisible`). A closed poll answers 403
 * and keeps reading fine.
 */
export const votePoll = (slug: string, optionIds: string[]) =>
  apiPost<ForumPollView>(`/forum/threads/${slug}/poll/vote`, { optionIds });
