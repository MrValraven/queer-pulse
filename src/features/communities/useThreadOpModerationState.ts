import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { AuthUser } from "../auth/api/auth.api";
import {
  useUpdatePost,
  useDeleteCommunityPost,
  useRestoreCommunityPost,
} from "./api/useCommunityMutations";
import { deriveOpFlags, type OpOverride } from "./communityThread.helpers";
import type { Thread as ThreadData } from "./communityDetails";
import type { DeleteTarget, ReportTarget } from "./communityThread.types";

/** OP-post moderation: local demo overrides + derived flags, and the
 *  edit / delete / restore / pin / report actions on the thread's own post.
 *  Reply moderation is a parallel, separate slice (`useThreadReplyModerationState`)
 *  since it owns its own per-reply override map — the two never touch the
 *  same piece of state. `setConfirmDelete`/`setReportTarget` are threaded in
 *  because those two dialogs are shared UI state between the OP post and its
 *  replies, owned one level up by `useCommunityThreadState`. */
export function useThreadOpModerationState(
  slug: string,
  data: ThreadData,
  demoMode: boolean,
  user: AuthUser | null,
  canModerate: boolean,
  isMember: boolean,
  setConfirmDelete: (target: DeleteTarget | null) => void,
  setReportTarget: (target: ReportTarget | null) => void,
) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const updatePost = useUpdatePost(slug);
  const deletePost = useDeleteCommunityPost(slug);
  const restorePost = useRestoreCommunityPost(slug);

  const [editingOp, setEditingOp] = useState(false);
  // Demo-only local overrides (live refetches after each mutation instead).
  const [opOverride, setOpOverride] = useState<OpOverride>({});

  const onError = () => showToast(t("communities:common.error"), "error");

  const {
    opDeleted,
    opPinned,
    opBody,
    opEditedAt,
    opCanEdit,
    opCanDelete,
    opCanRestore,
    opCanViewHistory,
    opCanPin,
    opCanReport,
  } = deriveOpFlags({
    data,
    demoMode,
    user,
    opOverride,
    canModerate,
    isMember,
  });

  function saveOpEdit(next: string) {
    if (demoMode) {
      setEditingOp(false);
      setOpOverride((prev) => ({
        ...prev,
        post: next,
        editedAt: new Date().toISOString(),
      }));
      showToast(t("communities:detail.thread.editSavedToast"), "success");
      return;
    }
    if (!data.id) {
      setEditingOp(false);
      return;
    }
    // The editor stays open (and busy) until the PATCH lands, so a failure
    // hands the edit back instead of confirming a save that never happened.
    updatePost.mutate(
      { id: data.id, dto: { body: next } },
      {
        onSuccess: () => {
          setEditingOp(false);
          showToast(t("communities:detail.thread.editSavedToast"), "success");
        },
        onError,
      },
    );
  }

  function runDeleteOp() {
    if (demoMode) {
      setConfirmDelete(null);
      setOpOverride((prev) => ({ ...prev, deleted: true }));
      showToast(t("communities:detail.thread.deletedToast"), "success");
      return;
    }
    if (!data.id) {
      setConfirmDelete(null);
      return;
    }
    // The confirm modal stays mounted (and busy) until the delete resolves,
    // so the "Deleted" toast only ever follows a delete that happened.
    deletePost.mutate(
      { id: data.id },
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

  function runRestorePost() {
    if (demoMode) {
      setOpOverride((prev) => ({ ...prev, deleted: false }));
      showToast(t("communities:detail.thread.restoredToast"), "success");
      return;
    }
    if (!data.id) return;
    restorePost.mutate(
      { id: data.id },
      {
        onSuccess: () =>
          showToast(t("communities:detail.thread.restoredToast"), "success"),
        onError,
      },
    );
  }

  function runTogglePinOp() {
    const next = !opPinned;
    const pinToast = () =>
      showToast(
        t(
          next
            ? "communities:common.pinnedToast"
            : "communities:common.unpinnedToast",
        ),
        "success",
      );
    if (demoMode) {
      setOpOverride((prev) => ({ ...prev, pinned: next }));
      pinToast();
      return;
    }
    if (!data.id) return;
    updatePost.mutate(
      { id: data.id, dto: { pinned: next } },
      { onSuccess: pinToast, onError },
    );
  }

  function onReportOp() {
    if (!data.id) return;
    setReportTarget({
      authorName: data.author.name,
      subjectId: data.id,
      subjectType: "post",
    });
  }

  return {
    editingOp,
    setEditingOp,
    opDeleted,
    opPinned,
    opBody,
    opEditedAt,
    opCanEdit,
    opCanDelete,
    opCanRestore,
    opCanViewHistory,
    opCanPin,
    opCanReport,
    isSavingOpEdit: updatePost.isPending,
    saveOpEdit,
    runDeleteOp,
    runRestorePost,
    runTogglePinOp,
    onReportOp,
    deletePost,
  };
}
