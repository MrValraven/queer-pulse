import { Link } from "react-router-dom";
import { TbPin, TbArrowBigUp, TbArrowBigUpFilled } from "react-icons/tb";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { thread as threadPath } from "../../app/routeMap";
import { CATS, CAT_STYLE, type Thread } from "./forum.data";
import { ForumAvatar, ProfileLink, OfficialBadge } from "./ForumAuthor";
import { authorHref } from "./forumAuthor.helpers";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { PostActionsMenu } from "./PostActionsMenu";
import styles from "./ForumPage.module.css";

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
  onEditTitle,
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
  onEditTitle: (thread: Thread) => void;
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
  const catMeta = CATS.find((c) => c.id === thread.category);
  const cs = CAT_STYLE[thread.category];
  const canModerate = canEditThread(thread);
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
            <div className={styles.badges}>
              {thread.pinned && (
                <span className={styles.pinBadge}>
                  <TbPin /> {t("forum:threadList.pinnedBadge")}
                </span>
              )}
              <span
                className={styles.catBadge}
                style={{ background: cs?.background, color: cs?.color }}
              >
                {catMeta && <catMeta.icon />}{" "}
                {catMeta && t(catMeta.nameKey)}
              </span>
              {thread.tags.map((tg) => (
                <button
                  key={tg}
                  type="button"
                  className={styles.tag}
                  aria-label={t("forum:threadList.filterByTagAria", { tag: tg })}
                  onClick={() => onTagClick(tg)}
                >
                  #{tg}
                </button>
              ))}
            </div>
            <div className={styles.threadTitle}>
              <Link
                to={threadPath(thread.slug ?? thread.id)}
                className={styles.threadTitleLink}
              >
                {thread.title}
              </Link>
            </div>
            {/* The list DTO carries no OP preview, so a live row's excerpt is
                empty — render nothing rather than an empty 6px-margin line. */}
            {thread.excerpt && (
              <div className={styles.threadExcerpt}>{thread.excerpt}</div>
            )}
            <div className={styles.threadMeta}>
              <ProfileLink
                to={authorHref(thread.author)}
                name={thread.author.name}
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
                    photo: thread.author.photo,
                    initials: thread.author.initials,
                    name: thread.author.name,
                  }}
                />
                <span className={styles.tmAuthor}>{thread.author.name}</span>
                <MemberStaffBadge slug={thread.author.slug} />
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
            </div>
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
            canDelete={canModerate && thread.canDelete}
            canRestore={canModerate && thread.canRestore}
            canViewHistory={canModerate && thread.canViewHistory}
            canPin={canModerate && thread.canPin}
            pinned={!!thread.pinned}
            author={{
              slug: thread.author.slug,
              name: thread.author.name,
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
