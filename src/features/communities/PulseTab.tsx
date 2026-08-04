import { useEffect, useMemo, useState } from "react";
import { FiSend, FiCornerUpLeft, FiMessageCircle } from "react-icons/fi";
import {
  Avatar,
  Button,
  FadeIn,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useSimulatedLoad } from "../../shared/hooks";
import { MemberStaffBadge } from "../../shared/staff/MemberStaffBadge";
import type {
  LivingCommunity,
  Post,
  PostReply,
  PulseMoment,
  Reaction,
  ReactionKey,
} from "./community.model";
import type { Person } from "./communityDetails";
import { photoOf, roleLookup, viewerPerson } from "./communityPeople";
import { RoleBadge, ReactionBar } from "./CommunityBadges";
import { AV_CLASS } from "./communityAvatar";
import {
  useCreatePost,
  useReact,
  useReply,
  useUnreact,
} from "./api/useCommunityMutations";
import type { PulsePaging } from "./api/useCommunityPosts";
import styles from "./PulseTab.module.css";

function toggle(reactions: Reaction[], key: ReactionKey): Reaction[] {
  return reactions.map((r) =>
    r.key === key
      ? { ...r, reacted: !r.reacted, count: r.count + (r.reacted ? -1 : 1) }
      : r,
  );
}

