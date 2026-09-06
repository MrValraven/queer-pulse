import { type Reply, type ReplySortId } from "./forum.data";

export interface ReplyNode {
  reply: Reply;
  depth: number;
  children: ReplyNode[];
}

/**
 * Assemble a flat reply list into the nested tree the thread page renders.
 *
 * THERE IS NO SORT HERE, deliberately (PRD-162). This used to re-order the
 * replies it was handed: "Newest" reversed them and "Most helpful" ranked them
 * on a demo-only `helpful` flag with a like-count fallback. Replies arrive in
 * pages, so on a sixty-reply thread "Newest" reversed the twenty OLDEST replies
 * and labelled them the newest — a sort that only sorts the current page is not
 * a sort. The ordering is now the server's `ORDER BY`
 * (`?sort=oldest|newest|top`), applied across the whole thread and at every
 * depth, and this function preserves it exactly: the sibling bucket under each
 * parent keeps the array order it arrived in, because `push` is stable.
 *
 * Demo mode has no server; `sortDemoReplies` below orders the mock BEFORE it
 * gets here, so nothing on the live path ever re-sorts.
 */
export function buildReplyTree(replies: Reply[]): ReplyNode[] {
  const childrenByParent = new Map<string, Reply[]>();
  const ids = new Set(replies.map((reply) => reply.id));
  for (const reply of replies) {
    // Orphans (parent not in the loaded set) fall back to the root. This is
    // what keeps a top-level reply at the top level: it is parented to the OP
    // POST, whose id is never in the replies array.
    const parentKey =
      reply.parentPostId && ids.has(reply.parentPostId)
        ? reply.parentPostId
        : "__root__";
    const bucket = childrenByParent.get(parentKey) ?? [];
    bucket.push(reply);
    childrenByParent.set(parentKey, bucket);
  }
  // `visited` is the set of reply ids on the CURRENT recursion path (root to
  // this node), not the whole tree — a fresh, path-scoped copy is threaded
  // into each branch below, so it only ever blocks a reply from becoming its
  // own ancestor (a cycle). It never drops a legitimate sibling or a reply
  // that reappears in an unrelated branch. Defense-in-depth: ids are unique
  // by construction today, but this util consumes API data with no
  // validation, and an unbounded cycle here is an unbounded recursive
  // render — a stack overflow — so the guard costs one Set per depth level
  // to make that structurally impossible.
  const build = (
    parentKey: string,
    depth: number,
    visited: Set<string>,
  ): ReplyNode[] =>
    (childrenByParent.get(parentKey) ?? [])
      .filter((reply) => !visited.has(reply.id)) // break cycles / duplicate-id loops
      .map((reply) => ({
        reply,
        depth,
        children: build(reply.id, depth + 1, new Set(visited).add(reply.id)),
      }));
  return build("__root__", 0, new Set());
}

/**
 * DEMO ONLY. The reply order for the prototype, which has no backend to ask.
 *
 * Called on the FLAT list before `buildReplyTree`, which groups without
 * reordering, so ordering the array once orders every sibling bucket at every
 * depth. Live mode never calls this: the server's ORDER BY is the truth there,
 * and re-sorting its page on the client is the bug PRD-162 describes.
 *
 * `helpful` is the mock's own curated flag; it exists nowhere in live data,
 * which is exactly why it may only be read from here.
 */
export function sortDemoReplies(replies: Reply[], sort: ReplySortId): Reply[] {
  if (sort === "newest") return [...replies].reverse();
  if (sort === "top")
    return [...replies].sort(
      (first, second) =>
        Number(second.helpful ?? 0) - Number(first.helpful ?? 0) ||
        second.reactions - first.reactions,
    );
  return replies; // "oldest" = as-authored (chronological)
}

export function countDescendants(node: ReplyNode): number {
  return node.children.reduce(
    (total, child) => total + 1 + countDescendants(child),
    0,
  );
}
