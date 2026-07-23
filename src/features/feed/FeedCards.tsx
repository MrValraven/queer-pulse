import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBookmark,
  FiCheck,
  FiHeart,
  FiCornerUpLeft,
  FiSend,
  FiMessageCircle,
} from "react-icons/fi";
import { Avatar, EmptyState } from "../../shared/components/ui";
import { useConnect } from "../../app/providers/ConnectProvider";
import { useMemberContact } from "../connect/useMemberContact";
import { useSaved } from "../../app/providers/SavedProvider";
import { useFocusOnMount } from "../../shared/hooks";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { memberAvatar } from "../members/data/members";
import { gatheringPath } from "../gatherings/data";
import { routes } from "../../app/routeMap";
import { tintForSlug } from "../../shared/api/refs";
import type { FeedItem } from "../../shared/contracts/contracts";
import { FEED_POST, type FeedPost, type FeedReply } from "./feed.data";
import { MoreMenu, ReportModal } from "./FeedModeration";
import { useLikePost, useReplyToPost } from "./api/useFeedMutations";
import { initials, relativeTime } from "./api/feed.adapters";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import styles from "./FeedPage.module.css";

export function GatheringCard() {
  const { t } = useTranslation();
  return (
    <Link
      to={gatheringPath("queer-book-club")}
      className={`${styles.card} ${styles.cardLink}`}
    >
      <div className={styles.accent} style={{ background: "var(--jade)" }} />
      <div className={styles.pad}>
        <div className={styles.eyebrow} style={{ color: "var(--jade)" }}>
          <span className={styles.dot} style={{ background: "var(--jade)" }} />
          {t("feed:card.gathering.upcomingIn", { count: 5 })}
        </div>
        <div className={styles.gcTitle}>Queer Book Club — July</div>
        <div className={styles.gcMeta}>
          <span>Sat 19 July · 18:00–20:00</span>
          <span>LX Factory, Alcântara, Lisbon</span>
        </div>
        <div className={styles.gcFooter}>
          <div className={styles.attStack}>
            <div className={styles.attAvs}>
              <Avatar initials="AK" tint="jade" size={24} />
              <Avatar initials="JP" tint="coral" size={24} />
              <Avatar initials="TM" tint="plum" size={24} />
            </div>
            <span className={styles.attLabel}>
              {t("feed:card.gathering.goingCount", { count: 9 })}
            </span>
          </div>
          <span className={styles.goingChip}>
            <FiCheck /> {t("feed:card.gathering.youAreGoing")}
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * "New member" card for the feed's People tab. With no `item`, renders the
 * demo prototype's scripted Kai Larsson mock (unchanged). With a live
 * `FeedItem` of type `new_member`, renders straight off its fields — see
 * `contracts.ts#FeedItem`'s `new_member` doc for the mapping. Pronouns/
 * neighbourhood/interest chips the demo mock shows aren't part of the
 * aggregate, so they're simply omitted for live items rather than guessed at.
 */
export function NewMemberCard({ item }: { item?: FeedItem } = {}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { openConnect } = useConnect();
  const slug = item ? (item.actor?.handle ?? "") : "kai";
  const name = item?.title ?? "Kai Larsson";
  const { connected, contact } = useMemberContact(slug || "");
  const bio =
    item?.summary ??
    "Filmmaker making a documentary about queer nightlife in southern Europe. Looking for interviewees and collaborators.";
  const joinedWhen = item
    ? relativeTime(item.createdAt, fmt)
    : t("feed:card.newMember.today");
  const joinedLine = t("feed:card.newMember.joined", { when: joinedWhen });
  const meta = item ? joinedLine : `they/them · Lisbon · ${joinedLine}`;
  const profileLink = item?.link ?? "/profile/kai";
  const avatarSrc = item
    ? (item.actor?.avatarUrl ?? undefined)
    : memberAvatar("kai")?.photo;
  const avatarInitials = item ? initials(name) : "KL";
  const tint = item ? (slug ? tintForSlug(slug) : "plum") : "plum";

  return (
    <article className={`${styles.card} ${styles.pad}`}>
      <div className={styles.tag}>
        <span className={styles.dot} /> {t("feed:card.newMember.tag")}
      </div>
      <div className={styles.nmRow}>
        <Avatar
          initials={avatarInitials}
          tint={tint}
          size={46}
          src={avatarSrc}
          alt={name}
        />
        <div className={styles.nmInfo}>
          <div className={styles.nmName}>
            <span className={styles.nameRow}>
              {name}
              <MemberStaffBadge slug={slug || undefined} />
            </span>
          </div>
          <div className={styles.nmMeta}>{meta}</div>
          <div className={styles.nmBio}>{bio}</div>
          {!item && (
            <div className={styles.nmChips}>
              <span className={styles.nmChip}>Film</span>
              <span className={styles.nmChip}>Queer Lisbon</span>
            </div>
          )}
          <div className={styles.nmActions}>
            <button
              type="button"
              className={styles.btnOutline}
              onClick={() =>
                slug ? contact({ slug, name }) : openConnect(undefined)
              }
            >
              {slug && connected
                ? t("connect:contact.message")
                : t("feed:action.connect")}
            </button>
            <Link to={profileLink} className={styles.linkBtn}>
              {t("feed:action.viewProfile")}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function ReplyComposer({
  onSubmit,
  onCancel,
}: {
  onSubmit: (body: string) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const inputRef = useFocusOnMount<HTMLTextAreaElement>();
  return (
    <form
      className={styles.composer}
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) return;
        onSubmit(trimmed);
        setValue("");
      }}
    >
      <label htmlFor="reply-input" className={styles.srOnly}>
        {t("feed:composer.srLabel")}
      </label>
      <textarea
        id="reply-input"
        ref={inputRef}
        className={styles.composerInput}
        placeholder={t("feed:composer.placeholder")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
      />
      <div className={styles.composerRow}>
        <button type="button" className={styles.linkBtn} onClick={onCancel}>
          {t("feed:action.cancel")}
        </button>
        <button
          type="submit"
          className={styles.composerSend}
          disabled={!value.trim()}
        >
          <FiSend /> {t("feed:action.reply")}
        </button>
      </div>
    </form>
  );
}

function PostActions({
  liked,
  likeCount,
  onLike,
  replyCount,
  onToggleReply,
  saved,
  onSave,
}: {
  liked: boolean;
  likeCount: number;
  onLike: () => void;
  replyCount: number;
  onToggleReply: () => void;
  saved: boolean;
  onSave: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.postFooter}>
      <button
        type="button"
        className={`${styles.postAction} ${liked ? styles.postActionOn : ""}`}
        onClick={onLike}
        aria-pressed={liked}
        aria-label={t(liked ? "feed:post.unlikeAria" : "feed:post.likeAria")}
      >
        <FiHeart fill={liked ? "currentColor" : "none"} /> {likeCount}
      </button>
      <button
        type="button"
        className={styles.postAction}
        onClick={onToggleReply}
        aria-label={t("feed:post.replyAria")}
      >
        <FiCornerUpLeft /> {t("feed:post.replyCount", { count: replyCount })}
      </button>
      <button
        type="button"
        className={`${styles.postAction} ${saved ? styles.postActionOn : ""}`}
        onClick={onSave}
        aria-pressed={saved}
        aria-label={t(saved ? "feed:post.unsaveAria" : "feed:post.saveAria")}
      >
        <FiBookmark fill={saved ? "currentColor" : "none"} />{" "}
        {t(saved ? "feed:action.saved" : "feed:action.save")}
      </button>
    </div>
  );
}

export function PostCard({ post = FEED_POST }: { post?: FeedPost }) {
  const { t } = useTranslation();
  const { connected, contact } = useMemberContact(post.slug);
  const { isSaved, toggleSave } = useSaved();
  const likePost = useLikePost();
  const replyToPost = useReplyToPost();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [replies, setReplies] = useState<FeedReply[]>(post.replies);
  const [composing, setComposing] = useState(false);
  const [reporting, setReporting] = useState(false);
  const saved = isSaved(post.id);

  function addReply(body: string) {
    setReplies((prev) => [
      ...prev,
      { id: `r${prev.length + 1}-${Date.now()}`, author: "You", body },
    ]);
    setComposing(false);
    // Live mode persists; demo mode no-ops (local state above is the record).
    replyToPost.mutate({ id: post.id, body });
  }

  return (
    <article className={`${styles.card} ${styles.pad}`}>
      <div className={styles.postHeader}>
        <div className={styles.postAuthor}>
          <Avatar
            initials={post.authorInitials}
            tint={post.authorTint}
            size={36}
          />
          <div>
            <div className={styles.paName}>
              <span className={styles.nameRow}>
                {post.authorName}
                <MemberStaffBadge slug={post.slug} />
              </span>
            </div>
            <div className={styles.paTime}>
              {post.time} · {post.context}
            </div>
          </div>
        </div>
        <div className={styles.postHeaderEnd}>
          <button
            type="button"
            className={styles.btnOutline}
            onClick={() =>
              contact({ slug: post.slug, name: post.authorName })
            }
          >
            {connected
              ? t("connect:contact.message")
              : t("feed:action.connect")}
          </button>
          <MoreMenu
            authorName={post.authorName}
            slug={post.slug}
            onReport={() => setReporting(true)}
          />
        </div>
      </div>
      <div className={styles.postBody}>{post.body}</div>
      <PostActions
        liked={liked}
        likeCount={likeCount}
        onLike={() => {
          const next = !liked;
          setLiked(next);
          setLikeCount((c) => (liked ? c - 1 : c + 1));
          likePost.mutate({ id: post.id, liked: next });
        }}
        replyCount={replies.length}
        onToggleReply={() => setComposing((c) => !c)}
        saved={saved}
        onSave={() =>
          toggleSave({
            id: post.id,
            kind: "post",
            title: post.body.slice(0, 60),
            meta: post.authorName,
            description: post.body,
          })
        }
      />
      {composing && (
        <ReplyComposer
          onSubmit={addReply}
          onCancel={() => setComposing(false)}
        />
      )}
      {replies.length === 0 && !composing && (
        <EmptyState
          compact
          icon={<FiMessageCircle />}
          title={t("feed:post.emptyReplies.title")}
          description={t("feed:post.emptyReplies.description")}
          action={{
            label: t("feed:composer.srLabel"),
            onClick: () => setComposing(true),
          }}
        />
      )}
      {replies.length > 0 && (
        <ul className={styles.thread}>
          {replies.map((r) => (
            <li key={r.id} className={styles.reply}>
              <span className={styles.replyAuthorRow}>
                <span className={styles.replyAuthor}>{r.author}</span>
                <MemberStaffBadge slug={r.authorSlug} />
              </span>
              <span className={styles.replyBody}>{r.body}</span>
            </li>
          ))}
        </ul>
      )}
      {reporting && (
        <ReportModal
          authorName={post.authorName}
          subjectId={post.id}
          subjectType="post"
          onClose={() => setReporting(false)}
        />
      )}
    </article>
  );
}

export function SavedArticleCard() {
  const { t } = useTranslation();
  return (
    <article className={`${styles.card} ${styles.pad}`}>
      <div className={styles.savedEyebrow}>
        {t("feed:card.savedArticle.eyebrow")}
      </div>
      <div className={styles.savedTitle}>
        The Quiet Politics of Chosen Family
      </div>
      <div className={styles.savedSource}>
        QueerPulse Magazine · Issue 17 · 6 min read
      </div>
      <Link className={styles.savedLink} to={routes.article}>
        {t("feed:action.continueReading")}
      </Link>
    </article>
  );
}

export function RecapCard() {
  const { t } = useTranslation();
  return (
    <article className={`${styles.card} ${styles.pad}`}>
      <div className={styles.recapEyebrow}>{t("feed:card.recap.eyebrow")}</div>
      <div className={styles.savedTitle}>Pride Brunch — June Edition</div>
      <div className={styles.savedSource}>
        You attended · 3 days ago · 38 people were there
      </div>
      <Link className={styles.savedLink} to={routes.gatheringRecap}>
        {t("feed:action.readRecap")}
      </Link>
    </article>
  );
}
