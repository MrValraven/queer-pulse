import { FiAlertTriangle, FiArrowLeft, FiMessageCircle } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import {
  Button,
  EmptyState,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { communityPath, routes } from "../../app/routeMap";
import { ReportReplyModal } from "../forum/ReportReplyModal";
import { PulseFeedPost } from "./PulseFeedPost";
import { useCommunityPostState } from "./useCommunityPostState";
import styles from "./CommunityPostPage.module.css";

/** The skeleton the page paints while the post and its community arrive. */
function CommunityPostSkeleton() {
  return (
    <div className={styles.card} aria-busy="true">
      <div className={styles.skeletonHead}>
        <SkeletonAvatar size={40} />
        <SkeletonLine height={12} width="40%" />
      </div>
      <SkeletonLine height={12} style={{ margin: "14px 0 6px" }} />
      <SkeletonLine height={12} width="80%" />
    </div>
  );
}

/**
 * A single community post at its own address, `/community/:slug/post/:postId`.
 *
 * This is the destination every "someone replied to your post" and "you were
 * mentioned" notification wants, and the thing a member copies when they want
 * to quote a post to someone else. It is a real route rather than a `?post=`
 * query parameter with scroll-and-highlight, because the Pulse timeline is
 * paginated: a post twelve pages deep is not on screen to scroll to, and
 * loading twelve pages to reach one post is the dead-end this replaces.
 *
 * Permissions are the timeline's, unchanged. The backend answers
 * `GET /communities/:slug/posts/:id` with the same 404 the timeline gives for
 * a private community the viewer is not in, so a post id proves nothing; a
 * non-member of an open community reads the post and its replies with the
 * composer withheld, exactly as they read the timeline.
 */
export function CommunityPostPage() {
  const { t } = useTranslation();
  const state = useCommunityPostState();

  if (state.status === "notFound") {
    return (
      <PageShell>
        <div className={styles.body}>
          <div className="wrap">
            <EmptyState
              icon={<FiMessageCircle />}
              title={t("communities:post.notFound.title")}
              description={t("communities:post.notFound.description")}
              action={{
                label: t("communities:post.notFound.cta"),
                to: state.slug ? communityPath(state.slug) : routes.communities,
              }}
            />
          </div>
        </div>
      </PageShell>
    );
  }

  if (state.status === "error") {
    return (
      <PageShell>
        <div className={styles.body}>
          <div className="wrap">
            <EmptyState
              icon={<FiAlertTriangle />}
              title={t("common:error.title")}
              description={t("common:error.description")}
              action={{
                label: t("common:error.retry"),
                onClick: state.refetch,
              }}
            />
          </div>
        </div>
      </PageShell>
    );
  }

  if (state.status === "loading") {
    return (
      <PageShell>
        <div className={styles.body}>
          <div className="wrap">
            <CommunityPostSkeleton />
          </div>
        </div>
      </PageShell>
    );
  }

  const {
    slug,
    community,
    post,
    isJoined,
    canModerate,
    repliesPaging,
    actions,
  } = state;

  return (
    <PageShell>
      <PageMeta
        title={t("communities:seo.post.title", { name: community.name })}
      />
      <div className={styles.body}>
        <div className="wrap">
          <Button
            variant="ghost"
            size="sm"
            to={communityPath(slug)}
            className={styles.back}
          >
            <FiArrowLeft aria-hidden />{" "}
            {t("communities:post.backTo", { name: community.name })}
          </Button>

          <h1 className={styles.heading}>
            {t("communities:post.heading", { name: community.name })}
          </h1>

          <PulseFeedPost
            post={post}
            postProps={{
              roleOf: actions.roleOf,
              isMember: isJoined,
              viewer: actions.viewer,
              canModerate,
              onReactPost: actions.onReactPost,
              onReplyPost: actions.onReplyPost,
              onTogglePin: actions.onTogglePin,
              onReportPost: actions.onReportPost,
              onReportReply: actions.onReportReply,
            }}
          />

          {repliesPaging.hasMore && (
            <div className={styles.loadMore}>
              <Button
                type="button"
                variant="ghost"
                disabled={repliesPaging.isLoadingMore}
                onClick={repliesPaging.loadMore}
              >
                {repliesPaging.isLoadingMore
                  ? t("communities:detail.pulse.loadingMore")
                  : t("communities:post.loadMoreReplies")}
              </Button>
            </div>
          )}

          {!isJoined && (
            <p className={styles.joinHint}>
              {t("communities:detail.pulse.joinHint", { name: community.name })}
            </p>
          )}
        </div>
      </div>

      {actions.reportTarget && (
        <ReportReplyModal
          authorName={actions.reportTarget.authorName}
          subjectId={actions.reportTarget.subjectId}
          subjectType={actions.reportTarget.subjectType}
          onClose={() => actions.setReportTarget(null)}
        />
      )}
    </PageShell>
  );
}
