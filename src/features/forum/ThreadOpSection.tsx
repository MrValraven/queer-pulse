import { type Dispatch, type SetStateAction } from "react";
import { type Thread } from "./forum.data";
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
  setBookmarked,
  moderation,
}: {
  thread: Thread;
  opView: ReturnType<typeof deriveOpView>;
  /** Cast/retract the viewer's vote on the opening post (real backend vote). */
  onVote: () => void;
  bookmarked: boolean;
  setBookmarked: Dispatch<SetStateAction<boolean>>;
  moderation: ReturnType<typeof useThreadModeration>;
}) {
  return (
    <ThreadOpCard
      thread={thread}
      title={opView.opTitle}
      body={opView.opBody}
      editedAt={opView.opEditedAt}
      deleted={opView.opDeleted}
      onVote={onVote}
      bookmarked={bookmarked}
      setBookmarked={setBookmarked}
      onReport={() => moderation.setReportingAuthor(thread.author.name)}
      canEdit={opView.opCanEdit}
      canDelete={opView.opCanDelete}
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
    />
  );
}
