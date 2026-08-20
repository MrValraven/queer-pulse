import { tintForSlug, type SlugTint } from "../../../shared/api/refs";
import { initialsFromName } from "../../../shared/lib/initials";
import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import type { Reply, Thread } from "../forum.data";
import type { ForumPostResponse, ForumThreadResponse } from "./forum.api";

// Map the backend DTOs onto the EXISTING rich `Thread`/`Reply` view-models
// (../forum.data.ts) so ForumThreadList / ThreadPage render unchanged. Author
// colours (t/tt, bg/color) and initials are synthesized from the member handle
// via the shared `tintForSlug`, matching the mock palette.

// The Thread view-model keys on a numeric id (routing + vote sets). Backend
// threads are keyed by slug, so we map each backend slug to a stable numeric id
// and remember the reverse so ThreadPage (which only sees the numeric route
// param) can resolve the slug to fetch detail/posts. Populated as threads list.
const slugById = new Map<number, string>();

/** Stable non-negative 31-bit hash of a string → the view-model's numeric id. */
function numericId(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % 2_000_000_000;
}

/** Resolve a numeric thread id back to its backend slug (list must run first). */
export function slugForThreadId(id: number): string | undefined {
  return slugById.get(id);
}

const SOLID: Record<SlugTint, { background: string; color: string }> = {
  coral: { background: "var(--accent)", color: "var(--paper)" },
  jade: { background: "var(--jade)", color: "var(--paper)" },
  plum: { background: "var(--plum)", color: "var(--cream)" },
};
const SOFT: Record<SlugTint, { background: string; color: string }> = {
  coral: { background: "rgba(232,119,90,.14)", color: "var(--accent-ink)" },
  jade: { background: "rgba(74,140,111,.15)", color: "var(--jade)" },
  plum: { background: "rgba(45,27,61,.1)", color: "var(--plum)" },
};

function relative(iso: string, t: TFunction, fmt: Formatters): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const mins = Math.max(0, Math.floor((Date.now() - d.getTime()) / 60000));
  if (mins < 1) return t("forum:time.justNow");
  if (mins < 60) return fmt.relativeTime(-mins, "minute");
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return fmt.relativeTime(-hrs, "hour");
  const days = Math.floor(hrs / 24);
  if (days < 30) return fmt.relativeTime(-days, "day");
  return fmt.date(d, { day: "numeric", month: "short" });
}

/** Split a raw post body into the paragraph array the view-models render. */
function paragraphs(body: string): string[] {
  return body
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean);
}

/** ForumThreadResponse → the `Thread` list card (body/replies filled later). */
export function threadToCard(
  dto: ForumThreadResponse,
  t: TFunction,
  fmt: Formatters,
): Thread {
  const id = numericId(dto.slug);
  slugById.set(id, dto.slug);
  const slug = dto.author.handle;
  const tint = tintForSlug(slug);
  const s = SOLID[tint];
  return {
    id,
    slug: dto.slug,
    category: dto.category,
    pinned: dto.isPinned,
    title: dto.title,
    excerpt: "",
    author: {
      initials: initialsFromName(dto.author.displayName),
      name: dto.author.displayName,
      background: s.background,
      color: s.color,
      slug,
      photo: dto.author.avatarUrl ?? undefined,
      official: dto.author.official,
    },
    posted: relative(dto.lastActivityAt, t, fmt),
    views: 0,
    // The card's upvote count is the OP post's vote count (denormalized onto the
    // thread DTO), NOT a hardcoded 0 — this is what the list-row upvote button
    // reads and mutates via `opPostId`.
    upvotes: dto.opVoteCount,
    comments: dto.replyCount,
    tags: dto.tags ?? [],
    body: [],
    replies: [],
    // Row-moderation permissions (denormalized onto the thread DTO) so the list
    // row can render its ⋯ menu without fetching the OP post. `canLock` is the
    // thread-level moderator permission (close / reopen replies).
    canEdit: dto.canEdit,
    canDelete: dto.canDelete,
    canRestore: dto.canRestore,
    canViewHistory: dto.canViewHistory,
    canLock: dto.canLock,
    canPin: dto.canPin,
    // OP-vote wiring: the list-row upvote acts on the OP post (`opPostId`) and
    // reflects the viewer's own vote (`myVote`); `isLocked` gates the composer.
    opPostId: dto.opPostId,
    isLocked: dto.isLocked,
    lockReason: dto.lockReason,
    myVote: dto.myVote,
  };
}

