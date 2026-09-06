import { FiHeart, FiTag } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { CATS, CAT_STYLE, type Thread } from "./forum.data";
import { ForumAvatar, ProfileLink, OfficialBadge } from "./ForumAuthor";
import { authorHref } from "./forumAuthor.helpers";
import { ModeratorByline } from "./ThreadReplies";
import { MentionText } from "../../shared/mentions/MentionText";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { FeatureHelp } from "../../shared/components/ui";
import { PostActionsMenu } from "./PostActionsMenu";
import { ForumPostImage } from "./ForumImageAttach";
import { ForumLinkPreview } from "./ForumLinkPreview";
import { firstLinkIn, useInViewOnce } from "./api/useForumLinkPreview";
import styles from "./ThreadPage.module.css";

export function ThreadOpCard({
  thread,
  title,
  body,
  editedAt,
  deleted,
  onVote,
  bookmarked,
  onToggleBookmark,
  onReport,
  canEdit,
  canDelete,
  canRestore,
  canViewHistory,
  onEdit,
  onDelete,
  onRestore,
  onHistory,
  onMoveCategory,
  onEditTags,
}: {
  thread: Thread;
  title: string;
  body: string[];
  editedAt: string | null;
  deleted: boolean;
  /** Cast/retract the viewer's vote on the opening post. Pressed-state and the
   *  count are read straight off the thread view-model (`myVote`/`upvotes`),
   *  which the vote mutation patches in place — no local like state. */
  onVote: () => void;
  bookmarked: boolean;
  /** Toggle whether this thread is in the member's saved items. Persisted via
   *  the app-wide saved store (real `/me/saved` endpoint, optimistic). */
  onToggleBookmark: () => void;
  onReport: () => void;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canViewHistory: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onHistory: () => void;
  /** Re-file this thread into another category (PRD-163). Omitted for a viewer
   *  outside the author's 24-hour window who is not a moderator, which is what
   *  keeps the action off a menu the server would refuse. */
  onMoveCategory?: () => void;
  /** Open the tag editor (SOC-13). Omitted for a viewer who may not re-file
   *  this thread, which is what hides the control. */
  onEditTags?: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const catMeta = CATS.find((c) => c.id === thread.category);
  // DES-120's fix, applied to the last place that still had the old fallback:
  // `--plum` does NOT flip in dark mode, so an unknown category printed its
  // name in near-black on the dark card. `--text-strong` IS the plum-for-text
  // token and flips, and it is what `CAT_STYLE.general` already resolves to.
  const catColor = CAT_STYLE[thread.category]?.color ?? "var(--text-strong)";
  const voted = !!thread.myVote;
  // ENG-130. Explicit `false` only: undefined is "the posts page has not landed
  // yet", which must read as loading rather than as a missing opening post.
  const isOpUnavailable = thread.isOpAvailable === false;
  // PRD-171: unfurl the first link in the opening post, and only once the card
  // is near the viewport (see `useForumLinkPreview` on the shared rate budget).
  const { ref: bodyRef, isInView } = useInViewOnce<HTMLDivElement>();
  const firstLink = firstLinkIn(body);

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
            style={{
              background: thread.author.background,
              color: thread.author.color,
            }}
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
            {/* Live threads carry no view count (the DTO has none), so the
                stat is omitted entirely rather than printing "0 views". */}
            {thread.views != null && (
              <>
                <span>·</span>
                <span>
                  {t("forum:threadOp.viewsCount", {
                    count: thread.views,
                    formatted: fmt.number(thread.views),
                  })}
                </span>
              </>
            )}
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
            // Adds Mute / Block for the thread's author (self-aware no-op).
            author={{
              slug: thread.author.slug,
              name: thread.author.name,
              official: thread.author.official,
            }}
            canMoveCategory={!!onMoveCategory}
            onMoveCategory={onMoveCategory}
            onEdit={onEdit}
            onDelete={onDelete}
            onRestore={onRestore}
            onHistory={onHistory}
          />
        </div>
      </div>
      <h1 className={styles.opTitle}>
        {title} <FeatureHelp id="forum.thread" />
      </h1>
      <div className={styles.opBody} ref={bodyRef}>
        {isOpUnavailable ? (
          // The server told us there is no opening post THIS viewer can see.
          // State that and nothing else: the reason (a mute, a block, a
          // moderator's hand, a thread with no OP row) is not ours to guess at,
          // and every reply that did come back is rendered below.
          <p className={styles.opUnavailable}>
            {t("forum:threadOp.unavailable")}
          </p>
        ) : deleted ? (
          <p className={styles.tombstone}>
            {t(
              thread.removedByModerator
                ? "forum:tombstone.removedByModerator"
                : "forum:tombstone.body",
            )}
          </p>
        ) : (
          <>
            {body.map((paragraph, index) => (
              <p key={index}>
                <MentionText text={paragraph} />
              </p>
            ))}
            <ForumPostImage src={thread.opImage} />
            <ForumLinkPreview url={firstLink} isEnabled={isInView} />
          </>
        )}
      </div>
      <OpTagsRow tags={thread.tags} onEditTags={onEditTags} />
      {!deleted && !isOpUnavailable && (
        <OpFooterActions
          upvotes={thread.upvotes}
          voted={voted}
          onVote={onVote}
          bookmarked={bookmarked}
          onToggleBookmark={onToggleBookmark}
          onReport={onReport}
        />
      )}
    </div>
  );
}

/** The thread's tag chips, plus the re-file control for whoever may use it.
 *  Extracted so `ThreadOpCard` itself stays inside the 200-line component
 *  budget as the card grew a tag editor and a photo. */
function OpTagsRow({
  tags,
  onEditTags,
}: {
  tags: string[];
  onEditTags?: () => void;
}) {
  const { t } = useTranslation();
  if (!tags.length && !onEditTags) return null;
  return (
    <div className={styles.opTags}>
      {tags.map((tag) => (
        <span key={tag} className={styles.opTag}>
          {tag}
        </span>
      ))}
      {onEditTags && (
        <button type="button" className={styles.opTagEdit} onClick={onEditTags}>
          <FiTag aria-hidden="true" />
          {t(tags.length ? "forum:tagsEdit.editCta" : "forum:tagsEdit.addCta")}
        </button>
      )}
    </div>
  );
}

/** Upvote / save / report, under the opening post. */
function OpFooterActions({
  upvotes,
  voted,
  onVote,
  bookmarked,
  onToggleBookmark,
  onReport,
}: {
  upvotes: number;
  voted: boolean;
  onVote: () => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onReport: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.opFooter}>
      <button
        type="button"
        aria-pressed={voted}
        aria-label={
          voted ? t("forum:threadOp.unvoteAria") : t("forum:threadOp.voteAria")
        }
        className={[styles.reaction, voted && styles.reactionOn]
          .filter(Boolean)
          .join(" ")}
        onClick={onVote}
      >
        {/* Same icon as the reply like button (ThreadReplyItem), so the OP
            and its replies no longer carry two different heart glyphs. */}
        <FiHeart aria-hidden="true" /> {upvotes}
      </button>
      <button
        type="button"
        className={[styles.reaction, bookmarked && styles.reactionOn]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={bookmarked}
        onClick={onToggleBookmark}
      >
        {bookmarked ? t("forum:threadOp.saved") : t("forum:threadOp.bookmark")}
      </button>
      <button type="button" className={styles.report} onClick={onReport}>
        {t("forum:threadOp.report")}
      </button>
    </div>
  );
}
