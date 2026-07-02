import { Link } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import { TbPin } from "react-icons/tb";
import { EmptyState, FadeIn } from "../../shared/components/ui";
import { thread as threadPath } from "../../app/routeMap";
import { CATS, CAT_STYLE, type Thread } from "./forum.data";
import {
  ForumAvatar,
  ProfileSpanLink,
  OfficialBadge,
  authorHref,
} from "./ForumAuthor";
import { ForumThreadListSkeleton } from "./ForumSkeleton";
import styles from "./ForumPage.module.css";

export function ForumThreadList({
  loading,
  threads,
  sort,
  setSort,
  voted,
  toggleVote,
  onShowAll,
}: {
  loading: boolean;
  threads: Thread[];
  sort: "top" | "new";
  setSort: (s: "top" | "new") => void;
  voted: Set<number>;
  toggleVote: (id: number) => void;
  onShowAll: () => void;
}) {
  return (
    <div>
      <div className={styles.top}>
        <div className={styles.sort}>
          <button
            type="button"
            className={[styles.sortBtn, sort === "top" && styles.sortBtnOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setSort("top")}
          >
            Top
          </button>
          <button
            type="button"
            className={[styles.sortBtn, sort === "new" && styles.sortBtnOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setSort("new")}
          >
            New
          </button>
        </div>
        <span className={styles.count}>
          {threads.length} thread{threads.length === 1 ? "" : "s"}
        </span>
      </div>

      {loading && <ForumThreadListSkeleton count={5} />}
      {!loading && threads.length === 0 && (
        <EmptyState
          icon={<FiMessageSquare />}
          title="Nothing in this category yet"
          description="No posts match this filter right now. Try another category, or start the conversation yourself."
          action={{ label: "Show all posts", onClick: onShowAll }}
        />
      )}
      {!loading &&
        threads.map((t, idx) => {
          const isVoted = voted.has(t.id);
          const catMeta = CATS.find((c) => c.id === t.cat);
          const cs = CAT_STYLE[t.cat];
          return (
            <FadeIn key={t.id} delay={Math.min(idx, 8) * 60}>
              <Link
                to={threadPath(t.id)}
                className={[styles.thread, t.pinned && styles.threadPinned]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div
                  className={styles.voteCol}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isVoted}
                  aria-label={isVoted ? "Remove upvote" : "Upvote"}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleVote(t.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleVote(t.id);
                    }
                  }}
                >
                  <span
                    aria-hidden="true"
                    className={[styles.voteUp, isVoted && styles.voteUpOn]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    ▲
                  </span>
                  <span className={styles.voteN}>
                    {t.upvotes + (isVoted ? 1 : 0)}
                  </span>
                </div>
                <div>
                  <div className={styles.badges}>
                    {t.pinned && (
                      <span className={styles.pinBadge}>
                        <TbPin /> Pinned
                      </span>
                    )}
                    <span
                      className={styles.catBadge}
                      style={{ background: cs?.bg, color: cs?.color }}
                    >
                      {catMeta && <catMeta.icon />} {catMeta?.name}
                    </span>
                    {t.tags.map((tg) => (
                      <span key={tg} className={styles.tag}>
                        #{tg}
                      </span>
                    ))}
                  </div>
                  <div className={styles.threadTitle}>{t.title}</div>
                  <div className={styles.threadExcerpt}>{t.excerpt}</div>
                  <div className={styles.threadMeta}>
                    <ProfileSpanLink
                      to={authorHref(t.author)}
                      name={t.author.n}
                      official={t.author.official}
                      className={styles.tmWho}
                    >
                      <ForumAvatar
                        className={styles.tmAv}
                        style={{ background: t.author.t, color: t.author.tt }}
                        person={{
                          slug: t.author.slug,
                          photo: t.author.photo,
                          initials: t.author.i,
                          name: t.author.n,
                        }}
                      />
                      <span className={styles.tmAuthor}>{t.author.n}</span>
                      {t.author.official && <OfficialBadge />}
                    </ProfileSpanLink>
                    <span className={styles.tmDot} />
                    <span>{t.posted}</span>
                    <span className={styles.tmDot} />
                    <span>{t.comments} replies</span>
                  </div>
                </div>
              </Link>
            </FadeIn>
          );
        })}
    </div>
  );
}
