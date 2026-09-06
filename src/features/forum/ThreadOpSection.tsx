import { type Thread } from "./forum.data";
import {
  canDeleteThread,
  canMoveThreadCategory,
} from "./forumPageState.helpers";
import { ThreadOpCard } from "./ThreadOpCard";
import {
  type deriveOpView,
  type useThreadModeration,
} from "./useThreadModeration";

/** The thread's original-post card, wired to its derived display/permission
 *  view-model and its moderation handlers. Lifted out of ThreadPage for the
 *  same reason `ThreadReplySection` was — keeping the page component itself
 *  well under the line budget. Takes `opView` (deriveOpView's result) and
 *  `moderation` (useThreadModeration's result) as-is, matching how
 *  ThreadPage already consumes them. */
export function ThreadOpSection({
  thread,
  opView,
  onVote,
  bookmarked,
  onToggleBookmark,
  onEditTags,
  moderation,
}: {
  thread: Thread;
  opView: ReturnType<typeof deriveOpView>;
  /** Cast/retract the viewer's vote on the opening post (real backend vote). */
  onVote: () => void;
  bookmarked: boolean;
  /** Persist/unpersist this thread in the member's saved items (real endpoint,
   *  optimistic + dual-mode via the app-wide saved store). */
  onToggleBookmark: () => void;
  /** Open the tag editor (SOC-13). Omitted for a viewer who may not re-file
   *  this thread. */
  onEditTags?: () => void;
  moderation: ReturnType<typeof useThreadModeration>;
}) {
  // PRD-163: the same gate the list row uses — a moderator at any time, the
  // author inside the thread's first 24 hours. Undefined when it does not
  // apply, which is what keeps the item out of the ⋯ menu entirely rather than
  // offering an action the server is about to refuse.
  const onMoveCategory = canMoveThreadCategory(thread)
    ? moderation.openMoveCategory
    : undefined;
  // PRD-160: "Delete" here takes the WHOLE thread down, so the gate is the
  // thread endpoint's (author or moderator) as well as the opening post's.
  // `opCanDelete` alone went false the moment that post was tombstoned, hiding
  // the action from the very author who wanted the thread gone;
  // `canDeleteThread` is false on a demo thread (no slug), which is what leaves
  // the prototype's local tombstone behaviour exactly as it was.
  const canDelete = opView.opCanDelete || canDeleteThread(thread);
  return (
    <ThreadOpCard
      thread={thread}
      title={opView.opTitle}
      body={opView.opBody}
      editedAt={opView.opEditedAt}
      deleted={opView.opDeleted}
      onVote={onVote}
      bookmarked={bookmarked}
      onToggleBookmark={onToggleBookmark}
      onReport={() =>
        // Report the OP's REAL backend post (`opPostId`), not the FE-synthetic
        // numeric thread id — the latter targets a non-existent subject and
        // never reaches moderators. Demo mock threads carry a stub `opPostId`.
        moderation.setReportTarget({
          authorName: thread.author.name,
          subjectId: thread.opPostId ?? String(thread.id),
          subjectType: "post",
        })
      }
      canEdit={opView.opCanEdit}
      canDelete={canDelete}
      canRestore={opView.opCanRestore}
      canViewHistory={opView.opCanViewHistory}
      onEdit={() => {
        moderation.setEditingOpInitialBody(opView.opBody.join("\n"));
        moderation.setEditingOp(true);
      }}
      onDelete={() => moderation.onOpDelete(thread.opPostId)}
      onRestore={() => moderation.doRestorePost(thread.opPostId ?? "", true)}
      onHistory={() =>
        thread.opPostId && moderation.setHistoryPostId(thread.opPostId)
      }
      onMoveCategory={onMoveCategory}
      onEditTags={onEditTags}
    />
  );
}
