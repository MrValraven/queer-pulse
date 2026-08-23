import type { ReactNode } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useCommunityMembership } from "../../app/providers/useCommunityMembership";
import { CommunityJoinFlowModal } from "./CommunityJoinFlowModal";
import { CommunityCard } from "./CommunityCard";
import { FeaturedCommunityCard } from "./FeaturedCommunityCard";
import { CommunitiesDiscoverControls } from "./CommunitiesDiscoverControls";
import { CommunitiesDiscoverEmptyState } from "./CommunitiesDiscoverEmptyState";
import { useDiscoverCommunities } from "./useDiscoverCommunities";
import type { CommunitiesScope } from "./communitiesDiscover.data";
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
 * The communities card grid with its whole filter/sort bar — shared verbatim
 * by both `/communities` tabs. `scope` is the only difference between them:
 * "discover" draws from the platform directory, "mine" from the viewer's own
 * memberships (see `useDiscoverCommunities`). Renders bare, with no page
 * background or `.wrap` of its own, so each tab's body can place it.
 *
 * `afterFilters` is a slot between the category chips and the results line —
 * the "My communities" tab drops its weekly digest in there, which is why the
 * digest sits inside the filter bar rather than above the whole page.
 */
export function CommunitiesGrid({
  scope = "discover",
  afterFilters,
}: {
  scope?: CommunitiesScope;
  afterFilters?: ReactNode;
}) {
  const { t } = useTranslation();
  const { isMember } = useCommunityMembership();
  const discover = useDiscoverCommunities(scope);
  const { demoMode, featured, isShowingSkeletons } = discover;

  /** Demo reads the session membership store; live trusts the card's own DTO. */
  const isJoined = (
    slug: string | undefined,
    myRole: string | null | undefined,
  ) => (demoMode ? (slug ? isMember(slug) : false) : myRole != null);

  return (
    <>
      <CommunitiesDiscoverControls
        searchInput={discover.searchInput}
        setSearchInput={discover.setSearchInput}
        isOpenOnly={discover.isOpenOnly}
        setIsOpenOnly={discover.setIsOpenOnly}
        isBusyOnly={discover.isBusyOnly}
        setIsBusyOnly={discover.setIsBusyOnly}
        sort={discover.sort}
        setSort={discover.setSort}
        filter={discover.filter}
        setFilter={discover.setFilter}
        tagIds={discover.tagIds}
        setTagIds={discover.setTagIds}
        categoryCounts={discover.categoryCounts}
        resultCount={
          discover.gridItems.length + (discover.isShowingFeatured ? 1 : 0)
        }
        hasActiveRefinement={discover.hasActiveRefinement}
        onReset={discover.resetRefinements}
        isShowingResline={!isShowingSkeletons}
        afterFilters={afterFilters}
      />

      {discover.isShowingFeatured && featured && (
        <div className={styles.featured}>
          <FeaturedCommunityCard
            community={featured}
            isJoined={isJoined(featured.slug, featured.myRole)}
          />
        </div>
      )}

      {!isShowingSkeletons && discover.visible.length === 0 ? (
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
