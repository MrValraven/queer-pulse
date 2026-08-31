import type { ReactNode } from "react";
import {
  Button,
  FadeIn,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { useCommunityMembership } from "../../app/providers/useCommunityMembership";
import { CommunityJoinFlowModal } from "./CommunityJoinFlowModal";
import { CommunityCard } from "./CommunityCard";
import { FeaturedCommunityCard } from "./FeaturedCommunityCard";
import { SuggestedCommunitiesSection } from "./SuggestedCommunitiesSection";
import { CommunitiesDiscoverEmptyState } from "./CommunitiesDiscoverEmptyState";
import type { DiscoverCommunities } from "./useDiscoverCommunities";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./CommunitiesPage.module.css";

function CommunityCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <SkeletonLine width={84} height={20} style={{ borderRadius: 6 }} />
      <SkeletonLine width="70%" height={21} />
      <SkeletonLine width="100%" height={14} />
      <SkeletonLine width="85%" height={14} />
      <div className={styles.foot}>
        <SkeletonLine width={90} height={13} />
        <SkeletonLine width={64} height={13} />
      </div>
    </div>
  );
}

/**
 * The communities card grid — shared verbatim by both `/communities` tabs. The
 * `discover` state driving it is owned by `CommunitiesHubPage` and shared with
 * the toolbar in the page header, which is where the search, Refine drawer and
 * chip row live. Its `scope` is the only difference between the two tabs:
 * "discover" draws from the platform directory, "mine" from the viewer's own
 * memberships (see `useDiscoverCommunities`). Renders bare, with no page
 * background or `.wrap` of its own, so each tab's body can place it.
 *
 * `beforeGrid` is a slot above the cards — the "My communities" tab drops its
 * weekly digest in there.
 *
 * `isPending` lets the host hold the grid on its skeletons past its own
 * fetch. The "My communities" tab needs it: its membership map (a separate
 * query) decides whether the tab shows this grid at all, so if the list
 * endpoint lands first the grid would otherwise flash "no communities match"
 * before the host even knows whether the member has any.
 */
export function CommunitiesGrid({
  discover,
  beforeGrid,
  isPending = false,
}: {
  discover: DiscoverCommunities;
  beforeGrid?: ReactNode;
  isPending?: boolean;
}) {
  const { t } = useTranslation();
  const { isMember } = useCommunityMembership();
  const { demoMode, featured, scope } = discover;
  const isShowingSkeletons = discover.isShowingSkeletons || isPending;

  /** Demo reads the session membership store; live trusts the card's own DTO. */
  const isJoined = (
    slug: string | undefined,
    myRole: string | null | undefined,
  ) => (demoMode ? (slug ? isMember(slug) : false) : myRole != null);

  return (
    <>
      {beforeGrid}

      {discover.isShowingFeatured && featured && (
        <div className={styles.featured}>
          <FeaturedCommunityCard
            community={featured}
            isJoined={isJoined(featured.slug, featured.myRole)}
          />
        </div>
      )}

      {/* "Suggested for you" sits between the featured hero and the browse
          grid, the same slot the featured card occupies in the discovery
          hierarchy. Discover only: on "My communities" every suggestion is by
          definition a community the viewer has not joined, which is a stranger
          in a list of your own. It also drops out the moment the member starts
          narrowing the directory, same rule as the featured card: a
          connection-ranked band is not an answer to a search they typed. The
          section renders nothing when the list is empty, so most viewers see
          no change here at all. */}
      {scope === "discover" && !discover.hasActiveRefinement && (
        <SuggestedCommunitiesSection excludeSlug={featured?.slug} />
      )}

      {!isShowingSkeletons && discover.hasListFailed ? (
        <LoadErrorState onRetry={discover.retryList} />
      ) : !isShowingSkeletons && discover.visible.length === 0 ? (
        <CommunitiesDiscoverEmptyState
          q={discover.q}
          filter={discover.filter}
          isOpenOnly={discover.isOpenOnly}
          isBusyOnly={discover.isBusyOnly}
          tagIds={discover.tagIds}
          setSearchInput={discover.setSearchInput}
          setFilter={discover.setFilter}
          setOpenOnly={discover.setIsOpenOnly}
          setBusyOnly={discover.setIsBusyOnly}
          setTagIds={discover.setTagIds}
        />
      ) : (
        <div className={styles.grid}>
          {isShowingSkeletons
            ? Array.from({ length: 6 }).map((_, index) => (
                <CommunityCardSkeleton key={index} />
              ))
            : discover.gridItems.map((community, index) => (
                // Keyed by slug: two communities may legitimately share a
                // name, and a name can be edited under React's feet.
                <FadeIn
                  key={community.slug ?? community.href}
                  delay={Math.min(index, 8) * 60}
                >
                  <CommunityCard
                    community={community}
                    joined={isJoined(community.slug, community.myRole)}
                    onJoin={discover.setJoining}
                  />
                </FadeIn>
              ))}
        </div>
      )}

      {!isShowingSkeletons && !discover.needsDrain && discover.hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            type="button"
            variant="ghost"
            disabled={discover.isFetchingNextPage}
            onClick={discover.fetchNextPage}
          >
            {discover.isFetchingNextPage
              ? t("communities:discover.loadingMore")
              : t("communities:discover.loadMoreCta")}
          </Button>
        </div>
      )}

      {discover.joining && (
        <CommunityJoinFlowModal
          community={discover.joining}
          onClose={() => discover.setJoining(null)}
        />
      )}
    </>
  );
}
