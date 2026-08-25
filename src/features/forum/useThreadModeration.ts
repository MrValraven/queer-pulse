import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Reply, type Thread } from "./forum.data";
import {
  useEditPost,
  useDeletePost,
  useRestorePost,
  useEditThreadTitle,
} from "./api/useForumMutations";
import {
  type ForumReportTarget,
  deriveOpView,
} from "./threadModeration.helpers";
import { useOpModeration } from "./useOpModeration";
import { useReplyModeration } from "./useReplyModeration";

export type { ForumReportTarget };
export { deriveOpView };

/** Owns every moderation concern for a thread — the edit/delete/restore/history
 * UI state, the four backend mutations, and the handlers that drive them —
 * lifting them out of ThreadPage so both stay well under the line budget.
 * Behaviour is identical to the inline handlers it replaces. `thread` may be
 * undefined before the live fetch resolves; handlers guard on it. The
 * OP-card slice and the reply slice are each their own sub-hook (see
 * `useOpModeration`/`useReplyModeration`); this hook wires the shared state
 * (confirm/history/report) and the delete/restore dispatch between them. */
export function useThreadModeration({
  thread,
  demoMode,
  localReplies,
  setLocalReplies,
  replyKey,
}: {
  thread: Thread | undefined;
  demoMode: boolean;
  /** The reply list as currently rendered — snapshotted before an optimistic
   *  change so a failed request can restore it verbatim. */
  localReplies: Reply[];
  setLocalReplies: React.Dispatch<React.SetStateAction<Reply[]>>;
  replyKey: (reply: Reply) => string;
}) {
  const { showToast } = useToast();
  const { t } = useTranslation();

  const editPost = useEditPost();
  const deletePost = useDeletePost();
  const restorePost = useRestorePost();
  // Takes the thread's REAL backend slug (see `useEditThreadTitle`), never the
  // numeric view-model id.
  const editTitle = useEditThreadTitle(thread?.slug);

  const [confirmDelete, setConfirmDelete] = useState<{
    postId: string;
    isOp: boolean;
  } | null>(null);
  const [historyPostId, setHistoryPostId] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<ForumReportTarget | null>(
    null,
  );

  const onMutateError = () => showToast(t("forum:toast.error"), "error");

  const {
    editingOp,
    setEditingOp,
    editingOpInitialBody,
    setEditingOpInitialBody,
    opOverride,
    setOpOverride,
    runOpOverrideOp,
    saveOpEdit,
  } = useOpModeration({ thread, demoMode, editTitle, editPost, onMutateError });

  const {
    editingReplyPostId,
    setEditingReplyPostId,
    runReplyOp,
    saveReplyEdit,
  } = useReplyModeration({
    demoMode,
    localReplies,
    setLocalReplies,
    replyKey,
    editPost,
    onMutateError,
  });

  function doDeletePost(postId: string, isOp: boolean) {
    setConfirmDelete(null);
    if (isOp) {
      runOpOverrideOp({
        override: { deleted: true },
        postId,
        mutate: deletePost.mutate,
        successKey: "forum:toast.deleted",
      });
      return;
    }
    runReplyOp({
      patch: (replies) =>
        replies.map((currentReply) =>
          currentReply.postId === postId
            ? { ...currentReply, deleted: true }
            : currentReply,
        ),
      postId,
      mutate: deletePost.mutate,
      successKey: "forum:toast.deleted",
    });
  }

  function doRestorePost(postId: string, isOp: boolean) {
    if (isOp) {
      runOpOverrideOp({
        override: { deleted: false },
        postId,
        mutate: restorePost.mutate,
        successKey: "forum:toast.restored",
      });
      return;
    }
    runReplyOp({
      patch: (replies) =>
        replies.map((currentReply) =>
          currentReply.postId === postId
            ? { ...currentReply, deleted: false }
            : currentReply,
        ),
      postId,
      mutate: restorePost.mutate,
      successKey: "forum:toast.restored",
    });
  }

  // The OP delete action: live/demo-with-postId routes through the confirm
  // modal; a demo OP without a post id tombstones locally on the spot.
  function onOpDelete(opPostId?: string) {
    if (opPostId) setConfirmDelete({ postId: opPostId, isOp: true });
    else setOpOverride((prev) => ({ ...prev, deleted: true }));
  }

  // A reply's delete action: with a post id it goes through the confirm modal;
  // a demo reply without one tombstones locally, matched by its stable key.
  function onReplyDelete(replyItem: Reply) {
    if (replyItem.postId)
      setConfirmDelete({ postId: replyItem.postId, isOp: false });
    else
      setLocalReplies((prev) =>
        prev.map((currentReply) =>
          replyKey(currentReply) === replyKey(replyItem)
            ? { ...currentReply, deleted: true }
            : currentReply,
        ),
      );
  }

  return {
    editingReplyPostId,
    setEditingReplyPostId,
    editingOp,
    setEditingOp,
    editingOpInitialBody,
    setEditingOpInitialBody,
    confirmDelete,
    setConfirmDelete,
    historyPostId,
    setHistoryPostId,
    reportTarget,
    setReportTarget,
    opOverride,
    setOpOverride,
    saveReplyEdit,
    doDeletePost,
    doRestorePost,
    saveOpEdit,
    onOpDelete,
    onReplyDelete,
    editBusy: editPost.isPending || editTitle.isPending,
    deleteBusy: deletePost.isPending,
  };
}