/** ForumPostResponse → a `Reply` (used for the OP body too). */
export function postToReply(
  dto: ForumPostResponse,
  t: TFunction,
  fmt: Formatters,
  isOP = false,
): Reply {
  const slug = dto.author.handle;
  const tint = tintForSlug(slug);
  const soft = SOFT[tint];
  return {
    id: dto.id,
    parentPostId: dto.parentPostId ?? null,
    avatar: initialsFromName(dto.author.displayName),
    background: soft.background,
    color: soft.color,
    name: dto.author.displayName,
    slug,
    photo: dto.author.avatarUrl ?? undefined,
    time: relative(dto.createdAt, t, fmt),
    isOP,
    body: paragraphs(dto.body),
    reactions: dto.voteCount,
    myVote: dto.myVote,
    postId: dto.id,
    editedAt: dto.editedAt,
    deleted: dto.deleted,
    removedByModerator: dto.moderationRemoved ?? false,
    canEdit: dto.canEdit,
    canDelete: dto.canDelete,
    canRestore: dto.canRestore,
    canViewHistory: dto.canViewHistory,
  };
}

/**
 * Flags the reply/replies with the highest NON-ZERO `reactions` (net vote
 * count) as `helpful`, ties included. Backs live "Most helpful" (see
 * `threadDetail`'s call site for the full rationale) — computed once over the
 * currently-loaded page of replies, so it recomputes as more pages load.
 */
function markMostHelpful(replies: Reply[]): Reply[] {
  const maxReactions = replies.reduce(
    (max, reply) => Math.max(max, reply.reactions),
    0,
  );
  if (maxReactions === 0) return replies;
  return replies.map((reply) =>
    reply.reactions === maxReactions ? { ...reply, helpful: true } : reply,
  );
}

/** Combine thread meta + its posts page into the full `Thread` detail. */
export function threadDetail(
  dto: ForumThreadResponse,
  posts: ForumPostResponse[],
  t: TFunction,
  fmt: Formatters,
): Thread {
  const card = threadToCard(dto, t, fmt);
  const [op, ...rest] = posts;
  const mappedReplies = rest.map((post) =>
    postToReply(post, t, fmt, post.author.handle === op?.author.handle),
  );
  return {
    ...card,
    excerpt: op ? (paragraphs(op.body)[0] ?? "") : "",
    body: op ? paragraphs(op.body) : [],
    // OP fields come from the fetched OP post itself here (not the card's
    // denormalized copy), so the thread page's upvote button reads the live
    // count + the viewer's own vote and stays consistent with `useVotePost`.
    upvotes: op?.voteCount ?? card.upvotes,
    myVote: op?.myVote ?? card.myVote,
    // "Most helpful" (see REPLY_SORTS/buildReplyTree) has no dedicated backend
    // concept — it's wired here to the real vote signal already on every post
    // (`forum_post_vote`, exposed as `reactions`/`voteCount`): the reply/replies
    // with the page's highest NON-ZERO vote count are flagged `helpful`, which
    // both drives buildReplyTree's sort (its `helpful` tiebreak now has a real
    // live signal, not just demo-curated data) and lights the "Most helpful"
    // badge (ThreadReplyItem). A thread with no votes yet flags nothing — zero
    // votes isn't a helpfulness signal.
    replies: markMostHelpful(mappedReplies),
    opPostId: op?.id ?? card.opPostId,
    editedAt: op?.editedAt ?? null,
    deleted: op?.deleted ?? false,
    removedByModerator: op?.moderationRemoved ?? false,
    // Post-level permissions come from the fetched OP post itself. `canLock` is
    // thread-level and is NOT overridden here — it flows through from the `card`
    // spread above (the thread DTO), which is where the lock permission lives.
    canEdit: op?.canEdit ?? false,
    canDelete: op?.canDelete ?? false,
    canRestore: op?.canRestore ?? false,
    canViewHistory: op?.canViewHistory ?? false,
  };
}
