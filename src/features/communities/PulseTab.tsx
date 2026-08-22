import { useMemo } from "react";
import { FiSend, FiMessageCircle } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSimulatedLoad } from "../../shared/hooks";
import { ReportReplyModal } from "../forum/ReportReplyModal";
import type { LivingCommunity, Post, PulseMoment } from "./community.model";
import { useCommunityTime } from "./communityTime";
import type { PulsePaging } from "./api/useCommunityPosts";
import { CommunityFrozenComposerNotice } from "./CommunityFrozenComposerNotice";
import { CommunityPostComposer } from "./CommunityPostComposer";
import { PulsePost } from "./PulsePost";
import { usePulseTabActions } from "./usePulseTabActions";
import styles from "./PulseTab.module.css";

function PulseFeedSkeleton() {
  return (
    <div aria-busy="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div className={styles.post} key={index}>
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
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const communityTime = useCommunityTime();
  const actions = usePulseTabActions(community);
  // The 500ms placeholder skeleton is a demo-prototype device. Live mode reads
  // the real first-page fetch state instead, so cached data paints at once and
  // a slow fetch is shown honestly for as long as it actually takes.
  const isSimulatedLoading = useSimulatedLoad(500);
  const isLoading = demoMode ? isSimulatedLoading : !!paging.isLoading;

  // Merge the pinned + regular lists once so a pin override can move a post
  // between the two sections without waiting on a refetch (demo mode has no
  // refetch to rely on — see `isPinnedEffective`).
  const allLivingPosts = useMemo(
    () => [...community.pinned, ...community.pulse],
    [community.pinned, community.pulse],
  );
  const pinnedPosts = allLivingPosts.filter(actions.isPinnedEffective);
  const regularPosts = allLivingPosts.filter(
    (post) => !actions.isPinnedEffective(post),
  );

  // Interleave system moments between posts so the feed reads as alive.
  const feed: Array<{ post?: Post; moment?: PulseMoment }> = [];
  [...actions.mine, ...regularPosts].forEach((post, index) => {
    feed.push({ post });
    const moment = community.moments[index];
    if (moment) feed.push({ moment });
  });
  const isFeedEmpty = pinnedPosts.length === 0 && feed.length === 0;

  const postProps = {
    roleOf: actions.roleOf,
    isMember,
    viewer: actions.viewer,
    canModerate,
    onReactPost: actions.onReactPost,
    onReplyPost: actions.onReplyPost,
    onTogglePin: actions.onTogglePin,
    onReportPost: actions.onReportPost,
    onReportReply: actions.onReportReply,
  };

  if (isLoading) return <PulseFeedSkeleton />;

  return (
    <div>
      {isMember ? (
        frozen ? (
          <div style={{ marginBottom: 20 }}>
            <CommunityFrozenComposerNotice />
          </div>
        ) : (
          <CommunityPostComposer
            viewer={actions.viewer}
            className={styles.composer}
            textareaClassName={styles.composerTa}
            placeholder={t("communities:detail.pulse.composerPlaceholder", {
              name,
            })}
            value={actions.draft}
            onChange={actions.setDraft}
            onSubmit={actions.share}
            submitLabel={t("communities:detail.pulse.shareCta")}
            submitIcon={<FiSend aria-hidden />}
            attach={actions.imageAttach}
          />
        )
      ) : (
        <div className={styles.joinHint}>
          {t("communities:detail.pulse.joinHint", { name })}
        </div>
      )}

      {isFeedEmpty && (
        <EmptyState
          icon={<FiMessageCircle />}
          title={t("communities:detail.pulse.empty.title")}
          description={t(
            isMember
              ? "communities:detail.pulse.empty.description"
              : "communities:detail.pulse.empty.visitorDescription",
          )}
        />
      )}

      {pinnedPosts.map((post) => (
        <FadeIn key={post.id} className={styles.rowFade}>
          <PulsePost post={post} isPinned {...postProps} />
        </FadeIn>
      ))}

      {feed.map((item, index) =>
        item.post ? (
          <FadeIn
            key={item.post.id}
            className={styles.rowFade}
            delay={Math.min(index, 8) * 55}
          >
            <PulsePost post={item.post} {...postProps} />
          </FadeIn>
        ) : (
          <FadeIn
            key={`m-${item.moment!.id}`}
            className={styles.rowFade}
            delay={Math.min(index, 8) * 55}
          >
            <div className={styles.moment}>
              <span className={styles.momentDot} />
              {item.moment!.text}
              <span className={styles.momentTime}>
                {communityTime.ago(item.moment!)}
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

      {actions.reportTarget && (
        <ReportReplyModal
          authorName={actions.reportTarget.authorName}
          subjectId={actions.reportTarget.subjectId}
          subjectType={actions.reportTarget.subjectType}
          onClose={() => actions.setReportTarget(null)}
        />
      )}
    </div>
  );
}
