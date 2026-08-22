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

  /**
   * Apply an optimistic change to the reply list, persist it, and put the list
   * back exactly as it was if the request fails.
   *
   * Every reply-level moderation action used to toast "success" the instant it
   * was queued and never undo its local change, so a 403/500 left the member
   * looking at an edit or a tombstone that the server had refused. Now the
   * success toast fires from `onSuccess` and the pre-change snapshot is
   * restored from `onError`.
   */
  function runReplyOp({
    patch,
    postId,
    mutate,
    successKey,
  }: {
    patch: (replies: Reply[]) => Reply[];
    postId: string;
    mutate: (
      variables: { postId: string },
      options: { onSuccess: () => void; onError: () => void },
    ) => void;
    successKey: string;
  }) {
    const snapshot = localReplies;
    setLocalReplies(patch);
    if (demoMode) {
      // Demo never reaches the network: the local list IS the record.
      showToast(t(successKey), "success");
      return;
    }
    mutate(
      { postId },
      {
        onSuccess: () => showToast(t(successKey), "success"),
        onError: () => {
          setLocalReplies(snapshot);
          onMutateError();
        },
      },
    );
  }

  function saveReplyEdit(postId: string, body: string) {
    const snapshot = localReplies;
    setLocalReplies((prev) =>
      prev.map((currentReply) =>
        currentReply.postId === postId ||
        (demoMode && replyKey(currentReply) === postId)
          ? { ...currentReply, body: [body], editedAt: new Date().toISOString() }
          : currentReply,
      ),
    );
    setEditingReplyPostId(null);
    if (demoMode) {
      showToast(t("forum:toast.editSaved"), "success");
      return;
    }
    editPost.mutate(
      { postId, body },
      {
        onSuccess: () => showToast(t("forum:toast.editSaved"), "success"),
        onError: () => {
          setLocalReplies(snapshot);
          onMutateError();
        },
      },
    );
  }

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

  /** The OP-card equivalent of `runReplyOp`: demo tombstones/restores through
   *  `opOverride`, live persists first and only then confirms. Live reads the
   *  DTO's `deleted` flag (refetched by `invalidateThread`), so there is no
   *  local live state to roll back. */
  function runOpOverrideOp({
    override,
    postId,
    mutate,
    successKey,
  }: {
    override: OpOverride;
    postId: string;
    mutate: (
      variables: { postId: string },
      options: { onSuccess: () => void; onError: () => void },
    ) => void;
    successKey: string;
  }) {
    if (demoMode) {
      setOpOverride((prev) => ({ ...prev, ...override }));
      showToast(t(successKey), "success");
      return;
    }
    mutate(
      { postId },
      {
        onSuccess: () => showToast(t(successKey), "success"),
        onError: onMutateError,
      },
    );
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
    setEditingOp(false);
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
      showToast(t("forum:toast.editSaved"), "success");
      return;
    }
    // An OP edit can be up to two requests (title + body). Both must settle
    // before confirming, so "Your edit is live" can never precede the server
    // accepting it. `mutateAsync` rejects on failure; the rejection handler
    // reports it honestly instead of a contradictory second toast.
    const pending: Promise<unknown>[] = [];
    if (next.title !== thread.title)
      pending.push(editTitle.mutateAsync({ title: next.title }));
    // Compare against the snapshot EditOpModal was opened with, not a fresh
    // `thread.body.join("\n")` — the latter can drift from a background
    // refetch while the modal is open, spuriously firing a body edit when the
    // member only changed the title. See `editingOpInitialBody` above.
    if (thread.opPostId && next.body !== editingOpInitialBody)
      pending.push(
        editPost.mutateAsync({ postId: thread.opPostId, body: next.body }),
      );
    void Promise.all(pending).then(
      () => showToast(t("forum:toast.editSaved"), "success"),
      () => onMutateError(),
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
