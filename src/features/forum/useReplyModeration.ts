import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Reply } from "./forum.data";
import { type useEditPost } from "./api/useForumMutations";

type PostIdMutate = (
  variables: { postId: string },
  options: { onSuccess: () => void; onError: () => void },
) => void;

/**
 * Owns the reply-level moderation slice — inline-edit state and the
 * optimistic-apply/persist/rollback runner shared by delete/restore/edit.
 * Lifted out of `useThreadModeration`.
 */
export function useReplyModeration({
  demoMode,
  localReplies,
  setLocalReplies,
  replyKey,
  editPost,
  onMutateError,
}: {
  demoMode: boolean;
  /** The reply list as currently rendered — snapshotted before an optimistic
   *  change so a failed request can restore it verbatim. */
  localReplies: Reply[];
  setLocalReplies: React.Dispatch<React.SetStateAction<Reply[]>>;
  replyKey: (reply: Reply) => string;
  editPost: ReturnType<typeof useEditPost>;
  onMutateError: () => void;
}) {
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [editingReplyPostId, setEditingReplyPostId] = useState<string | null>(
    null,
  );

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
    mutate: PostIdMutate;
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
          ? {
              ...currentReply,
              body: [body],
              editedAt: new Date().toISOString(),
            }
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

  return {
    editingReplyPostId,
    setEditingReplyPostId,
    runReplyOp,
    saveReplyEdit,
  };
}
