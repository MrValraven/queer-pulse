import { type RefObject } from "react";
import { type Reply, type ReplySortId } from "./forum.data";
import { type ReplyNode } from "./buildReplyTree";
import { ReplySortBar, ThreadReplies } from "./ThreadReplies";
import { ThreadComposer } from "./ThreadComposer";
import { type useThreadModeration } from "./useThreadModeration";
import { type useNestedReplyComposer } from "./useNestedReplyComposer";

/** The whole reply area of a thread: the sort bar, the reply tree (with its
 *  per-reply moderation actions and inline nested-reply composer), and the
 *  bottom "post a top-level reply" composer. Lifted out of ThreadPage for the
 *  same reason `useThreadModeration`/`useNestedReplyComposer` were — keeping
 *  the page component itself well under the line budget. Takes the two
 *  moderation/nested-reply hook results as-is (rather than re-flattening
 *  their fields into a dozen extra props), matching how ThreadPage already
 *  consumes them. */
export function ThreadReplySection({
  sort,
  setSort,
  count,
  loading,
  nodes,
  replyKey,
  likedReplies,
  toggleReplyLike,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  demoMode,
  demoOwns,
  moderation,
  nestedReplies,
  authorName,
  reply,
  setReply,
  onPost,
  textareaRef,
}: {
  sort: ReplySortId;
  setSort: (s: ReplySortId) => void;
  count: number;
  loading: boolean;
  /** Reply tree, already sorted (see buildReplyTree) — top-level nodes only;
   *  each node recurses into its own children. */
  nodes: ReplyNode[];
  replyKey: (r: Reply) => string;
  likedReplies: Record<string, boolean>;
  toggleReplyLike: (r: Reply) => void;
  /** Live mode only — demo passes `false`, so no "Load more" ever renders. */
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  demoMode: boolean;
  demoOwns: (person: { slug?: string; name?: string }) => boolean;
  moderation: ReturnType<typeof useThreadModeration>;
  nestedReplies: ReturnType<typeof useNestedReplyComposer>;
  authorName: string;
  reply: string;
  setReply: (v: string) => void;
  onPost: (body: string, parentPostId?: string | null) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <>
      <ReplySortBar count={count} sort={sort} setSort={setSort} />

      <ThreadReplies
        loading={loading}
        nodes={nodes}
        replyKey={replyKey}
        likedReplies={likedReplies}
        toggleReplyLike={toggleReplyLike}
        onFocusComposer={() => textareaRef.current?.focus()}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        demoMode={demoMode}
        demoOwns={demoOwns}
        editingReplyPostId={moderation.editingReplyPostId}
        onStartEdit={(replyItem) =>
          moderation.setEditingReplyPostId(
            replyItem.postId ?? replyKey(replyItem),
          )
        }
        onCancelEdit={() => moderation.setEditingReplyPostId(null)}
        onSaveEdit={moderation.saveReplyEdit}
        onDelete={moderation.onReplyDelete}
        onRestore={(replyItem) =>
          replyItem.postId && moderation.doRestorePost(replyItem.postId, false)
        }
        onHistory={(replyItem) =>
          replyItem.postId && moderation.setHistoryPostId(replyItem.postId)
        }
        collapsedIds={nestedReplies.collapsedIds}
        onToggleCollapse={nestedReplies.toggleCollapse}
        activeReplyTargetId={nestedReplies.replyTargetId}
        onStartReply={(replyItem) => nestedReplies.startReply(replyItem.id)}
        onCancelReply={nestedReplies.cancelReply}
        onPostReply={(body) => onPost(body, nestedReplies.replyTargetId)}
        inlineDraft={nestedReplies.inlineDraft}
        setInlineDraft={nestedReplies.setInlineDraft}
      />

      <ThreadComposer
        authorName={authorName}
        reply={reply}
        setReply={setReply}
        onPost={onPost}
        textareaRef={textareaRef}
      />
    </>
  );
}
