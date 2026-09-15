import { useId } from "react";
import { Link } from "react-router-dom";
import { TbPin, TbArrowBigUp, TbArrowBigUpFilled } from "react-icons/tb";
import { FiBarChart2 } from "react-icons/fi";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { thread as threadPath } from "../../app/routeMap";
import { type Thread } from "./forum.data";
import { ForumAvatar, ProfileLink, OfficialBadge } from "./ForumAuthor";
import { ForumCategoryBadge } from "./ForumCategoryBadge";
import { authorHref, isMaskedByline } from "./forumAuthor.helpers";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { PostActionsMenu } from "./PostActionsMenu";
import {
  ContentWarningPill,
  ContentWarningReveal,
} from "./ForumContentWarning";
import { useContentWarningReveal } from "./forumWarnings.helpers";
import styles from "./ForumPage.module.css";

/** The server caps `unreadReplyCount` at 99, so 99 means "99 or more" and is
 *  shown as such. Mirrors the backend's own ceiling; a badge is a nudge, and a
 *  four-digit one is just noise. */
const UNREAD_REPLY_CAP = 99;

/**
 * One row of the thread list.
 *
 * The card is a plain container with a single STRETCHED LINK on the title
 * (`.threadTitleLink::after` covers the card), not a `<Link>` wrapping the whole
 * row: the row also holds a vote button, tag filter chips and an author link,
 * and nesting those inside an anchor is invalid HTML, collapses the card into
 * one announced link for screen readers, and made Space on the vote control
 * behave inconsistently. Every interactive sibling sits above the overlay
 * (`z-index`), so clicking anywhere else on the card still opens the thread.
 */