function PulsePost({
  post,
  roleOf,
  isMember,
  viewer,
  pinned = false,
  onReactPost,
  onReplyPost,
}: {
  post: Post;
  roleOf: (p: Post["author"]) => ReturnType<ReturnType<typeof roleLookup>>;
  /** Members can react and reply; non-members see counts read-only. */
  isMember: boolean;
  /** The signed-in viewer, so their own optimistic reply shows their real
   *  name/avatar rather than a generic "You". */
  viewer: Person | null;
  pinned?: boolean;
  /** Persist a reaction toggle (no-op in demo — local state owns the UI). */
  onReactPost?: (id: string, key: ReactionKey, willReact: boolean) => void;
  /** Persist a reply (no-op in demo). `onDone` fires when the live mutation
   *  succeeds so the caller can clear its optimistic reply copy. */
  onReplyPost?: (id: string, text: string, onDone?: () => void) => void;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [reactions, setReactions] = useState(post.reactions);
  // Re-sync from the server whenever this post's reactions change (a refetch
  // after load-more or a socket invalidation), so the optimistic local copy
  // doesn't drift from the true counts.
  useEffect(() => {
    setReactions(post.reactions);
  }, [post.reactions]);
  const [showReply, setShowReply] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [added, setAdded] = useState<PostReply[]>([]);
  const replies = [...post.replies, ...added];
  // `replies` above is a bounded preview (+ locally-added optimistic replies)
  // — the TRUE total is `post.replyCount` (absent in demo, where the mock's
  // `replies` array already IS the whole list).
  const replyCount = (post.replyCount ?? post.replies.length) + added.length;
  const toggleReply = () => setShowReply((s) => !s);
  const react = (key: ReactionKey) => {
    const willReact = !reactions.find((r) => r.key === key)?.reacted;
    setReactions((r) => toggle(r, key));
    onReactPost?.(post.id, key, willReact);
  };
  const sendReply = () => {
    const text = replyDraft.trim();
    if (!text) return;
    setAdded((prev) => [
      ...prev,
      {
        author: viewer ?? { initials: "Me", name: "You", tint: "plum" },
        text,
        time: t("communities:common.justNow"),
      },
    ]);
    setReplyDraft("");
    onReplyPost?.(post.id, text, () => setAdded([]));
  };
  const replyAction = t("communities:detail.pulse.replyAction");
  const replyLabel = replyCount
    ? t("communities:detail.pulse.replyLabel", { count: replyCount })
    : replyAction;
  // A just-posted item carries the standalone "just now" phrase; every other
  // post carries a relative token ("2h") that reads as "{time} ago". Render the
  // phrase on its own rather than wrapping it into "just now ago".
  const justNow = t("communities:common.justNow");
  const timeLabel =
    post.time === justNow
      ? justNow
      : t("communities:common.timeAgo", { time: post.time });
  return (
    <article
      className={[styles.post, pinned && styles.pinned]
        .filter(Boolean)
        .join(" ")}
    >
      {pinned && (
        <div className={styles.pinFlag}>
          <FiMessageCircle aria-hidden />{" "}
          {t("communities:detail.pulse.pinnedAnnouncement")}
        </div>
      )}
      <header className={styles.pHead}>
        <Avatar
          initials={post.author.initials}
          tint={post.author.tint}
          src={photoOf(post.author, demoMode)}
          size={40}
          alt={post.author.name}
        />
        <div className={styles.pWho}>
          <div className={styles.pName}>
            {post.author.name}{" "}
            <MemberStaffBadge slug={post.author.slug} />{" "}
            <RoleBadge role={roleOf(post.author)} />
          </div>
          <div className={styles.pTime}>{timeLabel}</div>
        </div>
      </header>
      <p className={styles.pBody}>{post.body}</p>
      {post.image && (
        <div className={styles.pImg}>
          <img
            src={post.image}
            alt={t("communities:detail.pulse.imageAlt", {
              name: post.author.name,
            })}
            loading="lazy"
          />
        </div>
      )}
      <div className={styles.pFoot}>
        <ReactionBar
          reactions={reactions}
          onReact={react}
          readOnly={!isMember}
        />
        {isMember ? (
          <span
            role="button"
            tabIndex={0}
            aria-label={replyLabel}
            className={styles.replyBtn}
            onClick={toggleReply}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleReply();
              }
            }}
          >
            <FiCornerUpLeft aria-hidden /> {replyLabel}
          </span>
        ) : (
          replyCount > 0 && (
            <span className={styles.replyBtn}>
              <FiCornerUpLeft aria-hidden /> {replyLabel}
            </span>
          )
        )}
      </div>
      {replies.map((rep, i) => (
        <div className={styles.reply} key={`${rep.author.name}-${i}`}>
          <div className={[styles.rAv, AV_CLASS[rep.author.tint]].join(" ")}>
            {rep.author.initials}
          </div>
          <div>
            <span className={styles.rName}>{rep.author.name}</span>{" "}
            <MemberStaffBadge slug={rep.author.slug} />{" "}
            <span className={styles.rTime}>{rep.time}</span>
            <div className={styles.rText}>{rep.text}</div>
          </div>
        </div>
      ))}
      {showReply && (
        <div className={styles.replyBar}>
          <textarea
            className={styles.replyTa}
            rows={1}
            aria-label={t("communities:detail.pulse.replyPlaceholder")}
            placeholder={t("communities:detail.pulse.replyPlaceholder")}
            value={replyDraft}
            onChange={(e) => setReplyDraft(e.target.value)}
          />
          <Button variant="ghost" style={{ fontSize: 13 }} onClick={sendReply}>
            {replyAction}
          </Button>
        </div>
      )}
    </article>
  );
}

