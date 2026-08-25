import { type Reply, type ReplySortId } from "./forum.data";

export interface ReplyNode {
  reply: Reply;
  depth: number;
  children: ReplyNode[];
}

function sortReplies(replies: Reply[], sort: ReplySortId): Reply[] {
  if (sort === "newest") return [...replies].reverse();
  if (sort === "mostHelpful")
    return [...replies].sort(
      (first, second) =>
        Number(second.helpful ?? 0) - Number(first.helpful ?? 0) ||
        second.reactions - first.reactions,
    );
  return replies; // "oldest" = as-fetched (chronological)
}

export function buildReplyTree(
  replies: Reply[],
  sort: ReplySortId,
): ReplyNode[] {
  const childrenByParent = new Map<string, Reply[]>();
  const ids = new Set(replies.map((reply) => reply.id));
  for (const reply of replies) {
    // Orphans (parent not in the loaded set) fall back to the root.
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
    sortReplies(childrenByParent.get(parentKey) ?? [], sort)
      .filter((reply) => !visited.has(reply.id)) // break cycles / duplicate-id loops
      .map((reply) => ({
        reply,
        depth,
        children: build(reply.id, depth + 1, new Set(visited).add(reply.id)),
      }));
  return build("__root__", 0, new Set());
}

export function countDescendants(node: ReplyNode): number {
  return node.children.reduce(
    (total, child) => total + 1 + countDescendants(child),
    0,
  );
}
