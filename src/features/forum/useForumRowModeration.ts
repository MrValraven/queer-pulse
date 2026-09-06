import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../shared/api/client";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { CATS, type Thread } from "./forum.data";
import {
  useDeleteThread,
  useMoveThreadCategory,
  usePinThread,
  useRestorePost,
} from "./api/useForumMutations";

/**
 * Row-level moderation for the forum thread LIST: withdraw the thread, move it
 * to another category, restore a tombstoned opening post, view its edit history
 * and pin it, reusing the same mutations + confirm-delete / edit-history modals
 * the thread page uses.
 *
 * Live-only: demo threads carry no `slug`/`opPostId`/`canPin`, so every handler
 * guards and no-ops (their row menu shows only "Edit"). The restore mutation
 * only invalidates the thread PAGE's posts/meta, so after a live action we also
 * invalidate the thread LIST here so the row reflects the change; the withdraw,
 * move and pin mutations each invalidate their own affected keys.
 *
 * PRD-160: "Delete" on a row used to call `DELETE /forum/posts/:id` on the
 * thread's OPENING post. That tombstoned the body and left the thread itself in
 * the list and the feed, title and link intact, which is the opposite of what a
 * member means by deleting their post. It now withdraws the whole thread.
 */
export function useForumRowModeration({
  onThreadDeleted,
}: {
  /** Called with the withdrawn thread's slug once the server has taken it
   *  down, so the page can drop any OPTIMISTIC copy it is still holding. The
   *  query invalidations below only reach the server-backed list; a thread the
   *  member published seconds earlier lives in local state and would otherwise
   *  stay on screen after they withdrew it. */
  onThreadDeleted?: (slug: string) => void;
} = {}) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const deleteThread = useDeleteThread();
  const moveCategory = useMoveThreadCategory();
  const restorePost = useRestorePost();
  const pinThread = usePinThread();
  const [confirmDelete, setConfirmDelete] = useState<{
    slug: string;
    title: string;
  } | null>(null);
  const [movingThread, setMovingThread] = useState<{
    slug: string;
    category: string;
  } | null>(null);
  const [historyPostId, setHistoryPostId] = useState<string | null>(null);

  const onError = () => showToast(t("forum:toast.error"), "error");
  const refreshList = () =>
    void queryClient.invalidateQueries({ queryKey: ["forum-threads"] });

  function requestTogglePin(thread: Thread) {
    if (!thread.slug) return;
    const pinning = !thread.pinned;
    const action = pinning ? pinThread.pin : pinThread.unpin;
    action(thread.slug, {
      onError: (error: unknown) => {
        if (error instanceof ApiError && error.status === 409) {
          showToast(t("forum:toast.pinCapReached"), "error");
        } else {
          onError();
        }
      },
      onSuccess: () =>
        showToast(
          t(
            pinning ? "forum:toast.threadPinned" : "forum:toast.threadUnpinned",
          ),
          "success",
        ),
    });
  }

  function requestDelete(thread: Thread) {
    if (thread.slug)
      setConfirmDelete({ slug: thread.slug, title: thread.title });
  }

  function requestMoveCategory(thread: Thread) {
    if (thread.slug)
      setMovingThread({ slug: thread.slug, category: thread.category });
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
    const { slug } = confirmDelete;
    setConfirmDelete(null);
    deleteThread.mutate(
      { slug },
      {
        onError,
        onSuccess: () => {
          onThreadDeleted?.(slug);
          showToast(t("forum:toast.threadDeleted"), "success");
        },
      },
    );
  }

  function confirmMoveNow(category: string) {
    if (!movingThread) return;
    const { slug } = movingThread;
    setMovingThread(null);
    moveCategory.mutate(
      { slug, category },
      {
        onError,
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

  return {
    confirmDelete,
    setConfirmDelete,
    movingThread,
    setMovingThread,
    historyPostId,
    setHistoryPostId,
    requestDelete,
    requestMoveCategory,
    requestHistory,
    requestRestore,
    requestTogglePin,
    confirmDeleteNow,
    confirmMoveNow,
    deleteBusy: deleteThread.isPending,
    moveBusy: moveCategory.isPending,
    pinBusy: pinThread.isPending,
  };
}
