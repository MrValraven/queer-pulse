import { type Thread } from "./forum.data";
import { type ForumSort } from "./api/forum.api";
// DEMO-ONLY persona — read ONLY inside the `demoMode` branch of `canEditThread`
// below; the live branch must use solely the DTO's `thread.canEdit` flag.
import { currentUser } from "../members/data/members";

export const FORUM_SORTS: readonly ForumSort[] = [
  "new",
  "top",
  "active",
  "unanswered",
];

/** The forum's landing order, and the value `setSort` strips from the URL so
 *  the default round-trips (never `?sort=active`). It matches the SERVER's own
 *  default: both ends now agree on what an un-parameterised list means.
 *  PRD-161: this was `top`, which on a forum where almost every thread has
 *  zero votes produced a fixed order that no amount of new posting disturbed. */
export const DEFAULT_FORUM_SORT: ForumSort = "active";

/** Narrows a raw `?sort=` URL param to a known `ForumSort`, so a malformed or
 *  stale link (or hand-edited URL) falls back to the default rather than
 *  passing garbage through to `useThreads`/the server. */
export function isForumSort(value: string | null): value is ForumSort {
  return !!value && (FORUM_SORTS as readonly string[]).includes(value);
}

// Gate for the row's ⋯ moderation menu (kept named `canEditThread` so the list
// prop contract — ForumThreadList → ForumThreadRow — is unchanged).
// Live: show the menu when the viewer can do ANY row action — edit (author),
// OR delete / restore / view-history (moderator who isn't the author).
// Narrowing this to `canEdit` alone hid the menu for moderators, so
// delete/restore/history never rendered.
// Demo: the persona owns threads it authored (the optimistic card's `isMine`
// flag, or its slug); currentUser is only touched inside this demoMode
// branch. `isMine` replaced a `name === "You"` comparison, which stopped
// matching the moment the card's byline was translated.
export function canEditThread(thread: Thread, demoMode: boolean): boolean {
  return demoMode
    ? thread.author.slug === currentUser.slug || !!thread.author.isMine
    : !!thread.canEdit ||
        !!thread.canDelete ||
        !!thread.canRestore ||
        !!thread.canViewHistory ||
        !!thread.canPin;
}

/**
 * Twenty-four hours, in milliseconds: the window an AUTHOR has to refile their
 * own thread. Mirrors `CATEGORY_MOVE_WINDOW_MS` in the backend's
 * `forum-threads.service.ts`, which is the only authority. This copy exists so
 * the row never offers a member an action the server is about to 403.
 */
const CATEGORY_MOVE_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * May the viewer move this thread to another category (PRD-163)?
 *
 * There is no server flag for it, so this reproduces the backend's rule from
 * what the thread DTO does carry:
 *  - a moderator may move any thread at any time. `canPin` is the DTO's plain
 *    `viewer.isModerator` mirror (so is `canLock`), which is exactly the
 *    permission the move endpoint checks.
 *  - the author may move their own thread inside its first 24 hours. `canEdit`
 *    is the author-only title permission, so it is the author signal; the
 *    window is measured against the thread's own `createdAt`.
 *
 * Demo threads carry neither `createdAt` nor the permission flags, so this
 * returns false there and the affordance simply does not render. No demo
 * constant is read on the live path or the demo one.
 */
export function canMoveThreadCategory(thread: Thread): boolean {
  if (thread.isDeleted) return false;
  if (thread.canPin || thread.canLock) return true;
  // `canEditTitle` is the THREAD's author flag. On a list card it is the same
  // value as `canEdit`; on a thread DETAIL view-model `canEdit` has been
  // replaced by the opening POST's permission, which is a different right (see
  // `Thread.canEditTitle`), so reading `canEdit` alone hid the affordance from
  // the author of a thread whose opening post was tombstoned.
  const isAuthor = thread.canEditTitle ?? thread.canEdit;
  if (!isAuthor || !thread.createdAt) return false;
  const createdAtMs = new Date(thread.createdAt).getTime();
  if (Number.isNaN(createdAtMs)) return false;
  return Date.now() - createdAtMs <= CATEGORY_MOVE_WINDOW_MS;
}

/**
 * May the viewer withdraw this whole thread (PRD-160)?
 *
 * `DELETE /forum/threads/:slug` accepts the thread's AUTHOR or a platform
 * moderator. `canDelete` on the DTO is the narrower opening-POST permission
 * (and goes false once that post is tombstoned), so it is not the right gate:
 * author (`canEdit`) or moderator (`canPin`/`canLock`) is.
 */
export function canDeleteThread(thread: Thread): boolean {
  if (!thread.slug || thread.isDeleted) return false;
  // See `canMoveThreadCategory` on why the author signal is `canEditTitle`
  // with `canEdit` only as the fallback.
  const isAuthor = thread.canEditTitle ?? thread.canEdit;
  return !!isAuthor || !!thread.canPin || !!thread.canLock;
}

/** Dedupe the local optimistic copy against the refetched server list by
 *  SERVER SLUG (stamped once the create mutation resolves) — never
 *  `category::title`, which collided as soon as two drafts shared a title and
 *  is what left the just-posted card linking to a dead route. Demo never
 *  refetches, so its optimistic posts (no slug) are always kept as the record. */
export function mergeOptimisticThreads(
  extraThreads: Thread[],
  serverThreads: Thread[],
): Thread[] {
  const serverSlugs = new Set(
    serverThreads
      .map((thread) => thread.slug)
      .filter((slug): slug is string => Boolean(slug)),
  );
  const optimistic = extraThreads.filter(
    (thread) => !(thread.slug && serverSlugs.has(thread.slug)),
  );
  return [...optimistic, ...serverThreads];
}

/** Filters then sorts the visible thread list. Live: the server already
 *  applied category + tag + q + sort; render as-is (optimistic posts first).
 *  Demo: no server, so filter + sort the mock here. */
export function filterAndSortThreads(
  visible: Thread[],
  {
    demoMode,
    cat,
    tag,
    q,
    sort,
  }: {
    demoMode: boolean;
    cat: string;
    tag: string | undefined;
    q: string;
    sort: ForumSort;
  },
): Thread[] {
  if (!demoMode) return visible;
  let list = visible.filter(
    (thread) => cat === "all" || thread.category === cat,
  );
  if (tag) list = list.filter((thread) => thread.tags.includes(tag));
  if (q) {
    const needle = q.toLowerCase();
    list = list.filter((thread) => thread.title.toLowerCase().includes(needle));
  }
  if (sort === "new") return [...list].sort((a, b) => b.id - a.id);
  if (sort === "unanswered")
    return list
      .filter((thread) => thread.comments === 0)
      .sort((a, b) => b.id - a.id);
  // Demo mock carries no `lastActivityAt`; approximate recent activity by
  // reply volume so "Active" reads distinctly from "New"/"Top".
  if (sort === "active")
    return [...list].sort((a, b) => b.comments - a.comments || b.id - a.id);
  return [...list].sort(
    (a, b) =>
      (b.pinned ? 1000 : 0) + b.upvotes - ((a.pinned ? 1000 : 0) + a.upvotes),
  );
}
