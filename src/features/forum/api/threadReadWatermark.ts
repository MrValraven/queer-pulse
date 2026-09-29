import type { ForumPostResponse, ReplySort } from "./forum.api";

export interface ThreadReadWatermarkInput {
  /** Every post loaded so far, across all pages, in the server's order. */
  posts: ForumPostResponse[];
  /** The reply ordering the pages were fetched under. */
  sort: ReplySort;
  /** Whether the server still holds further pages of this thread. */
  hasNextPage: boolean;
}

/**
 * How far the member has actually read, as a post `createdAt` to send with the
 * read stamp (PRD-409).
 *
 * Stamping "now" on open marked every reply read, including the pages the
 * member never loaded. This answers with the newest moment the loaded posts
 * genuinely cover:
 *
 * - `undefined` while nothing has loaded yet;
 * - every page loaded: the newest `createdAt` among the loaded posts;
 * - `oldest` with more pages: the `createdAt` of the last loaded top-level
 *   reply (unparented, or parented to the opening post), since everything
 *   older than it is on screen;
 * - `newest` or `top` with more pages: `null`. Those orders leave gaps in time
 *   below the loaded pages, so no single moment is honest and the page skips
 *   the stamp until the rest loads.
 */
export function threadReadUpTo({
  posts,
  sort,
  hasNextPage,
}: ThreadReadWatermarkInput): string | undefined | null {
  if (posts.length === 0) return undefined;
  if (!hasNextPage) return newestCreatedAt(posts);
  if (sort !== "oldest") return null;
  // The server pages a reply to the opening post as a top-level reply too, so
  // a post parented to the OP counts as a root alongside the unparented ones.
  const openingPostId = posts.find((post) => post.isOp)?.id;
  const loadedRoots = posts.filter(
    (post) =>
      !post.isOp && (!post.parentPostId || post.parentPostId === openingPostId),
  );
  const lastLoadedRoot = loadedRoots.at(-1);
  return lastLoadedRoot ? lastLoadedRoot.createdAt : null;
}

function newestCreatedAt(posts: ForumPostResponse[]): string {
  return posts.reduce((newest, post) =>
    Date.parse(post.createdAt) > Date.parse(newest.createdAt) ? post : newest,
  ).createdAt;
}
