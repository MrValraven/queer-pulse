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
// threads are keyed by slug, so we map each backend slug to a stable numeric
// id. The REVERSE lookup used to live here as a module-level registry populated
// as a render side effect; every write path now carries `thread.slug` on the
// view-model instead (see `useEditThreadTitle`), so nothing renders-to-write
// any more.

/** Stable non-negative 31-bit hash of a string → the view-model's numeric id. */
function numericId(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % 2_000_000_000;
}

const SOLID: Record<SlugTint, { background: string; color: string }> = {
  coral: { background: "var(--accent)", color: "var(--paper)" },
  jade: { background: "var(--jade)", color: "var(--paper)" },
  plum: { background: "var(--plum)", color: "rgb(var(--cream-rgb))" },
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

/**
 * Peels a quote-reply's leading blockquote off its body.
 *
 * Quote-reply used to exist only as curated demo data: the `Reply.quote` field
 * was rendered but nothing could ever produce one live. The live affordance
 * (SOC-13) writes the quoted passage as `>`-prefixed leading lines of an
 * ORDINARY reply body, so it needs no column, no DTO field and no migration —
 * and a member who types `>` by hand gets the same rendering, which is the
 * convention every forum they have used already behaves this way.
 *
 * Only a run of blockquote lines at the very START counts. A `>` further down
 * is left in the prose, so an unrelated line beginning with a chevron is never
 * hoisted into a quote box.
 */
function splitLeadingQuote(body: string): { quoted: string; rest: string } {
  const lines = body.split("\n");
  let index = 0;
  const quotedLines: string[] = [];
  while (index < lines.length && lines[index]!.startsWith(">")) {
    quotedLines.push(lines[index]!.replace(/^>\s?/, ""));
    index += 1;
  }
  if (!quotedLines.length) return { quoted: "", rest: body };
  return {
    quoted: quotedLines.join("\n").trim(),
    rest: lines.slice(index).join("\n"),
  };
}

/** ForumThreadResponse → the `Thread` list card (body/replies filled later). */
export function threadToCard(
  dto: ForumThreadResponse,
  t: TFunction,
  fmt: Formatters,
): Thread {
  const id = numericId(dto.slug);
  const slug = dto.author.handle;
  const tint = tintForSlug(slug);
  const s = SOLID[tint];
  return {
    id,
    slug: dto.slug,
    category: dto.category,
    pinned: dto.isPinned,
    title: dto.title,
    // PRD-167: the list DTO now carries a short, HTML-stripped taste of the
    // opening post; this used to be hardcoded `""`, so no forum row (and no
    // feed forum card) ever showed a word of the body. Null is the server's
    // "there is nothing showable here" (no OP, an author tombstone, or a
    // moderator takedown) and collapses to the empty string the row already
    // treats as "render nothing". Never a placeholder.
    excerpt: dto.excerpt ?? "",
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
    // Kept RAW (not the relative string above): the author's 24-hour
    // category-move window is measured against it (PRD-163).
    createdAt: dto.createdAt,
    // Only ever true for a platform moderator: every member-facing read path
    // filters withdrawn threads out entirely (PRD-160).
    isDeleted: dto.isDeleted ?? false,
    // `views` is deliberately ABSENT: `ForumThreadResponse` carries no view
    // count, and hardcoding 0 printed "0 views" under every live thread as if
    // nobody had ever opened it. Undefined hides the stat instead.
    views: undefined,
    // The card's upvote count is the OP post's vote count (denormalized onto the
    // thread DTO), NOT a hardcoded 0 — this is what the list-row upvote button
    // reads and mutates via `opPostId`.
    upvotes: dto.opVoteCount,
    comments: dto.replyCount,
    tags: dto.tags ?? [],
    body: [],
    replies: [],
    // PRD-170: replies posted since this member last opened the thread, capped
    // at 99 by the server. `null` (no watermark: anonymous, never opened, or a
    // write echo) and `0` (caught up) both mean "no badge" — see
    // `ForumThreadRow`, which is the only place that reads it.
    unreadReplyCount: dto.unreadReplyCount ?? null,
    // SOC-13 — following, the accepted answer, and the two permissions that
    // gate the Follow / Accept / tag-edit affordances.
    isSubscribed: dto.isSubscribed ?? false,
    acceptedPostId: dto.acceptedPostId ?? null,
    canAcceptAnswer: dto.canAcceptAnswer ?? false,
    canEditTags: dto.canEditTags ?? false,
    // Row-moderation permissions (denormalized onto the thread DTO) so the list
    // row can render its ⋯ menu without fetching the OP post. `canLock` is the
    // thread-level moderator permission (close / reopen replies).
    canEdit: dto.canEdit,
    // The same DTO flag under a name `threadDetail` does NOT overwrite.
    // `canEdit` on the merged thread detail is replaced by the OPENING POST's
    // permission (that is what `deriveOpView` reads), and the two are different
    // rights that happen to share a word: the post one goes false the moment
    // that post is tombstoned, while the author's right to withdraw or refile
    // their own THREAD does not. The thread-level gates read this one.
    canEditTitle: dto.canEdit,
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

/** ForumPostResponse → a `Reply` (used for the OP body too). `quoteCite` is
 *  the display name of the post this one quotes, resolved by `threadDetail`
 *  from the parent post already in the loaded page. */
export function postToReply(
  dto: ForumPostResponse,
  t: TFunction,
  fmt: Formatters,
  isOP = false,
  quoteCite?: string,
): Reply {
  const slug = dto.author.handle;
  const tint = tintForSlug(slug);
  const soft = SOFT[tint];
  const { quoted, rest } = splitLeadingQuote(dto.body);
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
    ...(quoted ? { quote: { cite: quoteCite, text: quoted } } : {}),
    body: paragraphs(rest),
    image: dto.image ?? undefined,
    // The server's own answer mark, not a client-side guess (SOC-13).
    accepted: dto.isAccepted ?? false,
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
 * Combine thread meta + its loaded posts into the full `Thread` detail.
 *
 * ENG-130: the opening post is the post the SERVER flags `isOp`, found by
 * search. It used to be `data[0]`, which is only the OP on a first page that
 * actually carries one. Whenever it did not — the OP filtered out for this
 * viewer, or any page after the first — the first REPLY was promoted into the
 * OP card and read as the question, wearing that replier's name, edit mark and
 * permissions, while disappearing from the reply list underneath.
 *
 * `isOpAvailable` is the server's `opAvailable`, carried on every page: `false`
 * is "there is no opening post here for you", which the OP card states plainly
 * rather than guessing at a reason, and every post that DID come back is
 * rendered as a reply.
 */
export function threadDetail(
  dto: ForumThreadResponse,
  posts: ForumPostResponse[],
  t: TFunction,
  fmt: Formatters,
  isOpAvailable?: boolean,
): Thread {
  const card = threadToCard(dto, t, fmt);
  // Explicit `false` only: undefined is "the page has not resolved yet", which
  // must not read as a missing opening post.
  const op =
    isOpAvailable === false ? undefined : posts.find((post) => post.isOp);
  const rest = op ? posts.filter((post) => post.id !== op.id) : posts;
  // Display name per loaded post id, so a quote-reply can be attributed to the
  // post it quotes without a second request.
  const authorNameByPostId = new Map(
    posts.map((post) => [post.id, post.author.displayName]),
  );
  // Who counts as "OP" on a reply badge. Falls back to the THREAD's author when
  // the opening post itself is unavailable, so the marker survives a page that
  // carries no OP instead of silently going missing from every reply.
  const opAuthorHandle = op?.author.handle ?? dto.author.handle;
  const mappedReplies = rest.map((post) =>
    postToReply(
      post,
      t,
      fmt,
      post.author.handle === opAuthorHandle,
      post.parentPostId ? authorNameByPostId.get(post.parentPostId) : undefined,
    ),
  );
  return {
    ...card,
    isOpAvailable,
    excerpt: op ? (paragraphs(op.body)[0] ?? "") : "",
    body: op ? paragraphs(op.body) : [],
    // OP fields come from the fetched OP post itself here (not the card's
    // denormalized copy), so the thread page's upvote button reads the live
    // count + the viewer's own vote and stays consistent with `useVotePost`.
    upvotes: op?.voteCount ?? card.upvotes,
    myVote: op?.myVote ?? card.myVote,
    // No client-side "most helpful" pass any more (SOC-13/PRD-162). Ranking the
    // replies that happened to have loaded moved the badge as you paged, and it
    // was a guess dressed as an answer. The server now hoists the thread's
    // ACCEPTED answer to the top of the first page and flags it (`isAccepted` →
    // `Reply.accepted`), which is a real, author-given signal, and it applies
    // the reply ORDER the member asked for across the whole thread rather than
    // across one page. The order here is the server's order, verbatim.
    replies: mappedReplies,
    opPostId: op?.id ?? card.opPostId,
    opImage: op?.image ?? undefined,
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
