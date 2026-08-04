import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Thread } from "./forum.data";
import { useDeletePost, useRestorePost } from "./api/useForumMutations";

/**
 * Row-level moderation for the forum thread LIST: delete / restore / view
 * history on a thread's OPENING post (via `thread.opPostId`), reusing the exact
 * same mutations + confirm-delete / edit-history modals the thread page uses.
 *
 * Live-only: demo threads carry no `opPostId`, so every handler guards and
 * no-ops (their row menu shows only "Edit"). The delete/restore mutations
 * themselves only invalidate the thread PAGE's posts/meta, so after a live
 * action we also invalidate the thread LIST here so the row reflects the change.
 */
export function useForumRowModeration() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const deletePost = useDeletePost();
  const restorePost = useRestorePost();
  const [confirmDelete, setConfirmDelete] = useState<{ postId: string } | null>(
    null,
  );
  const [historyPostId, setHistoryPostId] = useState<string | null>(null);

  const onError = () => showToast(t("forum:toast.error"), "error");
  const refreshList = () =>
    void queryClient.invalidateQueries({ queryKey: ["forum-threads"] });

  function requestDelete(thread: Thread) {
    if (thread.opPostId) setConfirmDelete({ postId: thread.opPostId });
  }

  function requestHistory(thread: Thread) {
    if (thread.opPostId) setHistoryPostId(thread.opPostId);
  }

  function requestRestore(thread: Thread) {
    if (!thread.opPostId) return;
    restorePost.mutate(
      { postId: thread.opPostId },
      {
        onError,
        onSuccess: () => {
          refreshList();
          showToast(t("forum:toast.restored"), "success");
        },
      },
    );
  }

  function confirmDeleteNow() {
    if (!confirmDelete) return;
    const { postId } = confirmDelete;
    setConfirmDelete(null);
    deletePost.mutate(
      { postId },
      {
        onError,
        onSuccess: () => {
          refreshList();
          showToast(t("forum:toast.deleted"), "success");
        },
      },
    );
  }

  return {
    confirmDelete,
    setConfirmDelete,
    historyPostId,
    setHistoryPostId,
    requestDelete,
    requestHistory,
    requestRestore,
    confirmDeleteNow,
    deleteBusy: deletePost.isPending,
  };
}
