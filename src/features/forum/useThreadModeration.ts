import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type ConfirmDeleteSubject } from "./ConfirmDeleteModal";
import { CATS, type Reply, type Thread } from "./forum.data";
import {
  useEditPost,
  useDeletePost,
  useDeleteThread,
  useMoveThreadCategory,
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
  const navigate = useNavigate();

  const editPost = useEditPost();
  const deletePost = useDeletePost();
  // PRD-160: the thread page's own "Delete" on the opening post takes the WHOLE
  // thread down, the same action the list row already performs. It used to call
  // `DELETE /forum/posts/:id`, which tombstones one post: the body went blank
  // and the thread, its title and the link people follow to get here all stayed
  // standing, which is the opposite of what a member means by deleting their
  // post.
  const deleteThread = useDeleteThread();
  // PRD-163: re-filing the thread from the page it lives on, not only from the
  // list row.
  const moveCategory = useMoveThreadCategory();
  const restorePost = useRestorePost();
  // Takes the thread's REAL backend slug (see `useEditThreadTitle`), never the
  // numeric view-model id.
  const editTitle = useEditThreadTitle(thread?.slug);

  const [confirmDelete, setConfirmDelete] = useState<{
    postId: string;
    isOp: boolean;
  } | null>(null);
  const [historyPostId, setHistoryPostId] = useState<string | null>(null);
  const [isMovingCategory, setIsMovingCategory] = useState(false);
  const [reportTarget, setReportTarget] = useState<ForumReportTarget | null>(
    null,
  );

  /** Is a live thread's opening post the subject, i.e. does "Delete" here mean
   *  the whole thread? Demo has no slug and no server, so it keeps tombstoning
   *  the opening post locally. */
  const isThreadLevelDelete = !demoMode && !!thread?.slug;

  /** Which copy the confirm dialog wears: withdrawing the whole thread reads
   *  very differently from hiding one post, and it has to say so. */
  const confirmDeleteSubject: ConfirmDeleteSubject =
    confirmDelete?.isOp && isThreadLevelDelete ? "thread" : "post";

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
      if (isThreadLevelDelete && thread?.slug) {
        const { slug } = thread;
        deleteThread.mutate(
          { slug },
          {
            onError: onMutateError,
            onSuccess: () => {
              showToast(t("forum:toast.threadDeleted"), "success");
              // Leave: this page now 404s. `replace` keeps the withdrawn thread
              // out of the history stack, so Back does not land the member on
              // the "not found" state of the thread they just took down.
              void navigate(routes.forum, { replace: true });
            },
          },
        );
        return;
      }
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

  // The OP delete action. Live: always through the confirm modal, whose copy is
  // about withdrawing the whole thread — so it opens whether or not the opening
  // post's id resolved, because the thread is the subject either way. Demo:
  // with a post id it goes through the modal, without one it tombstones the
  // local mock on the spot.
  function onOpDelete(opPostId?: string) {
    if (isThreadLevelDelete) {
      setConfirmDelete({ postId: opPostId ?? "", isOp: true });
      return;
    }
    if (opPostId) setConfirmDelete({ postId: opPostId, isOp: true });
    else setOpOverride((prev) => ({ ...prev, deleted: true }));
  }

  /** Re-file the thread (PRD-163). The server owns the permission (author
   *  inside 24 hours, moderator any time); `canMoveThreadCategory` is what
   *  keeps the affordance off a menu where it would only earn a 403. */
  function saveCategory(category: string) {
    setIsMovingCategory(false);
    if (!thread?.slug) return;
    moveCategory.mutate(
      { slug: thread.slug, category },
      {
        onError: onMutateError,
        onSuccess: () => {
          const moved = CATS.find((option) => option.id === category);
          showToast(
            t("forum:toast.categoryMoved", {
              category: moved ? t(moved.nameKey) : category,
            }),
            "success",
          );
        },
      },
    );
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
    confirmDeleteSubject,
    historyPostId,
    setHistoryPostId,
    isMovingCategory,
    openMoveCategory: () => setIsMovingCategory(true),
    closeMoveCategory: () => setIsMovingCategory(false),
    saveCategory,
    isCategoryMoveSaving: moveCategory.isPending,
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
    deleteBusy: deletePost.isPending || deleteThread.isPending,
  };
}
