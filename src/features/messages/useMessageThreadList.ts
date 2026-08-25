import { useMemo } from "react";
import { type Conversation } from "./data";

type UseMessageThreadListParameters = {
  extraThreads: Conversation[];
  baseThreads: Conversation[];
  locallyDeletedIds: Set<string>;
  query: string;
  isBlocked: (slug: string) => boolean;
};

/**
 * Shapes the raw inbox into the three thread lists `useMessagesController`
 * renders from: the deduped/pinned-sorted full inbox, the search + block
 * filtered visible list, and the forward-picker's set of live groups. Split
 * out of the controller as a pure derivation slice — it owns no state of its
 * own, only `useMemo`s over the controller's state.
 */
export function useMessageThreadList({
  extraThreads,
  baseThreads,
  locallyDeletedIds,
  query,
  isBlocked,
}: UseMessageThreadListParameters) {
  // Session-started threads first, then the fetched inbox — deduped by id. A
  // just-started conversation lives in `extraThreads` until the inbox refetch
  // catches up, at which point the same row arrives from `baseThreads` too;
  // without this dedupe it would render (and key) twice.
  const allThreads = useMemo(() => {
    const seenIds = new Set<string>();
    const merged: Conversation[] = [];
    for (const thread of [...extraThreads, ...baseThreads]) {
      if (seenIds.has(thread.id) || locallyDeletedIds.has(thread.id)) continue;
      seenIds.add(thread.id);
      merged.push(thread);
    }
    // Pinned chats float to the top (WhatsApp-style), newest pin first; every
    // other pair keeps its merge-order position. `Array.prototype.sort` is
    // spec-stable, so returning 0 for two threads with no ordering preference
    // here (both unpinned) never reshuffles them relative to each other — this
    // is what keeps the pinned-first order intact inside every inbox tab too.
    return merged.sort((a, b) => {
      if (!!a.pinnedAt === !!b.pinnedAt) {
        return a.pinnedAt && b.pinnedAt
          ? b.pinnedAt.localeCompare(a.pinnedAt)
          : 0;
      }
      return a.pinnedAt ? -1 : 1;
    });
  }, [extraThreads, baseThreads, locallyDeletedIds]);

  // DM severance (spec 03): a blocked counterpart's thread is hidden. Their
  // history stays server-side for moderation; here we just stop surfacing it.
  const visibleThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allThreads.filter(
      (c) =>
        !(c.slug && isBlocked(c.slug)) &&
        (!q || c.name.toLowerCase().includes(q)),
    );
  }, [allThreads, query, isBlocked]);

  // Active group chats the member can forward INTO — every group they still
  // belong to (owner, admin, or member), never one they've left. Search inside
  // the forward picker filters this further; unfiltered here so opening the
  // picker always shows the full set regardless of the inbox search box.
  const forwardableGroups = useMemo(
    () => allThreads.filter((thread) => thread.isGroup && !thread.hasLeft),
    [allThreads],
  );

  return { allThreads, visibleThreads, forwardableGroups };
}
