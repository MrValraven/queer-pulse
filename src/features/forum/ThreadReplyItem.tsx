import { useState } from "react";
import { FiStar, FiHeart } from "react-icons/fi";
import { Button, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { type Reply } from "./forum.data";
import { ForumAvatar, ProfileLink, OfficialBadge } from "./ForumAuthor";
import { authorHref } from "./forumAuthor.helpers";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { MentionText } from "../../shared/mentions/MentionText";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import { PostActionsMenu } from "./PostActionsMenu";
import { ModeratorByline } from "./ThreadReplies";
import styles from "./ThreadPage.module.css";

/** Nested-replies collapse affordance for one reply. `count` is the number of
 *  descendant replies hidden while `collapsed` is true (ThreadReplyNode owns
 *  the actual show/hide of the subtree; this only renders the toggle). */
export interface ThreadReplyCollapseProps {
  collapsed: boolean;
  count: number;
  onToggle: () => void;
}

export function ThreadReplyItem({
  reply,
  index,
  replyKey,
  isLiked,
  toggleReplyLike,
  demoMode,
  demoOwns,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onRestore,
  onHistory,
  onReply,
  collapse,
}: {
  reply: Reply;
  index: number;
  replyKey: (reply: Reply) => string;
  isLiked: boolean;
  toggleReplyLike: (reply: Reply) => void;
  demoMode: boolean;
  demoOwns: (person: { slug?: string; name?: string }) => boolean;
  isEditing: boolean;
  onStartEdit: (reply: Reply) => void;
  onCancelEdit: () => void;
  onSaveEdit: (postId: string, body: string) => void;
  onDelete: (reply: Reply) => void;
  onRestore: (reply: Reply) => void;
  onHistory: (reply: Reply) => void;
  /** Nested-replies feature: renders a "Reply" action next to the like button
   *  when provided. Omitted call sites (none left) keep today's behaviour. */
  onReply?: (reply: Reply) => void;
  /** Nested-replies feature: renders a compact collapse/expand toggle near the
   *  author line when the reply has descendants. */
  collapse?: ThreadReplyCollapseProps;
}) {
  const { t } = useTranslation();
  const replyIdentity = reply.postId ?? replyKey(reply);
  const canEdit = demoMode ? demoOwns(reply) && !reply.deleted : !!reply.canEdit;
  const canDelete = demoMode
    ? demoOwns(reply) && !reply.deleted
    : !!reply.canDelete;
  const canRestore = demoMode
    ? demoOwns(reply) && !!reply.deleted
    : !!reply.canRestore;
  const canViewHistory = demoMode ? false : !!reply.canViewHistory;
  return (
    <FadeIn
      delay={Math.min(index, 8) * 60}
      className={[styles.reply, reply.helpful && styles.replyHighlighted]
        .filter(Boolean)
        .join(" ")}
    >
      <ProfileLink
        to={authorHref(reply)}
        name={reply.name}
        official={reply.official}
        className={styles.avLink}
      >
        <ForumAvatar
          className={styles.replyAv}
          style={{ background: reply.background, color: reply.color }}
          person={{
            slug: reply.slug,
            photo: reply.photo,
            initials: reply.avatar,
            name: reply.name,
          }}
        />
      </ProfileLink>
      <div>
        <div className={styles.replyTop}>
          {collapse && (
            <button
              type="button"
              className={styles.collapseToggle}
              aria-expanded={!collapse.collapsed}
              aria-label={t(
                collapse.collapsed
                  ? "forum:replies.expandAria"
                  : "forum:replies.collapseAria",
              )}
              onClick={collapse.onToggle}
            >
              {collapse.collapsed ? "+" : "–"}
            </button>
          )}
          {collapse?.collapsed && (
            <span className={styles.collapsedCount}>{collapse.count}</span>
          )}
          <span className={styles.replyName}>
            <ProfileLink
              to={authorHref(reply)}
              name={reply.name}
              official={reply.official}
              className={styles.authorLink}
            >
              {reply.name}
            </ProfileLink>
          </span>
          <MemberStaffBadge slug={reply.slug} />
          {reply.official && <OfficialBadge />}
          {reply.isOP && (
            <span className={styles.opBadge}>{t("forum:replies.opBadge")}</span>
          )}
          {reply.helpful && (
            <span className={styles.helpfulBadge}>
              <FiStar /> {t("forum:replies.mostHelpfulBadge")}
            </span>
          )}
          <span className={styles.replyTime}>{reply.time}</span>
          <span className={styles.replyMenu}>
            <PostActionsMenu
              canEdit={canEdit}
              canDelete={canDelete}
              canRestore={canRestore}
              canViewHistory={canViewHistory}
              onEdit={() => onStartEdit(reply)}
              onDelete={() => onDelete(reply)}
              onRestore={() => onRestore(reply)}
              onHistory={() => onHistory(reply)}
            />
          </span>
        </div>
        {reply.official && reply.mod && <ModeratorByline mod={reply.mod} />}
        {reply.deleted ? (
          <div className={styles.replyBody}>
            <p className={styles.tombstone}>
              {t(
                reply.removedByModerator
                  ? "forum:tombstone.removedByModerator"
                  : "forum:tombstone.body",
              )}
            </p>
          </div>
        ) : isEditing ? (
          <InlineReplyEditor
            initial={reply.body.join("\n")}
            onCancel={onCancelEdit}
            onSave={(next) => onSaveEdit(replyIdentity, next)}
          />
        ) : (
          <>
            <div className={styles.replyBody}>
              {reply.quote && (
                <div className={styles.quote}>
                  <cite>{reply.quote.cite}</cite>
                  {reply.quote.text}
                </div>
              )}
              {reply.body.map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>
                  <MentionText text={paragraph} />
                </p>
              ))}
              {reply.editedAt && (
                <span className={styles.editedMark}>
                  {t("forum:edited.mark")}
                </span>
              )}
            </div>
            <div className={styles.replyActions}>
              <button
                type="button"
                aria-pressed={isLiked}
                aria-label={
                  isLiked
                    ? t("forum:replies.unlikeAria")
                    : t("forum:replies.likeAria")
                }
                className={[styles.replyReact, isLiked && styles.replyReactOn]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => toggleReplyLike(reply)}
              >
                <FiHeart /> {reply.reactions + (isLiked ? 1 : 0)}
              </button>
              {onReply && (
                <button
                  type="button"
                  className={styles.replyReplyBtn}
                  onClick={() => onReply(reply)}
                >
                  {t("forum:replies.reply")}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </FadeIn>
  );
}

function InlineReplyEditor({
  initial,
  onCancel,
  onSave,
}: {
  initial: string;
  onCancel: () => void;
  onSave: (next: string) => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState(initial);
  const trimmed = value.trim();
  return (
    <div className={styles.inlineEdit}>
      <MentionTextarea
        className={styles.inlineTextarea}
        aria-label={t("forum:replyEdit.textareaAria")}
        value={value}
        onChange={setValue}
        rows={4}
      />
      <div className={styles.inlineActions}>
        <Button variant="ghost" type="button" onClick={onCancel}>
          {t("forum:replyEdit.cancel")}
        </Button>
        <Button
          variant="primary"
          type="button"
          disabled={!trimmed || trimmed === initial}
          onClick={() => onSave(trimmed)}
        >
          {t("forum:replyEdit.save")}
        </Button>
      </div>
    </div>
  );
}
