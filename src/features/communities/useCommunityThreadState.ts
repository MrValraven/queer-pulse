import { useState } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { viewerPerson } from "./communityPeople";
import { useCommunityReplies } from "./api/useCommunityReplies";
import { replyDtoToThreadReply } from "./api/communities.adapters";
import { buildRepliesList } from "./communityThread.helpers";
import { useThreadVoteState } from "./useThreadVoteState";
import { useThreadComposerState } from "./useThreadComposerState";
import { useThreadOpModerationState } from "./useThreadOpModerationState";
import { useThreadReplyModerationState } from "./useThreadReplyModerationState";
import type { Thread as ThreadData } from "./communityDetails";
import type {
  DeleteTarget,
  HistoryTarget,
  ReportTarget,
} from "./communityThread.types";
import type { CommunityTakedownInput } from "./api/communities.api";

/**
 * All state, derived values, and mutation handlers for a thread. Composed
 * from smaller sub-hooks along real seams — vote, composer, OP-post
 * moderation, and per-reply moderation each own their own state and
 * mutations — so this hook is left to wire them together and merge the
 * reply list. A plain hook (returns no JSX), pulled out of the
 * `CommunityThread` component (which is layout/JSX only) so that component
 * stays under the repo's 200-line-per-component limit.
 */
export function useCommunityThreadState(
  data: ThreadData,
  slug: string,
  canModerate: boolean,
  isMember: boolean,
) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  // Shared UI-selection state: which post/reply the confirm-delete, history,
  // and report dialogs currently target. Threaded into both moderation
  // sub-hooks below since the OP post and its replies share these dialogs.
  const [confirmDelete, setConfirmDelete] = useState<DeleteTarget | null>(null);
  const [historyTarget, setHistoryTarget] = useState<HistoryTarget | null>(
    null,
  );
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

  const { voted, toggleVote } = useThreadVoteState(slug, data, demoMode);
  const composer = useThreadComposerState(slug, data, demoMode, user);
  const opModeration = useThreadOpModerationState(
    slug,
    data,
    demoMode,
    user,
    canModerate,
    isMember,
    setConfirmDelete,
    setReportTarget,
  );
  const replyModeration = useThreadReplyModerationState(
    slug,
    data,
    demoMode,
    user,
    isMember,
    setConfirmDelete,
    setReportTarget,
  );

  // Replies beyond the post's embedded preview (`data.replies`) — inert until
  // "Load more replies" is clicked once (see `useCommunityReplies`).
  const repliesPaging = useCommunityReplies(
    slug,
    data.id,
    data.replyCount,
    data.replies.length,
  );
  const loadedMoreReplies = repliesPaging.extraReplies.map((dto) =>
    replyDtoToThreadReply(dto, t),
  );
  const replies = buildRepliesList({
    data,
    loadedMoreReplies,
    extraReplies: composer.extraReplies,
    replyOverrides: replyModeration.replyOverrides,
  });

  // The confirm-delete dialog targets either the OP post or a reply; dispatch
  // to whichever moderation slice owns that kind of content. `takedown` is
  // present only on a MODERATOR'S delete of somebody else's content (PRD-147)
  // and carries the reason and cited house rule its author is sent.
  function runDelete(target: DeleteTarget, takedown?: CommunityTakedownInput) {
    if (target.kind === "post") opModeration.runDeleteOp(takedown);
    else replyModeration.runDeleteReply(target.replyId, takedown);
  }

  // Whether what is about to come down belongs to the viewer. The author gets
  // the plain delete confirmation (nothing logged, nobody told); anybody else
  // is a moderator and gets the takedown dialog (PRD-147).
  function resolveIsDeleteTargetOwnContent(): boolean {
    // No target means no dialog is open; the quieter answer keeps the takedown
    // form from being the thing that renders on a stale click.
    if (confirmDelete === null) return true;
    if (confirmDelete.kind === "post") return opModeration.opIsMine;
    const targetReply = replies.find(
      (reply) => reply.id === confirmDelete.replyId,
    );
    // A reply the merged list no longer holds falls back to "own content" for
    // the same reason: an unreachable row must never open a form that writes
    // to somebody's notification.
    return targetReply ? replyModeration.isOwnReply(targetReply) : true;
  }
  const isDeleteTargetOwnContent = resolveIsDeleteTargetOwnContent();

  return {
    t,
    demoMode,
    viewer: viewerPerson(user),
    deletePost: opModeration.deletePost,
    deleteReply: replyModeration.deleteReply,
    // In-flight flags, so the UI keeps showing "working on it" between the
    // click and the server's answer instead of confirming early.
    isReplyPending: composer.isReplyPending,
    isSavingOpEdit: opModeration.isSavingOpEdit,
    isSavingReplyEdit: replyModeration.isSavingReplyEdit,
    open,
    setOpen,
    voted,
    replyText: composer.replyText,
    setReplyText: composer.setReplyText,
    editingOp: opModeration.editingOp,
    setEditingOp: opModeration.setEditingOp,
    editingReplyId: replyModeration.editingReplyId,
    setEditingReplyId: replyModeration.setEditingReplyId,
    confirmDelete,
    setConfirmDelete,
    isDeleteTargetOwnContent,
    historyTarget,
    setHistoryTarget,
    reportTarget,
    setReportTarget,
    opDeleted: opModeration.opDeleted,
    opPinned: opModeration.opPinned,
    opBody: opModeration.opBody,
    opEditedAt: opModeration.opEditedAt,
    opCanEdit: opModeration.opCanEdit,
    opCanDelete: opModeration.opCanDelete,
    opCanRestore: opModeration.opCanRestore,
    opCanViewHistory: opModeration.opCanViewHistory,
    opCanPin: opModeration.opCanPin,
    opCanReport: opModeration.opCanReport,
    replies,
    repliesPaging,
    toggleVote,
    postReply: composer.postReply,
    saveOpEdit: opModeration.saveOpEdit,
    saveReplyEdit: replyModeration.saveReplyEdit,
    runDelete,
    runRestorePost: opModeration.runRestorePost,
    runRestoreReply: replyModeration.runRestoreReply,
    runTogglePinOp: opModeration.runTogglePinOp,
    onReportOp: opModeration.onReportOp,
    onReportReply: replyModeration.onReportReply,
    canReportReply: replyModeration.canReportReply,
  };
}
