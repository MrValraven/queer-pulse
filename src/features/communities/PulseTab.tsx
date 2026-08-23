import { useMemo, useState } from "react";
import { FiSend, FiMessageCircle, FiSearch } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  SearchInput,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useDebouncedValue, useSimulatedLoad } from "../../shared/hooks";
import { ReportReplyModal } from "../forum/ReportReplyModal";
import type { LivingCommunity, Post, PulseMoment } from "./community.model";
import { useCommunityTime } from "./communityTime";
import {
  useCommunityPostSearch,
  type PulsePaging,
} from "./api/useCommunityPosts";
import { CommunityFrozenComposerNotice } from "./CommunityFrozenComposerNotice";
import { CommunityPostComposer } from "./CommunityPostComposer";
import { CommunityWelcomeCard } from "./CommunityWelcomeCard";
import { PulseFeedPost } from "./PulseFeedPost";
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
  canAnnounce = false,
  frozen = false,
  paging,
}: {
  community: LivingCommunity;
  name: string;
  isMember: boolean;
  /** Owner/mod — gates the pin/unpin action on each post. */
  canModerate?: boolean;
  /** Owner, co-owner or moderator — gates the composer's announcement switch.
   *  A plain member who somehow sent one would get a 403 from the server. */
  canAnnounce?: boolean;
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

  // Server-side search across the community's whole history, so a match on
  // page 40 is found without the member ever loading page 40. The term is
  // debounced because every keystroke would otherwise be a request.
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm.trim(), 300);
  const isSearching = debouncedSearchTerm.length > 0;
  const search = useCommunityPostSearch(community.slug, debouncedSearchTerm);

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
      {isMember && (
        <CommunityWelcomeCard
          key={community.slug}
          slug={community.slug}
          communityName={name}
        />
      )}

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
            submitLabel={t(
              actions.isAnnouncementDraft
                ? "communities:detail.pulse.announcement.shareCta"
                : "communities:detail.pulse.shareCta",
            )}
            submitIcon={<FiSend aria-hidden />}
            attach={actions.imageAttach}
            {...(canAnnounce
              ? {
                  announcement: {
                    isOn: actions.isAnnouncementDraft,
                    onToggle: actions.setIsAnnouncementDraft,
                  },
                }
              : {})}
          />
        )
      ) : (
        <div className={styles.joinHint}>
          {t("communities:detail.pulse.joinHint", { name })}
        </div>
      )}

      {/* Live only: demo mode has no server to search, and its whole feed is
          already on screen. */}
      {!demoMode && (
        <div className={styles.searchRow}>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            className={styles.searchInput}
            placeholder={t("communities:detail.pulse.search.placeholder", {
              name,
            })}
            ariaLabel={t("communities:detail.pulse.search.ariaLabel", { name })}
          />
        </div>
      )}

      {isSearching ? (
        <PulseSearchResults
          searchTerm={debouncedSearchTerm}
          search={search}
          postProps={postProps}
        />
      ) : (
        <>
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
              <PulseFeedPost post={post} isPinned postProps={postProps} />
            </FadeIn>
          ))}

          {feed.map((item, index) =>
            item.post ? (
              <FadeIn
                key={item.post.id}
                className={styles.rowFade}
                delay={Math.min(index, 8) * 55}
              >
                <PulseFeedPost post={item.post} postProps={postProps} />
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
        </>
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

/**
 * The search half of the Pulse tab: matches, their own load-more, and the
 * empty/failed states. Its own component so `PulseTab` stays under the repo's
 * 200-line limit.
 *
 * The results carry no "only the posts already loaded" caveat, because there
 * is none: the backend applies `q` in-query across the community's whole
 * history, so what is missing from these results is genuinely not there.
 */
function PulseSearchResults({
  searchTerm,
  search,
  postProps,
}: {
  searchTerm: string;
  search: ReturnType<typeof useCommunityPostSearch>;
  postProps: Parameters<typeof PulseFeedPost>[0]["postProps"];
}) {
  const { t } = useTranslation();

  if (search.isLoading) return <PulseFeedSkeleton />;

  if (search.isError) {
    return (
      <EmptyState
        icon={<FiSearch />}
        title={t("communities:detail.pulse.search.errorTitle")}
        description={t("communities:detail.pulse.search.errorDescription")}
      />
    );
  }

  if (search.matches.length === 0) {
    return (
      <EmptyState
        icon={<FiSearch />}
        title={t("communities:detail.pulse.search.emptyTitle")}
        description={t("communities:detail.pulse.search.emptyDescription", {
          term: searchTerm,
        })}
      />
    );
  }

  return (
    <>
      <p className={styles.searchCount} role="status">
        {t("communities:detail.pulse.search.resultCount", {
          count: search.matches.length,
        })}
      </p>
      {search.matches.map((post) => (
        <FadeIn key={post.id} className={styles.rowFade}>
          <PulseFeedPost post={post} postProps={postProps} />
        </FadeIn>
      ))}
      {search.hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            type="button"
            variant="ghost"
            disabled={search.isFetchingNextPage}
            onClick={search.fetchNextPage}
          >
            {search.isFetchingNextPage
              ? t("communities:detail.pulse.loadingMore")
              : t("communities:detail.pulse.search.loadMoreCta")}
          </Button>
        </div>
      )}
    </>
  );
}
