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

type OpOverride = {
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

/** Owns every moderation concern for a thread — the edit/delete/restore/history
 * UI state, the four backend mutations, and the handlers that drive them —
 * lifting them out of ThreadPage so both stay well under the line budget.
 * Behaviour is identical to the inline handlers it replaces. `thread` may be
 * undefined before the live fetch resolves; handlers guard on it. */
export function useThreadModeration({
  thread,
  demoMode,
  setLocalReplies,
  replyKey,
}: {
  thread: Thread | undefined;
  demoMode: boolean;
  setLocalReplies: React.Dispatch<React.SetStateAction<Reply[]>>;
  replyKey: (reply: Reply) => string;
}) {
  const { showToast } = useToast();
  const { t } = useTranslation();

  const editPost = useEditPost();
  const deletePost = useDeletePost();
  const restorePost = useRestorePost();
  const editTitle = useEditThreadTitle(thread?.id ?? 0);

  const [editingReplyPostId, setEditingReplyPostId] = useState<string | null>(
    null,
  );
  const [editingOp, setEditingOp] = useState(false);
  // Snapshot of the OP body exactly as EditOpModal was initialized with, so
  // `saveOpEdit` can tell a genuine body change from a title-only edit even if
  // `thread.body` itself changes (e.g. a background refetch) while the modal is
  // open — comparing against a live-recomputed `thread.body.join("\n")` would
  // misfire in that window.
  const [editingOpInitialBody, setEditingOpInitialBody] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<{
    postId: string;
    isOp: boolean;
  } | null>(null);
  const [historyPostId, setHistoryPostId] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<ForumReportTarget | null>(
    null,
  );
  // Demo-only local overrides for the OP card (live refetches after mutation).
  const [opOverride, setOpOverride] = useState<{
    title?: string;
    body?: string[];
    deleted?: boolean;
    editedAt?: string | null;
  }>({});

  const onMutateError = () => showToast(t("forum:toast.error"), "error");

  function saveReplyEdit(postId: string, body: string) {
    setLocalReplies((prev) =>
      prev.map((currentReply) =>
        currentReply.postId === postId ||
        (demoMode && replyKey(currentReply) === postId)
          ? { ...currentReply, body: [body], editedAt: new Date().toISOString() }
          : currentReply,
      ),
    );
    setEditingReplyPostId(null);
    if (!demoMode)
      editPost.mutate({ postId, body }, { onError: onMutateError });
    showToast(t("forum:toast.editSaved"), "success");
  }

  function doDeletePost(postId: string, isOp: boolean) {
    if (isOp) {
      if (demoMode) setOpOverride((prev) => ({ ...prev, deleted: true }));
      else deletePost.mutate({ postId }, { onError: onMutateError });
    } else {
      setLocalReplies((prev) =>
        prev.map((currentReply) =>
          currentReply.postId === postId
            ? { ...currentReply, deleted: true }
            : currentReply,
        ),
      );
      if (!demoMode) deletePost.mutate({ postId }, { onError: onMutateError });
    }
    setConfirmDelete(null);
    showToast(t("forum:toast.deleted"), "success");
  }

  function doRestorePost(postId: string, isOp: boolean) {
    if (isOp) {
      if (demoMode) setOpOverride((prev) => ({ ...prev, deleted: false }));
      else restorePost.mutate({ postId }, { onError: onMutateError });
    } else {
      setLocalReplies((prev) =>
        prev.map((currentReply) =>
          currentReply.postId === postId
            ? { ...currentReply, deleted: false }
            : currentReply,
        ),
      );
      if (!demoMode) restorePost.mutate({ postId }, { onError: onMutateError });
    }
    showToast(t("forum:toast.restored"), "success");
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

  function saveOpEdit(next: { title: string; body: string }) {
    if (!thread) return;
    if (demoMode) {
      setOpOverride((prev) => ({
        ...prev,
        title: next.title,
        body: next.body
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        editedAt: new Date().toISOString(),
      }));
    } else {
      if (next.title !== thread.title)
        editTitle.mutate({ title: next.title }, { onError: onMutateError });
      // Compare against the snapshot EditOpModal was opened with, not a fresh
      // `thread.body.join("\n")` — the latter can drift from a background
      // refetch while the modal is open, spuriously firing a body edit when the
      // member only changed the title. See `editingOpInitialBody` above.
      if (thread.opPostId && next.body !== editingOpInitialBody)
        editPost.mutate(
          { postId: thread.opPostId, body: next.body },
          { onError: onMutateError },
        );
    }
    setEditingOp(false);
    showToast(t("forum:toast.editSaved"), "success");
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
