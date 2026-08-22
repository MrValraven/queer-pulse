import { useEffect, useState } from "react";
import { FiCornerUpLeft } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { ConfirmDeleteModal } from "../forum/ConfirmDeleteModal";
import type { Post, PostReply, Reaction, ReactionKey } from "./community.model";
import type { Person } from "./communityDetails";
import type { roleLookup } from "./communityPeople";
import { ReactionBar } from "./CommunityBadges";
import {
  usePulsePostPermissions,
  usePulsePostState,
} from "./usePulsePostState";
import { CommunityInlineTextEditor } from "./CommunityInlineTextEditor";
import { CommunityHistoryModal } from "./CommunityHistoryModal";
import { PulsePostHeader, PulsePinnedFlag } from "./PulsePostHeader";
import { PulsePostReplies, PulseReplyBar } from "./PulsePostReplies";
import detail from "./CommunityDetailPage.module.css";
import styles from "./PulseTab.module.css";

function toggleReaction(reactions: Reaction[], key: ReactionKey): Reaction[] {
  return reactions.map((reaction) =>
    reaction.key === key
      ? {
          ...reaction,
          reacted: !reaction.reacted,
          count: reaction.count + (reaction.reacted ? -1 : 1),
        }
      : reaction,
  );
}

/** The post's own content: a tombstone, the inline editor, or the body text
 *  plus any attached photo. */
function PulsePostBody({
  post,
  body,
  isDeleted,
  isEditing,
  isSavingEdit,
  onCancelEdit,
  onSaveEdit,
}: {
  post: Post;
  body: string;
  isDeleted: boolean;
  isEditing: boolean;
  isSavingEdit: boolean;
  onCancelEdit: () => void;
  onSaveEdit: (next: string) => void;
}) {
  const { t } = useTranslation();
  if (isDeleted) {
    return (
      <p className={detail.tombstone}>
        {t("communities:detail.thread.tombstone")}
      </p>
    );
  }
  if (isEditing) {
    return (
      <CommunityInlineTextEditor
        initial={body}
        isBusy={isSavingEdit}
        onCancel={onCancelEdit}
        onSave={onSaveEdit}
      />
    );
  }
  return (
    <>
      <p className={styles.pBody}>{body}</p>
      {post.image && (
        <div className={styles.pImg}>
          <img
            src={post.image}
            alt={t("communities:detail.pulse.imageAlt", {
              name: post.author.name,
            })}
            loading="lazy"
          />
        </div>
      )}
    </>
  );
}

