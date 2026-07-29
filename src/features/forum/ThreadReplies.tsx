import { useState } from "react";
import { Link } from "react-router-dom";
import { FiStar, FiHeart, FiMessageSquare } from "react-icons/fi";
import { Button, EmptyState, FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  MOD_ROLE_KEY,
  REPLY_SORTS,
  type Reply,
  type ReplySortId,
} from "./forum.data";
import { ForumAvatar, ProfileLink, OfficialBadge } from "./ForumAuthor";
import { authorHref, memberPath } from "./forumAuthor.helpers";
import { memberName } from "../members/data/members";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { ThreadRepliesSkeleton } from "./ThreadRepliesSkeleton";
import { MentionText } from "../../shared/mentions/MentionText";
import { MentionTextarea } from "../../shared/mentions/MentionTextarea";
import { PostActionsMenu } from "./PostActionsMenu";
import styles from "./ThreadPage.module.css";

/** Names the moderator who published an official QueerPulse post, linking to
 * their member profile — so the platform voice stays accountable to a person. */
export function ModeratorByline({ mod }: { mod?: string }) {
  const { t } = useTranslation();
  if (!mod) return null;
  const roleKey = MOD_ROLE_KEY[mod];
  const name = memberName(mod);
  return (
    <div className={styles.modBy}>
      <Translation
        i18nKey={roleKey ? "forum:byline.withRole" : "forum:byline.noRole"}
        components={{
          name: <Link to={memberPath(mod)} className={styles.modByLink} />,
        }}
        values={roleKey ? { name, role: t(roleKey) } : { name }}
      />
    </div>
  );
}

