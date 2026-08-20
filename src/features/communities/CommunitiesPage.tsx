import { useState } from "react";
import { FiUsers } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  Reveal,
  SearchInput,
  Select,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDebouncedValue, useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { useCommunityMembership } from "../../app/providers/useCommunityMembership";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import type { Community, CommunityType } from "../homepage/data/types";
import { useCommunities } from "./api/useCommunities";
import { useJoinCommunity } from "./api/useCommunityMutations";
import { getLiving } from "./livingCommunities.data";
import { JoinModal } from "./JoinModal";
import { CommunityCard } from "./CommunityCard";
import styles from "./CommunitiesPage.module.css";

type DiscoverSort = "newest" | "name";
const SORT_OPTIONS: DiscoverSort[] = ["newest", "name"];

const FILTERS: { value: "all" | CommunityType; labelKey: string }[] = [
  { value: "all", labelKey: "communities:category.all" },
  { value: "social", labelKey: "communities:category.social" },
  { value: "arts", labelKey: "communities:category.arts" },
  { value: "activism", labelKey: "communities:category.activism" },
  { value: "support", labelKey: "communities:category.support" },
  { value: "sports", labelKey: "communities:category.sports" },
  { value: "professional", labelKey: "communities:category.professional" },
];

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
  const {
    items: communities,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
  } = useCommunities({
    q: q || undefined,
    sort: sort === "newest" ? undefined : sort,
    type: filter === "all" ? undefined : filter,
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

  // The server now does the real `type` filtering (`useCommunities`'s `type`
  // param), so `communities` already IS the filtered set — no more
  // client-side re-filter over just the loaded page, which used to false-
  // negative "no communities match" once a filtered category had more than
  // one page (COM-3).
  const visible = communities;

  return (
    <>
      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.controlsRow}>
            <SearchInput
              className={styles.search}
              value={searchInput}
              onChange={setSearchInput}
              placeholder={t("communities:discover.search.placeholder")}
              ariaLabel={t("communities:discover.search.ariaLabel")}
            />

            <label className={styles.sort}>
              <span className={styles.sortLabel}>
                {t("communities:discover.sort.label")}
              </span>
              <Select
                size="sm"
                value={sort}
                options={SORT_OPTIONS.map((option) => ({
                  value: option,
                  label: t(`communities:discover.sort.${option}`),
                }))}
                onChange={(next) => setSort((next as DiscoverSort) ?? sort)}
              />
            </label>
          </div>

          <Reveal className={styles.filters}>
            {FILTERS.map((option) => (
              <button
                type="button"
                key={option.value}
                className={[
                  styles.chip,
                  filter === option.value && styles.chipActive,
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setFilter(option.value)}
              >
                {t(option.labelKey)}
              </button>
            ))}
          </Reveal>

          {/* `type`/`q` are now server-side query params (COM-3), so `visible`
              (=`communities`) already IS the filtered, searched result — an
              empty list here means the server found nothing, not that a
              client-side re-filter over one loaded page came up short. Order
              matters: search takes priority (it's the more specific action
              the member just took), then the category filter, then the
              platform-wide "nothing exists yet" fallback. */}
          {!loading && visible.length === 0 ? (
            q ? (
              <EmptyState
                icon={<FiUsers />}
                title={t("communities:discover.empty.search.title")}
                description={t(
                  "communities:discover.empty.search.description",
                )}
                action={{
                  label: t("communities:discover.empty.search.cta"),
                  onClick: () => setSearchInput(""),
                }}
              />
            ) : filter !== "all" ? (
              <EmptyState
                icon={<FiUsers />}
                title={t("communities:discover.empty.filtered.title")}
                description={t(
                  "communities:discover.empty.filtered.description",
                )}
                action={{
                  label: t("communities:discover.empty.filtered.cta"),
                  onClick: () => setFilter("all"),
                }}
              />
            ) : (
              <EmptyState
                icon={<FiUsers />}
                title={t("communities:discover.empty.none.title")}
                description={t("communities:discover.empty.none.description")}
                action={{
                  label: t("communities:discover.empty.none.cta"),
                  to: routes.startCommunity,
                }}
              />
            )
          ) : (
            <div className={styles.grid}>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <CommunityCardSkeleton key={i} />
                  ))
                : visible.map((community, index) => (
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

          {!loading && hasNextPage && (
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
