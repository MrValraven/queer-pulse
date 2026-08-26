import type { Conversation } from "./data";

/** "requests" (MSG-1) isn't a conversation filter at all — it swaps the whole
 *  list body for `MessagesRequestsPanel` (incoming first-contact message
 *  requests), so `filterThreadsByTab` below just returns no conversation rows
 *  for it; the real data comes from `useConnectionsList("incoming")`.
 *
 *  "archived" (SOC-16) is the mirror image of every other tab: every OTHER
 *  tab hides an archived thread (it's out of the main inbox experience by
 *  definition), and only this tab shows them. A thread never sits in both —
 *  the moment it's archived it drops out of "all"/"unread"/"favorites"/
 *  "groups" and appears only here, until it's explicitly unarchived or a new
 *  message auto-unarchives it server-side. */
export type InboxTab =
  "all" | "unread" | "favorites" | "groups" | "archived" | "requests";

/** Same unread rule `MessagesThreadRow` uses for its dot/badge — unread flag
 *  on, not locally marked read this session, and not the thread currently
 *  open (a thread being read live doesn't count as unread here either). */
export function isThreadUnread(
  thread: Conversation,
  activeId: string,
  readIds: Set<string>,
): boolean {
  return thread.unread && !readIds.has(thread.id) && thread.id !== activeId;
}

/** Filter an (already pinned-first sorted, per `useMessagesController`)
 *  thread list for the active inbox tab. Filtering only ever removes rows —
 *  it never reorders, so the pinned-first order survives inside every tab. */
export function filterThreadsByTab(
  threads: Conversation[],
  tab: InboxTab,
  activeId: string,
  readIds: Set<string>,
): Conversation[] {
  if (tab === "archived") {
    return threads.filter((thread) => !!thread.archivedAt);
  }
  if (tab === "requests") {
    return [];
  }
  // Every other tab is a view of the MAIN inbox — an archived thread is out
  // of it by definition until it's unarchived (or a new message
  // auto-unarchives it server-side), regardless of which of these it would
  // otherwise match.
  const unarchived = threads.filter((thread) => !thread.archivedAt);
  switch (tab) {
    case "unread":
      return unarchived.filter((thread) =>
        isThreadUnread(thread, activeId, readIds),
      );
    case "favorites":
      return unarchived.filter((thread) => thread.favorite === true);
    case "groups":
      return unarchived.filter((thread) => thread.isGroup === true);
    default:
      return unarchived;
  }
}
