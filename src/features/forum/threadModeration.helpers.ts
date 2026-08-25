import { type Thread } from "./forum.data";

export type OpOverride = {
  title?: string;
  body?: string[];
  deleted?: boolean;
  editedAt?: string | null;
};

/** The forum content currently being reported — the opening post (`"post"`) or
 *  a specific reply (`"reply"`). Carries the REAL backend post id as
 *  `subjectId` (the OP's `opPostId` / the reply's `postId`), never the
 *  FE-synthetic numeric thread id, so live reports reach the right subject. */
export interface ForumReportTarget {
  authorName: string;
  subjectId: string;
  subjectType: "post" | "reply";
}

/** Resolves the OP card's display + permission view-model. Demo layers the
 * local `opOverride` (and persona ownership) over the thread; live reads the
 * DTO flags straight through. Called after the not-found guard, so `thread` is
 * resolved. `ownsOp` is the demo persona's ownership of the OP author. */
export function deriveOpView(
  thread: Thread,
  demoMode: boolean,
  ownsOp: boolean,
  opOverride: OpOverride,
) {
  const opDeleted = demoMode ? !!opOverride.deleted : !!thread.deleted;
  return {
    opDeleted,
    opCanEdit: demoMode ? ownsOp && !opDeleted : !!thread.canEdit,
    opCanDelete: demoMode ? ownsOp && !opDeleted : !!thread.canDelete,
    opCanRestore: demoMode ? ownsOp && opDeleted : !!thread.canRestore,
    opCanViewHistory: demoMode ? false : !!thread.canViewHistory,
    opTitle: demoMode ? (opOverride.title ?? thread.title) : thread.title,
    opBody: demoMode ? (opOverride.body ?? thread.body) : thread.body,
    opEditedAt: demoMode
      ? (opOverride.editedAt ?? thread.editedAt ?? null)
      : (thread.editedAt ?? null),
  };
}
