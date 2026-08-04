import type { ForumSort } from "./api/forum.api";

/**
 * Label-key indirection (i18n Pattern A): `id` is the canonical `sort` value
 * `useForumPageState` holds and passes to `useThreads`/the server (never
 * translated); `labelKey` is the only thing that changes with language. Array
 * order = the sort tablist's tab order.
 */
export const SORT_TABS: { id: ForumSort; labelKey: string }[] = [
  { id: "top", labelKey: "forum:threadList.top" },
  { id: "new", labelKey: "forum:threadList.new" },
  { id: "active", labelKey: "forum:threadList.active" },
  { id: "unanswered", labelKey: "forum:threadList.unanswered" },
];
