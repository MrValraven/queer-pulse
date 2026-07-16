import { Link } from "react-router-dom";
import { FiMessageSquare } from "react-icons/fi";
import { TbPin } from "react-icons/tb";
import { EmptyState, FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
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
  filtered,
  onShowAll,
  onCompose,
}: {
  loading: boolean;
  threads: Thread[];
  sort: "top" | "new";
  setSort: (s: "top" | "new") => void;
  voted: Set<number>;
  toggleVote: (id: number) => void;
  filtered: boolean;
  onShowAll: () => void;
  onCompose: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
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
            {t("forum:threadList.top")}
          </button>
          <button
            type="button"
            className={[styles.sortBtn, sort === "new" && styles.sortBtnOn]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setSort("new")}
          >
            {t("forum:threadList.new")}
          </button>
        </div>
        <span className={styles.count}>
          {t("forum:threadList.count", {
            count: threads.length,
            formatted: fmt.number(threads.length),
          })}
        </span>
      </div>

      {loading && <ForumThreadListSkeleton count={5} />}
      {!loading && threads.length === 0 && filtered && (
        <EmptyState
          icon={<FiMessageSquare />}
          title={t("forum:threadList.emptyFiltered.title")}
          description={t("forum:threadList.emptyFiltered.description")}
          action={{
            label: t("forum:threadList.emptyFiltered.action"),
            onClick: onShowAll,
          }}
        />
      )}
      {!loading && threads.length === 0 && !filtered && (
        <EmptyState
          icon={<FiMessageSquare />}
          title={t("forum:threadList.emptyAll.title")}
          description={t("forum:threadList.emptyAll.description")}
          action={{
            label: t("forum:threadList.emptyAll.action"),
            onClick: onCompose,
          }}
        />
      )}
      {!loading &&
        threads.map((thread, idx) => {
          const isVoted = voted.has(thread.id);
          const catMeta = CATS.find((c) => c.id === thread.cat);
          const cs = CAT_STYLE[thread.cat];
          return (
            <FadeIn key={thread.id} delay={Math.min(idx, 8) * 60}>
              <Link
                to={threadPath(thread.id)}
                className={[
                  styles.thread,
                  thread.pinned && styles.threadPinned,
                ]
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
                    toggleVote(thread.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleVote(thread.id);
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
                    {thread.upvotes + (isVoted ? 1 : 0)}
                  </span>
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
                      style={{ background: cs?.bg, color: cs?.color }}
                    >
                      {catMeta && <catMeta.icon />}{" "}
                      {catMeta && t(catMeta.nameKey)}
                    </span>
                    {thread.tags.map((tg) => (
                      <span key={tg} className={styles.tag}>
                        #{tg}
                      </span>
                    ))}
                  </div>
                  <div className={styles.threadTitle}>{thread.title}</div>
                  <div className={styles.threadExcerpt}>{thread.excerpt}</div>
                  <div className={styles.threadMeta}>
                    <ProfileSpanLink
                      to={authorHref(thread.author)}
                      name={thread.author.n}
                      official={thread.author.official}
                      className={styles.tmWho}
                    >
                      <ForumAvatar
                        className={styles.tmAv}
                        style={{
                          background: thread.author.t,
                          color: thread.author.tt,
                        }}
                        person={{
                          slug: thread.author.slug,
                          photo: thread.author.photo,
                          initials: thread.author.i,
                          name: thread.author.n,
                        }}
                      />
                      <span className={styles.tmAuthor}>
                        {thread.author.n}
                      </span>
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
            </FadeIn>
          );
        })}
    </div>
  );
}
