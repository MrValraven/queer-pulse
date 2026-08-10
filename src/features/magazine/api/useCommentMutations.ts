import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import {
  addArticleComment,
  replyToArticleComment,
  resolveArticleComment,
  type ArticleCommentDto,
} from "./pieces.api";
import { articleCommentsQueryKey } from "./useArticleComments";

/** A synthetic id for a demo-only comment/reply — never sent to a server,
 *  only ever used as a React `key` and a tree-patch target within the same
 *  session. */
function demoCommentId(): string {
  return `demo-comment-${Math.random().toString(36).slice(2, 10)}`;
}

function buildDemoNode(
  author: string,
  body: string,
  blockId: string | null,
  parentId: string | null,
): ArticleCommentDto {
  return {
    id: demoCommentId(),
    blockId,
    parentId,
    author,
    body,
    resolved: false,
    createdAt: new Date().toISOString(),
    replies: [],
  };
}

/** Appends a reply to its parent's `replies` (oldest-first, so a new reply
 *  goes at the end) — the parent is always a top-level comment (see
 *  `ArticleCommentDto`'s doc comment), so this never needs to recurse. */
function appendReply(
  tree: ArticleCommentDto[],
  parentId: string,
  newReply: ArticleCommentDto,
): ArticleCommentDto[] {
  return tree.map((comment) =>
    comment.id === parentId
      ? { ...comment, replies: [...comment.replies, newReply] }
      : comment,
  );
}

function patchResolved(
  tree: ArticleCommentDto[],
  commentId: string,
  resolved: boolean,
): ArticleCommentDto[] {
  return tree.map((comment) => {
    if (comment.id === commentId) return { ...comment, resolved };
    if (comment.replies.length === 0) return comment;
    return { ...comment, replies: patchResolved(comment.replies, commentId, resolved) };
  });
}

/**
 * Write side of the NotesRail (Phase 7 Wave D), dual-mode. Demo never
 * touches the network — each action patches `useArticleComments`' own query
 * cache directly (via `queryClient.setQueryData`, keyed identically) so the
 * new note/reply or the resolve toggle is immediately visible, plus a toast
 * confirming the (local-only) write. Live mode calls the real endpoint, then
 * ALWAYS invalidates the comments query rather than trusting the mutation
 * response: `addArticleComment`/`replyToArticleComment`/`resolveArticleComment`
 * each return only the single row they touched with `replies: []`, which
 * would silently drop any existing replies if patched into place directly
 * (see the Task D1 backend report).
 */
export function useCommentMutations(pieceId: string) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const queryKey = articleCommentsQueryKey(demoMode, pieceId);
  const demoAuthor = t("magazine:write.notes.you");

  function invalidate(): void {
    void queryClient.invalidateQueries({ queryKey });
  }

  const addComment = useMutation<void, Error, { body: string; blockId?: string }>({
    mutationFn: async ({ body, blockId }) => {
      if (demoMode) {
        const newComment = buildDemoNode(demoAuthor, body, blockId ?? null, null);
        queryClient.setQueryData<ArticleCommentDto[]>(queryKey, (tree = []) => [
          newComment,
          ...tree,
        ]);
        showToast(t("magazine:write.notes.addToast"), "success");
        return;
      }
      await addArticleComment(pieceId, { body, blockId });
    },
    onSuccess: () => {
      if (!demoMode) invalidate();
    },
  });

  const reply = useMutation<void, Error, { commentId: string; body: string }>({
    mutationFn: async ({ commentId, body }) => {
      if (demoMode) {
        const newReply = buildDemoNode(demoAuthor, body, null, commentId);
        queryClient.setQueryData<ArticleCommentDto[]>(queryKey, (tree = []) =>
          appendReply(tree, commentId, newReply),
        );
        showToast(t("magazine:write.notes.replyToast"), "success");
        return;
      }
      await replyToArticleComment(commentId, { body });
    },
    onSuccess: () => {
      if (!demoMode) invalidate();
    },
  });

  const toggleResolve = useMutation<void, Error, { commentId: string; resolved: boolean }>({
    mutationFn: async ({ commentId, resolved }) => {
      if (demoMode) {
        queryClient.setQueryData<ArticleCommentDto[]>(queryKey, (tree = []) =>
          patchResolved(tree, commentId, resolved),
        );
        showToast(
          resolved
            ? t("magazine:write.notes.resolveToast")
            : t("magazine:write.notes.reopenToast"),
          "success",
        );
        return;
      }
      await resolveArticleComment(commentId, resolved);
    },
    onSuccess: () => {
      if (!demoMode) invalidate();
    },
  });

  return { addComment, reply, toggleResolve };
}
