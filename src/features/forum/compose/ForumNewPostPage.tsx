import { useCallback, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import { PageShell } from "../../../shared/components/layout";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { routes, thread as threadPath } from "../../../app/routeMap";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useCreateThreadFlow } from "../useCreateThreadFlow";
import { useForumCounts } from "../api/useForum";
import { useFollowThread, useReply } from "../api/useForumMutations";
import { ForumNewPostMain } from "./ForumNewPostMain";
import { ForumNewPostOverlays } from "./ForumNewPostOverlays";
import { ForumNewPostRail } from "./ForumNewPostRail";
import { useComposeAudiences } from "./useComposeAudiences";
import { useComposeIdentity } from "./useComposeIdentity";
import { useComposeThreadPage } from "./useComposeThreadPage";
import { useComposeThreadPageOverlays } from "./useComposeThreadPageOverlays";
import { useComposeThreadSeeds } from "./useComposeThreadSeeds";
import { useComposeThreadShortcuts } from "./useComposeThreadShortcuts";
import styles from "./ForumNewPostPage.module.css";

// ── /forum/new ──────────────────────────────────────────────────────────────
// The composer as a page of its own, replacing the five-field modal that used
// to open over `/forum`.
//
// This component is the WIRING and nothing else: `useComposeThreadPage` owns
// the draft and everything derived from it, `useCreateThreadFlow` owns the
// publish, `useComposeThreadPageOverlays` owns which card is over the page,
// and the three columns below own their own markup. The page holds the four
// things that genuinely belong to no one else — where the caret goes after a
// starter chip, whether the member is following replies, and the two exits
// (leave, and leave having thrown the draft away).

export function ForumNewPostPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  const seeds = useComposeThreadSeeds();
  const communities = useComposeAudiences();
  const identity = useComposeIdentity();
  const page = useComposeThreadPage({ communities, ...seeds });
  const { hasPosted } = useForumCounts();
  const flow = useCreateThreadFlow({ demoMode, user });
  const titleRef = useRef<HTMLTextAreaElement | null>(null);
  // The backend follows an author to their own thread on create, so the panel
  // opens on the truth and the toggle is a way to opt back out.
  const [isFollowingReplies, setIsFollowingReplies] = useState(true);

  const { state, setters, photos, clearDraft } = page;
  const { publishThread, published, resetPublish, withdrawPublished } = flow;
  const hasUnsavedDraft =
    !!state.title.trim() || !!state.body.trim() || state.photos.length > 0;

  // `void`, because react-router's `navigate` returns `void | Promise<void>`
  // and every caller here is an event handler, not an awaiter.
  const leave = useCallback(() => {
    void navigate(routes.forum);
  }, [navigate]);

  const runPublish = useCallback(
    (
      mode: Parameters<typeof publishThread>[0]["mode"],
      when: string | null,
    ) => {
      publishThread({
        state,
        mode,
        scheduledAtLocal: when,
        canPostAsOfficial: identity.canPostAsOfficial,
      });
    },
    [publishThread, state, identity.canPostAsOfficial],
  );

  const overlays = useComposeThreadPageOverlays({
    isFirstPost: !hasPosted,
    hasUnsavedDraft,
    onPublish: runPublish,
    onLeave: leave,
  });

  const reply = useReply(overlays.replyTarget?.slug);
  const { setFollowing } = useFollowThread();

  useComposeThreadShortcuts({
    isSuspended: overlays.overlay !== null || published !== null,
    onPublish: () => overlays.requestPublish("now"),
    onOpenShortcuts: overlays.openShortcuts,
    onCancel: overlays.requestCancel,
  });

  /** Leaving the success screen is what spends the draft: a publish that
   *  failed, and a post taken back down, both still have one. */
  const finish = useCallback(
    (go: () => void) => {
      void clearDraft();
      resetPublish();
      go();
    },
    [clearDraft, resetPublish],
  );

  const publishedSlug = published?.slug;
  const publishedUrl = publishedSlug
    ? new URL(threadPath(publishedSlug), window.location.origin).toString()
    : null;

  return (
    <PageShell>
      <ForumNewPostHeader />

      <div className={styles.layout}>
        <ForumNewPostMain
          page={page}
          communities={communities}
          isPublishing={flow.publishStatus === "publishing"}
          onPublish={overlays.requestPublish}
          onCancel={overlays.requestCancel}
          onOpenShortcuts={overlays.openShortcuts}
          titleRef={titleRef}
        />

        <ForumNewPostRail
          page={page}
          identity={identity}
          onReplyInstead={overlays.requestReplyInstead}
        />
      </div>

      <ForumNewPostOverlays
        page={page}
        overlays={overlays}
        communities={communities}
        postingAsLabel={identity.author?.name ?? t("forum:author.you")}
        published={published}
        publishedUrl={publishedUrl}
        onDiscardDraft={() => {
          void clearDraft();
          setters.reset();
          photos.replaceAll([]);
          leave();
        }}
        onKeepDraft={leave}
        onWithdraw={withdrawPublished}
        onViewPost={() => {
          finish(() => {
            if (publishedSlug) void navigate(threadPath(publishedSlug));
          });
        }}
        onDone={() => {
          finish(leave);
        }}
        onMoveAsReply={() => {
          const target = overlays.replyTarget;
          if (!target) return;
          reply.mutate(
            { body: state.body.trim() },
            {
              onSuccess: () => {
                void clearDraft();
                void navigate(threadPath(target.slug ?? target.id));
              },
            },
          );
        }}
        isFollowingReplies={isFollowingReplies}
        onFollowRepliesChange={(isFollowing) => {
          setIsFollowingReplies(isFollowing);
          if (publishedSlug) setFollowing(publishedSlug, isFollowing);
        }}
      />
    </PageShell>
  );
}

/** Breadcrumb, title and the one line that says what this page is for. */
function ForumNewPostHeader() {
  const { t } = useTranslation();
  return (
    <header className={styles.head}>
      <div>
        <p className={styles.crumb}>
          <Link to={routes.forum} className={styles.crumbLink}>
            {t("forum:composePage.head.crumbForum")}
          </Link>
          <FiChevronRight className={styles.crumbSeparator} aria-hidden />
          {t("forum:composePage.head.crumbCurrent")}
        </p>
        <h1 className={styles.title}>
          <Translation
            i18nKey="forum:composePage.head.title"
            components={{ em: <em /> }}
          />
        </h1>
        <p className={styles.lead}>{t("forum:composePage.head.lead")}</p>
      </div>
    </header>
  );
}
