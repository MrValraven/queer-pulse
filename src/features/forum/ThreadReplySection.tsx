import { type RefObject } from "react";
import { FiLock } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Reply, type ReplySortId } from "./forum.data";
import { type ReplyNode } from "./buildReplyTree";
import { ReplySortBar, ThreadReplies } from "./ThreadReplies";
import { ThreadComposer } from "./ThreadComposer";
import { replyDraftId } from "./api/forumDrafts.api";
import type { StagedPostImage } from "../communities/usePostImageAttach";
import { thread as threadPath } from "../../app/routeMap";
import { type useThreadModeration } from "./useThreadModeration";
import { type useNestedReplyComposer } from "./useNestedReplyComposer";
import styles from "./ThreadPage.module.css";

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
  isLocked,
  lockReason,
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
  threadSlug,
  threadTitle,
  reply,
  setReply,
  onPost,
  onAcceptAnswer,
  onQuote,
  textareaRef,
}: {
  sort: ReplySortId;
  setSort: (s: ReplySortId) => void;
  count: number;
  loading: boolean;
  /** When true, replies are closed: no reply/nested-reply composers render and
   *  a banner stands in for the bottom composer. */
  isLocked: boolean;
  /** Optional moderator note explaining why the thread was locked, shown on
   *  the locked banner. Live-only; undefined/null in demo. */
  lockReason?: string | null;
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
  demoOwns: (person: { slug?: string; isMine?: boolean }) => boolean;
  moderation: ReturnType<typeof useThreadModeration>;
  nestedReplies: ReturnType<typeof useNestedReplyComposer>;
  authorName: string;
  /** The thread's backend slug, keying its autosaved reply draft. Undefined on
   *  a demo mock thread, where the draft falls back to the numeric id. */
  threadSlug: string | undefined;
  /** Row title on the member's drafts list, so a recovered reply says which
   *  conversation it belongs to. */
  threadTitle: string;
  reply: string;
  setReply: (v: string) => void;
  onPost: (
    body: string,
    parentPostId?: string | null,
    image?: StagedPostImage,
  ) => void;
  /** Mark this reply as the thread's answer, or clear the mark. Omitted for a
   *  viewer who is neither the thread's author nor a moderator, which is what
   *  hides the action. */
  onAcceptAnswer?: (replyItem: Reply) => void;
  /** Start a reply that quotes this one. */
  onQuote: (replyItem: Reply) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <>
      <ReplySortBar count={count} sort={sort} setSort={setSort} />

      <ThreadReplies
        loading={loading}
        isLocked={isLocked}
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
        onPostReply={(body, image) =>
          onPost(body, nestedReplies.replyTargetId, image)
        }
        onAcceptAnswer={onAcceptAnswer}
        onQuote={onQuote}
        onReport={(replyItem) =>
          // Report the reply's REAL backend post (`postId`); demo replies carry
          // no postId, so fall back to the local id (demo never hits the network).
          moderation.setReportTarget({
            authorName: replyItem.name,
            subjectId: replyItem.postId ?? replyItem.id,
            subjectType: "reply",
          })
        }
        inlineDraft={nestedReplies.inlineDraft}
        setInlineDraft={nestedReplies.setInlineDraft}
      />

      {isLocked ? (
        <LockedBanner reason={lockReason} />
      ) : (
        <ThreadComposer
          authorName={authorName}
          reply={reply}
          setReply={setReply}
          onPost={(body, image) => onPost(body, null, image)}
          textareaRef={textareaRef}
          draft={{
            draftId: replyDraftId(threadSlug ?? "unsaved"),
            title: threadTitle,
            href: threadPath(threadSlug ?? ""),
          }}
        />
      )}
    </>
  );
}

/** Stands in for the reply composer when a moderator has closed replies. Uses
 *  the plum-panel pattern (plum surface, cream text) with a lock icon — warm,
 *  not punitive: the conversation is still fully readable above. Shows the
 *  moderator's reason note when one was given, instead of the same generic
 *  copy on every locked thread. */
function LockedBanner({ reason }: { reason?: string | null }) {
  const { t } = useTranslation();
  return (
    <div className={styles.lockedBanner} role="status">
      <FiLock className={styles.lockedIcon} aria-hidden="true" />
      <div>
        <p className={styles.lockedTitle}>{t("forum:locked.title")}</p>
        <p className={styles.lockedBody}>
          {reason
            ? t("forum:locked.reasonBody", { reason })
            : t("forum:locked.body")}
        </p>
      </div>
    </div>
  );
}