export function PulseTab({
  community,
  name,
  isMember,
  paging,
}: {
  community: LivingCommunity;
  name: string;
  isMember: boolean;
  /** Live-mode pagination for the feed; inert in demo (`hasNextPage: false`). */
  paging: PulsePaging;
}) {
  const loading = useSimulatedLoad(500);
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const viewer = useMemo(() => viewerPerson(user), [user]);
  const createPost = useCreatePost(community.slug);
  const react = useReact(community.slug);
  const unreact = useUnreact(community.slug);
  const reply = useReply(community.slug);
  const roleOf = useMemo(
    () => roleLookup(community.roster),
    [community.roster],
  );
  const [draft, setDraft] = useState("");
  const [mine, setMine] = useState<Post[]>([]);

  // Persist handlers threaded into each post. Demo mode no-ops (the local
  // optimistic state owns the UI); live mode hits the API + invalidates.
  const onReactPost = (id: string, key: ReactionKey, willReact: boolean) => {
    if (willReact) react.mutate({ id, key });
    else unreact.mutate({ id, key });
  };
  const onReplyPost = (id: string, text: string, onDone?: () => void) => {
    if (demoMode) return;
    reply.mutate({ id, text }, { onSuccess: onDone });
  };

  const share = () => {
    const text = draft.trim();
    if (!text) return;
    setMine((prev) => [
      {
        id: `me-${prev.length}`,
        author: viewer ?? { initials: "Me", name: "You", tint: "plum" },
        body: text,
        kind: "post",
        reactions: [{ key: "heart", count: 0 }],
        replies: [],
        time: t("communities:common.justNow"),
        communitySlug: community.slug,
      },
      ...prev,
    ]);
    setDraft("");
    if (!demoMode) {
      createPost.mutate({ body: text }, { onSuccess: () => setMine([]) });
    }
    showToast(t("communities:detail.pulse.sharedToast"), "success");
  };

  // Interleave system moments between posts so the feed reads as alive.
  const feed: Array<{ post?: Post; moment?: PulseMoment }> = [];
  const posts = [...mine, ...community.pulse];
  posts.forEach((post, i) => {
    feed.push({ post });
    if (community.moments[i]) feed.push({ moment: community.moments[i] });
  });

  if (loading) {
    return (
      <div aria-busy="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <div className={styles.post} key={i}>
            <div className={styles.pHead}>
              <SkeletonAvatar size={40} />
              <SkeletonLine height={12} width="40%" />
            </div>
            <SkeletonLine height={12} style={{ margin: "14px 0 6px" }} />
            <SkeletonLine height={12} width="80%" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {isMember ? (
        <div className={styles.composer}>
          <Avatar initials="Me" tint="plum" size={38} />
          <textarea
            className={styles.composerTa}
            rows={1}
            aria-label={t("communities:detail.pulse.composerPlaceholder", {
              name,
            })}
            placeholder={t("communities:detail.pulse.composerPlaceholder", {
              name,
            })}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button
            variant="primary"
            onClick={share}
            style={{ whiteSpace: "nowrap" }}
          >
            <FiSend aria-hidden /> {t("communities:detail.pulse.shareCta")}
          </Button>
        </div>
      ) : (
        <div className={styles.joinHint}>
          {t("communities:detail.pulse.joinHint", { name })}
        </div>
      )}

      {community.pinned.map((post) => (
        <FadeIn key={post.id}>
          <PulsePost
            post={post}
            roleOf={roleOf}
            isMember={isMember}
            viewer={viewer}
            pinned
            onReactPost={onReactPost}
            onReplyPost={onReplyPost}
          />
        </FadeIn>
      ))}

      {feed.map((item, i) =>
        item.post ? (
          <FadeIn key={item.post.id} delay={Math.min(i, 8) * 55}>
            <PulsePost
              post={item.post}
              roleOf={roleOf}
              isMember={isMember}
              viewer={viewer}
              onReactPost={onReactPost}
              onReplyPost={onReplyPost}
            />
          </FadeIn>
        ) : (
          <FadeIn key={`m-${item.moment!.id}`} delay={Math.min(i, 8) * 55}>
            <div className={styles.moment}>
              <span className={styles.momentDot} />
              {item.moment!.text} ·{" "}
              <span className={styles.momentTime}>
                {t("communities:common.timeAgo", { time: item.moment!.time })}
              </span>
            </div>
          </FadeIn>
        ),
      )}

      {paging.hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            type="button"
            variant="ghost"
            disabled={paging.isFetchingNextPage}
            onClick={paging.fetchNextPage}
          >
            {paging.isFetchingNextPage
              ? t("communities:detail.pulse.loadingMore")
              : t("communities:detail.pulse.loadMoreCta")}
          </Button>
        </div>
      )}
    </div>
  );
}