export function PulsePost({
  post,
  roleOf,
  isMember,
  viewer,
  isPinned = false,
  canModerate = false,
  onReactPost,
  onReplyPost,
  onTogglePin,
  onReportPost,
  onReportReply,
}: {
  post: Post;
  roleOf: (author: Post["author"]) => ReturnType<ReturnType<typeof roleLookup>>;
  /** Members can react and reply; non-members see counts read-only. */
  isMember: boolean;
  /** The signed-in viewer, so their own optimistic reply shows their real
   *  name/avatar rather than a generic "You". */
  viewer: Person | null;
  isPinned?: boolean;
  /** Owner/mod — gates the pin/unpin action. */
  canModerate?: boolean;
  /** Persist a reaction toggle (no-op in demo — local state owns the UI).
   *  `onFailed` rolls the optimistic pill back when the write is refused. */
  onReactPost?: (
    id: string,
    key: ReactionKey,
    willReact: boolean,
    onFailed: () => void,
  ) => void;
  /** Persist a reply (no-op in demo). `onDone` fires when the live mutation
   *  succeeds so the caller can clear its optimistic reply copy; `onFailed`
   *  fires on error so the caller can roll the optimistic reply back. */
  onReplyPost?: (
    id: string,
    text: string,
    onDone?: () => void,
    onFailed?: () => void,
  ) => void;
  onTogglePin?: (post: Post) => void;
  onReportPost?: (post: Post) => void;
  /** Member-only report on a reply that isn't the viewer's own. */
  onReportReply?: (reply: PostReply) => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const editing = usePulsePostState(post);
  const permissions = usePulsePostPermissions({
    post,
    viewer,
    isMember,
    canModerate,
    isDeleted: editing.isDeleted,
    demoMode,
  });
  const [reactions, setReactions] = useState(post.reactions);
  // Re-sync from the server whenever this post's reactions change (a refetch
  // after load-more or a socket invalidation), so the optimistic local copy
  // doesn't drift from the true counts.
  useEffect(() => {
    setReactions(post.reactions);
  }, [post.reactions]);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [added, setAdded] = useState<PostReply[]>([]);
  const replies = [...post.replies, ...added];
  // `replies` above is a bounded preview (+ locally-added optimistic replies).
  // The TRUE total is `post.replyCount` (absent in demo, where the mock's
  // `replies` array already IS the whole list).
  const replyCount = (post.replyCount ?? post.replies.length) + added.length;

  const react = (key: ReactionKey) => {
    const before = reactions;
    const willReact = !reactions.find((reaction) => reaction.key === key)
      ?.reacted;
    setReactions((current) => toggleReaction(current, key));
    // A refused reaction puts the pill and the count back where they were,
    // rather than leaving a "reacted" state the server never recorded.
    onReactPost?.(post.id, key, willReact, () => setReactions(before));
  };

  const sendReply = () => {
    const text = replyDraft.trim();
    if (!text) return;
    const optimisticReply: PostReply = {
      author: viewer ?? { initials: "?", name: "", tint: "plum" },
      text,
      createdAt: new Date().toISOString(),
    };
    setAdded((prev) => [...prev, optimisticReply]);
    setReplyDraft("");
    onReplyPost?.(
      post.id,
      text,
      () => setAdded([]),
      () => setAdded((prev) => prev.filter((item) => item !== optimisticReply)),
    );
  };

  const replyLabel = replyCount
    ? t("communities:detail.pulse.replyLabel", { count: replyCount })
    : t("communities:detail.pulse.replyAction");

  return (
    <article
      className={[styles.post, isPinned && styles.pinned]
        .filter(Boolean)
        .join(" ")}
    >
      {isPinned && <PulsePinnedFlag />}
      <PulsePostHeader
        post={post}
        roleOf={roleOf}
        permissions={permissions}
        editedAt={editing.editedAt}
        onEdit={() => editing.setIsEditing(true)}
        onDelete={() => editing.setIsConfirmingDelete(true)}
        onRestore={editing.runRestore}
        onHistory={() => editing.setIsShowingHistory(true)}
        onTogglePin={() => onTogglePin?.(post)}
        onReport={() => onReportPost?.(post)}
      />
      <PulsePostBody
        post={post}
        body={editing.body}
        isDeleted={editing.isDeleted}
        isEditing={editing.isEditing}
        isSavingEdit={editing.isSavingEdit}
        onCancelEdit={() => editing.setIsEditing(false)}
        onSaveEdit={editing.saveEdit}
      />
      <div className={styles.pFoot}>
        <ReactionBar
          reactions={reactions}
          onReact={react}
          readOnly={!isMember}
        />
        {isMember ? (
          <Button
            variant="ghost"
            size="sm"
            className={styles.replyBtn}
            aria-expanded={isReplyOpen}
            onClick={() => setIsReplyOpen((open) => !open)}
          >
            <FiCornerUpLeft aria-hidden /> {replyLabel}
          </Button>
        ) : (
          replyCount > 0 && (
            <span className={styles.replyCount}>
              <FiCornerUpLeft aria-hidden /> {replyLabel}
            </span>
          )
        )}
      </div>
      <PulsePostReplies
        replies={replies}
        canReportReply={(reply) =>
          isMember && !permissions.isOwnReply(reply) && !reply.deleted
        }
        onReportReply={(reply) => onReportReply?.(reply)}
      />
      {isReplyOpen && (
        <PulseReplyBar
          value={replyDraft}
          onChange={setReplyDraft}
          onSend={sendReply}
        />
      )}
      {editing.isConfirmingDelete && (
        <ConfirmDeleteModal
          busy={editing.isDeletePending}
          onConfirm={editing.runDelete}
          onClose={() => editing.setIsConfirmingDelete(false)}
        />
      )}
      {editing.isShowingHistory && (
        <CommunityHistoryModal
          slug={post.communitySlug}
          postId={post.id}
          replyId={undefined}
          onClose={() => editing.setIsShowingHistory(false)}
        />
      )}
    </article>
  );
}
