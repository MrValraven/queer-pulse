import { useEffect, useState } from "react";
import { Button, FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useDebouncedValue, useSimulatedLoad } from "../../shared/hooks";
import { useCommunityMembership } from "../../app/providers/useCommunityMembership";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { Community, CommunityType } from "../homepage/data/types";
import { useCommunities } from "./api/useCommunities";
import { useFeaturedCommunity } from "./api/useFeaturedCommunity";
import { useJoinCommunity } from "./api/useCommunityMutations";
import { getLiving } from "./livingCommunities.data";
import { useCommunitiesTagsFilter } from "./useCommunitiesTagsFilter";
import { JoinModal } from "./JoinModal";
import { CommunityCard } from "./CommunityCard";
import { FeaturedCommunityCard } from "./FeaturedCommunityCard";
import { CommunitiesDiscoverControls } from "./CommunitiesDiscoverControls";
import { CommunitiesDiscoverEmptyState } from "./CommunitiesDiscoverEmptyState";
import { CommunitiesDiscoverOutro } from "./CommunitiesDiscoverOutro";
import { BUSY_THRESHOLD, type DiscoverSort } from "./communitiesDiscover.data";
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

export function CommunitiesDiscover() {
  const { t } = useTranslation();
  const [searchInput, setSearchInput] = useState("");
  // Search only fans out to the network once the member pauses typing for
  // 300ms (same debounce timing as the other list-with-search controls, e.g.
  // AdminListingsHeader) — every distinct debounced term is its own react-query
  // key, so a fresh search naturally restarts pagination at page 1 instead of
  // appending onto whatever the previous term had loaded.
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const q = debouncedSearch.trim();
  // Unlike search, sort isn't debounced — it's a discrete pick, not typed
  // text, so it fans out immediately. Same mechanism resets pagination to
  // page 1 either way: it's part of the react-query key `useCommunities`
  // builds from `params`, so a changed sort is a fresh key, not an append.
  const [sort, setSort] = useState<DiscoverSort>("newest");
  const [filter, setFilter] = useState<"all" | CommunityType>("all");
  const [openOnly, setOpenOnly] = useState(false);
  const [busyOnly, setBusyOnly] = useState(false);
  // Synced with `?tags=` — see the hook's doc comment for why only this
  // filter round-trips through the URL.
  const [tagIds, setTagIds] = useCommunitiesTagsFilter();

  const {
    items: communities,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  } = useCommunities({
    q: q || undefined,
    // "active" isn't a server-side sort (see the drain note below) — leave the
    // server on its default order and re-sort client-side once fully drained.
    sort: sort === "name" ? "name" : undefined,
    type: filter === "all" ? undefined : filter,
    access: openOnly ? "public" : undefined,
    tags: tagIds.length ? tagIds : undefined,
  });
  const loading = useSimulatedLoad() || isLoading;
  const { isMember, join, requestToJoin } = useCommunityMembership();
  const { demoMode } = useDemoMode();
  const [joining, setJoining] = useState<Community | null>(null);
  const joinMutation = useJoinCommunity(joining?.slug ?? "");

  const joiningTier = joining
    ? (getLiving(joining.slug)?.accessTier ??
      joining.accessTier ??
      (joining.privateBadge ? "private" : "public"))
    : "public";

  // The featured card only makes sense against the platform's whole discover
  // pool — once a member is actively narrowing the list (search, category,
  // either toggle) it drops out so it doesn't compete with what they asked for.
  const featured = useFeaturedCommunity();
  const showFeatured =
    Boolean(featured) &&
    !q &&
    filter === "all" &&
    !openOnly &&
    !busyOnly &&
    tagIds.length === 0;

  // The backend can't sort/filter by `activeThisWeek` (it's computed
  // post-pagination, not an indexed column), so "Most active" and "Busy this
  // week" fully drain every remaining page client-side before filtering/
  // sorting in memory — correct results over a handful of extra requests,
  // rather than a "most active" that's silently wrong past page 1.
  const needsDrain = busyOnly || sort === "active";
  useEffect(() => {
    if (needsDrain && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [needsDrain, hasNextPage, isFetchingNextPage, fetchNextPage]);
  const draining = needsDrain && hasNextPage;
  const showSkeletons = loading || draining;

  // The server now does the real `type`/`q`/`access` filtering (`useCommunities`'s
  // params), so `communities` already IS the filtered set — no more client-side
  // re-filter over just the loaded page, which used to false-negative "no
  // communities match" once a filtered category had more than one page (COM-3).
  let visible = communities;
  if (busyOnly) {
    visible = visible.filter(
      (community) => (community.activeThisWeek ?? 0) >= BUSY_THRESHOLD,
    );
  }
  if (sort === "active") {
    visible = [...visible].sort(
      (a, b) => (b.activeThisWeek ?? 0) - (a.activeThisWeek ?? 0),
    );
  }
  const gridItems = showFeatured
    ? visible.filter((community) => community.slug !== featured!.slug)
    : visible;

  // Category-chip counts are deliberately stable across search/sort/toggles —
  // they read against the whole discover pool, not whatever's currently
  // filtered, so switching a chip doesn't make the other chips' numbers jump.
  const {
    items: allForCounts,
    hasNextPage: countsHasNext,
    fetchNextPage: countsFetchNext,
    isFetchingNextPage: countsFetching,
  } = useCommunities({});
  useEffect(() => {
    if (countsHasNext && !countsFetching) countsFetchNext();
  }, [countsHasNext, countsFetching, countsFetchNext]);

  const hasActiveRefinement =
    Boolean(q) || filter !== "all" || openOnly || busyOnly || tagIds.length > 0;

  return (
    <>
      <div className={styles.body}>
        <div className="wrap">
          <CommunitiesDiscoverControls
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            openOnly={openOnly}
            setOpenOnly={setOpenOnly}
            busyOnly={busyOnly}
            setBusyOnly={setBusyOnly}
            sort={sort}
            setSort={setSort}
            filter={filter}
            setFilter={setFilter}
            tagIds={tagIds}
            setTagIds={setTagIds}
            allForCounts={allForCounts}
            countsHasNext={countsHasNext}
            resultCount={gridItems.length + (showFeatured ? 1 : 0)}
            hasActiveRefinement={hasActiveRefinement}
            showResline={!showSkeletons}
          />

          {showFeatured && (
            <div className={styles.featured}>
              <FeaturedCommunityCard
                community={featured!}
                joined={
                  demoMode
                    ? featured!.slug
                      ? isMember(featured!.slug)
                      : false
                    : featured!.myRole != null
                }
              />
            </div>
          )}

          {!showSkeletons && visible.length === 0 ? (
            <CommunitiesDiscoverEmptyState
              q={q}
              filter={filter}
              openOnly={openOnly}
              busyOnly={busyOnly}
              tagIds={tagIds}
              setSearchInput={setSearchInput}
              setFilter={setFilter}
              setOpenOnly={setOpenOnly}
              setBusyOnly={setBusyOnly}
              setTagIds={setTagIds}
            />
          ) : (
            <div className={styles.grid}>
              {showSkeletons
                ? Array.from({ length: 6 }).map((_, i) => (
                    <CommunityCardSkeleton key={i} />
                  ))
                : gridItems.map((community, index) => (
                    <FadeIn
                      key={community.name}
                      delay={Math.min(index, 8) * 60}
                    >
                      <CommunityCard
                        community={community}
                        joined={
                          demoMode
                            ? community.slug
                              ? isMember(community.slug)
                              : false
                            : community.myRole != null
                        }
                        onJoin={setJoining}
                      />
                    </FadeIn>
                  ))}
            </div>
          )}

          {!showSkeletons && !needsDrain && hasNextPage && (
            <div className={styles.loadMore}>
              <Button
                type="button"
                variant="ghost"
                disabled={isFetchingNextPage}
                onClick={fetchNextPage}
              >
                {isFetchingNextPage
                  ? t("communities:discover.loadingMore")
                  : t("communities:discover.loadMoreCta")}
              </Button>
            </div>
          )}

          <CommunitiesDiscoverOutro />
        </div>
      </div>

      {joining && (
        <JoinModal
          community={{
            name: joining.name,
            typeLabel: joining.typeLabel,
            count: joining.count,
            description: joining.description,
          }}
          tier={joiningTier}
          onClose={() => setJoining(null)}
          onJoined={(note) => {
            if (joining.slug) join(joining.slug);
            joinMutation.mutate({ note });
          }}
          onRequested={(note) => {
            if (joining.slug) requestToJoin(joining.slug);
            joinMutation.mutate({ note });
          }}
        />
      )}
    </>
  );
}
