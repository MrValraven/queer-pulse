import { useMemo } from "react";
import { withLastActivityOf } from "../../shared/api/messageCache";
import { type Conversation } from "./data";

type UseMessageThreadListParameters = {
  extraThreads: Conversation[];
  baseThreads: Conversation[];
  /** Cached `["conversation-detail", id]` reads for `extraThreads` rows the
   *  list pages do not hold (`useCachedConversationDetails`). Empty in demo. */
  detailThreadsById: ReadonlyMap<string, Conversation>;
  /** Live mode: the query caches outrank a session copy, and a live session
   *  row that survives the dedupe sits at its own `updatedAt` slot among the
   *  fetched rows (see `mergeInboxThreads`). Demo keeps the session copy on
   *  top, because its simulated group changes live nowhere else. */
  shouldPreferCachedRows: boolean;
  locallyDeletedIds: Set<string>;
  query: string;
  isBlocked: (slug: string) => boolean;
};

interface MergeInboxThreadsInput {
  extraThreads: Conversation[];
  baseThreads: Conversation[];
  detailThreadsById: ReadonlyMap<string, Conversation>;
  shouldPreferCachedRows: boolean;
  locallyDeletedIds: Set<string>;
}

/**
 * The fetched inbox plus the session-started threads, deduped by id.
 * `extraThreads` carries what the list pages cannot show yet: a just-started
 * or just-created conversation, a picker placeholder, a thread opened past
 * the loaded pages that a local group action patched.
 *
 * Live, each id takes its freshest source. The list pages win whenever they
 * hold the id: every conversation-level patch (a remote rename, photo, pin,
 * mute, unread bump, preview) writes the list and the detail together, and
 * the open thread's detail roster is layered on later
 * (`useRequestedActiveThread`). A session row the list lacks takes its cached
 * detail read when one exists, since the same patches reach that entry too,
 * with the session copy's last activity laid over it when that copy is
 * strictly newer by `updatedAt` (see `mergeDetailWithSessionActivity`). The
 * session copy otherwise stands only where neither cache holds the id, so a
 * copy frozen at the moment of a local mutation can never mask a later
 * remote change.
 *
 * Live, each session row sits at its `updatedAt` slot among the fetched rows,
 * the server's own most-recently-active-first order (see
 * `withSessionRowsInActivityOrder`), so a thread opened past the loaded pages
 * stays put when the page holding it loads. Demo keeps the session copies on
 * top: its simulated group changes are patched into `extraThreads` alone and
 * the seeded list never moves.
 */
export function mergeInboxThreads({
  extraThreads,
  baseThreads,
  detailThreadsById,
  shouldPreferCachedRows,
  locallyDeletedIds,
}: MergeInboxThreadsInput): Conversation[] {
  const listedIds = new Set(baseThreads.map((thread) => thread.id));
  const ordered = shouldPreferCachedRows
    ? withSessionRowsInActivityOrder(
        extraThreads
          .filter((thread) => !listedIds.has(thread.id))
          .map((thread) =>
            mergeDetailWithSessionActivity(
              detailThreadsById.get(thread.id),
              thread,
            ),
          ),
        baseThreads,
      )
    : [...extraThreads, ...baseThreads];
  const seenIds = new Set<string>();
  const merged: Conversation[] = [];
  for (const thread of ordered) {
    if (seenIds.has(thread.id) || locallyDeletedIds.has(thread.id)) continue;
    seenIds.add(thread.id);
    merged.push(thread);
  }
  return merged;
}

/** A row's `updatedAt` as epoch milliseconds, `NaN` when absent or
 *  unreadable. */
function activityTime(thread: Conversation): number {
  return Date.parse(thread.updatedAt ?? "");
}

/**
 * `baseThreads` with each session row placed just before the first fetched
 * row whose `updatedAt` is equal to or older than its own; a tie goes to the
 * session row, so a just-created thread leads a list whose newest row shares
 * its instant. Session rows with no readable `updatedAt` (a picker
 * placeholder) lead, in their given order, and the rest keep newest first
 * among themselves. A fetched row with no readable time never makes a session
 * row wait behind it. A repeated session id keeps its first copy, as the
 * caller's dedupe did before the rows were reordered.
 */
