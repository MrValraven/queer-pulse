import { Link } from "react-router-dom";
import { TbPin, TbArrowBigUp, TbArrowBigUpFilled } from "react-icons/tb";
import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { thread as threadPath } from "../../app/routeMap";
import { CATS, CAT_STYLE, type Thread } from "./forum.data";
import { ForumAvatar, ProfileSpanLink, OfficialBadge } from "./ForumAuthor";
import { authorHref } from "./forumAuthor.helpers";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import { PostActionsMenu } from "./PostActionsMenu";
import styles from "./ForumPage.module.css";

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
  return (
    <FadeIn delay={Math.min(index, 8) * 60}>
      <div className={styles.threadRow}>
        <Link
          to={threadPath(thread.slug ?? thread.id)}
          className={[styles.thread, thread.pinned && styles.threadPinned]
            .filter(Boolean)
            .join(" ")}
        >
          <div
            className={styles.voteCol}
            role="button"
            tabIndex={0}
            aria-pressed={isVoted}
            aria-label={
              isVoted
                ? t("forum:threadList.removeUpvoteAria")
                : t("forum:threadList.upvoteAria")
            }
            onClick={(e) => {
              e.preventDefault();
              onVote(thread);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onVote(thread);
              }
            }}
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
          </div>
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
                <span
                  key={tg}
                  role="button"
                  tabIndex={0}
                  className={styles.tag}
                  aria-label={t("forum:threadList.filterByTagAria", { tag: tg })}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onTagClick(tg);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      onTagClick(tg);
                    }
                  }}
                >
                  #{tg}
                </span>
              ))}
            </div>
            <div className={styles.threadTitle}>{thread.title}</div>
            <div className={styles.threadExcerpt}>{thread.excerpt}</div>
            <div className={styles.threadMeta}>
              <ProfileSpanLink
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
              </ProfileSpanLink>
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
        </Link>
        {canEditThread(thread) && (
          <div className={styles.threadMenu}>
            <PostActionsMenu
              // The row menu now shows for any moderatable thread, so `canEdit`
              // must be the real edit right (author only), not literal `true` —
              // otherwise a moderator who isn't the author sees a bogus "Edit".
              // Live: the DTO boolean. Demo: no DTO flag, so fall back to the
              // persona-ownership gate (which returned true to open the menu).
              canEdit={thread.canEdit ?? canEditThread(thread)}
              canDelete={thread.canDelete}
              canRestore={thread.canRestore}
              canViewHistory={thread.canViewHistory}
              canPin={thread.canPin}
              pinned={!!thread.pinned}
              onEdit={() => onEditTitle(thread)}
              onDelete={() => onDelete(thread)}
              onRestore={() => onRestore(thread)}
              onHistory={() => onHistory(thread)}
              onTogglePin={() => onTogglePin(thread)}
            />
          </div>
        )}
      </div>
    </FadeIn>
  );
}