export function ReplySortBar({
  count,
  sort,
  setSort,
}: {
  count: number;
  sort: ReplySortId;
  setSort: (s: ReplySortId) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.replyBar}>
      <span className={styles.replyCount}>
        {t("forum:repliesCount", { count, formatted: fmt.number(count) })}
      </span>
      <div className={styles.replySort}>
        {REPLY_SORTS.map((s) => (
          <button
            type="button"
            key={s.id}
            className={[styles.sortBtn, sort === s.id && styles.sortBtnOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setSort(s.id)}
          >
            {t(s.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ThreadReplies({
  loading,
  replies,
  replyKey,
  likedReplies,
  toggleReplyLike,
  onFocusComposer,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  demoMode,
  demoOwns,
  editingReplyPostId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onRestore,
  onHistory,
}: {
  loading: boolean;
  replies: Reply[];
  replyKey: (r: Reply) => string;
  likedReplies: Record<string, boolean>;
  toggleReplyLike: (r: Reply) => void;
  onFocusComposer: () => void;
  /** Live mode only — demo passes `false`, so no "Load more" ever renders. */
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  demoMode: boolean;
  demoOwns: (person: { slug?: string; name?: string }) => boolean;
  editingReplyPostId: string | null;
  onStartEdit: (reply: Reply) => void;
  onCancelEdit: () => void;
  onSaveEdit: (postId: string, body: string) => void;
  onDelete: (reply: Reply) => void;
  onRestore: (reply: Reply) => void;
  onHistory: (reply: Reply) => void;
}) {
  const { t } = useTranslation();
  return (
    <div>
      {loading && <ThreadRepliesSkeleton count={3} />}
      {!loading && replies.length === 0 && (
        <EmptyState
          compact
          icon={<FiMessageSquare />}
          title={t("forum:replies.emptyTitle")}
          description={t("forum:replies.emptyDescription")}
          action={{
            label: t("forum:replies.emptyAction"),
            onClick: onFocusComposer,
          }}
        />
      )}
      {!loading &&
        replies.map((r, i) => {
          const isLiked = !!likedReplies[replyKey(r)];
          const replyIdentity = r.postId ?? replyKey(r);
          const isEditing = editingReplyPostId === replyIdentity;
          const canEdit = demoMode ? demoOwns(r) && !r.deleted : !!r.canEdit;
          const canDelete = demoMode
            ? demoOwns(r) && !r.deleted
            : !!r.canDelete;
          const canRestore = demoMode
            ? demoOwns(r) && !!r.deleted
            : !!r.canRestore;
          const canViewHistory = demoMode ? false : !!r.canViewHistory;
          return (
            <FadeIn
              key={replyKey(r)}
              delay={Math.min(i, 8) * 60}
              className={[styles.reply, r.helpful && styles.replyHighlighted]
                .filter(Boolean)
                .join(" ")}
            >
              <ProfileLink
                to={authorHref(r)}
                name={r.name}
                official={r.official}
                className={styles.avLink}
              >
                <ForumAvatar
                  className={styles.replyAv}
                  style={{ background: r.background, color: r.color }}
                  person={{
                    slug: r.slug,
                    photo: r.photo,
                    initials: r.avatar,
                    name: r.name,
                  }}
                />
              </ProfileLink>
              <div>
                <div className={styles.replyTop}>
                  <span className={styles.replyName}>
                    <ProfileLink
                      to={authorHref(r)}
                      name={r.name}
                      official={r.official}
                      className={styles.authorLink}
                    >
                      {r.name}
                    </ProfileLink>
                  </span>
                  <MemberStaffBadge slug={r.slug} />
                  {r.official && <OfficialBadge />}
                  {r.isOP && (
                    <span className={styles.opBadge}>
                      {t("forum:replies.opBadge")}
                    </span>
                  )}
                  {r.helpful && (
                    <span className={styles.helpfulBadge}>
                      <FiStar /> {t("forum:replies.mostHelpfulBadge")}
                    </span>
                  )}
                  <span className={styles.replyTime}>{r.time}</span>
                  <span className={styles.replyMenu}>
                    <PostActionsMenu
                      canEdit={canEdit}
                      canDelete={canDelete}
                      canRestore={canRestore}
                      canViewHistory={canViewHistory}
                      onEdit={() => onStartEdit(r)}
                      onDelete={() => onDelete(r)}
                      onRestore={() => onRestore(r)}
                      onHistory={() => onHistory(r)}
                    />
                  </span>
                </div>
                {r.official && r.mod && <ModeratorByline mod={r.mod} />}
                {r.deleted ? (
                  <div className={styles.replyBody}>
                    <p className={styles.tombstone}>
                      {t("forum:tombstone.body")}
                    </p>
                  </div>
                ) : isEditing ? (
                  <InlineReplyEditor
                    initial={r.body.join("\n")}
                    onCancel={onCancelEdit}
                    onSave={(next) => onSaveEdit(replyIdentity, next)}
                  />
                ) : (
                  <>
                    <div className={styles.replyBody}>
                      {r.quote && (
                        <div className={styles.quote}>
                          <cite>{r.quote.cite}</cite>
                          {r.quote.text}
                        </div>
                      )}
                      {r.body.map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex}>
                          <MentionText text={paragraph} />
                        </p>
                      ))}
                      {r.editedAt && (
                        <span className={styles.editedMark}>
                          {t("forum:edited.mark")}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-pressed={isLiked}
                      aria-label={
                        isLiked
                          ? t("forum:replies.unlikeAria")
                          : t("forum:replies.likeAria")
                      }
                      className={[
                        styles.replyReact,
                        isLiked && styles.replyReactOn,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => toggleReplyLike(r)}
                    >
                      <FiHeart /> {r.reactions + (isLiked ? 1 : 0)}
                    </button>
                  </>
                )}
              </div>
            </FadeIn>
          );
        })}

      {!loading && hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            type="button"
            variant="ghost"
            disabled={isFetchingNextPage}
            onClick={fetchNextPage}
          >
            {isFetchingNextPage
              ? t("forum:replies.loadingMore")
              : t("forum:replies.loadMoreCta")}
          </Button>
        </div>
      )}
    </div>
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
