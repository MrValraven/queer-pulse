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