function withSessionRowsInActivityOrder(
  sessionThreads: Conversation[],
  baseThreads: Conversation[],
): Conversation[] {
  if (sessionThreads.length === 0) return baseThreads;
  const firstSessionCopies = sessionThreads.filter(
    (thread, index) =>
      sessionThreads.findIndex((other) => other.id === thread.id) === index,
  );
  const untimedSessionThreads = firstSessionCopies.filter((thread) =>
    Number.isNaN(activityTime(thread)),
  );
  // `sort` is spec-stable, so session rows sharing an instant keep their order.
  const timedSessionThreads = firstSessionCopies
    .filter((thread) => !Number.isNaN(activityTime(thread)))
    .sort((first, second) => activityTime(second) - activityTime(first));
  const ordered: Conversation[] = [...untimedSessionThreads];
  let nextSessionIndex = 0;
  for (const baseThread of baseThreads) {
    const baseTime = activityTime(baseThread);
    // Newest first, so once the next session row is too old for this slot
    // every row behind it is too. A fetched row with no readable time never
    // makes a session row wait behind it, so an unreadable `baseTime` takes
    // every remaining session row regardless of its own time.
    let nextSessionThread = timedSessionThreads[nextSessionIndex];
    while (
      nextSessionThread &&
      (Number.isNaN(baseTime) || activityTime(nextSessionThread) >= baseTime)
    ) {
      ordered.push(nextSessionThread);
      nextSessionIndex += 1;
      nextSessionThread = timedSessionThreads[nextSessionIndex];
    }
    ordered.push(baseThread);
  }
  ordered.push(...timedSessionThreads.slice(nextSessionIndex));
  return ordered;
}

/**
 * The cached detail read, with the session copy's last activity (preview,
 * time, `updatedAt` and the sender fields behind them, `withLastActivityOf`)
 * laid over it when the session copy carries a strictly newer `updatedAt`: a
 * conversation `startConversation` just handed back may be ahead of a detail
 * entry cached earlier this session. Every other field stays the detail's,
 * since a rename, a photo, a pin or a mute patches that entry without moving
 * its `updatedAt`. A tie, or a missing or unreadable time on either copy,
 * keeps the detail whole.
 */
function mergeDetailWithSessionActivity(
  detail: Conversation | undefined,
  sessionCopy: Conversation,
): Conversation {
  if (!detail) return sessionCopy;
  const detailTime = activityTime(detail);
  const sessionTime = activityTime(sessionCopy);
  if (Number.isNaN(detailTime) || Number.isNaN(sessionTime)) return detail;
  return sessionTime > detailTime
    ? withLastActivityOf(detail, sessionCopy)
    : detail;
}

/**
 * `extraThreads` without the rows the list pages now hold, or the same array
 * when there are none, so a caller can prune with no extra render. Live only:
 * once the list carries a row its session copy is dead weight, and dropping
 * it keeps that copy from resurfacing if the row later slides past the
 * loaded pages. Demo returns the array untouched (see `mergeInboxThreads`).
 */
export function withoutListedExtraThreads(
  extraThreads: Conversation[],
  listedIds: ReadonlySet<string>,
  shouldPreferCachedRows: boolean,
): Conversation[] {
  if (!shouldPreferCachedRows || extraThreads.length === 0) return extraThreads;
  if (!extraThreads.some((thread) => listedIds.has(thread.id))) {
    return extraThreads;
  }
  return extraThreads.filter((thread) => !listedIds.has(thread.id));
}

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
  detailThreadsById,
  shouldPreferCachedRows,
  locallyDeletedIds,
  query,
  isBlocked,
}: UseMessageThreadListParameters) {
  // Deduped by id (see `mergeInboxThreads`): a just-started conversation
  // lives in `extraThreads` until the inbox refetch catches up, at which
  // point the same row arrives from `baseThreads` too; without the dedupe it
  // would render (and key) twice. Live, a session row already sits at its
  // `updatedAt` slot, so that handover leaves the row where it was.
  const allThreads = useMemo(() => {
    const merged = mergeInboxThreads({
      extraThreads,
      baseThreads,
      detailThreadsById,
      shouldPreferCachedRows,
      locallyDeletedIds,
    });
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
  }, [
    extraThreads,
    baseThreads,
    detailThreadsById,
    shouldPreferCachedRows,
    locallyDeletedIds,
  ]);

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
  // Built from the loaded inbox pages; a search inside the picker also finds
  // groups past them on the server (`useForwardGroupSearch`, ENG-403).
  const forwardableGroups = useMemo(
    () => allThreads.filter((thread) => thread.isGroup && !thread.hasLeft),
    [allThreads],
  );

  return { allThreads, visibleThreads, forwardableGroups };
}
