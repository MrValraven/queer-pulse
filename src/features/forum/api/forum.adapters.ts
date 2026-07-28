import { tintForSlug, type SlugTint } from "../../../shared/api/refs";
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

function initials(name: string): string {
  const p = name.trim().split(/\s+/);
  return `${p[0]?.[0] ?? ""}${p.length > 1 ? (p.at(-1)?.[0] ?? "") : ""}`.toUpperCase();
}

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
      initials: initials(dto.author.displayName),
      name: dto.author.displayName,
      background: s.background,
      color: s.color,
      slug,
      photo: dto.author.avatarUrl ?? undefined,
    },
    posted: relative(dto.lastActivityAt, t, fmt),
    views: 0,
    upvotes: 0,
    comments: dto.replyCount,
    tags: [],
    body: [],
    replies: [],
    canEdit: dto.canEdit,
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
    avatar: initials(dto.author.displayName),
    background: soft.background,
    color: soft.color,
    name: dto.author.displayName,
    slug,
    photo: dto.author.avatarUrl ?? undefined,
    time: relative(dto.createdAt, t, fmt),
    isOP,
    body: paragraphs(dto.body),
    reactions: dto.voteCount,
    postId: dto.id,
    editedAt: dto.editedAt,
    deleted: dto.deleted,
    canEdit: dto.canEdit,
    canDelete: dto.canDelete,
    canRestore: dto.canRestore,
    canViewHistory: dto.canViewHistory,
  };
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
  return {
    ...card,
    excerpt: op ? (paragraphs(op.body)[0] ?? "") : "",
    body: op ? paragraphs(op.body) : [],
    upvotes: op?.voteCount ?? 0,
    replies: rest.map((post) => postToReply(post, t, fmt)),
    opPostId: op?.id,
    editedAt: op?.editedAt ?? null,
    deleted: op?.deleted ?? false,
    canEdit: op?.canEdit ?? false,
    canDelete: op?.canDelete ?? false,
    canRestore: op?.canRestore ?? false,
    canViewHistory: op?.canViewHistory ?? false,
  };
}