export function ForumThreadRow({
  thread,
  index,
  onVote,
  onTagClick,
  canEditThread,
  canMoveCategory,
  canDeleteThread,
  onEditTitle,
  onMoveCategory,
  onDelete,
  onRestore,
  onHistory,
  onTogglePin,
}: {
  thread: Thread;
  index: number;
  onVote: (thread: Thread) => void;
  onTagClick: (tag: string) => void;
  canEditThread: (thread: Thread) => boolean;
  /** May the viewer refile this thread (PRD-163)? Author inside the thread's
   *  first 24 hours, or a moderator at any time. See
   *  `canMoveThreadCategory`. Optional so existing tests/callers that don't
   *  wire the move affordance keep an inert category badge. */
  canMoveCategory?: (thread: Thread) => boolean;
  /** May the viewer withdraw this WHOLE thread (PRD-160)? The row's "Delete"
   *  now takes the thread down rather than tombstoning its opening post, so its
   *  gate is the thread endpoint's (author or moderator), not the OP post's
   *  narrower `canDelete`. Optional: without it the row falls back to the OP
   *  permission it used before. */
  canDeleteThread?: (thread: Thread) => boolean;
  onEditTitle: (thread: Thread) => void;
  onMoveCategory?: (thread: Thread) => void;
  onDelete: (thread: Thread) => void;
  onRestore: (thread: Thread) => void;
  onHistory: (thread: Thread) => void;
  onTogglePin: (thread: Thread) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  // Real vote: pressed state + count come straight from the card (patched
  // optimistically by `useVotePost`), not a local toggle set.
  const isVoted = !!thread.myVote;
  const canModerate = canEditThread(thread);
  // PRD-163: the category chip doubles as the move control for whoever may
  // refile the thread (see `ForumCategoryBadge`).
  const isMovable = !!canMoveCategory?.(thread) && !!onMoveCategory;
  // PRD-170. `null` is "there is no watermark to compare against" (anonymous,
  // never opened, or a write echo) and `0` is "you are caught up": both mean no
  // badge at all, which is the difference between a quiet row and a row
  // insisting there is nothing new. Only 1..99 shows, and 99 is the server's
  // cap, so it reads as "99+" rather than claiming an exact ninety-nine.
  const unreadReplyCount = thread.unreadReplyCount ?? 0;
  const unreadReplyLabel =
    unreadReplyCount >= UNREAD_REPLY_CAP
      ? t("forum:threadList.unreadCap")
      : fmt.number(unreadReplyCount);
  // The author's warnings cover the taste of the post until a reader chooses
  // otherwise. The choice is remembered for this thread for the session, so
  // uncovering it here and opening the thread does not ask twice.
  const excerptId = useId();
  const hasWarnings = !!thread.contentWarnings?.length;
  const { isRevealed, reveal, cover } = useContentWarningReveal(
    thread.slug ?? String(thread.id),
  );
  const isExcerptCovered = hasWarnings && !!thread.excerpt && !isRevealed;
  // A masked byline links nowhere (`authorHref` already returns undefined for
  // a handle-less author) and wears the same placeholder name the composer's
  // preview drew while the thread was being written.
  const isMasked = isMaskedByline(thread);
  const anonymousName = t("forum:composePage.preview.anonymousName");
  const authorName = isMasked ? anonymousName : thread.author.name;
  return (
    // `.rowFade` lets the open menu escape this row's stacking context — the
    // FadeIn wrapper keeps `will-change: transform` for the life of the element,
    // so without it the NEXT row paints over the dropdown.
    <FadeIn className={styles.rowFade} delay={Math.min(index, 8) * 60}>
      <div className={styles.threadRow}>
        <div
          className={[styles.thread, thread.pinned && styles.threadPinned]
            .filter(Boolean)
            .join(" ")}
        >
          <button
            type="button"
            className={styles.voteCol}
            aria-pressed={isVoted}
            aria-label={
              isVoted
                ? t("forum:threadList.removeUpvoteAria")
                : t("forum:threadList.upvoteAria")
            }
            onClick={() => onVote(thread)}
          >
            <span
              aria-hidden="true"
              className={[styles.voteUp, isVoted && styles.voteUpOn]
                .filter(Boolean)
                .join(" ")}
            >
              {isVoted ? <TbArrowBigUpFilled /> : <TbArrowBigUp />}
            </span>
            <span className={styles.voteN}>{thread.upvotes}</span>
          </button>
          <div>
            <ThreadRowBadges
              thread={thread}
              isMovable={isMovable}
              onMoveCategory={onMoveCategory}
              onTagClick={onTagClick}
            />
            <div className={styles.threadTitle}>
              <Link
                to={threadPath(thread.slug ?? thread.id)}
                className={styles.threadTitleLink}
              >
                {thread.title}
              </Link>
            </div>
            {/* PRD-167: the list DTO now carries a short taste of the opening
                post (`excerpt`). It is null whenever there is nothing showable
                behind it (no OP, an author tombstone, a moderator takedown),
                which maps to "" here: render nothing at all, no placeholder and
                no reserved space. */}
            {thread.excerpt && (
              <div
                id={excerptId}
                // A blur is no cover at all to a screen reader, so the covered
                // taste is hidden from assistive tech too. It holds no focusable
                // content, so there is nothing to make inert.
                aria-hidden={isExcerptCovered || undefined}
                className={[
                  styles.threadExcerpt,
                  isExcerptCovered && styles.threadExcerptCovered,
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {thread.excerpt}
              </div>
            )}
            {hasWarnings && thread.excerpt && (
              <ContentWarningReveal
                warnings={thread.contentWarnings}
                isRevealed={isRevealed}
                onToggle={isRevealed ? cover : reveal}
                controlsId={excerptId}
                className={styles.warningReveal}
              />
            )}
            <ThreadRowMeta
              thread={thread}
              authorName={authorName}
              isMasked={isMasked}
              anonymousName={anonymousName}
              unreadReplyCount={unreadReplyCount}
              unreadReplyLabel={unreadReplyLabel}
            />
          </div>
        </div>
        {/* Always rendered: the menu holds mute/block for every other member's
            thread, and hides itself when it would have no actions at all. */}
        <div className={styles.threadMenu}>
          <PostActionsMenu
            // The row menu shows for any moderatable thread, so `canEdit`
            // must be the real edit right (author only), not literal `true` —
            // otherwise a moderator who isn't the author sees a bogus "Edit".
            // Live: the DTO boolean. Demo: no DTO flag, so fall back to the
            // persona-ownership gate (which returned true to open the menu).
            canEdit={canModerate && (thread.canEdit ?? true)}
            // PRD-160: "Delete" withdraws the whole thread, so this is the
            // thread endpoint's permission (author or moderator) rather than
            // the opening post's, which also goes false the moment that post
            // is tombstoned, hiding the action from the very author who wanted
            // the thread gone.
            canDelete={
              canDeleteThread
                ? canDeleteThread(thread)
                : canModerate && thread.canDelete
            }
            canRestore={canModerate && thread.canRestore}
            canViewHistory={canModerate && thread.canViewHistory}
            canPin={canModerate && thread.canPin}
            pinned={!!thread.pinned}
            author={{
              slug: thread.author.slug,
              name: authorName,
              official: thread.author.official,
            }}
            onEdit={() => onEditTitle(thread)}
            onDelete={() => onDelete(thread)}
            onRestore={() => onRestore(thread)}
            onHistory={() => onHistory(thread)}
            onTogglePin={() => onTogglePin(thread)}
          />
        </div>
      </div>
    </FadeIn>
  );
}

/**
 * The chips above a row's title: pinned, withdrawn, category, the author's
 * content warning, a poll indicator, and the tag filters.
 *
 * Its own component so `ForumThreadRow` stays inside the 200-line budget as the
 * full-page composer's fields reached the list.
 */
function ThreadRowBadges({
  thread,
  isMovable,
  onMoveCategory,
  onTagClick,
}: {
  thread: Thread;
  isMovable: boolean;
  onMoveCategory?: (thread: Thread) => void;
  onTagClick: (tag: string) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const pollOptionCount = thread.poll?.options.length ?? 0;
  return (
    <div className={styles.badges}>
      {thread.pinned && (
        <span className={styles.pinBadge}>
          <TbPin /> {t("forum:threadList.pinnedBadge")}
        </span>
      )}
      {/* Withdrawn threads reach only a platform moderator's list
                (PRD-160); everyone else's read path filters them out. */}
      {thread.isDeleted && (
        <span className={styles.withdrawnBadge}>
          {t("forum:threadList.withdrawnBadge")}
        </span>
      )}
      <ForumCategoryBadge
        category={thread.category}
        onMove={isMovable ? () => onMoveCategory?.(thread) : undefined}
      />
      <ContentWarningPill
        warnings={thread.contentWarnings}
        className={styles.warningPill}
      />
      {/* A quiet note that there is something to answer here, with how
                many answers it offers. No counts: the row has no business
                showing a tally the thread page may be withholding. */}
      {pollOptionCount > 0 && (
        <span className={styles.pollBadge}>
          <FiBarChart2 aria-hidden="true" />
          {t("forum:threadList.pollBadge", {
            count: pollOptionCount,
            formatted: fmt.number(pollOptionCount),
          })}
        </span>
      )}
      {thread.tags.map((tg) => (
        <button
          key={tg}
          type="button"
          className={styles.tag}
          aria-label={t("forum:threadList.filterByTagAria", {
            tag: tg,
          })}
          onClick={() => onTagClick(tg)}
        >
          #{tg}
        </button>
      ))}
    </div>
  );
}

/** The byline and counts under a row's excerpt. A MASKED byline wears the
 *  placeholder name and links nowhere, which the caller has already resolved
 *  off the response rather than re-deriving here. */
function ThreadRowMeta({
  thread,
  authorName,
  isMasked,
  anonymousName,
  unreadReplyCount,
  unreadReplyLabel,
}: {
  thread: Thread;
  authorName: string;
  isMasked: boolean;
  anonymousName: string;
  unreadReplyCount: number;
  unreadReplyLabel: string;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const hasUnreadReplies = unreadReplyCount > 0;
  return (
    <div className={styles.threadMeta}>
      <ProfileLink
        to={authorHref(thread.author)}
        name={authorName}
        official={thread.author.official}
        className={styles.tmWho}
      >
        <ForumAvatar
          className={styles.tmAv}
          style={{
            background: thread.author.background,
            color: thread.author.color,
          }}
          person={{
            slug: thread.author.slug,
            photo: isMasked ? undefined : thread.author.photo,
            initials: isMasked
              ? anonymousName.slice(0, 1)
              : thread.author.initials,
            name: authorName,
            official: thread.author.official,
          }}
        />
        <span className={styles.tmAuthor}>{authorName}</span>
        {!isMasked && <MemberStaffBadge slug={thread.author.slug} />}
        {thread.author.official && <OfficialBadge />}
      </ProfileLink>
      <span className={styles.tmDot} />
      <span>{thread.posted}</span>
      <span className={styles.tmDot} />
      <span>
        {t("forum:repliesCount", {
          count: thread.comments,
          formatted: fmt.number(thread.comments),
        })}
      </span>
      {hasUnreadReplies && (
        <span
          className={styles.unreadBadge}
          // The visible chip is deliberately terse; the accessible name
          // says what the number MEANS, so it is never announced as a
          // bare digit floating after the reply count.
          aria-label={t("forum:threadList.unreadAria", {
            count: unreadReplyCount,
            formatted: unreadReplyLabel,
          })}
        >
          {t("forum:threadList.unreadBadge", {
            count: unreadReplyCount,
            formatted: unreadReplyLabel,
          })}
        </span>
      )}
    </div>
  );
}
