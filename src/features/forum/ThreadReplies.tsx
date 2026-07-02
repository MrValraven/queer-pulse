import { Link } from "react-router-dom";
import { FiStar, FiHeart, FiMessageSquare } from "react-icons/fi";
import { EmptyState, FadeIn } from "../../shared/components/ui";
import { REPLY_SORTS, MOD_ROLE, type Reply } from "./forum.data";
import {
  ForumAvatar,
  ProfileLink,
  OfficialBadge,
  authorHref,
  memberPath,
} from "./ForumAuthor";
import { memberName } from "../members/data/members";
import { ThreadRepliesSkeleton } from "./ThreadRepliesSkeleton";
import styles from "./ThreadPage.module.css";

/** Names the moderator who published an official QueerPulse post, linking to
 * their member profile — so the platform voice stays accountable to a person. */
export function ModeratorByline({ mod }: { mod?: string }) {
  if (!mod) return null;
  return (
    <div className={styles.modBy}>
      Written by{" "}
      <Link to={memberPath(mod)} className={styles.modByLink}>
        {memberName(mod)}
      </Link>
      {MOD_ROLE[mod] ? `, ${MOD_ROLE[mod]}` : ""} · on behalf of the team
    </div>
  );
}

export function ReplySortBar({
  count,
  sort,
  setSort,
}: {
  count: number;
  sort: (typeof REPLY_SORTS)[number];
  setSort: (s: (typeof REPLY_SORTS)[number]) => void;
}) {
  return (
    <div className={styles.replyBar}>
      <span className={styles.replyCount}>
        {count} repl{count === 1 ? "y" : "ies"}
      </span>
      <div className={styles.replySort}>
        {REPLY_SORTS.map((s) => (
          <button
            type="button"
            key={s}
            className={[styles.sortBtn, sort === s && styles.sortBtnOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setSort(s)}
          >
            {s}
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
}: {
  loading: boolean;
  replies: Reply[];
  replyKey: (r: Reply) => string;
  likedReplies: Record<string, boolean>;
  toggleReplyLike: (r: Reply) => void;
  onFocusComposer: () => void;
}) {
  return (
    <div>
      {loading && <ThreadRepliesSkeleton count={3} />}
      {!loading && replies.length === 0 && (
        <EmptyState
          compact
          icon={<FiMessageSquare />}
          title="No replies yet"
          description="This thread is waiting for its first voice. Be the first to reply — a thoughtful answer goes a long way."
          action={{ label: "Write a reply", onClick: onFocusComposer }}
        />
      )}
      {!loading &&
        replies.map((r, i) => {
          const isLiked = !!likedReplies[replyKey(r)];
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
                  style={{ background: r.bg, color: r.color }}
                  person={{
                    slug: r.slug,
                    photo: r.photo,
                    initials: r.av,
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
                  {r.official && <OfficialBadge />}
                  {r.isOP && <span className={styles.opBadge}>OP</span>}
                  {r.helpful && (
                    <span className={styles.helpfulBadge}>
                      <FiStar /> Most helpful
                    </span>
                  )}
                  <span className={styles.replyTime}>{r.time}</span>
                </div>
                {r.official && r.mod && <ModeratorByline mod={r.mod} />}
                <div className={styles.replyBody}>
                  {r.quote && (
                    <div className={styles.quote}>
                      <cite>{r.quote.cite}</cite>
                      {r.quote.text}
                    </div>
                  )}
                  {r.body.map((p, j) => (
                    <p key={j}>{p}</p>
                  ))}
                </div>
                <button
                  type="button"
                  aria-pressed={isLiked}
                  aria-label={isLiked ? "Unlike this reply" : "Like this reply"}
                  className={[styles.replyReact, isLiked && styles.replyReactOn]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => toggleReplyLike(r)}
                >
                  <FiHeart /> {r.reactions + (isLiked ? 1 : 0)}
                </button>
              </div>
            </FadeIn>
          );
        })}
    </div>
  );
}
