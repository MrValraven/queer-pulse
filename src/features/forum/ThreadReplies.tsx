import { Link } from "react-router-dom";
import { FiStar, FiHeart, FiMessageSquare } from "react-icons/fi";
import { EmptyState, FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  MOD_ROLE_KEY,
  REPLY_SORTS,
  type Reply,
  type ReplySortId,
} from "./forum.data";
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
}: {
  loading: boolean;
  replies: Reply[];
  replyKey: (r: Reply) => string;
  likedReplies: Record<string, boolean>;
  toggleReplyLike: (r: Reply) => void;
  onFocusComposer: () => void;
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
          action={{ label: t("forum:replies.emptyAction"), onClick: onFocusComposer }}
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
                  aria-label={
                    isLiked
                      ? t("forum:replies.unlikeAria")
                      : t("forum:replies.likeAria")
                  }
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
