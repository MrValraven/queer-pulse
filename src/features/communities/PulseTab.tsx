import { useEffect, useMemo, useState } from "react";
import { FiSend, FiCornerUpLeft, FiMessageCircle, FiImage, FiX } from "react-icons/fi";
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
import { PostActionsMenu } from "../forum/PostActionsMenu";
import { ReportReplyModal } from "../forum/ReportReplyModal";
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
  useUpdatePost,
} from "./api/useCommunityMutations";
import type { PulsePaging } from "./api/useCommunityPosts";
import { usePostImageAttach } from "./usePostImageAttach";
import { CommunityFrozenComposerNotice } from "./CommunityFrozenComposerNotice";
import styles from "./PulseTab.module.css";

// The content currently being reported — mirrors the shape `ReportReplyModal`
// (shared with the forum) already expects.
type ReportTarget = {
  authorName: string;
  subjectId: string;
  subjectType: "post" | "reply";
};

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
  canModerate = false,
  onReactPost,
  onReplyPost,
  onTogglePin,
  onReportPost,
  onReportReply,
}: {
  post: Post;
  roleOf: (p: Post["author"]) => ReturnType<ReturnType<typeof roleLookup>>;
  /** Members can react and reply; non-members see counts read-only. */
  isMember: boolean;
  /** The signed-in viewer, so their own optimistic reply shows their real
   *  name/avatar rather than a generic "You". */
  viewer: Person | null;
  pinned?: boolean;
  /** Owner/mod — gates the pin/unpin action. */
  canModerate?: boolean;
  /** Persist a reaction toggle (no-op in demo — local state owns the UI). */
  onReactPost?: (id: string, key: ReactionKey, willReact: boolean) => void;
  /** Persist a reply (no-op in demo). `onDone` fires when the live mutation
   *  succeeds so the caller can clear its optimistic reply copy; `onFailed`
   *  fires on error so the caller can roll the optimistic reply back. */
  onReplyPost?: (
    id: string,
    text: string,
    onDone?: () => void,
    onFailed?: () => void,
  ) => void;
  onTogglePin?: (post: Post) => void;
  onReportPost?: (post: Post) => void;
  /** Member-only report on a reply that isn't the viewer's own — the same
   *  generic reports flow as `onReportPost`, just for a reply subject. */
  onReportReply?: (reply: PostReply) => void;
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
    const optimisticReply: PostReply = {
      author: viewer ?? { initials: "Me", name: "You", tint: "plum" },
      text,
      time: t("communities:common.justNow"),
    };
    setAdded((prev) => [...prev, optimisticReply]);
    setReplyDraft("");
    onReplyPost?.(
      post.id,
      text,
      () => setAdded([]),
      () => setAdded((prev) => prev.filter((r) => r !== optimisticReply)),
    );
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
  // Live "is this my post" check — no DTO flag says so directly (`canEdit` is
  // also true for a mod editing someone else's post), so compare the
  // viewer's own slug to the author's. Drives hiding "Report" on your own post.
  const isOwnPost = demoMode
    ? post.author.name === "You"
    : !!viewer?.slug && viewer.slug === post.author.slug;
  const canPin = canModerate && !post.deleted;
  const canReport = isMember && !isOwnPost && !post.deleted;
  // Same own-content check as `isOwnPost`, applied per-reply since replies
  // don't share the post's flags.
  const isOwnReply = (reply: PostReply) =>
    demoMode
      ? reply.author.name === "You"
      : !!viewer?.slug && viewer.slug === reply.author.slug;
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
        {(canPin || canReport) && (
          <span className={styles.pMenu}>
            <PostActionsMenu
              canEdit={false}
              canDelete={false}
              canRestore={false}
              canViewHistory={false}
              onEdit={() => {}}
              onDelete={() => {}}
              onRestore={() => {}}
              onHistory={() => {}}
              canPin={canPin}
              pinned={!!post.pinned}
              onTogglePin={() => onTogglePin?.(post)}
              canReport={canReport}
              onReport={() => onReportPost?.(post)}
            />
          </span>
        )}
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
      {replies.map((rep, i) => {
        const canReportReply = isMember && !isOwnReply(rep) && !rep.deleted;
        return (
          <div className={styles.reply} key={`${rep.author.name}-${i}`}>
            <div
              className={[styles.rAv, AV_CLASS[rep.author.tint]].join(" ")}
            >
              {rep.author.initials}
            </div>
            <div className={styles.rBody}>
              <div className={styles.rHead}>
                <span className={styles.rName}>{rep.author.name}</span>{" "}
                <MemberStaffBadge slug={rep.author.slug} />{" "}
                <span className={styles.rTime}>{rep.time}</span>
                {canReportReply && (
                  <span className={styles.rMenu}>
                    <PostActionsMenu
                      canEdit={false}
                      canDelete={false}
                      canRestore={false}
                      canViewHistory={false}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onRestore={() => {}}
                      onHistory={() => {}}
                      canReport
                      onReport={() => onReportReply?.(rep)}
                    />
                  </span>
                )}
              </div>
              <div className={styles.rText}>{rep.text}</div>
            </div>
          </div>
        );
      })}
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
  canModerate = false,
  frozen = false,
  paging,
}: {
  community: LivingCommunity;
  name: string;
  isMember: boolean;
  /** Owner/mod — gates the pin/unpin action on each post. */
  canModerate?: boolean;
  /** True while the community is auto-frozen — swaps the composer for an
   *  explanation instead of leaving it open to a 403. */
  frozen?: boolean;
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
  const updatePost = useUpdatePost(community.slug);
  const {
    image: attachedImage,
    uploading: imageUploading,
    error: imageError,
    inputRef: imageInputRef,
    handleFile: handleImageFile,
    remove: removeAttachedImage,
    openPicker: openImagePicker,
  } = usePostImageAttach();
  const roleOf = useMemo(
    () => roleLookup(community.roster),
    [community.roster],
  );
  const [draft, setDraft] = useState("");
  const [mine, setMine] = useState<Post[]>([]);
  // Demo-only pin overrides, keyed by post id — live mode relies on the
  // refetch a successful `useUpdatePost` mutation triggers to move the post
  // between the pinned/regular lists (see `postsToPulse`).
  const [pinOverrides, setPinOverrides] = useState<Record<string, boolean>>({});
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

  const onError = () => showToast(t("communities:common.error"), "error");

  const isPinnedEffective = (post: Post) =>
    pinOverrides[post.id] ?? !!post.pinned;

  // Persist handlers threaded into each post. Demo mode no-ops (the local
  // optimistic state owns the UI); live mode hits the API + invalidates.
  const onReactPost = (id: string, key: ReactionKey, willReact: boolean) => {
    if (willReact) react.mutate({ id, key });
    else unreact.mutate({ id, key });
  };
  const onReplyPost = (
    id: string,
    text: string,
    onDone?: () => void,
    onFailed?: () => void,
  ) => {
    if (demoMode) return;
    reply.mutate(
      { id, text },
      {
        onSuccess: onDone,
        onError: () => {
          onFailed?.();
          onError();
        },
      },
    );
  };
  const onTogglePin = (post: Post) => {
    const next = !isPinnedEffective(post);
    if (demoMode) {
      setPinOverrides((prev) => ({ ...prev, [post.id]: next }));
    } else {
      updatePost.mutate({ id: post.id, dto: { pinned: next } }, { onError });
    }
    showToast(
      t(
        next
          ? "communities:common.pinnedToast"
          : "communities:common.unpinnedToast",
      ),
      "success",
    );
  };
  const onReportPost = (post: Post) => {
    setReportTarget({
      authorName: post.author.name,
      subjectId: post.id,
      subjectType: "post",
    });
  };
  const onReportReply = (reply: PostReply) => {
    // A reply's backend id (absent on a demo/optimistic reply that hasn't
    // round-tripped through the API) is the report's subject id.
    if (!reply.id) return;
    setReportTarget({
      authorName: reply.author.name,
      subjectId: reply.id,
      subjectType: "reply",
    });
  };

  const share = () => {
    const text = draft.trim();
    if (!text) return;
    const stagedImage = attachedImage;
    const optimisticId = `me-${mine.length}-${Date.now()}`;
    setMine((prev) => [
      {
        id: optimisticId,
        author: viewer ?? { initials: "Me", name: "You", tint: "plum" },
        body: text,
        image: stagedImage?.previewUrl,
        kind: "post",
        reactions: [{ key: "heart", count: 0 }],
        replies: [],
        time: t("communities:common.justNow"),
        communitySlug: community.slug,
      },
      ...prev,
    ]);
    setDraft("");
    removeAttachedImage();
    if (demoMode) {
      showToast(t("communities:detail.pulse.sharedToast"), "success");
      return;
    }
    createPost.mutate(
      { body: text, image: stagedImage?.key },
      {
        onSuccess: () => {
          setMine([]);
          showToast(t("communities:detail.pulse.sharedToast"), "success");
        },
        onError: () => {
          setMine((prev) => prev.filter((post) => post.id !== optimisticId));
          onError();
        },
      },
    );
  };

  // Merge the pinned + regular lists once so a pin override can move a post
  // between the two sections without waiting on a refetch (demo mode has no
  // refetch to rely on — see `isPinnedEffective`).
  const allLivingPosts = useMemo(
    () => [...community.pinned, ...community.pulse],
    [community.pinned, community.pulse],
  );
  const pinnedPosts = allLivingPosts.filter(isPinnedEffective);
  const regularPosts = allLivingPosts.filter((post) => !isPinnedEffective(post));

  // Interleave system moments between posts so the feed reads as alive.
  const feed: Array<{ post?: Post; moment?: PulseMoment }> = [];
  const posts = [...mine, ...regularPosts];
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
        frozen ? (
          <div style={{ marginBottom: 20 }}>
            <CommunityFrozenComposerNotice />
          </div>
        ) : (
          <div className={styles.composer}>
            <Avatar initials="Me" tint="plum" size={38} />
            <div style={{ flex: 1, minWidth: 0 }}>
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
                style={{ width: "100%" }}
              />
              {attachedImage && (
                <div className={styles.stagedImage}>
                  <img src={attachedImage.previewUrl} alt="" />
                  <button
                    type="button"
                    className={styles.stagedImageRemove}
                    aria-label={t("communities:common.removeImageAria")}
                    onClick={removeAttachedImage}
                  >
                    <FiX aria-hidden />
                  </button>
                </div>
              )}
              {imageError && (
                <p className={styles.imageAttachError} role="alert">
                  {imageError}
                </p>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className={styles.hiddenFileInput}
              onChange={(e) => {
                void handleImageFile(e.target.files?.[0]);
              }}
            />
            <button
              type="button"
              className={styles.attachImageBtn}
              aria-label={t("communities:common.attachImageAria")}
              disabled={imageUploading}
              onClick={openImagePicker}
            >
              <FiImage aria-hidden />
            </button>
            <Button
              variant="primary"
              onClick={share}
              style={{ whiteSpace: "nowrap" }}
            >
              <FiSend aria-hidden /> {t("communities:detail.pulse.shareCta")}
            </Button>
          </div>
        )
      ) : (
        <div className={styles.joinHint}>
          {t("communities:detail.pulse.joinHint", { name })}
        </div>
      )}

      {pinnedPosts.map((post) => (
        <FadeIn key={post.id}>
          <PulsePost
            post={post}
            roleOf={roleOf}
            isMember={isMember}
            viewer={viewer}
            pinned
            canModerate={canModerate}
            onReactPost={onReactPost}
            onReplyPost={onReplyPost}
            onTogglePin={onTogglePin}
            onReportPost={onReportPost}
            onReportReply={onReportReply}
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
              canModerate={canModerate}
              onReactPost={onReactPost}
              onReplyPost={onReplyPost}
              onTogglePin={onTogglePin}
              onReportPost={onReportPost}
              onReportReply={onReportReply}
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

      {reportTarget && (
        <ReportReplyModal
          authorName={reportTarget.authorName}
          subjectId={reportTarget.subjectId}
          subjectType={reportTarget.subjectType}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}
