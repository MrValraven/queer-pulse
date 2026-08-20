import type { Conversation } from "./data";

/** "requests" (MSG-1) isn't a conversation filter at all — it swaps the whole
 *  list body for `MessagesRequestsPanel` (incoming first-contact message
 *  requests), so `filterThreadsByTab` below just returns no conversation rows
 *  for it; the real data comes from `useConnectionsList("incoming")`. */
export type InboxTab = "all" | "unread" | "favorites" | "groups" | "requests";

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
  switch (tab) {
    case "unread":
      return threads.filter((thread) =>
        isThreadUnread(thread, activeId, readIds),
      );
    case "favorites":
      return threads.filter((thread) => thread.favorite === true);
    case "groups":
      return threads.filter((thread) => thread.isGroup === true);
    case "requests":
      return [];
    default:
      return threads;
  }
}
