import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AuthUser } from "../auth/api/auth.api";
import {
  useEditCommunityReply,
  useDeleteCommunityReply,
  useRestoreCommunityReply,
} from "./api/useCommunityMutations";
import { canReportReplyContent } from "./communityThread.helpers";
import type { Reply, Thread as ThreadData } from "./communityDetails";
import type { DeleteTarget, ReportTarget } from "./communityThread.types";

/** Per-reply moderation: local demo overrides keyed by reply id, and the
 *  edit / delete / restore / report actions on a thread's replies. Parallel
 *  to `useThreadOpModerationState`, which owns the OP post's own slice — the
 *  two never touch the same piece of state. `setConfirmDelete`/`setReportTarget`
 *  are threaded in because those two dialogs are shared UI state between the
 *  OP post and its replies, owned one level up by `useCommunityThreadState`. */
export function useThreadReplyModerationState(
  slug: string,
  data: ThreadData,
  demoMode: boolean,
  user: AuthUser | null,
  isMember: boolean,
  setConfirmDelete: (target: DeleteTarget | null) => void,
  setReportTarget: (target: ReportTarget | null) => void,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const editReply = useEditCommunityReply(slug);
  const deleteReply = useDeleteCommunityReply(slug);
  const restoreReply = useRestoreCommunityReply(slug);

  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  // Demo-only local overrides (live refetches after each mutation instead).
  const [replyOverrides, setReplyOverrides] = useState<
    Record<string, Partial<Reply>>
  >({});

  const onError = () => showToast(t("communities:common.error"), "error");

  function saveReplyEdit(replyId: string, next: string) {
    if (demoMode) {
      setEditingReplyId(null);
      setReplyOverrides((prev) => ({
        ...prev,
        [replyId]: {
          ...prev[replyId],
          text: next,
          editedAt: new Date().toISOString(),
        },
      }));
      showToast(t("communities:detail.thread.editSavedToast"), "success");
      return;
    }
    if (!data.id) {
      setEditingReplyId(null);
      return;
    }
    editReply.mutate(
      { postId: data.id, replyId, text: next },
      {
        onSuccess: () => {
          setEditingReplyId(null);
          showToast(t("communities:detail.thread.editSavedToast"), "success");
        },
        onError,
      },
    );
  }

  function runDeleteReply(replyId: string) {
    if (demoMode) {
      setConfirmDelete(null);
      setReplyOverrides((prev) => ({
        ...prev,
        [replyId]: { ...prev[replyId], deleted: true },
      }));
      showToast(t("communities:detail.thread.deletedToast"), "success");
      return;
    }
    if (!data.id) {
      setConfirmDelete(null);
      return;
    }
    // The confirm modal stays mounted (and busy) until the delete resolves,
    // so the "Deleted" toast only ever follows a delete that happened.
    deleteReply.mutate(
      { postId: data.id, replyId },
      {
        onSuccess: () => {
          setConfirmDelete(null);
          showToast(t("communities:detail.thread.deletedToast"), "success");
        },
        onError: () => {
          setConfirmDelete(null);
          onError();
        },
      },
    );
  }

  function runRestoreReply(replyId: string) {
    if (demoMode) {
      setReplyOverrides((prev) => ({
        ...prev,
        [replyId]: { ...prev[replyId], deleted: false },
      }));
      showToast(t("communities:detail.thread.restoredToast"), "success");
      return;
    }
    if (!data.id) return;
    restoreReply.mutate(
      { postId: data.id, replyId },
      {
        onSuccess: () =>
          showToast(t("communities:detail.thread.restoredToast"), "success"),
        onError,
      },
    );
  }

  function onReportReply(reply: Reply) {
    if (!reply.id) return;
    setReportTarget({
      authorName: reply.name,
      subjectId: reply.id,
      subjectType: "reply",
    });
  }

  function canReportReply(reply: Reply): boolean {
    return canReportReplyContent(reply, { isMember, demoMode, user });
  }

  return {
    editingReplyId,
    setEditingReplyId,
    replyOverrides,
    isSavingReplyEdit: editReply.isPending,
    saveReplyEdit,
    runDeleteReply,
    runRestoreReply,
    onReportReply,
    canReportReply,
    deleteReply,
  };
}
