// Shared UI-selection types for a community thread: which post/reply is
// currently being deleted, having its edit history viewed, or reported.
// Used by `useCommunityThreadState` and its sub-hooks, and by
// `CommunityThread`'s modal wiring.

/** The history modal target: the OP post, or a specific reply. */
export type HistoryTarget = { postId: string; replyId?: string };

/** A pending delete confirmation: the OP post, or a specific reply. */
export type DeleteTarget =
  { kind: "post" } | { kind: "reply"; replyId: string };

/** The content currently being reported — the OP post or a specific reply.
 *  Carries the real backend post/reply id as `subjectId`, matching the generic
 *  `POST /reports` contract (`ReportReplyModal` already speaks this shape). */
export type ReportTarget = {
  authorName: string;
  subjectId: string;
  subjectType: "post" | "reply";
};
