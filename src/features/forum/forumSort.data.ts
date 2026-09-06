import type { ForumSort } from "./api/forum.api";

/**
 * Label-key indirection (i18n Pattern A): `id` is the canonical `sort` value
 * `useForumPageState` holds and passes to `useThreads`/the server (never
 * translated); `labelKey` is the only thing that changes with language. Array
 * order = the sort tablist's tab order.
 *
 * PRD-161: `active` leads, because it is now the default on both ends
 * (`DEFAULT_FORUM_SORT`, and the server's own default). A tab order whose first
 * tab is not the one the list actually opens on reads as a bug. The rest run
 * from the most time-sensitive to the most deliberate: what is moving now, what
 * has just arrived, what the room has voted up over the last month, and what is
 * still waiting for somebody to answer.
 */
export const SORT_TABS: { id: ForumSort; labelKey: string }[] = [
  { id: "active", labelKey: "forum:threadList.active" },
  { id: "new", labelKey: "forum:threadList.new" },
  { id: "top", labelKey: "forum:threadList.top" },
  { id: "unanswered", labelKey: "forum:threadList.unanswered" },
];
