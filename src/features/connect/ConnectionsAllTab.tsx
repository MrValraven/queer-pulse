import { useMemo, useState } from "react";
import { FiSearch, FiUsers } from "react-icons/fi";
import {
  Button,
  EmptyState,
  FadeIn,
  SearchInput,
  Select,
} from "../../shared/components/ui";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import { ConnectionsGridSkeleton } from "./ConnectionsSkeleton";
import { AllConnectionCard } from "./ConnectionCards";
import {
  MORE_POOL,
  MORE_PER_PAGE,
  connectionViews,
  type ConnectionView,
} from "./connections.data";
import styles from "./ConnectionsPage.module.css";

// i18n label-key indirection: `Sort` stays a stable canonical English id (not
// persisted, but keeping the id/label split avoids recomputing comparisons
// against translated text). The label is resolved via `t()` at render.
const SORTS = ["recentlyConnected", "aToZ", "closestMutuals"] as const;
type Sort = (typeof SORTS)[number];

function sortLabel(sort: Sort, t: TFunction): string {
  switch (sort) {
    case "aToZ":
      return t("connect:allTab.sortAToZ");
    case "closestMutuals":
      return t("connect:allTab.sortClosestMutuals");
    default:
      return t("connect:allTab.sortRecentlyConnected");
  }
}

function matchesView(v: ConnectionView, q: string): boolean {
  return [v.name, v.pron ?? "", v.role, ...v.tags]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export function ConnectionsAllTab({
  loading,
  connected,
  allowMorePool = true,
  isBlocked,
  onUnblock,
  onMessage,
}: {
  loading: boolean;
  /** The already-resolved connection cards for this tab. */
  connected: ConnectionView[];
  /** Whether the mock "Load more" pool is offered (demo only — the live API
   *  paginates its own list, so it would splice in fake members otherwise). */
  allowMorePool?: boolean;
  isBlocked: (slug: string) => boolean;
  onUnblock: (v: ConnectionView) => void;
  onMessage: (slug: string, name: string) => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recentlyConnected");
  const [morePages, setMorePages] = useState(0);

  const revealedSlugs = useMemo(
    () => (allowMorePool ? MORE_POOL.slice(0, morePages * MORE_PER_PAGE) : []),
    [allowMorePool, morePages],
  );
  const hasMore = allowMorePool && revealedSlugs.length < MORE_POOL.length;

  const visibleAll = useMemo(() => {
    const seen = new Set(connected.map((v) => v.slug));
    const extra = connectionViews(revealedSlugs).filter(
      (v) => !seen.has(v.slug),
    );
    let views = [...connected, ...extra];
    const q = query.trim().toLowerCase();
    if (q) views = views.filter((v) => matchesView(v, q));
    if (sort === "aToZ") {
      views = [...views].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "closestMutuals") {
      views = [...views].sort(
        (a, b) => (b.meta.mutuals ?? 0) - (a.meta.mutuals ?? 0),
      );
    }
    return views;
  }, [connected, revealedSlugs, query, sort]);

  return (
    <>
      <div className={styles.filters}>
        <SearchInput
          className={styles.searchInput}
          value={query}
          onChange={setQuery}
          placeholder={t("connect:allTab.searchPlaceholder")}
          ariaLabel={t("connect:allTab.searchAria")}
        />
        <Select
          size="sm"
          label={t("members:directory.sortLabel")}
          value={sort}
          onChange={(value) => setSort((value ?? "recentlyConnected") as Sort)}
          options={SORTS.map((s) => ({ value: s, label: sortLabel(s, t) }))}
        />
      </div>

      {loading ? (
        <ConnectionsGridSkeleton count={6} />
      ) : (
        <>
          <div className={styles.grid}>
            {visibleAll.map((v, i) => (
              <FadeIn
                key={v.slug}
                delay={Math.min(i, 8) * 60}
                className={styles.cardFade}
              >
                <AllConnectionCard
                  view={v}
                  blocked={isBlocked(v.slug)}
                  onUnblock={() => onUnblock(v)}
                  onMessage={() => onMessage(v.slug, v.name)}
                />
              </FadeIn>
            ))}
          </div>
          {visibleAll.length === 0 &&
            (query.trim() === "" ? (
              <EmptyState
                compact
                icon={<FiUsers />}
                title={t("connect:allTab.emptyTitle")}
                description={t("connect:allTab.emptyDescription")}
                action={{
                  label: t("connect:allTab.findMembers"),
                  to: routes.members,
                }}
              />
            ) : (
              <EmptyState
                compact
                icon={<FiSearch />}
                title={t("connect:allTab.emptySearchTitle")}
                description={t("connect:allTab.emptySearchDescription")}
                action={{
                  label: t("connect:allTab.clearSearch"),
                  onClick: () => {
                    setQuery("");
                    setSort("recentlyConnected");
                  },
                }}
              />
            ))}
          {hasMore && query.trim() === "" && (
            <div className={styles.loadMore}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMorePages((p) => p + 1)}
              >
                {t("connect:allTab.loadMore")}
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}
