import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { CATS, CAT_STYLE, type Thread } from "./forum.data";
import { ForumAvatar, ProfileLink, OfficialBadge } from "./ForumAuthor";
import { authorHref } from "./forumAuthor.helpers";
import { ModeratorByline } from "./ThreadReplies";
import { MentionText } from "../../shared/mentions/MentionText";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { PostActionsMenu } from "./PostActionsMenu";
import styles from "./ThreadPage.module.css";

export function ThreadOpCard({
  thread,
  title,
  body,
  editedAt,
  deleted,
  liked,
  setLiked,
  bookmarked,
  setBookmarked,
  onReport,
  canEdit,
  canDelete,
  canRestore,
  canViewHistory,
  onEdit,
  onDelete,
  onRestore,
  onHistory,
}: {
  thread: Thread;
  title: string;
  body: string[];
  editedAt: string | null;
  deleted: boolean;
  liked: boolean;
  setLiked: (fn: (v: boolean) => boolean) => void;
  bookmarked: boolean;
  setBookmarked: (fn: (v: boolean) => boolean) => void;
  onReport: () => void;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canViewHistory: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onHistory: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const catMeta = CATS.find((c) => c.id === thread.category);
  const catColor = CAT_STYLE[thread.category]?.color ?? "var(--plum)";

  return (
    <div className={styles.opCard}>
      <div className={styles.opHead}>
        <ProfileLink
          to={authorHref(thread.author)}
          name={thread.author.name}
          official={thread.author.official}
          className={styles.avLink}
        >
          <ForumAvatar
            className={styles.opAv}
            style={{ background: thread.author.background, color: thread.author.color }}
            person={{
              slug: thread.author.slug,
              photo: thread.author.photo,
              initials: thread.author.initials,
              name: thread.author.name,
            }}
          />
        </ProfileLink>
        <div>
          <div className={styles.opName}>
            <ProfileLink
              to={authorHref(thread.author)}
              name={thread.author.name}
              official={thread.author.official}
              className={styles.authorLink}
            >
              {thread.author.name}
            </ProfileLink>
            <MemberStaffBadge slug={thread.author.slug} />
            {thread.author.official && <OfficialBadge />}
          </div>
          <ModeratorByline mod={thread.author.mod} />
          <div className={styles.opSub}>
            <span className={styles.opCat} style={{ color: catColor }}>
              {catMeta && t(catMeta.nameKey)}
            </span>
            <span>·</span>
            <span>
              {t("forum:threadOp.postedPrefix", { time: thread.posted })}
            </span>
            <span>·</span>
            <span>
              {t("forum:threadOp.viewsCount", {
                count: thread.views,
                formatted: fmt.number(thread.views),
              })}
            </span>
            {editedAt && (
              <>
                <span>·</span>
                <span className={styles.editedMark}>
                  {t("forum:edited.mark")}
                </span>
              </>
            )}
          </div>
        </div>
        <div className={styles.opMenu}>
          <PostActionsMenu
            canEdit={canEdit}
            canDelete={canDelete}
            canRestore={canRestore}
            canViewHistory={canViewHistory}
            onEdit={onEdit}
            onDelete={onDelete}
            onRestore={onRestore}
            onHistory={onHistory}
          />
        </div>
      </div>
      <h1 className={styles.opTitle}>{title}</h1>
      <div className={styles.opBody}>
        {deleted ? (
          <p className={styles.tombstone}>
            {t(
              thread.removedByModerator
                ? "forum:tombstone.removedByModerator"
                : "forum:tombstone.body",
            )}
          </p>
        ) : (
          body.map((paragraph, index) => (
            <p key={index}>
              <MentionText text={paragraph} />
            </p>
          ))
        )}
      </div>
      <div className={styles.opTags}>
        {thread.tags.map((t) => (
          <span key={t} className={styles.opTag}>
            {t}
          </span>
        ))}
      </div>
      {!deleted && (
        <div className={styles.opFooter}>
          <button
            type="button"
            className={[styles.reaction, liked && styles.reactionOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setLiked((v) => !v)}
          >
            <svg viewBox="0 0 14 14">
              <path
                d="M7 12s-7-4.5-7-8a4 4 0 0 1 7-2.7A4 4 0 0 1 14 4c0 3.5-7 8-7 8z"
                fill="currentColor"
                stroke="none"
              />
            </svg>
            {thread.upvotes + (liked ? 1 : 0)}
          </button>
          <button
            type="button"
            className={[styles.reaction, bookmarked && styles.reactionOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setBookmarked((v) => !v)}
          >
            {bookmarked
              ? t("forum:threadOp.saved")
              : t("forum:threadOp.bookmark")}
          </button>
          <button type="button" className={styles.report} onClick={onReport}>
            {t("forum:threadOp.report")}
          </button>
        </div>
      )}
    </div>
  );
}
